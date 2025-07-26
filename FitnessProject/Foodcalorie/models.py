from django.db import models


class FoodCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Unit(models.Model):
    UNIT_TYPES = [
        ("mass", "Mass (g, mg, kg)"),
        ("volume", "Volume (ml, l)"),
        ("count", "Count (each, piece)"),
    ]

    name = models.CharField(max_length=20, unique=True)  # e.g. "gram", "liter", "each"
    abbreviation = models.CharField(max_length=10)  # e.g. "g", "l", "ea"
    unit_type = models.CharField(max_length=10, choices=UNIT_TYPES)

    def __str__(self):
        return self.abbreviation


class FoodItem(models.Model):
    category = models.ForeignKey(FoodCategory, on_delete=models.PROTECT)
    name = models.CharField(max_length=255, unique=True)
    default_serving_size = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        help_text="e.g. 150 for 150 g apple or 1.00 for 1 l milk",
    )
    default_serving_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        limit_choices_to={"unit_type__in": ["mass", "volume", "count"]},
    )
    calories_per_default = models.DecimalField(
        max_digits=7, decimal_places=2, help_text="kcal for one default serving"
    )

    def __str__(self):
        return self.name


class FoodSize(models.Model):
    """
    Portion-size categories with a multiplier relative to the default serving.
    E.g. Small=0.5×, Medium=0.75×, Large=1.0×
    """

    name = models.CharField(
        max_length=30, unique=True
    )  # "Small", "Medium", "Large", etc.
    multiplier = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Portion = multiplier × default serving",
    )

    def __str__(self):
        return self.name


# Foodcalorie/models.py

from django.db import models
from django.conf import settings


class FoodConsumption(models.Model):
    MEAL_TYPES = [
        ("breakfast", "Breakfast"),
        ("lunch", "Lunch"),
        ("dinner", "Dinner"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="food_consumptions",
    )
    meal_type = models.CharField(
        max_length=10,
        choices=MEAL_TYPES,
        db_index=True,
    )
    category = models.ForeignKey(
        "FoodCategory",
        on_delete=models.PROTECT,
        db_index=True,
    )
    food_item = models.ForeignKey(
        "FoodItem",
        on_delete=models.PROTECT,
    )
    size = models.ForeignKey(
        "FoodSize",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    quantity = models.DecimalField(
        max_digits=7, decimal_places=2, help_text="Amount in the item’s default unit"
    )
    calories_consumed = models.DecimalField(
        max_digits=7, decimal_places=2, help_text="kcal for this entry"
    )
    logged_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-logged_at"]
        verbose_name = "Food Consumption"
        verbose_name_plural = "Food Consumptions"

    def __str__(self):
        return (
            f"{self.user.username} – {self.get_meal_type_display()} – "
            f"{self.food_item.name} x{self.quantity} ({self.calories_consumed} kcal)"
        )
