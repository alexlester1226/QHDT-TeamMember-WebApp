from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TimelineViewSet

timeline_router = DefaultRouter()
timeline_router.register(r'timeline', TimelineViewSet)
