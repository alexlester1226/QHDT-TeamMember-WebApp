# from rest_framework.viewsets import ModelViewSet
# from .. models import Post
# from .serializers import PostSerializer

# class PostViewSet(ModelViewSet):
#     queryset = Post.objects.all()
#     serializer_class = PostSerializer
    
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from ..models import Memo
from .serializers import MemoSerializer
from teams.models import Team

class MemoViewSet(ModelViewSet):
    queryset = Memo.objects.all()
    serializer_class = MemoSerializer

    @action(detail=False, methods=['post'])
    def create_memo(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            memo = serializer.save()
            
            team_name = request.data.get('team', None)
            if team_name:
                try:
                    team = Team.objects.get(bio=team_name)
                except Team.DoesNotExist:
                    return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Add the memo to the team's memos
                team.memos.add(memo)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        


    @action(detail=False, methods=['post'])
    def delete_memo(self, request):
        title = request.data.get('title', None)
        if title is None:
            return Response({'error': 'Title not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            memo_to_delete = Memo.objects.get(title=title)
            memo_to_delete.delete()
            return Response({'message': 'Memo deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Memo.DoesNotExist:
            return Response({'error': 'Memo not found'}, status=status.HTTP_404_NOT_FOUND)

