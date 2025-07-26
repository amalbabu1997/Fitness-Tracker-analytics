from rest_framework import serializers
from subscriptions.models import DimSubscriptionPlan
from users.models import CustomUser


class DimSubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DimSubscriptionPlan
        fields = ["subscription_plan_id", "plan_name", "description", "price"]


class SubscriptionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["subscription_plan"]
