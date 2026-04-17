from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from teams.models import Team

from ..models import User
from .serializers import UserSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    email = request.data.get("email")
    password = request.data.get("password")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")
    user_type = request.data.get("type", "")
    team_bio = request.data.get("team")

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "A user with that email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not team_bio:
        return Response(
            {"error": "Team bio is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        team = Team.objects.get(bio=team_bio)
    except Team.DoesNotExist:
        return Response(
            {"error": f"Invalid team bio '{team_bio}'. No team with that bio exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        type=user_type,
    )
    team.users.add(user)

    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {"user": UserSerializer(user).data, "token": token.key},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)
    data = UserSerializer(user).data
    data["token"] = token.key
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
