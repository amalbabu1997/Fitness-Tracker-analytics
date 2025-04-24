from django.db import models
from django.conf import settings


class PaymentMethod(models.Model):
    method_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.method_name


class Payment(models.Model):

    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    status = models.CharField(
        max_length=20,
        choices=(
            ("pending", "Pending"),
            ("completed", "Completed"),
            ("failed", "Failed"),
        ),
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.payment_method} - {self.amount} {self.currency} - {self.status}"
