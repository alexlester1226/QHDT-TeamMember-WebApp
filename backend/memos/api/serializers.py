from rest_framework.serializers import ModelSerializer
from ..models import Memo

class MemoSerializer(ModelSerializer):
    class Meta:
        model = Memo
        fields = ('id', 'title', 'body', 'created_at', 'team') 
