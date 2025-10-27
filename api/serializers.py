from rest_framework import serializers
from .models import Course, Chapter, Topic, Quiz, Question, Answer
from django.contrib.auth.models import User
from .models import UserProgress # <-- UserProgress মডেল ইমপোর্ট করুন
from .models import UserProgress, QuizAttempt # <-- QuizAttempt ইমপোর্ট করুন




class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'text', 'answers']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'questions']

# api/serializers.py

# ... AnswerSerializer, QuestionSerializer, QuizSerializer যেমন আছে থাকবে ...

# ----- নিচের TopicSerializer ক্লাসটি পরিবর্তন করুন -----
class TopicSerializer(serializers.ModelSerializer):
    topic_quiz = QuizSerializer(read_only=True) # <-- নতুন লাইন
    class Meta:
        model = Topic
        fields = ['id', 'title', 'video_url', 'article_content', 'order', 'topic_quiz'] # <-- 'topic_quiz' যোগ করুন

# ----- নিচের ChapterSerializer ক্লাসটি পরিবর্তন করুন -----
class ChapterSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    chapter_quiz = QuizSerializer(read_only=True) # <-- 'quiz'-কে 'chapter_quiz' করুন
    class Meta:
        model = Chapter
        fields = ['id', 'title', 'order', 'topics', 'chapter_quiz'] # <-- 'quiz'-কে 'chapter_quiz' করুন

# ... CourseSerializer এবং UserRegistrationSerializer যেমন আছে থাকবে ...

class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'chapters']






# একদম শেষে এই নতুন ক্লাসটি যোগ করুন
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    

 # api/serializers.py

# ... আপনার অন্যান্য import ...


# ... আপনার অন্যান্য Serializer ...

# ----- ফাইলের শেষে নিচের নতুন ক্লাসটি যোগ করুন -----
class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'topic', 'completed']
        read_only_fields = ('user',) # ইউজারকে স্বয়ংক্রিয়ভাবে সেট করা হবে   


# api/serializers.py

# ... আপনার অন্যান্য import ...


# ... আপনার অন্যান্য Serializer ...

# ----- ফাইলের শেষে নিচের নতুন ক্লাসটি যোগ করুন -----
class QuizAttemptSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True) # শুধু দেখানোর জন্য

    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'quiz', 'score', 'timestamp']
        read_only_fields = ('user', 'timestamp') # ইউজার এবং সময় স্বয়ংক্রিয়ভাবে সেট হবে        