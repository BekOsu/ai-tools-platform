from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Resume(models.Model):
    """Main resume model containing all resume metadata"""
    TEMPLATE_CHOICES = [
        ('modern', 'Modern'),
        ('classic', 'Classic'),
        ('creative', 'Creative'),
        ('minimal', 'Minimal'),
        ('professional', 'Professional'),
        ('tech', 'Technology'),
        ('executive', 'Executive'),
        ('academic', 'Academic'),
    ]

    EXPERIENCE_LEVELS = [
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('executive', 'Executive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=200, default='Untitled Resume')
    template_id = models.CharField(max_length=50, choices=TEMPLATE_CHOICES, default='modern')

    # AI and ATS Scores
    ai_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    ats_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    readability_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    # Target job information
    target_industry = models.CharField(max_length=100, blank=True)
    target_role = models.CharField(max_length=100, blank=True)
    experience_level = models.CharField(max_length=50, choices=EXPERIENCE_LEVELS, default='mid')

    # Settings
    color_scheme = models.JSONField(default=dict)
    font_settings = models.JSONField(default=dict)
    layout_settings = models.JSONField(default=dict)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class PersonalInfo(models.Model):
    """Personal information section"""
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='personal_info')
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    professional_summary = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.full_name} - {self.resume.title}"


class Experience(models.Model):
    """Work experience entries"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField()
    achievements = models.JSONField(default=list)
    technologies = models.JSONField(default=list)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_date']

    def __str__(self):
        return f"{self.position} at {self.company}"


class Education(models.Model):
    """Education entries"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    gpa = models.CharField(max_length=10, blank=True)
    honors = models.CharField(max_length=200, blank=True)
    relevant_coursework = models.JSONField(default=list)
    activities = models.JSONField(default=list)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_date']

    def __str__(self):
        return f"{self.degree} from {self.institution}"


class Skill(models.Model):
    """Skills entries"""
    SKILL_CATEGORIES = [
        ('technical', 'Technical'),
        ('soft', 'Soft Skills'),
        ('language', 'Language'),
        ('tools', 'Tools'),
        ('frameworks', 'Frameworks'),
        ('industry', 'Industry'),
    ]

    PROFICIENCY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=SKILL_CATEGORIES, default='technical')
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS, default='intermediate')
    years_experience = models.PositiveIntegerField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'category', 'name']

    def __str__(self):
        return f"{self.name} ({self.proficiency})"


class Project(models.Model):
    """Project entries"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    technologies = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_ongoing = models.BooleanField(default=False)
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    achievements = models.JSONField(default=list)
    role = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_date']

    def __str__(self):
        return self.title


class Certification(models.Model):
    """Certification entries"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiration_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-issue_date']

    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"


class Language(models.Model):
    """Language proficiency entries"""
    PROFICIENCY_LEVELS = [
        ('basic', 'Basic'),
        ('conversational', 'Conversational'),
        ('professional', 'Professional'),
        ('native', 'Native'),
    ]

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='languages')
    name = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS, default='conversational')
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.proficiency})"


class Award(models.Model):
    """Awards and honors entries"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='awards')
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    date = models.DateField()
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-date']

    def __str__(self):
        return f"{self.title} - {self.issuer}"


class Publication(models.Model):
    """Publications entries"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='publications')
    title = models.CharField(max_length=200)
    authors = models.CharField(max_length=500)
    publication = models.CharField(max_length=200)
    date = models.DateField()
    url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-date']

    def __str__(self):
        return self.title


class Reference(models.Model):
    """Professional references"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='references')
    name = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    relationship = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} - {self.company}"


class JobOptimization(models.Model):
    """Job optimization tracking and analysis"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='job_optimizations')
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True)
    job_description = models.TextField()
    extracted_keywords = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    optimization_suggestions = models.JSONField(default=list)
    match_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.job_title} optimization for {self.resume.title}"


class ATSAnalysis(models.Model):
    """ATS (Applicant Tracking System) analysis results"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='ats_analyses')
    overall_score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    keyword_score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    format_score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    readability_score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    section_analysis = models.JSONField(default=dict)
    recommendations = models.JSONField(default=list)
    scanned_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"ATS Analysis for {self.resume.title} - Score: {self.overall_score}"


class ResumeTemplate(models.Model):
    """Resume template definitions"""
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    description = models.TextField()
    preview_image = models.ImageField(upload_to='template_previews/', blank=True, null=True)
    html_template = models.TextField()
    css_styles = models.TextField()
    color_schemes = models.JSONField(default=list)
    font_options = models.JSONField(default=list)
    layout_options = models.JSONField(default=dict)
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return self.display_name


class LanguageCertification(models.Model):
    """Language certification entries"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='language_certifications')
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='certifications')
    certification_name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiration_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-issue_date']

    def __str__(self):
        return f"{self.certification_name} ({self.language.name}) - {self.issuing_organization}"


# Add alias for backwards compatibility
Skills = Skill
