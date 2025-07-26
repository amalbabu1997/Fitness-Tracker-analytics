from rest_framework import serializers
from .models import FoodCategory, FoodItem, FoodSize


class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = ["id", "name"]


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            "id",
            "name",
            "default_serving_size",
            "default_serving_unit",
            "calories_per_default",
        ]


class FoodSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodSize
        fields = ["id", "name", "multiplier"]


from decimal import Decimal
from rest_framework import serializers
from .models import FoodConsumption


class FoodConsumptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodConsumption
        fields = [
            "id",
            "user",
            "meal_type",
            "category",
            "food_item",
            "size",
            "quantity",
            "calories_consumed",
            "logged_at",
        ]
        read_only_fields = ["id", "user", "calories_consumed", "logged_at"]

    def create(self, validated_data):
        # extract values
        item = validated_data["food_item"]
        size = validated_data.get("size")
        qty = validated_data["quantity"]  # Decimal

        # base calories per default serving
        base_kcal = Decimal(item.calories_per_default)
        # size multiplier (e.g. small 0.5, regular 1.0)
        multiplier = Decimal(size.multiplier) if size else Decimal("1")

        # total calories = base_kcal * quantity_of_servings * multiplier
        total_kcal = (base_kcal * qty * multiplier).quantize(Decimal("0.01"))

        # assign computed values
        validated_data["calories_consumed"] = total_kcal
        validated_data["user"] = self.context["request"].user

        return super().create(validated_data)
