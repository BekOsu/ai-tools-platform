from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'resumes', views.ResumeViewSet, basename='resume')

# Create nested routers for resume sections
urlpatterns = [
    # Main router for resumes
    path('', include(router.urls)),

    # Templates
    path('templates/', views.get_templates, name='templates-list'),

    # Resume section endpoints
    path('resumes/<uuid:resume_id>/personal-info/',
         views.PersonalInfoView.as_view(), name='personal-info'),

    path('resumes/<uuid:resume_id>/professional-summary/',
         views.ProfessionalSummaryView.as_view(), name='professional-summary'),

    # Experience endpoints
    path('resumes/<uuid:resume_id>/experiences/',
         views.ExperienceViewSet.as_view({'get': 'list', 'post': 'create'}), name='experiences-list'),
    path('resumes/<uuid:resume_id>/experiences/<int:pk>/',
         views.ExperienceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='experiences-detail'),
    path('resumes/<uuid:resume_id>/experiences/bulk-update/',
         views.ExperienceViewSet.as_view({'post': 'bulk_update'}), name='experiences-bulk-update'),
    path('resumes/<uuid:resume_id>/experiences/reorder/',
         views.ExperienceViewSet.as_view({'post': 'reorder'}), name='experiences-reorder'),

    # Education endpoints
    path('resumes/<uuid:resume_id>/education/',
         views.EducationViewSet.as_view({'get': 'list', 'post': 'create'}), name='education-list'),
    path('resumes/<uuid:resume_id>/education/<int:pk>/',
         views.EducationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='education-detail'),

    # Skills endpoints
    path('resumes/<uuid:resume_id>/skills/',
         views.SkillViewSet.as_view({'get': 'list', 'post': 'create'}), name='skills-list'),
    path('resumes/<uuid:resume_id>/skills/<int:pk>/',
         views.SkillViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='skills-detail'),
    path('resumes/<uuid:resume_id>/skills/bulk-update/',
         views.SkillViewSet.as_view({'post': 'bulk_update'}), name='skills-bulk-update'),

    # Projects endpoints
    path('resumes/<uuid:resume_id>/projects/',
         views.ProjectViewSet.as_view({'get': 'list', 'post': 'create'}), name='projects-list'),
    path('resumes/<uuid:resume_id>/projects/<int:pk>/',
         views.ProjectViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='projects-detail'),

    # Certifications endpoints
    path('resumes/<uuid:resume_id>/certifications/',
         views.CertificationViewSet.as_view({'get': 'list', 'post': 'create'}), name='certifications-list'),
    path('resumes/<uuid:resume_id>/certifications/<int:pk>/',
         views.CertificationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='certifications-detail'),

    # Languages endpoints
    path('resumes/<uuid:resume_id>/languages/',
         views.LanguageViewSet.as_view({'get': 'list', 'post': 'create'}), name='languages-list'),
    path('resumes/<uuid:resume_id>/languages/<int:pk>/',
         views.LanguageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='languages-detail'),

    # Awards endpoints (NEW)
    path('resumes/<uuid:resume_id>/awards/',
         views.AwardViewSet.as_view({'get': 'list', 'post': 'create'}), name='awards-list'),
    path('resumes/<uuid:resume_id>/awards/<int:pk>/',
         views.AwardViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='awards-detail'),
    path('resumes/<uuid:resume_id>/awards/bulk-update/',
         views.AwardViewSet.as_view({'post': 'bulk_update'}), name='awards-bulk-update'),
    path('resumes/<uuid:resume_id>/awards/statistics/',
         views.AwardViewSet.as_view({'get': 'statistics'}), name='awards-statistics'),
    path('resumes/<uuid:resume_id>/awards/<int:pk>/duplicate/',
         views.AwardViewSet.as_view({'post': 'duplicate'}), name='awards-duplicate'),

    # Volunteer Experience endpoints
    path('resumes/<uuid:resume_id>/volunteer-experiences/',
         views.VolunteerExperienceViewSet.as_view({'get': 'list', 'post': 'create'}), name='volunteer-experiences-list'),
    path('resumes/<uuid:resume_id>/volunteer-experiences/<int:pk>/',
         views.VolunteerExperienceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='volunteer-experiences-detail'),

    # References endpoints
    path('resumes/<uuid:resume_id>/references/',
         views.ReferenceViewSet.as_view({'get': 'list', 'post': 'create'}), name='references-list'),
    path('resumes/<uuid:resume_id>/references/<int:pk>/',
         views.ReferenceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='references-detail'),

    # AI Integration endpoints
    path('resumes/<uuid:resume_id>/ai/generate-content/',
         views.generate_ai_content, name='ai-generate-content'),
    path('resumes/<uuid:resume_id>/ai/optimize-job/',
         views.optimize_for_job, name='ai-optimize-job'),

    # Analytics endpoints
    path('resumes/<uuid:resume_id>/analytics/',
         views.ResumeAnalyticsView.as_view(), name='resume-analytics'),
    path('resumes/<uuid:resume_id>/analytics/track-view/',
         views.track_resume_view, name='track-resume-view'),

    # Export endpoints
    path('resumes/<uuid:resume_id>/export/',
         views.export_resume, name='resume-export'),
]
