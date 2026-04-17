# from rest_framework.routers import DefaultRouter
# from posts.api.urls import post_router
# from users.api.urls import user_router

# from django.urls import path, include

# router = DefaultRouter()

# # posts
# router.registry.extend(post_router.registry)
# router.registry.extend(user_router.registry)

# urlpatterns = [
#     path('', include(router.urls))
# ]

from rest_framework.routers import DefaultRouter
from posts.api.urls import post_router
from timeline.api.urls import timeline_router
from memos.api.urls import memo_router

from users.api import views as user_views  # Import views from users app
from teams.api import views as team_views 


from django.urls import path, include

router = DefaultRouter()

# posts
router.registry.extend(post_router.registry)
router.registry.extend(timeline_router.registry)
router.registry.extend(memo_router.registry)



# Include user authentication and registration URLs
urlpatterns = [
    path('', include(router.urls)),
    path('login/', user_views.login, name='login'),  # Include login view
    path('signup/', user_views.signup, name='signup'),  # Include signup view
    path('logout/', user_views.logout, name='logout'),  # Include logout view
    path('list_teams/', team_views.list_teams, name='list_teams'),
    path('create_team/', team_views.create_team, name='create_team'),  # Include create_team view
    path('search_team/', team_views.search_team, name='search_team'),  # Include search_team view
    path('get_user/', team_views.get_user, name='get_user'),  # Include get_user view
    path('get_memo/', team_views.get_memo, name='get_memo'),  # Include get_memo view


    # Other URLs as needed
]
