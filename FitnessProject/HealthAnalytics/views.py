# health/views.py
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.timezone import now
from Health.models import DailyCheckIn
from .serializer import DailyCheckInSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


class DailyCheckInListView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        start = request.query_params.get("start")
        end = request.query_params.get("end")

        qs = DailyCheckIn.objects.filter(user=user)
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)

        qs = qs.order_by("date")
        serializer = DailyCheckInSerializer(qs, many=True)
        return Response(serializer.data)
