from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MemoViewSet

memo_router = DefaultRouter()
memo_router.register(r'memos', MemoViewSet)