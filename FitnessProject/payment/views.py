from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework import generics
from .models import PaymentMethod, Payment
from .serializers import PaymentMethodSerializer, PaymentSerializer


# active payment methods
class PaymentMethodList(generics.ListAPIView):
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):  # disabled Csrf
    def enforce_csrf(self, request):
        # Simply bypass CSRF validation.
        return


class PaymentCreate(generics.CreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
