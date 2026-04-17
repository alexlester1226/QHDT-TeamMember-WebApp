from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSameTeam(BasePermission):
    """Object-level permission: user must belong to the object's team."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        team_id = getattr(obj, "team_id", None)
        if team_id is None:
            return False
        return request.user.teams.filter(id=team_id).exists()
