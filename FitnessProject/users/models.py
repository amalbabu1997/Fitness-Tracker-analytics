from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from subscriptions.models import DimSubscriptionPlan


class CustomUser(AbstractUser):
    groups = models.ManyToManyField(
        Group,
        verbose_name="groups",
        blank=True,
        help_text="The groups this user belongs to.",
        related_name="customuser_set",
        related_query_name="customuser",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name="user permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        related_name="customuser_set",
        related_query_name="customuser",
    )
    USER_TYPE_CHOICES = [
        ("ADMIN", "Admin"),
        ("REGISTERED", "Registered"),
    ]
    user_type = models.CharField(
        max_length=10, choices=USER_TYPE_CHOICES, default="REGISTERED"
    )
    subscription_plan = models.ForeignKey(
        DimSubscriptionPlan, on_delete=models.SET_NULL, null=True, blank=True
    )

    payment_method = models.ForeignKey(
        "payment.PaymentMethod", on_delete=models.SET_NULL, null=True, blank=True
    )

    middle_name = models.CharField(max_length=150, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Auto-generate username
        if not self.username:
            if self.first_name and self.last_name:
                base_username = f"{self.first_name.lower()}.{self.last_name.lower()}"
            else:
                base_username = "user"
            username = base_username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            self.username = username
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    class Meta:
        db_table = "fitness_CustomUser"


class DimContactInfo(models.Model):
    contact_info_id = models.AutoField(primary_key=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email

    class Meta:
        db_table = "users_dimcontactinfo"


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        "users.CustomUser", on_delete=models.CASCADE, related_name="profile"
    )
    gender = models.CharField(max_length=10, blank=True, null=True)
    age = models.IntegerField(null=True, blank=True)
    goal_description = models.TextField(blank=True, null=True)
    point_balance = models.IntegerField(default=0)
    contact_info = models.ForeignKey(
        "users.DimContactInfo", on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return f"Profile for {self.user.username}"

    class Meta:
        db_table = "users_customerprofile"
