from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet ,UserRegistrationView
from .views import CourseViewSet, UserRegistrationView 
from .views import MarkTopicCompleteView # <-- নতুন ভিউ ইমপোর্ট করুন
from .views import MarkTopicCompleteView, CourseProgressView, UserDashboardStatsView, SubmitQuizView


# একটি রাউটার তৈরি করা হচ্ছে
router = DefaultRouter()
# কোর্স ভিউসেটকে রাউটারে রেজিস্টার করা হচ্ছে
router.register(r'courses', CourseViewSet, basename='course')

# আমাদের API URL গুলো এখন রাউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হবে
urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('topics/<int:topic_id>/mark-complete/', MarkTopicCompleteView.as_view(), name='mark-topic-complete'),
    path('courses/<int:course_id>/my-progress/', CourseProgressView.as_view(), name='course-progress'),
    path('dashboard-stats/', UserDashboardStatsView.as_view(), name='dashboard-stats'),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),
  

]




