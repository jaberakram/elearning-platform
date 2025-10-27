from django.contrib import admin
from .models import Course, Chapter, Topic, Quiz, Question, Answer, UserProgress

# Register your models here.
admin.site.register(Course)
admin.site.register(Chapter)
admin.site.register(Topic)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(UserProgress)