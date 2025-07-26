from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import authenticate

from .models import CustomUser, CustomerProfile, DimContactInfo
from subscriptions.models import DimSubscriptionPlan
from payment.models import PaymentMethod


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=15)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    gender = serializers.ChoiceField(
        choices=[("Male", "Male"), ("Female", "Female"), ("Other", "Other")]
    )
    age = serializers.IntegerField()
    goal_description = serializers.CharField()
    subscription_plan = serializers.PrimaryKeyRelatedField(
        queryset=DimSubscriptionPlan.objects.all()
    )
    password = serializers.CharField(write_only=True)
    middle_name = serializers.CharField(
        max_length=150, required=False, allow_blank=True, allow_null=True
    )
    payment_method = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMethod.objects.filter(is_active=True)
    )

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        try:
            with transaction.atomic():
                username = validated_data["username"]
                email = validated_data["email"]
                subscription_plan = validated_data["subscription_plan"]
                password = validated_data["password"]
                gender = validated_data["gender"]
                age = validated_data["age"]
                goal_description = validated_data["goal_description"]
                phone_number = validated_data["phone_number"]
                first_name = validated_data["first_name"]
                last_name = validated_data["last_name"]
                middle_name = validated_data.get("middle_name", "")
                payment_method = validated_data["payment_method"]

                user = CustomUser(
                    username=username,
                    email=email,
                    subscription_plan=subscription_plan,
                    payment_method=payment_method,
                    first_name=first_name,
                    last_name=last_name,
                    middle_name=middle_name,
                )
                user.set_password(password)
                user.save()

                contact_info = DimContactInfo.objects.create(
                    phone_number=phone_number, email=email
                )

                CustomerProfile.objects.create(
                    user=user,
                    gender=gender,
                    age=age,
                    goal_description=goal_description,
                    contact_info=contact_info,
                )
                return user
        except Exception as e:
            raise serializers.ValidationError(f"Signup failed: {str(e)}")


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError(
                    "Authentication failed for the provided credentials."
                )
        else:
            raise serializers.ValidationError(
                "Both username and password are required."
            )
        data["user"] = user
        return data


class CustomerProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    middle_name = serializers.CharField(source="user.middle_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    subscription_plan = serializers.CharField(
        source="user.subscription_plan.plan_name", read_only=True
    )
    phone_number = serializers.SerializerMethodField()

    class Meta:
        model = CustomerProfile
        fields = [
            "id",
            "first_name",
            "middle_name",
            "last_name",
            "username",
            "email",
            "phone_number",
            "subscription_plan",
            "gender",
            "age",
            "goal_description",
            "point_balance",
        ]

    def get_phone_number(self, profile):
        ci = getattr(profile, "contact_info", None)
        return ci.phone_number if ci else ""
