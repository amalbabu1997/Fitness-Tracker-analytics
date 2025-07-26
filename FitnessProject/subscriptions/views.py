from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from users.views import CsrfExemptSessionAuthentication
from .models import DimSubscriptionPlan
from .serializer import DimSubscriptionPlanSerializer, SubscriptionUpdateSerializer


class SubscriptionPlanListAPIView(ListAPIView):
    queryset = DimSubscriptionPlan.objects.all()
    serializer_class = DimSubscriptionPlanSerializer


class SubscriptionUpdateView(RetrieveUpdateAPIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionUpdateSerializer

    def get_object(self):
        return self.request.user
