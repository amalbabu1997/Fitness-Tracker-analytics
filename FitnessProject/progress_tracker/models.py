from django.db import models
from Analytics.models import Analytics


class AnalyticsOccurrence(models.Model):
    STATUS_CHOICES = [
        ("completed", "Completed"),
        ("uncompleted", "Uncompleted"),
        ("skipped", "Skipped"),
    ]

    analytics = models.ForeignKey(
        Analytics, on_delete=models.CASCADE, related_name="occurrences"
    )
    date = models.DateField()
    status = models.CharField(
        max_length=12, choices=STATUS_CHOICES, default="uncompleted"
    )
    calories_burned = models.FloatField(
        help_text="Calories burned for this single occurrence", null=True, blank=True
    )

    def __str__(self):
        return f"{self.analytics.exercise.exercise_name} on {self.date} - {self.status}"
