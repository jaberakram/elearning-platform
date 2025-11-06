from django.db import models
from django.contrib.auth.models import User
from ckeditor.fields import RichTextField # <-- নতুন ইমপোর্ট

# Create your models here.

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title

class Chapter(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=200)
    order = models.IntegerField() # অধ্যায়গুলো সাজিয়ে রাখার জন্য

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - Chapter {self.order}: {self.title}"

class Topic(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=200)
    video_url = models.URLField(blank=True, null=True)

    article_content = RichTextField(blank=True, null=True)
    order = models.IntegerField()
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.chapter.title} - Topic {self.order}: {self.title}"

# api/models.py

# ... Course, Chapter, Topic মডেলগুলো যেমন আছে থাকবে ...


# api/models.py

class Quiz(models.Model):
    title = models.CharField(max_length=200)

    # অধ্যায়ের সাথে সম্পর্ক (আগের মতোই)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='chapter_quiz', null=True, blank=True)

    # টপিকের সাথে সম্পর্ক (আগের মতোই)
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='topic_quiz', null=True, blank=True)

    # --- নতুন: কোর্সের সাথে সম্পর্ক (One-to-One) ---
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='course_quiz', null=True, blank=True)

    def __str__(self):
        if self.chapter:
            return f"Quiz for Chapter: {self.chapter.title}"
        if self.topic:
            return f"Quiz for Topic: {self.topic.title}"
        # --- নতুন: কোর্সের জন্য শিরোনাম ---
        if self.course:
            return f"Final Quiz for Course: {self.course.title}"
        return self.title





# ... Question, Answer, UserProgress মডেলগুলো যেমন আছে থাকবে ...

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=500)

    def __str__(self):
        return self.text

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Answer for '{self.question.text}': {self.text}"

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)

    class Meta:
        # একজন ইউজার একটি টপিক একবারই সম্পন্ন করতে পারবে
        unique_together = ('user', 'topic')

    def __str__(self):
        return f"{self.user.username}'s progress on {self.topic.title}"
    


# api/models.py

# ... UserProgress ক্লাসের পর ...

# ----- নিচের নতুন ক্লাসটি যোগ করুন -----
class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField() # কুইজের স্কোর (শতাংশ) সেভ করার জন্য
    timestamp = models.DateTimeField(auto_now_add=True) # কখন কুইজ দিয়েছে

    def __str__(self):
        return f"{self.user.username}'s attempt on {self.quiz.title} - Score: {self.score}%"    
    




# api/models.py

class MatchingGame(models.Model):
    title = models.CharField(max_length=200)

    # অধ্যায়ের সাথে সম্পর্ক (আগের মতোই)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='matching_game', null=True, blank=True)

    # টপিকের সাথে সম্পর্ক (আগের মতোই)
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='matching_game', null=True, blank=True)

    # --- নতুন: কোর্সের সাথে সম্পর্ক (One-to-One) ---
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='matching_game', null=True, blank=True)

    def __str__(self):
        if self.chapter:
            return f"Matching Game for Chapter: {self.chapter.title}"
        if self.topic:
            return f"Matching Game for Topic: {self.topic.title}"
        # --- নতুন: কোর্সের জন্য শিরোনাম ---
        if self.course:
            return f"Final Game for Course: {self.course.title}"
        return self.title




class MatchingPair(models.Model):
    game = models.ForeignKey(MatchingGame, on_delete=models.CASCADE, related_name='pairs')
    item_a = models.CharField(max_length=200) # যেমন: ইংরেজি শব্দ
    item_b = models.CharField(max_length=200) # যেমন: বাংলা অর্থ

    def __str__(self):
        return f"{self.item_a} = {self.item_b}"



# ... MatchingPair ক্লাসের পর ...

# ----- নিচের নতুন ক্লাসটি যোগ করুন -----
class GameAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(MatchingGame, on_delete=models.CASCADE)
    score = models.FloatField() # গেমের স্কোর (সাধারণত ১০০%)
    timestamp = models.DateTimeField(auto_now_add=True) # কখন গেম খেলেছে

    def __str__(self):
        return f"{self.user.username}'s attempt on {self.game.title} - Score: {self.score}%"









