from rest_framework.generics import ListAPIView
from .models import DimSubscriptionPlan
from .serializer import DimSubscriptionPlanSerializer

class SubscriptionPlanListAPIView(ListAPIView):
    queryset = DimSubscriptionPlan.objects.all()
    serializer_class = DimSubscriptionPlanSerializer