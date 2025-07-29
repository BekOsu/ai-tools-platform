import openai
import anthropic
import requests
import json
from typing import Dict, List, Any, Optional
from django.conf import settings
from django.core.cache import cache
from .models import Resume, Experience, Skills, JobOptimization
import logging

logger = logging.getLogger(__name__)


class AIResumeService:
    """AI service for resume enhancement using multiple LLM providers"""

    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.deepseek_base_url = "https://api.deepseek.com/v1"
        self.deepseek_headers = {
            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

    async def generate_professional_summary(self, user_data: Dict) -> str:
        """Generate AI-powered professional summary using OpenAI GPT-4"""
        try:
            prompt = f"""
            Create a compelling professional summary for a resume based on this information:
            
            Name: {user_data.get('name', '')}
            Experience Level: {user_data.get('experience_level', 'mid')}
            Target Industry: {user_data.get('target_industry', '')}
            Target Role: {user_data.get('target_role', '')}
            Key Skills: {', '.join(user_data.get('skills', []))}
            Years of Experience: {user_data.get('years_experience', 0)}
            
            Write a 3-4 sentence professional summary that:
            1. Highlights key qualifications and experience
            2. Shows value proposition for the target role
            3. Uses industry-relevant keywords
            4. Maintains professional tone
            
            Return only the summary text, no additional formatting.
            """

            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error generating professional summary: {e}")
            return "Experienced professional with a proven track record of success."

    async def enhance_experience_description(self, experience_data: Dict) -> Dict:
        """Enhance job experience description using Anthropic Claude"""
        try:
            original_description = experience_data.get('description', '')
            position = experience_data.get('position', '')
            company = experience_data.get('company', '')

            prompt = f"""
            Enhance this job experience description to be more impactful and ATS-friendly:
            
            Position: {position}
            Company: {company}
            Original Description: {original_description}
            
            Please:
            1. Rewrite using strong action verbs
            2. Add quantifiable achievements where possible
            3. Include relevant industry keywords
            4. Structure with bullet points
            5. Focus on results and impact
            
            Return as JSON with:
            {{
                "enhanced_description": "enhanced text",
                "achievements": ["achievement 1", "achievement 2"],
                "keywords_added": ["keyword1", "keyword2"],
                "suggestions": ["suggestion 1", "suggestion 2"]
            }}
            """

            response = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )

            return json.loads(response.content[0].text)

        except Exception as e:
            logger.error(f"Error enhancing experience description: {e}")
            return {
                "enhanced_description": experience_data.get('description', ''),
                "achievements": [],
                "keywords_added": [],
                "suggestions": []
            }

    async def analyze_job_match(self, resume_id: str, job_description: str) -> Dict:
        """Analyze resume-job match using multiple AI models"""
        try:
            resume = Resume.objects.get(id=resume_id)

            # Extract resume content
            resume_text = self._extract_resume_text(resume)

            # Use Claude for comprehensive analysis
            analysis_prompt = f"""
            Analyze how well this resume matches the job description:
            
            RESUME:
            {resume_text}
            
            JOB DESCRIPTION:
            {job_description}
            
            Provide analysis as JSON:
            {{
                "match_score": 0-100,
                "extracted_keywords": ["keyword1", "keyword2"],
                "missing_skills": ["skill1", "skill2"],
                "strengths": ["strength1", "strength2"],
                "improvement_areas": ["area1", "area2"],
                "optimization_suggestions": ["suggestion1", "suggestion2"]
            }}
            """

            response = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                messages=[{"role": "user", "content": analysis_prompt}]
            )

            analysis = json.loads(response.content[0].text)

            # Store optimization data
            JobOptimization.objects.create(
                resume=resume,
                job_description=job_description,
                extracted_keywords=analysis.get('extracted_keywords', []),
                skills_gap=analysis.get('missing_skills', []),
                match_score=analysis.get('match_score', 0),
                optimization_suggestions=analysis.get('optimization_suggestions', [])
            )

            return analysis

        except Exception as e:
            logger.error(f"Error analyzing job match: {e}")
            return {"match_score": 0, "error": str(e)}

    async def suggest_skills_for_industry(self, industry: str, role: str) -> List[Dict]:
        """Suggest relevant skills using DeepSeek for technical analysis"""
        try:
            cache_key = f"skills_{industry}_{role}"
            cached_skills = cache.get(cache_key)
            if cached_skills:
                return cached_skills

            prompt = f"""
            Suggest the most relevant and in-demand skills for:
            Industry: {industry}
            Role: {role}
            
            Provide 15-20 skills categorized by type. Return as JSON:
            {{
                "technical_skills": [
                    {{"name": "skill", "importance": 1-5, "trend": "rising/stable/declining"}}
                ],
                "soft_skills": [
                    {{"name": "skill", "importance": 1-5, "description": "brief desc"}}
                ],
                "tools_software": [
                    {{"name": "tool", "category": "category", "market_demand": 1-5}}
                ]
            }}
            """

            payload = {
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 800,
                "temperature": 0.3
            }

            response = requests.post(
                f"{self.deepseek_base_url}/chat/completions",
                headers=self.deepseek_headers,
                json=payload
            )

            if response.status_code == 200:
                result = response.json()
                skills_data = json.loads(result['choices'][0]['message']['content'])

                # Cache for 24 hours
                cache.set(cache_key, skills_data, 86400)
                return skills_data
            else:
                raise Exception(f"DeepSeek API error: {response.status_code}")

        except Exception as e:
            logger.error(f"Error suggesting skills: {e}")
            return {"technical_skills": [], "soft_skills": [], "tools_software": []}

    async def generate_cover_letter(self, resume_id: str, job_description: str,
                                  company_name: str) -> str:
        """Generate personalized cover letter using OpenAI"""
        try:
            resume = Resume.objects.get(id=resume_id)
            resume_text = self._extract_resume_text(resume)

            prompt = f"""
            Write a compelling cover letter based on:
            
            RESUME SUMMARY:
            {resume_text[:1000]}  # Truncate for token limits
            
            JOB DESCRIPTION:
            {job_description[:800]}
            
            COMPANY: {company_name}
            
            Create a professional cover letter that:
            1. Opens with enthusiasm for the specific role
            2. Highlights relevant experience from the resume
            3. Shows knowledge of the company/role
            4. Demonstrates value proposition
            5. Ends with strong call to action
            
            Keep it to 3-4 paragraphs, professional tone.
            """

            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=600,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error generating cover letter: {e}")
            return "Unable to generate cover letter at this time."

    async def calculate_resume_score(self, resume_id: str) -> Dict:
        """Calculate comprehensive resume score using multiple AI models"""
        try:
            resume = Resume.objects.get(id=resume_id)

            # Get resume content
            content_score = self._analyze_content_quality(resume)
            ats_score = self._analyze_ats_compatibility(resume)
            completeness_score = self._analyze_completeness(resume)

            overall_score = (content_score + ats_score + completeness_score) / 3

            # Update resume scores
            resume.ai_score = overall_score
            resume.ats_score = ats_score
            resume.save()

            return {
                "overall_score": round(overall_score, 1),
                "content_quality": round(content_score, 1),
                "ats_compatibility": round(ats_score, 1),
                "completeness": round(completeness_score, 1),
                "recommendations": self._get_improvement_recommendations(resume)
            }

        except Exception as e:
            logger.error(f"Error calculating resume score: {e}")
            return {"overall_score": 0, "error": str(e)}

    def _extract_resume_text(self, resume: Resume) -> str:
        """Extract text content from resume for AI analysis"""
        content_parts = []

        # Personal info
        if hasattr(resume, 'personal_info'):
            info = resume.personal_info
            content_parts.append(f"Name: {info.full_name}")
            if info.professional_summary:
                content_parts.append(f"Summary: {info.professional_summary}")

        # Experience
        for exp in resume.experiences.all():
            content_parts.append(f"Experience: {exp.position} at {exp.company}")
            content_parts.append(exp.description)

        # Skills
        skills = [skill.name for skill in resume.skills.all()]
        if skills:
            content_parts.append(f"Skills: {', '.join(skills)}")

        # Education
        for edu in resume.education.all():
            content_parts.append(f"Education: {edu.degree} in {edu.field_of_study} from {edu.institution}")

        return "\n".join(content_parts)

    def _analyze_content_quality(self, resume: Resume) -> float:
        """Analyze content quality (placeholder implementation)"""
        score = 50.0  # Base score

        # Check for professional summary
        if hasattr(resume, 'personal_info') and resume.personal_info.professional_summary:
            score += 10

        # Check experience descriptions
        exp_count = resume.experiences.count()
        if exp_count > 0:
            score += min(exp_count * 10, 30)

        # Check skills
        skills_count = resume.skills.count()
        if skills_count > 5:
            score += 10

        return min(score, 100)

    def _analyze_ats_compatibility(self, resume: Resume) -> float:
        """Analyze ATS compatibility (placeholder implementation)"""
        score = 60.0  # Base ATS score

        # Check for keywords in descriptions
        if resume.experiences.exists():
            score += 20

        # Check for proper section structure
        if resume.skills.exists():
            score += 10

        if resume.education.exists():
            score += 10

        return min(score, 100)

    def _analyze_completeness(self, resume: Resume) -> float:
        """Analyze resume completeness"""
        score = 0
        max_score = 100

        # Required sections
        if hasattr(resume, 'personal_info'):
            score += 20
        if resume.experiences.exists():
            score += 30
        if resume.skills.exists():
            score += 20
        if resume.education.exists():
            score += 20

        # Optional but valuable sections
        if resume.projects.exists():
            score += 5
        if resume.certifications.exists():
            score += 5

        return min(score, max_score)

    def _get_improvement_recommendations(self, resume: Resume) -> List[str]:
        """Get specific improvement recommendations"""
        recommendations = []

        if not hasattr(resume, 'personal_info') or not resume.personal_info.professional_summary:
            recommendations.append("Add a compelling professional summary")

        if resume.experiences.count() < 2:
            recommendations.append("Add more work experience entries")

        if resume.skills.count() < 8:
            recommendations.append("Add more relevant skills")

        if not resume.projects.exists():
            recommendations.append("Include relevant projects to showcase your work")

        return recommendations
