from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Team
from .serializers import TeamSerializer
from users.api.serializers import UserSerializer
from users.models import User  # Import the User model
from memos.models import Memo 
from memos.api.serializers import MemoSerializer

@api_view(['POST'])
def create_team(request):
    if request.method == 'POST':
        serializer = TeamSerializer(data=request.data)
        print("Request Data:", request.data)
        if serializer.is_valid():
            team = serializer.save()
            print("Serializer Data:", serializer.data)
            
            bio = request.data.get('bio')
            print("Bio:", bio)
            
            if bio:
                matching_users = User.objects.filter(type=bio)
                print("Matching Users:", matching_users)
                
                team.users.add(*matching_users)
                print("Users Added to Team:", team.users.all())
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def search_team(request):
    team_name = request.data.get('team')
    try:
        team = Team.objects.get(bio=team_name)
        serializer = TeamSerializer(team)
        return Response(serializer.data)
    except Team.DoesNotExist:
        return Response({'message': f'Team "{team_name}" not found.'}, status=404)
    

@api_view(['POST'])
def get_user(request):
    user_id = request.data.get('id')

    try:
        user = User.objects.get(id=user_id)
        user_serializer = UserSerializer(user)
               
        
        return Response(user_serializer.data)
    
    except User.DoesNotExist:
        return Response({'message': f'User with ID "{user_id}" not found.'}, status=404)
    
@api_view(['POST'])
def get_memo(request):
    memo_id = request.data.get('id')

    try:
        memo = Memo.objects.get(id=memo_id)
        memo_serializer = MemoSerializer(memo)

        return Response(memo_serializer.data)

    except Memo.DoesNotExist:
        return Response({'message': f'Memo with ID "{memo_id}" not found.'}, status=404)
