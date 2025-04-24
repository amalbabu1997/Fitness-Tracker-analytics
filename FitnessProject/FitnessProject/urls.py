"""
URL configuration for FitnessProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# FitnessProject/urls.py
from django.contrib import admin
from django.urls import path, include
from core.views import csrf
from users.views import LoginAPIView, SignupAPIView, CustomerProfileView
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

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/subscriptions/", include("subscriptions.urls")),
    path("api/signupbk/", SignupAPIView.as_view(), name="signup"),
    path("api/login/", LoginAPIView.as_view(), name="login"),
    path("api/payment/", include("payment.urls")),
    path("api/profile/", CustomerProfileView.as_view(), name="profile"),
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
    path(
        "api/occurrences/create-or-update/",
        CreateOrUpdateOccurrenceView.as_view(),
        name="create_or_update_occurrence",
    ),
    path(
        "api/achievement-summary/",
        AnalyticsStatusSummaryView.as_view(),
        name="achievement-summary",
    ),
    path(
        "api/analytics/progress-summary/",
        AnalyticsProgressSummaryView.as_view(),
        name="analytics-progress-summary",
    ),
    path(
        "api/burn-summary/",
        BurnPerTaskSummaryView.as_view(),
        name="burn-per-task-summary",
    ),
]
