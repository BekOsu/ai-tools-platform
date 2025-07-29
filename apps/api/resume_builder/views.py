from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
import json
import asyncio

from .models import (
    Resume, PersonalInfo, Experience, Education, Skill,
    Project, Certification, Language, LanguageCertification,
    Award, VolunteerExperience, Reference, ProfessionalSummary, ResumeAnalytics
)
from .serializers import (
    ResumeSerializer, ResumeCreateUpdateSerializer, PersonalInfoSerializer,
    ExperienceSerializer, EducationSerializer, SkillSerializer,
    ProjectSerializer, CertificationSerializer, LanguageSerializer,
    AwardSerializer, VolunteerExperienceSerializer, ReferenceSerializer,
    ProfessionalSummarySerializer, ResumeAnalyticsSerializer,
    BulkExperienceSerializer, BulkSkillSerializer, BulkAwardSerializer,
    AIContentRequestSerializer, JobOptimizationSerializer, ExportOptionsSerializer
)
from .ai_service import AIResumeService


class ResumeViewSet(viewsets.ModelViewSet):
    """Complete CRUD operations for resumes"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ResumeCreateUpdateSerializer
        return ResumeSerializer

    def perform_create(self, serializer):
        resume = serializer.save(user=self.request.user)
        # Create analytics entry
        ResumeAnalytics.objects.create(resume=resume)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a resume"""
        original_resume = self.get_object()

        with transaction.atomic():
            # Create new resume
            new_resume = Resume.objects.create(
                user=request.user,
                title=f"{original_resume.title} (Copy)",
                template_id=original_resume.template_id,
                target_industry=original_resume.target_industry,
                target_role=original_resume.target_role,
                experience_level=original_resume.experience_level,
                color_scheme=original_resume.color_scheme,
                font_settings=original_resume.font_settings,
                layout_settings=original_resume.layout_settings,
            )

            # Copy all sections
            if hasattr(original_resume, 'personal_info'):
                PersonalInfo.objects.create(
                    resume=new_resume,
                    **{field.name: getattr(original_resume.personal_info, field.name)
                       for field in PersonalInfo._meta.fields if field.name != 'id' and field.name != 'resume'}
                )

            # Copy experiences
            for exp in original_resume.experiences.all():
                Experience.objects.create(
                    resume=new_resume,
                    **{field.name: getattr(exp, field.name)
                       for field in Experience._meta.fields if field.name != 'id' and field.name != 'resume'}
                )

            # Copy other sections similarly...

            # Create analytics
            ResumeAnalytics.objects.create(resume=new_resume)

        serializer = self.get_serializer(new_resume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Personal Info Views
class PersonalInfoView(generics.RetrieveUpdateAPIView):
    """Manage personal information section"""
    serializer_class = PersonalInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        personal_info, created = PersonalInfo.objects.get_or_create(resume=resume)
        return personal_info


# Experience Views
class ExperienceViewSet(viewsets.ModelViewSet):
    """Manage work experience entries"""
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Experience.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request, resume_id=None):
        """Bulk update all experiences"""
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        serializer = BulkExperienceSerializer(data=request.data, context={'resume': resume})

        if serializer.is_valid():
            experiences = serializer.save()
            response_serializer = ExperienceSerializer(experiences, many=True)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def reorder(self, request, resume_id=None):
        """Reorder experiences"""
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        experience_ids = request.data.get('experience_ids', [])

        for index, exp_id in enumerate(experience_ids):
            Experience.objects.filter(id=exp_id, resume=resume).update(order=index)

        return Response({'message': 'Experiences reordered successfully'})


# Education Views
class EducationViewSet(viewsets.ModelViewSet):
    """Manage education entries"""
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Education.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)


# Skills Views
class SkillViewSet(viewsets.ModelViewSet):
    """Manage skills entries"""
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Skill.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request, resume_id=None):
        """Bulk update all skills"""
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        serializer = BulkSkillSerializer(data=request.data, context={'resume': resume})

        if serializer.is_valid():
            skills = serializer.save()
            response_serializer = SkillSerializer(skills, many=True)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Awards Views (NEW)
class AwardViewSet(viewsets.ModelViewSet):
    """Manage awards and honors entries"""
    serializer_class = AwardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Award.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request, resume_id=None):
        """Bulk update all awards"""
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        serializer = BulkAwardSerializer(data=request.data, context={'resume': resume})

        if serializer.is_valid():
            awards = serializer.save()
            response_serializer = AwardSerializer(awards, many=True)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def statistics(self, request, resume_id=None):
        """Get award statistics"""
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        awards = Award.objects.filter(resume=resume)

        stats = {
            'total_awards': awards.count(),
            'featured_awards': awards.filter(is_featured=True).count(),
            'awards_with_monetary_value': awards.filter(monetary_value__isnull=False).count(),
            'total_monetary_value': sum(award.monetary_value or 0 for award in awards),
            'recurring_awards': awards.filter(is_recurring=True).count(),
            'by_category': {},
            'by_prestige_level': {}
        }

        # Group by category
        for category, _ in Award.AWARD_CATEGORIES:
            stats['by_category'][category] = awards.filter(category=category).count()

        # Group by prestige level
        for level, _ in Award.PRESTIGE_LEVELS:
            stats['by_prestige_level'][level] = awards.filter(prestige_level=level).count()

        return Response(stats)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None, resume_id=None):
        """Duplicate an award"""
        award = self.get_object()
        new_award = Award.objects.create(
            resume=award.resume,
            title=f"{award.title} (Copy)",
            issuer=award.issuer,
            date=award.date,
            category=award.category,
            prestige_level=award.prestige_level,
            description=award.description,
            monetary_value=award.monetary_value,
            currency=award.currency,
            competition_size=award.competition_size,
            selection_ratio=award.selection_ratio,
            is_recurring=award.is_recurring,
            recurrence_frequency=award.recurrence_frequency,
            url=award.url,
            is_featured=False,  # Don't duplicate featured status
        )

        serializer = AwardSerializer(new_award)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Projects Views
