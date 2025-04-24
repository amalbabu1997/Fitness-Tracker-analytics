from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.contrib.auth import login
from rest_framework.permissions import IsAuthenticated
from .models import CustomerProfile
from .serializer import SignupSerializer, LoginSerializer, CustomerProfileSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """helper:
    A custom authentication class that bypasses CSRF checks.
    Only use this for local testing or non-production environments if you rely on CSRF.
    """

    def enforce_csrf(self, request):
        return


class SignupAPIView(APIView):
    """
    Handles user signup without requiring a CSRF token.
    """

    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Signup successful!"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    """
    Handles user login without requiring a CSRF token.
    """

    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data.get("user")
            login(request, user)  # create session
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = CustomerProfile.objects.get(user=request.user)
            serializer = CustomerProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomerProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )
