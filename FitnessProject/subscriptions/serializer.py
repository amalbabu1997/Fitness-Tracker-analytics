from rest_framework import serializers
from .models import DimSubscriptionPlan

class DimSubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DimSubscriptionPlan
        fields = '__all__'
