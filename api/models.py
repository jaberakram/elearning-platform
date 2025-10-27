from django.db import models
from django.contrib.auth.models import User

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
    article_content = models.TextField(blank=True, null=True)
    order = models.IntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.chapter.title} - Topic {self.order}: {self.title}"

# api/models.py

# ... Course, Chapter, Topic মডেলগুলো যেমন আছে থাকবে ...

# ----- নিচের Quiz মডেলটি পরিবর্তন করুন -----
class Quiz(models.Model):
    title = models.CharField(max_length=200)
    
    # অধ্যায়ের সাথে সম্পর্ক (One-to-One)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='chapter_quiz', null=True, blank=True)
    
    # টপিকের সাথে সম্পর্ক (One-to-One)
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='topic_quiz', null=True, blank=True)

    def __str__(self):
        if self.chapter:
            return f"Quiz for Chapter: {self.chapter.title}"
        if self.topic:
            return f"Quiz for Topic: {self.topic.title}"
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