# Analytics/serializer.py
from rest_framework import serializers
from .models import Analytics
from Excercise.models import Exercise


class ExerciseAnalyticsSerializer(serializers.ModelSerializer):

    exercise = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all())

    class Meta:
        model = Analytics
        fields = [
            "id",
            "exercise",
            "user",
            "exercise_type",
            "status",
            "progress_percent",
            "occurrence_count",
            "creation_date",
            "end_date",
        ]
        read_only_fields = ["id", "creation_date", "end_date", "user"]


class ExerciseAnalyticsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = ["status", "progress_percent"]