class ProjectViewSet(viewsets.ModelViewSet):
    """Manage project entries"""
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Project.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)


# Certifications Views
class CertificationViewSet(viewsets.ModelViewSet):
    """Manage certification entries"""
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Certification.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)


# Languages Views
class LanguageViewSet(viewsets.ModelViewSet):
    """Manage language entries"""
    serializer_class = LanguageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Language.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)


# Volunteer Experience Views
class VolunteerExperienceViewSet(viewsets.ModelViewSet):
    """Manage volunteer experience entries"""
    serializer_class = VolunteerExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return VolunteerExperience.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)


# References Views
class ReferenceViewSet(viewsets.ModelViewSet):
    """Manage reference entries"""
    serializer_class = ReferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        return Reference.objects.filter(resume=resume)

    def perform_create(self, serializer):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        serializer.save(resume=resume)


# Professional Summary Views
class ProfessionalSummaryView(generics.RetrieveUpdateAPIView):
    """Manage professional summary section"""
    serializer_class = ProfessionalSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        summary, created = ProfessionalSummary.objects.get_or_create(resume=resume)
        return summary


# AI Integration Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_ai_content(request, resume_id):
    """Generate AI content for resume sections"""
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    serializer = AIContentRequestSerializer(data=request.data)

    if serializer.is_valid():
        ai_service = AIResumeService()
        try:
            content = ai_service.generate_content(
                section=serializer.validated_data['section'],
                context=serializer.validated_data['context'],
                target_industry=serializer.validated_data.get('target_industry'),
                target_role=serializer.validated_data.get('target_role'),
                writing_style=serializer.validated_data.get('writing_style', 'professional')
            )

            return Response({
                'generated_content': content,
                'section': serializer.validated_data['section']
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to generate AI content',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_for_job(request, resume_id):
    """Optimize resume for specific job posting"""
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    serializer = JobOptimizationSerializer(data=request.data)

    if serializer.is_valid():
        ai_service = AIResumeService()
        try:
            optimization = ai_service.optimize_for_job(
                resume=resume,
                job_title=serializer.validated_data['job_title'],
                company_name=serializer.validated_data.get('company_name'),
                job_description=serializer.validated_data['job_description']
            )

            return Response(optimization, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to optimize resume',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Analytics Views
class ResumeAnalyticsView(generics.RetrieveAPIView):
    """Get resume analytics"""
    serializer_class = ResumeAnalyticsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        resume = get_object_or_404(Resume, id=self.kwargs['resume_id'], user=self.request.user)
        analytics, created = ResumeAnalytics.objects.get_or_create(resume=resume)
        return analytics


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_resume_view(request, resume_id):
    """Track resume view"""
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    analytics, created = ResumeAnalytics.objects.get_or_create(resume=resume)
    analytics.views += 1
    analytics.save()

    return Response({'message': 'View tracked successfully'})


# Export Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_resume(request, resume_id):
    """Export resume in various formats"""
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    serializer = ExportOptionsSerializer(data=request.data)

    if serializer.is_valid():
        try:
            # Track download
            analytics, created = ResumeAnalytics.objects.get_or_create(resume=resume)
            analytics.downloads += 1
            analytics.save()

            # Generate export (implement based on your export service)
            export_url = f"/api/resumes/{resume_id}/download/{serializer.validated_data['format']}/"

            return Response({
                'download_url': export_url,
                'format': serializer.validated_data['format'],
                'expires_at': '2024-12-31T23:59:59Z'  # Set appropriate expiry
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to export resume',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Template management
@api_view(['GET'])
def get_templates(request):
    """Get available resume templates"""
    templates = [
        {
            'id': 'modern',
            'name': 'Modern Professional',
            'description': 'Clean, contemporary design perfect for tech and creative roles',
            'preview_url': '/static/templates/modern_preview.png',
            'color_schemes': ['blue', 'green', 'purple', 'red'],
            'features': ['ATS-friendly', 'Clean layout', 'Modern typography']
        },
        {
            'id': 'classic',
            'name': 'Classic Professional',
            'description': 'Traditional format suitable for conservative industries',
            'preview_url': '/static/templates/classic_preview.png',
            'color_schemes': ['black', 'navy', 'dark-gray'],
            'features': ['Traditional format', 'Professional appearance', 'Wide compatibility']
        },
        {
            'id': 'creative',
            'name': 'Creative Portfolio',
            'description': 'Eye-catching design for creative professionals',
            'preview_url': '/static/templates/creative_preview.png',
            'color_schemes': ['orange', 'teal', 'pink', 'yellow'],
            'features': ['Creative layout', 'Visual elements', 'Portfolio integration']
        },
        {
            'id': 'minimal',
            'name': 'Minimal Clean',
            'description': 'Minimalist design focusing on content clarity',
            'preview_url': '/static/templates/minimal_preview.png',
            'color_schemes': ['gray', 'black', 'blue-gray'],
            'features': ['Minimal design', 'Focus on content', 'Easy to read']
        },
        {
            'id': 'executive',
            'name': 'Executive Leadership',
            'description': 'Sophisticated design for senior-level positions',
            'preview_url': '/static/templates/executive_preview.png',
            'color_schemes': ['navy', 'charcoal', 'burgundy'],
            'features': ['Executive styling', 'Leadership focus', 'Professional imagery']
        }
    ]

    return Response(templates, status=status.HTTP_200_OK)
