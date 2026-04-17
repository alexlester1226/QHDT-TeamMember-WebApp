from rest_framework import serializers

from ..models import Timeline


class TimelineSerializer(serializers.ModelSerializer):
    team_name = serializers.SerializerMethodField()

    class Meta:
        model = Timeline
        fields = ("id", "title", "description", "team", "team_name", "date")

    def get_team_name(self, obj):
        return obj.team.name if obj.team_id else None
