from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Resume, PersonalInfo, Experience, Education, Skill,
    Project, Certification, Language, LanguageCertification,
    Award, VolunteerExperience, Reference, ProfessionalSummary, ResumeAnalytics
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        exclude = ['resume']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError("End date cannot be before start date")
        if data.get('is_current') and data.get('end_date'):
            raise serializers.ValidationError("Current position cannot have an end date")
        return data


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError("End date cannot be before start date")
        return data


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError("End date cannot be before start date")
        if data.get('is_ongoing') and data.get('end_date'):
            raise serializers.ValidationError("Ongoing project cannot have an end date")
        return data


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if data.get('expiration_date') and data.get('issue_date'):
            if data['expiration_date'] < data['issue_date']:
                raise serializers.ValidationError("Expiration date cannot be before issue date")
        return data


class LanguageCertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanguageCertification
        fields = '__all__'


class LanguageSerializer(serializers.ModelSerializer):
    certifications = LanguageCertificationSerializer(many=True, read_only=True)

    class Meta:
        model = Language
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }


class AwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Award
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if data.get('monetary_value') is not None and data['monetary_value'] < 0:
            raise serializers.ValidationError("Monetary value cannot be negative")
        if data.get('competition_size') is not None and data['competition_size'] < 1:
            raise serializers.ValidationError("Competition size must be at least 1")
        if data.get('is_recurring') and not data.get('recurrence_frequency'):
            raise serializers.ValidationError("Recurring awards must specify frequency")
        return data


class VolunteerExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerExperience
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError("End date cannot be before start date")
        if data.get('is_ongoing') and data.get('end_date'):
            raise serializers.ValidationError("Ongoing volunteer work cannot have an end date")
        if data.get('hours_per_week') is not None and data['hours_per_week'] > 168:
            raise serializers.ValidationError("Hours per week cannot exceed 168")
        return data


class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        exclude = ['resume']
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if data.get('years_known') is not None and data['years_known'] < 0:
            raise serializers.ValidationError("Years known cannot be negative")
        return data


class ProfessionalSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalSummary
        exclude = ['resume']

    def validate(self, data):
        content = data.get('content', '')
        if len(content.split()) > 300:
            raise serializers.ValidationError("Professional summary should not exceed 300 words")
        return data


class ResumeAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalytics
        exclude = ['resume']


class ResumeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    personal_info = PersonalInfoSerializer(read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    awards = AwardSerializer(many=True, read_only=True)
    volunteer_experiences = VolunteerExperienceSerializer(many=True, read_only=True)
    references = ReferenceSerializer(many=True, read_only=True)
    professional_summary = ProfessionalSummarySerializer(read_only=True)
    analytics = ResumeAnalyticsSerializer(read_only=True)

    class Meta:
        model = Resume
        fields = '__all__'

    def validate(self, data):
        if data.get('ai_score') is not None and (data['ai_score'] < 0 or data['ai_score'] > 100):
            raise serializers.ValidationError("AI score must be between 0 and 100")
        if data.get('ats_score') is not None and (data['ats_score'] < 0 or data['ats_score'] > 100):
            raise serializers.ValidationError("ATS score must be between 0 and 100")
        if data.get('readability_score') is not None and (data['readability_score'] < 0 or data['readability_score'] > 100):
            raise serializers.ValidationError("Readability score must be between 0 and 100")
        return data


class ResumeCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating resume metadata only"""
    class Meta:
        model = Resume
        exclude = ['user', 'created_at', 'updated_at']


# Bulk operation serializers
class BulkExperienceSerializer(serializers.Serializer):
    experiences = ExperienceSerializer(many=True)

    def create(self, validated_data):
        resume = self.context['resume']
        experiences_data = validated_data['experiences']

        # Clear existing experiences
        resume.experiences.all().delete()

        # Create new experiences
        experiences = []
        for i, exp_data in enumerate(experiences_data):
            exp_data['order'] = i
            exp = Experience.objects.create(resume=resume, **exp_data)
            experiences.append(exp)

        return experiences


class BulkSkillSerializer(serializers.Serializer):
    skills = SkillSerializer(many=True)

    def create(self, validated_data):
        resume = self.context['resume']
        skills_data = validated_data['skills']

        # Clear existing skills
        resume.skills.all().delete()

        # Create new skills
        skills = []
        for i, skill_data in enumerate(skills_data):
            skill_data['order'] = i
            skill = Skill.objects.create(resume=resume, **skill_data)
            skills.append(skill)

        return skills


class BulkAwardSerializer(serializers.Serializer):
    awards = AwardSerializer(many=True)

    def create(self, validated_data):
        resume = self.context['resume']
        awards_data = validated_data['awards']

        # Clear existing awards
        resume.awards.all().delete()

        # Create new awards
        awards = []
        for i, award_data in enumerate(awards_data):
            award_data['order'] = i
            award = Award.objects.create(resume=resume, **award_data)
            awards.append(award)

        return awards


# AI Integration Serializers
class AIContentRequestSerializer(serializers.Serializer):
    section = serializers.ChoiceField(choices=[
        'summary', 'experience', 'skills', 'cover_letter'
    ])
    context = serializers.JSONField()
    target_industry = serializers.CharField(max_length=100, required=False)
    target_role = serializers.CharField(max_length=100, required=False)
    writing_style = serializers.ChoiceField(
        choices=['professional', 'creative', 'executive', 'technical'],
        required=False,
        default='professional'
    )


class JobOptimizationSerializer(serializers.Serializer):
    job_title = serializers.CharField(max_length=200)
    company_name = serializers.CharField(max_length=200, required=False)
    job_description = serializers.CharField()

    def validate_job_description(self, value):
        if len(value.split()) < 20:
            raise serializers.ValidationError("Job description should contain at least 20 words")
        return value


class ResumeScoreSerializer(serializers.Serializer):
    overall_score = serializers.FloatField(min_value=0, max_value=100)
    content_quality = serializers.FloatField(min_value=0, max_value=100)
    ats_compatibility = serializers.FloatField(min_value=0, max_value=100)
    completeness = serializers.FloatField(min_value=0, max_value=100)
    recommendations = serializers.ListField(
        child=serializers.CharField(max_length=500)
    )


# Export Serializers
class ExportOptionsSerializer(serializers.Serializer):
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('docx', 'Word Document'),
        ('html', 'HTML'),
    ]

    format = serializers.ChoiceField(choices=FORMAT_CHOICES)
    template_customizations = serializers.JSONField(required=False)
    include_sections = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    page_size = serializers.ChoiceField(
        choices=[('A4', 'A4'), ('Letter', 'Letter')],
        default='A4'
    )
    margins = serializers.JSONField(required=False)
