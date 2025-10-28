
from django.contrib import admin
from .models import StudyTopic, StudySession

class StudyTopicAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    list_display = ('name', 'slug') 

admin.site.register(StudyTopic, StudyTopicAdmin) 
admin.site.register(StudySession) 