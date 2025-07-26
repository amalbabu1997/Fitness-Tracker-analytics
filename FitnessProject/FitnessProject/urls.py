# FitnessProject/urls.py

from django.contrib import admin
from django.urls import path, include
from core.views import csrf
from django.contrib.auth import views as auth_views
from users.views import (
    LoginAPIView,
    SignupAPIView,
    LogoutAPIView,
    CustomerProfileView,
    ForgotPasswordAPIView,
    ChangePasswordView,
)
from profiles.views import (
    ProfileEditView,
    GoalUpdateView,
    SubscriptionUpdateView,
)

from Excercise.views import ExerciseByGoalView
from Analytics.views import (
    ExerciseAnalyticsCreateView,
    CyclicAnalyticsTodayView,
    AnalyticsStatusSummaryView,
)
from progress_tracker.views import (
    CreateOrUpdateOccurrenceView,
    AnalyticsProgressSummaryView,
    BurnPerTaskSummaryView,
)
from Foodcalorie.views import (
    FoodCategoryListView,
    FoodSizeListView,
    FoodItemListView,
    FoodConsumptionCreateView,
    ConsumptionSummaryView,
)
from Health.views import DailyCheckInView
from HealthAnalytics.views import DailyCheckInListView


urlpatterns = [
    path("admin/", admin.site.urls),
    # CSRF endpoint (if you need one)
    path("api/csrf/", csrf, name="csrf"),
    # auth
    path("api/signupbk/", SignupAPIView.as_view(), name="signup"),
    path("api/login/", LoginAPIView.as_view(), name="login"),
    path("api/payment/", include("payment.urls")),
    path("api/logout/", LogoutAPIView.as_view(), name="logout"),
    # subscription‐plans listing
    path("api/subscriptions/", include("subscriptions.urls")),
    # profile: view & edit basic info
    path("api/profile/", ProfileEditView.as_view(), name="profile-detail"),
    # change goal
    path(
        "api/profile/subscription/",
        SubscriptionUpdateView.as_view(),
        name="profile-subscription",
    ),
    path("api/profile/goal/", GoalUpdateView.as_view(), name="profile-goal"),
    # exercise analytics
    path("api/exercises/", ExerciseByGoalView.as_view(), name="exercise-by-goal"),
    path(
        "api/exercise-analytics/create/",
        ExerciseAnalyticsCreateView.as_view(),
        name="analytics-create",
    ),
    path(
        "api/exercise-analytics/today/",
        CyclicAnalyticsTodayView.as_view(),
        name="analytics-today",
    ),
    # occurrences & summaries
    path(
        "api/occurrences/create-or-update/",
        CreateOrUpdateOccurrenceView.as_view(),
        name="create-or-update-occurrence",
    ),
    path(
        "api/analytics/progress-summary/",
        AnalyticsProgressSummaryView.as_view(),
        name="analytics-progress-summary",
    ),
    path(
        "api/achievement-summary/",
        AnalyticsStatusSummaryView.as_view(),
        name="achievement-summary",
    ),
    path("api/burn-summary/", BurnPerTaskSummaryView.as_view(), name="burn-summary"),
    # food & calories
    path(
        "api/foodcategories/", FoodCategoryListView.as_view(), name="food-category-list"
    ),
    path("api/fooditems/", FoodItemListView.as_view(), name="food-item-list"),
    path("api/sizes/", FoodSizeListView.as_view(), name="food-size-list"),
    path("api/meal/log/", FoodConsumptionCreateView.as_view(), name="meal-log"),
    path(
        "api/consumption-summary/",
        ConsumptionSummaryView.as_view(),
        name="consumption-summary",
    ),
    # health check-in
    path("api/health-checkup/", DailyCheckInView.as_view(), name="health-checkup"),
    path(
        "api/health/daily-checkin/",
        DailyCheckInListView.as_view(),
        name="daily-checkin-list",
    ),
    path(
        "api/password-reset/",
        ForgotPasswordAPIView,
        name="password_reset",
    ),
    # 2) Confirmation that email was sent (GET)
    path(
        "api/password-reset-done/",
        auth_views.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    # 3) Link with token → built-in form to set new password (GET & POST)
    path(
        "api/password-reset-confirm/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            success_url="/api/password-reset-complete/"
        ),
        name="password_reset_confirm",
    ),
    # 4) Final success page (GET)
    path(
        "api/password-reset-complete/",
        auth_views.PasswordResetCompleteView.as_view(),
        name="password_reset_complete",
    ),
    path(
        "api/change-password/",
        ChangePasswordView.as_view(),
        name="change_password",
    ),
]
