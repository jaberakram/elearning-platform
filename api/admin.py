from django.contrib import admin
from .models import (
    Course, Chapter, Topic, 
    Quiz, Question, Answer, 
    UserProgress, QuizAttempt,
    MatchingGame, MatchingPair, GameAttempt # <-- GameAttempt ইমপোর্ট করুন
)
#from nested_admin.nested import NestedModelAdmin, NestedTabularInline # <-- nested_admin ইমপোর্ট করুন (যদি আগে থাকে)

# --- সাধারণ মডেলগুলো রেজিস্টার করা ---
admin.site.register(Course)
admin.site.register(Chapter)
admin.site.register(Topic)
# admin.site.register(Quiz) # <-- এটি নিচে বিশেষভাবে রেজিস্টার হবে
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(UserProgress)
admin.site.register(QuizAttempt) 
admin.site.register(GameAttempt) # <-- নতুন গেম অ্যাটেম্পট

# --- Quiz-এর জন্য বিশেষ অ্যাডমিন ---
# (যদি nested_admin ব্যবহার না করেন, তবে এটি বাদ দিতে পারেন)
# class AnswerInline(NestedTabularInline):
#     model = Answer
#     extra = 1

# class QuestionInline(NestedTabularInline):
#     model = Question
#     inlines = [AnswerInline]
#     extra = 1

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin): # <-- Quiz-এর জন্য নতুন অ্যাডমিন ক্লাস
    # inlines = [QuestionInline] # <-- nested_admin থাকলে এটি যোগ করুন
    list_display = ('title', 'topic', 'chapter', 'course') # <-- course যোগ করা হয়েছে
    search_fields = ('title',)

# --- MatchingGame-এর জন্য বিশেষ অ্যাডমিন ---
class MatchingPairInline(admin.TabularInline): # <-- nested_admin এর জন্য NestedTabularInline ব্যবহার করা ভালো
    model = MatchingPair
    extra = 1

@admin.register(MatchingGame)
class MatchingGameAdmin(admin.ModelAdmin): # <-- এটি পরিবর্তন করা হয়েছে
    inlines = [MatchingPairInline]
    list_display = ('title', 'topic', 'chapter', 'course') # <-- course যোগ করা হয়েছে
    search_fields = ('title',)

# দ্রষ্টব্য: Quiz এবং MatchingGame ডেকোরেটরের মাধ্যমে রেজিস্টার হয়েছে