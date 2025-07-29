from django.contrib import admin
from .models import (
    Resume, PersonalInfo, Experience, Education, Skill,
    Project, Certification, Language
)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'template_id', 'ai_score', 'ats_score', 'created_at', 'updated_at']
    list_filter = ['template_id', 'target_industry', 'experience_level', 'created_at']
    search_fields = ['title', 'user__username', 'user__email', 'target_industry', 'target_role']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'title', 'template_id')
        }),
        ('Target Job', {
            'fields': ('target_industry', 'target_role', 'experience_level')
        }),
        ('AI Scores', {
            'fields': ('ai_score', 'ats_score', 'readability_score')
        }),
        ('Settings', {
            'fields': ('color_scheme', 'font_settings', 'layout_settings')
        }),
        ('Metadata', {
            'fields': ('is_public', 'is_featured', 'created_at', 'updated_at')
        })
    )


@admin.register(PersonalInfo)
class PersonalInfoAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'resume']
    search_fields = ['full_name', 'email', 'resume__title']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'resume', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'start_date', 'resume__target_industry']
    search_fields = ['position', 'company', 'resume__title', 'resume__user__username']
    ordering = ['-start_date']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['institution', 'degree', 'field_of_study', 'resume', 'end_date']
    list_filter = ['degree', 'end_date']
    search_fields = ['institution', 'field_of_study', 'resume__title']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'proficiency', 'resume', 'is_featured']
    list_filter = ['category', 'proficiency', 'is_featured']
    search_fields = ['name', 'resume__title', 'resume__user__username']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'resume', 'start_date', 'end_date', 'is_ongoing']
    list_filter = ['is_ongoing', 'start_date']
    search_fields = ['title', 'description', 'resume__title']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['name', 'issuing_organization', 'resume', 'issue_date', 'expiration_date']
    list_filter = ['issuing_organization', 'issue_date']
    search_fields = ['name', 'issuing_organization', 'resume__title']


@admin.register(Language)
class LanguagesAdmin(admin.ModelAdmin):
    list_display = ['name', 'proficiency', 'resume']
    list_filter = ['proficiency']
    search_fields = ['name', 'resume__title']
