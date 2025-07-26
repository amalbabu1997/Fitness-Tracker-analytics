# health/models.py

from django.db import models
from django.conf import settings


class Device(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    identifier = models.CharField(max_length=200, unique=True)
    last_seen = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class DailyCheckIn(models.Model):
    SOURCE_CHOICES = [
        ("manual", "Manual Entry"),
        ("device", "IoT Device"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True, db_index=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="manual")
    device = models.ForeignKey(Device, null=True, blank=True, on_delete=models.SET_NULL)
    heart_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    systolic_bp = models.PositiveSmallIntegerField(null=True, blank=True)
    diastolic_bp = models.PositiveSmallIntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    sleep_hours = models.FloatField(null=True, blank=True)
    water_intake = models.FloatField(null=True, blank=True)
    mood = models.PositiveSmallIntegerField(null=True, blank=True)
    stress = models.PositiveSmallIntegerField(null=True, blank=True)
    steps = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.username} check-in on {self.date}"
