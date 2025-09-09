from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from ..models import Timeline
from .serializers import TimelineSerializer

class TimelineViewSet(ModelViewSet):
    queryset = Timeline.objects.all()
    serializer_class = TimelineSerializer
    
    @action(detail=False, methods=['post'])
    def create_timeline_entry(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'])
    def delete_timeline_entry(self, request):
        title = request.data.get('title', None)
        if title is None:
            return Response({'error': 'Title not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use filter instead of get to get all timeline entries with the specified title
            timeline_entries_to_delete = Timeline.objects.filter(title=title)
            
            # Check if any timeline entries with the specified title exist
            if timeline_entries_to_delete.exists():
                # Delete all timeline entries with the specified title
                timeline_entries_to_delete.delete()
                return Response({'message': 'All timeline entries with the specified title deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'No timeline entries found with the specified title'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
