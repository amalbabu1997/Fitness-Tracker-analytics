# users/views.py

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.forms import PasswordResetForm
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import update_session_auth_hash
from rest_framework.views import APIView
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CustomerProfile
from .serializer import SignupSerializer, LoginSerializer, CustomerProfileSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that skips CSRF checks.
    Only for API endpoints where you explicitly want to bypass CSRF.
    """

    def enforce_csrf(self, request):
        return  # no-op


class SignupAPIView(APIView):
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
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data.get("user")
            login(request, user)
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = CustomerProfile.objects.get(user=request.user)
            serializer = CustomerProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomerProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )


class LogoutAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response(
            {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
        )


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])  # no authentication required
@permission_classes([])  # open endpoint
def ForgotPasswordAPIView(request):
    """
    Accepts POST { "email": "user@example.com" } and always returns 200 OK.
    Uses Django's PasswordResetForm to email the reset link if the email exists.
    """
    form = PasswordResetForm(data=request.data)
    if form.is_valid():
        form.save(
            request=request,
            from_email=settings.DEFAULT_FROM_EMAIL,
            email_template_name="registration/password_reset_email.html",
            subject_template_name="registration/password_reset_subject.txt",
        )

    return Response(
        {"detail": "If your email is registered, you will receive a reset link."},
        status=status.HTTP_200_OK,
    )


class ChangePasswordView(APIView):
    """
    POST { old_password, new_password, confirm_password }
    """

    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        old = data.get("old_password")
        new = data.get("new_password")
        confirm = data.get("confirm_password")

        if not user.check_password(old):
            return Response(
                {"detail": "Incorrect old password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new != confirm:
            return Response(
                {"detail": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. set the new password
        user.set_password(new)
        user.save()

        # 2. rotate the session so the user stays authenticated
        update_session_auth_hash(request, user)

        return Response(
            {"detail": "Password changed successfully."}, status=status.HTTP_200_OK
        )
