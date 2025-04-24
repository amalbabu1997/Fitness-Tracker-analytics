from django.db import models
from users.models import CustomUser


class Exercise(models.Model):
    GOAL_CHOICES = [
        ("Weight Loss", "Weight Loss"),
        ("Weight Gain", "Weight Gain"),
        ("Build Muscle", "Build Muscle"),
        ("Normal", "Normal"),
    ]

    INTENSITY_LEVELS = [
        ("Low", "Low"),
        ("Moderate", "Moderate"),
        ("High", "High"),
    ]

    MEASUREMENT_TYPE_CHOICES = [
        ("duration", "Duration"),
        ("reps_sets", "Reps and Sets"),
    ]

    exercise_name = models.CharField(max_length=100)
    goal_category = models.CharField(max_length=20, choices=GOAL_CHOICES)
    age_min = models.IntegerField()
    age_max = models.IntegerField()
    measurement_type = models.CharField(
        max_length=15, choices=MEASUREMENT_TYPE_CHOICES, default="duration"
    )
    duration_minutes = models.IntegerField(null=True, blank=True)
    reps = models.IntegerField(null=True, blank=True)
    sets = models.IntegerField(null=True, blank=True)
    calories_burned = models.IntegerField()
    intensity = models.CharField(max_length=10, choices=INTENSITY_LEVELS)

    def __str__(self):
        return f"{self.exercise_name} ({self.goal_category})"

    class Meta:
        db_table = "exercise_exercise"
