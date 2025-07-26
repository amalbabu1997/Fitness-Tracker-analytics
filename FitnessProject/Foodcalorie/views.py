from rest_framework import generics, permissions
from .models import FoodCategory, FoodItem, FoodSize
from .serializers import FoodCategorySerializer, FoodItemSerializer, FoodSizeSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


class FoodCategoryListView(generics.ListAPIView):
    queryset = FoodCategory.objects.all()
    serializer_class = FoodCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class FoodItemListView(generics.ListAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = FoodItem.objects.all()
        cat = self.request.query_params.get("category")
        if cat:
            qs = qs.filter(category_id=cat)
        return qs


class FoodSizeListView(generics.ListAPIView):
    queryset = FoodSize.objects.all()
    serializer_class = FoodSizeSerializer
    permission_classes = [permissions.IsAuthenticated]


from rest_framework import generics, permissions
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from .models import FoodConsumption
from .serializers import FoodConsumptionSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # skip CSRF checks (local/dev only)


class FoodConsumptionCreateView(generics.CreateAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    permission_classes = [permissions.IsAuthenticated]
    queryset = FoodConsumption.objects.all()
    serializer_class = FoodConsumptionSerializer

    def perform_create(self, serializer):
        # attach the current user
        serializer.save(user=self.request.user)


from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
import datetime

from .models import FoodConsumption


class ConsumptionSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start = request.query_params.get(
            "start", (today - datetime.timedelta(days=30)).isoformat()
        )
        end = request.query_params.get("end", today.isoformat())

        qs = FoodConsumption.objects.filter(
            user=request.user,
            logged_at__date__gte=start,
            logged_at__date__lte=end,
        )

        # apply meal_type filter if provided
        meal_type = request.query_params.get("meal_type")
        if meal_type:
            qs = qs.filter(meal_type=meal_type)

        qs = (
            qs.values("logged_at__date")
            .annotate(total_cal=Sum("calories_consumed"))
            .order_by("logged_at__date")
        )

        data = [
            {
                "date": rec["logged_at__date"].isoformat(),
                "total_calories": float(rec["total_cal"]),
            }
            for rec in qs
        ]
        return Response(data)
