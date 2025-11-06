from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, 
    UserRegistrationView, 
    SubmitQuizView, 
    SubmitGameView, 
    CourseProgressView, 
    UserDashboardStatsView,
    MarkTopicCompleteView # <-- এটি ফিরিয়ে আনা হয়েছে
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),
    path('submit-game/', SubmitGameView.as_view(), name='submit-game'),
    path('courses/<int:course_id>/my-progress/', CourseProgressView.as_view(), name='course-progress'),
    path('dashboard-stats/', UserDashboardStatsView.as_view(), name='dashboard-stats'),
    
    # ----- এটিই সেই URL যা আমরা ফিরিয়ে আনছি -----
    path('topics/<int:topic_id>/mark-complete/', MarkTopicCompleteView.as_view(), name='mark-topic-complete'),
]