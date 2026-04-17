from rest_framework import serializers

from ..models import Memo


class MemoSerializer(serializers.ModelSerializer):
    team_name = serializers.SerializerMethodField()

    class Meta:
        model = Memo
        fields = ("id", "title", "body", "created_at", "team", "team_name")

    def get_team_name(self, obj):
        return obj.team.name if obj.team_id else None
