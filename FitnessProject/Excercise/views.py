from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Exercise
from .serializers import ExerciseSerializer


class ExerciseByGoalView(APIView):
    permission_classes = [IsAuthenticated]  # Optional: remove it for open access

    def get(self, request):
        goal = request.GET.get("goal_category")
        if goal:
            exercises = Exercise.objects.filter(goal_category=goal)
        else:
            exercises = Exercise.objects.all()
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data)
