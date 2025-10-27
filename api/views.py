# উপরের import গুলো আপডেট করুন
from rest_framework import viewsets, generics, permissions
from .models import Course
from django.contrib.auth.models import User
from .serializers import CourseSerializer, UserRegistrationSerializer


# ... আপনার অন্যান্য import ...
from .models import UserProgress, Topic
from .serializers import UserProgressSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# api/views.py

from django.db.models import Count, Q
from .models import Course, UserProgress
# ... আপনার অন্যান্য import ...

# ... আপনার অন্যান্য import-এর সাথে নিচের লাইনটি যোগ করুন ...
from rest_framework.permissions import IsAuthenticated


from .models import UserProgress # (এটি সম্ভবত আগেই ইমপোর্ট করা আছে)

# UserProgressSerializer এর সাথে QuizAttemptSerializer ইমপোর্ট করুন
from .serializers import UserProgressSerializer, QuizAttemptSerializer
from .models import QuizAttempt # <-- QuizAttempt ইমপোর্ট করুন

from django.db.models import Count, Q, Avg
from .models import Course, UserProgress, QuizAttempt # <-- QuizAttempt ইমপোর্ট করুন





# ফাইলের উপরের দিকে এগুলো import করুন


# ... CourseViewSet ক্লাসটি যেমন আছে থাকবে ...

#

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    এই ViewSet টি কোর্সগুলোর একটি তালিকা (list) এবং 
    একটি নির্দিষ্ট কোর্সের বিস্তারিত (detail) দেখার সুযোগ করে দেয়।
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

# Create your views here.
# ফাইলের শেষে এই নতুন ক্লাসটি যোগ করুন
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

 


 # api/views.py



# ... আপনার অন্যান্য View ...

# ----- ফাইলের শেষে নিচের নতুন ক্লাসটি যোগ করুন -----
class MarkTopicCompleteView(APIView):
    permission_classes = [IsAuthenticated] # শুধু লগইন করা ইউজাররা এটা ব্যবহার করতে পারবে

    def post(self, request, topic_id, *args, **kwargs):
        try:
            topic = Topic.objects.get(id=topic_id)
            # UserProgress অবজেক্টটি খুঁজে বের করা বা নতুন তৈরি করা
            progress, created = UserProgress.objects.get_or_create(
                user=request.user,
                topic=topic
            )
            
            # টপিকটিকে সম্পন্ন হিসেবে চিহ্নিত করা
            progress.completed = True
            progress.save()
            
            serializer = UserProgressSerializer(progress)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Topic.DoesNotExist:
            return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

 # api/views.py


# ... আপনার অন্যান্য View ...

# ----- ফাইলের শেষে নিচের নতুন ক্লাসটি যোগ করুন -----
class CourseProgressView(generics.ListAPIView):
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # URL থেকে কোর্সের ID (course_id) নেওয়া হচ্ছে
        course_id = self.kwargs.get('course_id')
        # শুধুমাত্র বর্তমানে লগইন করা ব্যবহারকারীর জন্য
        # এবং শুধুমাত্র এই নির্দিষ্ট কোর্সের টপিকগুলোর জন্য প্রগ্রেস ফিল্টার করা হচ্ছে
        return UserProgress.objects.filter(
            user=self.request.user,
            topic__chapter__course_id=course_id,
            completed=True # শুধু সম্পন্ন করা টপিকগুলো পাঠাও
        )       
    

 # api/views.py



# ... আপনার অন্যান্য View ...

# ----- ফাইলের শেষে নিচের নতুন ক্লাসটি যোগ করুন -----
# api/views.py

# --- Avg ইমপোর্ট করুন (গড় গণনার জন্য) ---

# ... আপনার অন্যান্য View ...

# ----- নিচের UserDashboardStatsView ক্লাসটি প্রতিস্থাপন করুন -----
class UserDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # ব্যবহারকারী যে কোর্সগুলোতে কমপক্ষে একটি টপিক সম্পন্ন করেছে, সেগুলো খুঁজে বের করা
        enrolled_courses_ids = UserProgress.objects.filter(user=request.user).values_list('topic__chapter__course_id', flat=True).distinct()
        
        courses_stats = []
        for course_id in enrolled_courses_ids:
            course = Course.objects.get(id=course_id)
            
            # --- টপিক সমাপ্তির গণনা (আগের মতোই) ---
            total_topics = course.chapters.aggregate(total_topics=Count('topics'))['total_topics']
            completed_topics = UserProgress.objects.filter(
                user=request.user,
                topic__chapter__course_id=course_id,
                completed=True
            ).count()
            completion_percentage = (completed_topics / total_topics) * 100 if total_topics > 0 else 0
            
            # ----- নতুন: কুইজের গড় স্কোর গণনা -----
            # এই কোর্সের অধ্যায় বা টপিকের সাথে যুক্ত সব কুইজে ব্যবহারকারীর চেষ্টার (attempt) গড় স্কোর
            avg_score_data = QuizAttempt.objects.filter(
                user=request.user,
                quiz__topic__chapter__course_id=course_id
            ).aggregate(average_score=Avg('score'))
            
            avg_chapter_score_data = QuizAttempt.objects.filter(
                user=request.user,
                quiz__chapter__course_id=course_id
            ).aggregate(average_score=Avg('score'))

            # দুটি গড় স্কোরের মধ্যে যেটি null নয়, সেটি নেওয়া
            avg_score = avg_score_data['average_score'] or avg_chapter_score_data['average_score']
            
            courses_stats.append({
                'course_id': course.id,
                'course_title': course.title,
                'total_topics': total_topics,
                'completed_topics': completed_topics,
                'completion_percentage': round(completion_percentage, 2),
                'average_quiz_score': round(avg_score, 2) if avg_score is not None else None # <-- নতুন ডেটা
            })
            
        return Response(courses_stats)
           
    

# api/views.py

# ... আপনার অন্যান্য import ...

# ... আপনার অন্যান্য View ...

# ----- ফাইলের শেষে নিচের নতুন ক্লাসটি যোগ করুন -----
class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated] # শুধু লগইন করা ইউজাররাই স্কোর জমা দিতে পারবে

    def post(self, request, *args, **kwargs):
        # ফ্রন্টএন্ড থেকে পাঠানো ডেটা (quiz_id এবং score) নেওয়া হচ্ছে
        data = {
            'quiz': request.data.get('quiz_id'),
            'score': request.data.get('score'),
            'user': request.user.id  # স্বয়ংক্রিয়ভাবে লগইন করা ইউজারকে সেট করা
        }
        
        serializer = QuizAttemptSerializer(data=data)
        
        if serializer.is_valid():
            serializer.save(user=request.user) # ইউজারকে সেট করে সেভ করা
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # যদি কোনো ভুল থাকে (যেমন score না পাঠানো হয়)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    