from rest_framework import serializers
from .models import Analytics


class ExerciseAnalyticsSerializer(serializers.ModelSerializer):
    """
    Serializer for creating an ExerciseAnalytics record.
    The user, creation_date, and end_date are read-only.
    """

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
        depth = 1


class ExerciseAnalyticsUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating an ExerciseAnalytics record.
    Here we allow updating fields such as status and progress_percent.
    """

    class Meta:
        model = Analytics
        fields = ["status", "progress_percent"]
