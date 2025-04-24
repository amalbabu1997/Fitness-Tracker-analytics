from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Analytics(models.Model):
    EXERCISE_TYPE_CHOICES = [
        ("Daily", "Daily"),
        ("Weekly", "Weekly"),
        ("Monthly", "Monthly"),
    ]

    STATUS_CHOICES = [
        ("completed", "Completed"),
        ("uncompleted", "Uncompleted"),
        ("inprogress", "In Progress"),
    ]

    exercise = models.ForeignKey("Excercise.Exercise", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    exercise_type = models.CharField(max_length=10, choices=EXERCISE_TYPE_CHOICES)
    status = models.CharField(
        max_length=12, choices=STATUS_CHOICES, default="inprogress"
    )
    progress_percent = models.FloatField(default=0.0)
    occurrence_count = models.IntegerField(default=1)
    creation_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            now = timezone.now()
            if self.exercise_type == "Daily":
                self.end_date = now + timedelta(days=self.occurrence_count)
            elif self.exercise_type == "Weekly":
                self.end_date = now + timedelta(weeks=self.occurrence_count)
            elif self.exercise_type == "Monthly":
                self.end_date = now + timedelta(days=30 * self.occurrence_count)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Analytics for {self.user} - {self.exercise} ({self.exercise_type})"
