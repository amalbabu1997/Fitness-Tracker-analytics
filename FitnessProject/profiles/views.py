from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from users.views import CsrfExemptSessionAuthentication

from .serializer import (
    ProfileUpdateSerializer,
    GoalUpdateSerializer,
    SubscriptionUpdateSerializer,
)


class ProfileEditView(RetrieveUpdateAPIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        return self.request.user


class GoalUpdateView(RetrieveUpdateAPIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = GoalUpdateSerializer

    def get_object(self):
        return self.request.user.profile


class SubscriptionUpdateView(RetrieveUpdateAPIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionUpdateSerializer

    def get_object(self):
        return self.request.user
