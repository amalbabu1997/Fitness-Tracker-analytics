# your_app/management/commands/seed_full_food_catalog.py

from django.core.management.base import BaseCommand
from Foodcalorie.models import FoodCategory, Unit, FoodSize, FoodItem


class Command(BaseCommand):
    help = "Seed a full, realistic food catalog"

    def handle(self, *args, **options):
        # 1) Categories
        category_names = [
            "Fruit",
            "Vegetables",
            "Grains",
            "Dairy",
            "Meat",
            "Poultry",
            "Seafood",
            "Legumes",
            "Nuts & Seeds",
            "Oils & Fats",
            "Beverages",
            "Sweets & Snacks",
        ]
        for name in category_names:
            obj, created = FoodCategory.objects.get_or_create(name=name)
            if created:
                self.stdout.write(f" Category: {name}")

        # 2) Units
        units = [
            {"name": "gram", "abbreviation": "g", "unit_type": "mass"},
            {"name": "milliliter", "abbreviation": "ml", "unit_type": "volume"},
            {"name": "liter", "abbreviation": "l", "unit_type": "volume"},
            {"name": "each", "abbreviation": "ea", "unit_type": "count"},
        ]
        for u in units:
            obj, created = Unit.objects.get_or_create(name=u["name"], defaults=u)
            if created:
                self.stdout.write(f" Unit: {u['abbreviation']}")

        # 3) Sizes
        sizes = [
            {"name": "Small", "multiplier": 0.50},
            {"name": "Regular", "multiplier": 1.00},
            {"name": "Medium", "multiplier": 1.25},
            {"name": "Large", "multiplier": 1.50},
        ]
        for s in sizes:
            obj, created = FoodSize.objects.get_or_create(
                name=s["name"], defaults={"multiplier": s["multiplier"]}
            )
            if created:
                self.stdout.write(f"✔️ Size: {s['name']}")

        # 4) FoodItems
        # Format: (name, category, default_size, default_unit, default_cal)
        items = [
            # Fruit
            ("Apple", "Fruit", 150, "gram", 80),
            ("Banana", "Fruit", 120, "gram", 105),
            ("Orange", "Fruit", 130, "gram", 62),
            ("Strawberry", "Fruit", 50, "gram", 16),
            # Vegetables
            ("Carrot", "Vegetables", 75, "gram", 30),
            ("Broccoli", "Vegetables", 100, "gram", 34),
            ("Spinach", "Vegetables", 30, "gram", 7),
            # Grains
            ("White Rice", "Grains", 185, "gram", 242),
            ("Oatmeal", "Grains", 234, "gram", 166),
            ("Quinoa", "Grains", 185, "gram", 222),
            # Dairy
            ("Milk", "Dairy", 1.0, "liter", 200),
            ("Yogurt", "Dairy", 150, "gram", 95),
            ("Cheddar Cheese", "Dairy", 30, "gram", 120),
            # Meat
            ("Beef Steak", "Meat", 200, "gram", 540),
            ("Pork Chop", "Meat", 180, "gram", 419),
            # Poultry
            ("Chicken Breast", "Poultry", 150, "gram", 165),
            ("Turkey Slice", "Poultry", 50, "gram", 40),
            # Seafood
            ("Salmon", "Seafood", 170, "gram", 350),
            ("Shrimp", "Seafood", 100, "gram", 99),
            # Legumes
            ("Lentils", "Legumes", 198, "gram", 230),
            ("Chickpeas", "Legumes", 164, "gram", 269),
            # Nuts & Seeds
            ("Almonds", "Nuts & Seeds", 28, "gram", 164),
            ("Chia Seeds", "Nuts & Seeds", 28, "gram", 138),
            # Oils & Fats
            ("Olive Oil", "Oils & Fats", 14, "gram", 119),
            ("Butter", "Oils & Fats", 14, "gram", 102),
            # Beverages
            ("Black Coffee", "Beverages", 240, "milliliter", 2),
            ("Orange Juice", "Beverages", 240, "milliliter", 112),
            # Sweets & Snacks
            ("Chocolate Chip Cookie", "Sweets & Snacks", 28, "gram", 138),
            ("Potato Chips", "Sweets & Snacks", 28, "gram", 152),
        ]
        for name, cat, size, unit, kcal in items:
            category = FoodCategory.objects.get(name=cat)
            default_unit = Unit.objects.get(name=unit)
            obj, created = FoodItem.objects.get_or_create(
                name=name,
                defaults={
                    "category": category,
                    "default_serving_size": size,
                    "default_serving_unit": default_unit,
                    "calories_per_default": kcal,
                },
            )
            if created:
                self.stdout.write(f"✔️ Item: {name}")

        self.stdout.write(self.style.SUCCESS("Full catalog seeded."))
