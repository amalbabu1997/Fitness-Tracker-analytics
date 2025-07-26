# health/serializers.py
from rest_framework import serializers
from Health.models import DailyCheckIn


class DailyCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = [
            "date",
            "heart_rate",
            "systolic_bp",
            "diastolic_bp",
            "weight",
            "sleep_hours",
            "water_intake",
            "mood",
            "stress",
            "steps",
        ]
