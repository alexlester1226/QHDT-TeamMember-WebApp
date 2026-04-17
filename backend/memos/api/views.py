from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsSameTeam

from ..models import Memo
from .serializers import MemoSerializer


class MemoViewSet(ModelViewSet):
    queryset = Memo.objects.all()
    serializer_class = MemoSerializer
    permission_classes = [IsAuthenticated, IsSameTeam]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Memo.objects.none()
        if user.is_staff:
            return Memo.objects.all()
        return Memo.objects.filter(team__in=user.teams.all())

    def perform_create(self, serializer):
        team = serializer.validated_data.get("team")
        if team is None:
            raise PermissionDenied("A team is required.")
        if not self.request.user.is_staff and not self.request.user.teams.filter(id=team.id).exists():
            raise PermissionDenied("You may only create memos for your own team.")
        serializer.save()
