from rest_framework import serializers
from .models import AnalyticsOccurrence


class AnalyticsOccurrenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsOccurrence
        fields = ["id", "analytics", "date", "status", "calories_burned"]


from rest_framework import serializers


class AchievementSummarySerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.IntegerField()
