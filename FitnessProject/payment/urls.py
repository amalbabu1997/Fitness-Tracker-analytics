from django.urls import path
from .views import PaymentMethodList, PaymentCreate

urlpatterns = [
    path("submit/", PaymentCreate.as_view(), name="payment-submit"),
    path("methods/", PaymentMethodList.as_view(), name="payment-methods"),
]
