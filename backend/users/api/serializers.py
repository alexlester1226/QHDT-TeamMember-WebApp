from rest_framework import serializers

from ..models import User


class UserSerializer(serializers.ModelSerializer):
    team = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "type", "team", "is_staff")

    def get_team(self, obj):
        t = obj.teams.first()
        return t.name if t else None
