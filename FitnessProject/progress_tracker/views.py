from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from collections import defaultdict
from datetime import timedelta
from django.db.models import Sum, F

from progress_tracker.models import AnalyticsOccurrence
from .serializer import AnalyticsOccurrenceSerializer
from Analytics.models import Analytics


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now

from progress_tracker.models import AnalyticsOccurrence
from .serializer import AnalyticsOccurrenceSerializer
from Analytics.models import Analytics


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


class CreateOrUpdateOccurrenceView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        analytics_id = request.data.get("analytics_id")
        status_val = request.data.get("status")
        date = request.data.get("date")  # format "YYYY-MM-DD"

        if not all([analytics_id, status_val, date]):
            return Response(
                {"error": "Missing fields (analytics_id, status, date required)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            analytics = Analytics.objects.get(id=analytics_id, user=user)
        except Analytics.DoesNotExist:
            return Response(
                {"error": "Analytics record not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create/update the occurrence
        occurrence, created = AnalyticsOccurrence.objects.get_or_create(
            analytics=analytics,
            date=date,
            defaults={"status": status_val},
        )

        if not created and occurrence.status != status_val:
            occurrence.status = status_val
            occurrence.save()

        if status_val == "completed":

            per_occ_cal = analytics.exercise.calories_burned
            occurrence.calories_burned = per_occ_cal
            occurrence.save()

        if status_val in ["completed", "skipped"]:
            completed_count = AnalyticsOccurrence.objects.filter(
                analytics=analytics, status="completed"
            ).count()
            skipped_count = AnalyticsOccurrence.objects.filter(
                analytics=analytics, status="skipped"
            ).count()

            done_count = completed_count + skipped_count
            total_count = analytics.occurrence_count

            analytics.progress_percent = round((done_count / total_count) * 100, 2)

            if done_count >= total_count:
                analytics.status = "completed"
                analytics.end_date = now()

            analytics.save()

        serializer = AnalyticsOccurrenceSerializer(occurrence)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AnalyticsProgressSummaryView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        exercise_type = request.query_params.get("type", "Daily")
        today = now().date()

        analytics_records = Analytics.objects.filter(
            user=user, exercise_type=exercise_type
        )

        report = []

        for analytics in analytics_records:

            days_since_start = (today - analytics.creation_date.date()).days + 1
            if days_since_start < 1:
                continue

            expected_occurrences = min(days_since_start, analytics.occurrence_count)

            occurrences = AnalyticsOccurrence.objects.filter(
                analytics=analytics, date__lte=today
            )
            completed = occurrences.filter(status="completed").count()
            skipped = occurrences.filter(status="skipped").count()
            uncompleted = expected_occurrences - (completed + skipped)

            done_count = completed + skipped
            progress = round((done_count / analytics.occurrence_count) * 100, 2)
            analytics.progress_percent = progress

            if done_count >= analytics.occurrence_count or (
                analytics.end_date and today > analytics.end_date.date()
            ):
                analytics.status = "uncompleted" if progress < 100 else "completed"
            else:
                analytics.status = "inprogress"

            analytics.save()

            report.append(
                {
                    "id": analytics.id,
                    "exercise": analytics.exercise.exercise_name,
                    "type": analytics.exercise_type,
                    "completed": completed,
                    "skipped": skipped,
                    "uncompleted": max(uncompleted, 0),
                    "progress": progress,
                    "status": analytics.status,
                }
            )

        return Response(report)


class BurnPerTaskSummaryView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # filter completed occurrences, join through analytics to exercise
        qs = AnalyticsOccurrence.objects.filter(
            analytics__user=user, status="completed"
        )
        # aggregate total calories burned per date
        summary = (
            qs.values("date")
            .annotate(total_calories=Sum(F("analytics__exercise__calories_burned")))
            .order_by("date")
        )
        data = [
            {
                "date": item["date"],
                "total_calories": item["total_calories"] or 0,
            }
            for item in summary
        ]
        return Response(data)
