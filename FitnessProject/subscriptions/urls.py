from django.urls import path
from .views import SubscriptionPlanListAPIView, SubscriptionUpdateView

urlpatterns = [
    # List all plans
    path(
        "subscription-plans/",
        SubscriptionPlanListAPIView.as_view(),
        name="subscription-plans",
    ),
    # Get or update the current user’s subscription
    path(
        "user-subscription/", SubscriptionUpdateView.as_view(), name="user-subscription"
    ),
]
