from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsSameTeam

from ..models import Timeline
from .serializers import TimelineSerializer


class TimelineViewSet(ModelViewSet):
    queryset = Timeline.objects.all()
    serializer_class = TimelineSerializer
    permission_classes = [IsAuthenticated, IsSameTeam]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Timeline.objects.none()
        if user.is_staff:
            return Timeline.objects.all()
        return Timeline.objects.filter(team__in=user.teams.all())

    def perform_create(self, serializer):
        team = serializer.validated_data.get("team")
        if team is None:
            raise PermissionDenied("A team is required.")
        if not self.request.user.is_staff and not self.request.user.teams.filter(id=team.id).exists():
            raise PermissionDenied("You may only create timeline entries for your own team.")
        serializer.save()
