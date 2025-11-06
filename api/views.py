

from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Avg

# Import Models
from .models import (
    Course, Topic, 
    Quiz, UserProgress, QuizAttempt,
    MatchingGame, GameAttempt 
)
# Import Serializers
from .serializers import (
    CourseSerializer, UserRegistrationSerializer, UserProgressSerializer, QuizAttemptSerializer,
    GameAttemptSerializer
)

# --- Course ViewSet ---
class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all().prefetch_related(
        'chapters__topics__topic_quiz__questions__answers',
        'chapters__topics__matching_game__pairs',
        'chapters__chapter_quiz__questions__answers',
        'chapters__matching_game__pairs',
        'course_quiz__questions__answers',
        'matching_game__pairs'
    )
    serializer_class = CourseSerializer

# --- User Registration ---
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

# --- Submit Quiz Score ---
class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        quiz_id = request.data.get('quiz_id')
        score = request.data.get('score')
        user = request.user

        if quiz_id is None or score is None:
            return Response({"error": "quiz_id and score are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            attempt, created = QuizAttempt.objects.update_or_create(
                user=user, quiz=quiz, defaults={'score': score} 
            )
            serializer = QuizAttemptSerializer(attempt)
            if quiz.topic: # Automatic Topic Completion
                try:
                    progress, progress_created = UserProgress.objects.get_or_create(
                        user=user, topic=quiz.topic, defaults={'completed': True}
                    )
                    if not progress_created and not progress.completed:
                        progress.completed = True
                        progress.save()
                except Exception as e:
                    print(f"Error updating progress for topic {quiz.topic.id}: {e}") 
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# --- Submit Game Score ---
class SubmitGameView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        game_id = request.data.get('game_id')
        score = request.data.get('score')
        user = request.user

        if game_id is None or score is None:
            return Response({"error": "game_id and score are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            game = MatchingGame.objects.get(id=game_id)
            attempt, created = GameAttempt.objects.update_or_create(
                user=user, game=game, defaults={'score': score} 
            )
            serializer = GameAttemptSerializer(attempt)
            if game.topic: # Automatic Topic Completion
                try:
                    progress, progress_created = UserProgress.objects.get_or_create(
                        user=user, topic=game.topic, defaults={'completed': True}
                    )
                    if not progress_created and not progress.completed:
                        progress.completed = True
                        progress.save()
                except Exception as e:
                    print(f"Error updating progress for topic {game.topic.id} via game: {e}") 
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except MatchingGame.DoesNotExist:
            return Response({"error": "MatchingGame not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# --- Get User Progress for a Course ---
class CourseProgressView(generics.ListAPIView):
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return UserProgress.objects.filter(
            user=self.request.user, topic__chapter__course_id=course_id, completed=True 
        )

# --- Mark Topic Complete (Manual) ---
class MarkTopicCompleteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, topic_id, *args, **kwargs):
        try:
            topic = Topic.objects.get(id=topic_id)
            progress, created = UserProgress.objects.get_or_create(
                user=request.user, topic=topic, defaults={'completed': True}
            )
            if not created and not progress.completed:
                progress.completed = True
                progress.save()
            serializer = UserProgressSerializer(progress)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Topic.DoesNotExist:
            return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ----- এটিই সেই আপগ্রেডেড ক্লাস -----
class UserDashboardStatsView(APIView):
    """
    Calculates and returns statistics for ALL courses for the logged-in user.
    Shows 0% for courses not started.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        print("!!!!!!!!!! DEBUG: চূড়ান্ত ড্যাশবোর্ড কোডটি চলছে (বাগ ফিক্স সহ) !!!!!!!!!!")
        user = request.user
        all_courses = Course.objects.all()
        courses_stats = []
        
        for course in all_courses:
            try:
                total_topics_count = Topic.objects.filter(chapter__course_id=course.id).count()
                
                completed_topics_count = UserProgress.objects.filter(
                    user=user,
                    topic__chapter__course_id=course.id,
                    completed=True
                ).count()
                
                completion_percentage = (completed_topics_count / total_topics_count) * 100 if total_topics_count > 0 else 0
                
                # --- কুইজের গড় স্কোর গণনার সংশোধিত কোড ---
                # (এটি এখন টপিক, অধ্যায় এবং কোর্স কুইজ—সবকিছুই হিসাব করবে)
                topic_quiz_attempts = QuizAttempt.objects.filter(user=user, quiz__topic__chapter__course_id=course.id)
                chapter_quiz_attempts = QuizAttempt.objects.filter(user=user, quiz__chapter__course_id=course.id)
                course_quiz_attempts = QuizAttempt.objects.filter(user=user, quiz__course_id=course.id)
                
                # সব ধরনের কুইজ অ্যাটেম্পটকে একত্রিত করা
                latest_attempts = topic_quiz_attempts.union(chapter_quiz_attempts, course_quiz_attempts).distinct()
                
                avg_score_data = latest_attempts.aggregate(average_score=Avg('score'))
                avg_score = avg_score_data.get('average_score')
                
                courses_stats.append({
                    'course_id': course.id,
                    'course_title': course.title,
                    'total_topics': total_topics_count,
                    'completed_topics': completed_topics_count,
                    'completion_percentage': round(completion_percentage, 2),
                    'average_quiz_score': round(avg_score, 2) if avg_score is not None else None 
                })
            except Exception as e:
                print(f"Error processing stats for course {course.id}: {e}")
                continue
            
        return Response(courses_stats)