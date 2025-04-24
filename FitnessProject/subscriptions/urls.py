from django.urls import path
from .views import SubscriptionPlanListAPIView  

urlpatterns = [
    path('subscription-plans/', SubscriptionPlanListAPIView.as_view(), name='subscription-plans'),
]