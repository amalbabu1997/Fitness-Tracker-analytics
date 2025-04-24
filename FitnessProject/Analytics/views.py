from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Analytics
from .serializer import ExerciseAnalyticsSerializer, ExerciseAnalyticsUpdateSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Q

from progress_tracker.models import AnalyticsOccurrence


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    A custom authentication class that bypasses CSRF checks.
    Only use this for local testing or non-production environments.
    """

    def enforce_csrf(self, request):
        return


class ExerciseAnalyticsCreateView(generics.CreateAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]
    queryset = Analytics.objects.all()
    serializer_class = ExerciseAnalyticsSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExerciseAnalyticsUpdateView(generics.UpdateAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]
    queryset = Analytics.objects.all()
    serializer_class = ExerciseAnalyticsUpdateSerializer


class CyclicAnalyticsTodayView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()
        result = []

        all_analytics = Analytics.objects.filter(user=user).exclude(status="completed")

        for record in all_analytics:
            created = record.creation_date.date()
            delta_days = (today - created).days

            done_count = AnalyticsOccurrence.objects.filter(
                analytics=record, status__in=["completed", "skipped"]
            ).count()

            if done_count >= record.occurrence_count:
                continue

            already_done_today = AnalyticsOccurrence.objects.filter(
                analytics=record, date=today, status__in=["completed", "skipped"]
            ).exists()

            if already_done_today:
                continue

            if record.exercise_type == "Daily" and delta_days >= 0:
                result.append(record)

            elif (
                record.exercise_type == "Weekly"
                and delta_days % 7 == 0
                and delta_days >= 0
            ):
                result.append(record)

            elif (
                record.exercise_type == "Monthly"
                and created.day == today.day
                and delta_days >= 0
            ):
                result.append(record)

        serializer = ExerciseAnalyticsSerializer(result, many=True)
        return Response(serializer.data)


class AnalyticsStatusSummaryView(APIView):
    """
    Returns the count of Analytics records by status (completed, inprogress, uncompleted)
    filtered by exercise_type.
    """

    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        exercise_type = request.query_params.get("type", "Daily")

        # Filter analytics by user and type
        qs = Analytics.objects.filter(user=user, exercise_type=exercise_type)

        # Count by status
        completed_count = qs.filter(status="completed").count()
        inprogress_count = qs.filter(status="inprogress").count()
        uncompleted_count = qs.filter(status="uncompleted").count()

        data = [
            {"name": "Completed", "value": completed_count},
            {"name": "In Progress", "value": inprogress_count},
            {"name": "Uncompleted", "value": uncompleted_count},
        ]

        return Response(data)
