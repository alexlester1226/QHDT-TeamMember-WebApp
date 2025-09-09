from rest_framework.serializers import ModelSerializer
from ..models import Timeline

class TimelineSerializer(ModelSerializer):
    class Meta:
        model = Timeline
        fields = ('title', 'description', 'team', 'date') 

