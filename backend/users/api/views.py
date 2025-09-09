from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from .serializers import UserSerializer
from rest_framework import status
from rest_framework.authtoken.models import Token
from ..models import User
import random
from django.contrib.auth.hashers import check_password
from teams.models import Team



@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Check if email and password are provided
    if not email or not password:
        return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # User does not exist
        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

    if check_password(password, user.password):
        user_data = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'type': user.type,
            'team': user.team,
            'token': user.token  # Token for authentication
        }
        return Response(user_data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)



# @api_view(['POST'])
# def signup(request):
#     serializer = UserSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()  # Save the user instance returned by serializer
#         password = request.data.get('password')  # Safely retrieve password from request data
#         if password:
#             hashed_password = make_password(password)  # Hash the plain-text password
#             user.password = hashed_password  # Set the hashed password to the user instance            
#             # Get or create token for the user
#             token = ''.join([str(random.randint(0, 9)) for _ in range(15)])
#             user.token = token
#             user.save()  # Save user instance with token

            
#             return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)
#         else:
#             return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()  # Save the user instance returned by serializer
        password = request.data.get('password')  # Safely retrieve password from request data
        team_bio = request.data.get('team')  # Get team bio from request data

        if password:
            hashed_password = make_password(password)  # Hash the plain-text password
            user.password = hashed_password  # Set the hashed password to the user instance

            # Check if a Team with the same bio exists
            try:
                team = Team.objects.get(bio=team_bio)
                # Add user to the team
                team.users.add(user)

                # Get or create token for the user
                token = ''.join([str(random.randint(0, 9)) for _ in range(15)])
                user.token = token
                user.save()  # Save user instance with token

                return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)
            except Team.DoesNotExist:
                return Response({"error": f"No team with the bio '{team_bio}' found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def test_token(request):
    token = request.data.get('token')

    try:
        user = User.objects.get(token=token)
    except User.DoesNotExist:
        return False

    return True


