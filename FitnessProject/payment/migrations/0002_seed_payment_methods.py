from django.db import migrations


def seed_payment_methods(apps, schema_editor):
    PaymentMethod = apps.get_model("payment", "PaymentMethod")
    default_methods = [
        {
            "method_name": "Credit Card",
            "description": "Visa, MasterCard, etc.",
            "is_active": True,
        },
        {
            "method_name": "PayPal",
            "description": "Pay using your PayPal account.",
            "is_active": True,
        },
        {
            "method_name": "Bank Transfer",
            "description": "Direct bank transfers.",
            "is_active": True,
        },
    ]
    for method in default_methods:
        PaymentMethod.objects.create(**method)


def reverse_seed_payment_methods(apps, schema_editor):
    PaymentMethod = apps.get_model("payment", "PaymentMethod")
    PaymentMethod.objects.filter(
        method_name__in=["Credit Card", "PayPal", "Bank Transfer"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        (
            "payment",
            "0001_initial",
        ),  # Update if your initial migration file has a different name
    ]

    operations = [
        migrations.RunPython(seed_payment_methods, reverse_seed_payment_methods),
    ]
