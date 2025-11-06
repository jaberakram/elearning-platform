from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Course, Chapter, Topic, 
    Quiz, Question, Answer, 
    UserProgress, QuizAttempt,
    MatchingGame, MatchingPair, GameAttempt
)

# -------------------------
# কুইজ সিস্টেমের সিরিয়ালাইজার
# -------------------------
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

# -------------------------
# ম্যাচিং গেমের সিরিয়ালাইজার
# -------------------------
class MatchingPairSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingPair
        fields = ['id', 'item_a', 'item_b']

class MatchingGameSerializer(serializers.ModelSerializer):
    pairs = MatchingPairSerializer(many=True, read_only=True)
    
    class Meta:
        model = MatchingGame
        fields = ['id', 'title', 'pairs']

# -------------------------
# মূল কনটেন্ট সিরিয়ালাইজার (আপডেটেড)
# -------------------------
class TopicSerializer(serializers.ModelSerializer):
    topic_quiz = QuizSerializer(read_only=True)
    matching_game = MatchingGameSerializer(read_only=True)

    class Meta:
        model = Topic
        fields = [
            'id', 'title', 'video_url', 'article_content', 'order', 
            'topic_quiz', 'matching_game'
        ]

class ChapterSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    chapter_quiz = QuizSerializer(read_only=True)
    matching_game = MatchingGameSerializer(read_only=True)

    class Meta:
        model = Chapter
        fields = [
            'id', 'title', 'order', 'topics', 
            'chapter_quiz', 'matching_game'
        ]

# ----- এটিই সেই সমাধান -----
class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    # --- এই দুটি লাইন নতুন যোগ করা হয়েছে ---
    course_quiz = QuizSerializer(read_only=True)
    matching_game = MatchingGameSerializer(read_only=True)

    class Meta:
        model = Course
        # --- ফিল্ড লিস্ট আপডেট করা হয়েছে ---
        fields = [
            'id', 'title', 'description', 'chapters', 
            'course_quiz', 'matching_game'
        ]

# -------------------------
# ইউজার সম্পর্কিত সিরিয়ালাইজার
# -------------------------
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

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'topic', 'completed']
        read_only_fields = ('user',)

class QuizAttemptSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'quiz', 'score', 'timestamp']
        read_only_fields = ('user', 'timestamp')

class GameAttemptSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = GameAttempt
        fields = ['id', 'user', 'game', 'score', 'timestamp']
        read_only_fields = ('user', 'timestamp')