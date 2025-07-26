# health/views.py
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import DailyCheckIn
from .serializer import DailyCheckInSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    # Disable CSRF for API endpoints (use with caution in production)
    def enforce_csrf(self, request):
        return


class DailyCheckInView(generics.CreateAPIView):
    """
    API view to record a daily health check-in.
    Expects POST data for the various vitals; assigns `user` and `date` automatically.
    """

    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [IsAuthenticated]
    queryset = DailyCheckIn.objects.all()
    serializer_class = DailyCheckInSerializer

    def perform_create(self, serializer):
        # Automatically set the user and source to 'manual'
        serializer.save(user=self.request.user, source="manual")
