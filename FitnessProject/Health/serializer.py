# health/serializers.py
from rest_framework import serializers
from .models import DailyCheckIn


class DailyCheckInSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and retrieving DailyCheckIn records.
    The `user` and `date` fields are read-only and assigned automatically.
    """

    class Meta:
        model = DailyCheckIn
        fields = [
            "id",
            "date",
            "source",
            "device",
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
        read_only_fields = ["id", "date"]
