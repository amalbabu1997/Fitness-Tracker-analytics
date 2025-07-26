from rest_framework import serializers
from users.models import CustomUser, CustomerProfile, DimContactInfo
from subscriptions.models import DimSubscriptionPlan

from subscriptions.models import DimSubscriptionPlan


class SubscriptionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["subscription_plan"]


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    middle_name = serializers.CharField(
        max_length=150, required=False, allow_blank=True
    )
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(max_length=15, required=False)

    def validate_email(self, value):
        user = self.context["request"].user
        if CustomUser.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def update(self, instance, validated_data):
        user = instance
        profile = user.profile

        # update user fields
        for attr in ("first_name", "middle_name", "last_name", "email"):
            if attr in validated_data:
                setattr(user, attr, validated_data[attr])
        user.save()

        # update or create contact_info
        if "phone_number" in validated_data:
            phone = validated_data["phone_number"] or ""
            ci = profile.contact_info or DimContactInfo()
            ci.phone_number = phone
            ci.email = user.email
            ci.save()
            profile.contact_info = ci
            profile.save()

        return user

    def to_representation(self, instance):
        # include current phone number from contact_info
        ret = super().to_representation(instance)
        ci = getattr(instance.profile, "contact_info", None)
        ret["phone_number"] = ci.phone_number if ci else ""
        ret["goal_description"] = instance.profile.goal_description or ""
        return ret


class GoalUpdateSerializer(serializers.Serializer):
    goal_description = serializers.CharField()

    def update(self, instance, validated_data):
        # instance is CustomerProfile
        instance.goal_description = validated_data["goal_description"]
        instance.save()
        return instance


class SubscriptionUpdateSerializer(serializers.Serializer):
    subscription_plan = serializers.PrimaryKeyRelatedField(
        queryset=DimSubscriptionPlan.objects.all()
    )

    def update(self, instance, validated_data):
        # instance is CustomUser
        instance.subscription_plan = validated_data["subscription_plan"]
        instance.save()
        return instance
