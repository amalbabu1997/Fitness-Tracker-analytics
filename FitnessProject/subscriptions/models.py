from django.db import models

class DimSubscriptionPlan(models.Model):
    subscription_plan_id = models.AutoField(primary_key=True)
    plan_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.plan_name

    class Meta:
        db_table = 'fitness_dimsubscriptionplan'

