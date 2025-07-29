import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8006;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Ensure directories exist
const ensureDirectories = async () => {
  const dirs = ['generated', 'templates', 'uploads'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true });
    } catch (error) {
      console.log(`Directory ${dir} already exists or error creating:`, error);
    }
  }
};

// Types
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements: string[];
}

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  github?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  languages: Array<{ name: string; proficiency: string }>;
  certifications: Array<{ name: string; issuer: string; date: string; url?: string }>;
  template: string;
  theme: string;
}

interface GenerationJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  filePath?: string;
  metadata: {
    template: string;
    theme: string;
    format: string;
    createdAt: string;
    completedAt?: string;
  };
  error?: string;
}

// In-memory job storage
const jobs: Map<string, GenerationJob> = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'resume-builder',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      pdf_generation: true,
      html_templates: true,
      ai_optimization: true
    }
  });
});

// Generate resume
app.post('/api/resume/generate', async (req, res) => {
  try {
    const resumeData: ResumeData = req.body;
    const format = req.query.format as string || 'pdf';
    
    // Validate required fields
    if (!resumeData.personalInfo?.fullName || !resumeData.personalInfo?.email) {
      return res.status(400).json({
        error: 'Personal information (fullName and email) is required'
      });
    }
    
    const jobId = uuidv4();
    
    // Create job
    jobs.set(jobId, {
      id: jobId,
      status: 'processing',
      metadata: {
        template: resumeData.template || 'modern',
        theme: resumeData.theme || 'blue',
        format,
        createdAt: new Date().toISOString()
      }
    });
    
    // Start generation process (async)
    generateResumeAsync(jobId, resumeData, format).catch(error => {
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
      }
    });
    
    res.json({
      jobId,
      status: 'processing',
      message: 'Resume generation started'
    });
    
  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({
      error: 'Failed to start resume generation'
    });
  }
});

// Get job status
app.get('/api/resume/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

// Download generated resume
app.get('/api/resume/download/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  if (job.status !== 'completed' || !job.filePath) {
    return res.status(400).json({ error: 'Resume not ready for download' });
  }
  
  try {
    const filePath = path.join(__dirname, job.filePath);
    const fileName = `resume_${jobId}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileBuffer = await fs.readFile(filePath);
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
});

// Get available templates
app.get('/api/resume/templates', (req, res) => {
  const templates = [
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean, modern design with emphasis on readability',
      preview: '/templates/modern-preview.png',
      themes: ['blue', 'green', 'purple', 'red', 'black']
    },
    {
      id: 'classic',
      name: 'Classic Traditional',
      description: 'Traditional layout perfect for conservative industries',
      preview: '/templates/classic-preview.png',
      themes: ['blue', 'black', 'gray']
    },
    {
      id: 'creative',
      name: 'Creative Designer',
      description: 'Eye-catching design for creative professionals',
      preview: '/templates/creative-preview.png',
      themes: ['orange', 'pink', 'teal', 'purple']
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      description: 'Ultra-clean design focusing on content',
      preview: '/templates/minimal-preview.png',
      themes: ['black', 'gray', 'blue']
    },
    {
      id: 'executive',
      name: 'Executive Professional',
      description: 'Sophisticated design for senior positions',
      preview: '/templates/executive-preview.png',
      themes: ['navy', 'burgundy', 'black']
    }
  ];
  
  res.json({ templates });
});

// AI-powered resume optimization
app.post('/api/resume/optimize', async (req, res) => {
  try {
    const { resumeData, jobDescription, targetRole } = req.body;
    
    // Mock AI optimization (replace with actual AI service call)
    const optimizedResume = await optimizeResumeWithAI(resumeData, jobDescription, targetRole);
    
    res.json({
      optimizedResume,
      improvements: [
        'Enhanced summary to match job requirements',
        'Reordered skills based on job description relevance',
        'Improved achievement descriptions with quantifiable results',
        'Optimized keywords for ATS compatibility'
      ],
      atsScore: 85,
      suggestions: [
        'Consider adding more specific metrics to your achievements',
        'Include industry-specific keywords from the job description',
        'Highlight leadership experience more prominently'
      ]
    });
    
  } catch (error) {
    console.error('Resume optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// Parse resume from file
app.post('/api/resume/parse', async (req, res) => {
  // This would integrate with document parsing services
  res.json({
    message: 'Resume parsing feature coming soon',
    supportedFormats: ['pdf', 'docx', 'txt']
  });
});

// Batch resume generation
app.post('/api/resume/batch-generate', async (req, res) => {
  try {
    const { resumes, template, theme } = req.body;
    
    if (!Array.isArray(resumes) || resumes.length === 0) {
      return res.status(400).json({ error: 'Resumes array is required' });
    }
    
    if (resumes.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 resumes per batch' });
    }
    
    const batchId = uuidv4();
    const jobIds: string[] = [];
    
    // Create individual jobs for each resume
    for (const resumeData of resumes) {
      const jobId = uuidv4();
      jobIds.push(jobId);
      
      jobs.set(jobId, {
        id: jobId,
        status: 'processing',
        metadata: {
          template: template || 'modern',
          theme: theme || 'blue',
          format: 'pdf',
          createdAt: new Date().toISOString()
        }
      });
      
      // Start generation (async)
      generateResumeAsync(jobId, { ...resumeData, template, theme }, 'pdf').catch(error => {
        const job = jobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.error = error.message;
        }
      });
    }
    
    res.json({
      batchId,
      jobIds,
      totalJobs: jobIds.length,
      status: 'processing'
    });
    
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ error: 'Failed to start batch generation' });
  }
});

// Resume generation function
async function generateResumeAsync(jobId: string, resumeData: ResumeData, format: string) {
  try {
    const job = jobs.get(jobId);
    if (!job) throw new Error('Job not found');
    
    // Generate HTML content
    const htmlContent = generateResumeHTML(resumeData);
    
    // Convert to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    const pdfPath = path.join(__dirname, 'generated', `resume_${jobId}.pdf`);
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();
    
    // Update job status
    job.status = 'completed';
    job.filePath = `generated/resume_${jobId}.pdf`;
    job.metadata.completedAt = new Date().toISOString();
    
  } catch (error) {
    console.error('Resume generation error:', error);
    const job = jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error.message;
    }
  }
}

// Generate HTML content for resume
function generateResumeHTML(resumeData: ResumeData): string {
  const { personalInfo, experience, education, skills, projects, languages, certifications } = resumeData;
  const template = resumeData.template || 'modern';
  const theme = resumeData.theme || 'blue';
  
  const themeColors = {
    blue: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
    green: { primary: '#059669', secondary: '#047857', accent: '#10b981' },
    purple: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
    red: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' },
    black: { primary: '#1f2937', secondary: '#111827', accent: '#374151' },
    gray: { primary: '#6b7280', secondary: '#4b5563', accent: '#9ca3af' },
    orange: { primary: '#ea580c', secondary: '#c2410c', accent: '#f97316' },
    pink: { primary: '#db2777', secondary: '#be185d', accent: '#ec4899' },
    teal: { primary: '#0d9488', secondary: '#0f766e', accent: '#14b8a6' },
    navy: { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
    burgundy: { primary: '#991b1b', secondary: '#7f1d1d', accent: '#dc2626' }
  };
  
  const colors = themeColors[theme as keyof typeof themeColors] || themeColors.blue;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${personalInfo.fullName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
        }
        
        .header {
            background: ${colors.primary};
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .header .contact-info {
            font-size: 1.1em;
            margin-top: 15px;
        }
        
        .header .contact-info span {
            margin: 0 15px;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 35px;
        }
        
        .section-title {
            font-size: 1.4em;
            color: ${colors.primary};
            border-bottom: 2px solid ${colors.accent};
            padding-bottom: 8px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        
        .summary {
            font-size: 1.1em;
            line-height: 1.7;
            color: #555;
        }
        
        .experience-item, .education-item, .project-item {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .experience-item:last-child,
        .education-item:last-child,
        .project-item:last-child {
            border-bottom: none;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .item-title {
            font-size: 1.2em;
            font-weight: bold;
            color: ${colors.secondary};
        }
        
        .item-company {
            font-size: 1.1em;
            color: #666;
            margin-bottom: 5px;
        }
        
        .item-date {
            color: #888;
            font-size: 0.95em;
            white-space: nowrap;
        }
        
        .item-description {
            margin-top: 10px;
            color: #555;
        }
        
        .achievements {
            list-style: none;
            margin-top: 10px;
        }
        
        .achievements li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 5px;
            color: #555;
        }
        
        .achievements li:before {
            content: "▸";
            color: ${colors.accent};
            position: absolute;
            left: 0;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .skill-category {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid ${colors.accent};
        }
        
        .skill-category h4 {
            color: ${colors.secondary};
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .skill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 5px 0;
        }
        
        .skill-level {
            font-size: 0.9em;
            color: #666;
            font-weight: bold;
        }
        
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .certifications, .languages {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
        }
        
        .cert-item, .lang-item {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
        }
        
        .cert-item:last-child,
        .lang-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .cert-name, .lang-name {
            font-weight: bold;
            color: ${colors.secondary};
        }
        
        .cert-issuer, .lang-level {
            color: #666;
            font-size: 0.95em;
        }
        
        .technologies {
            margin-top: 10px;
        }
        
        .tech-tag {
            display: inline-block;
            background: ${colors.accent};
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            margin: 2px 5px 2px 0;
        }
        
        @media print {
            body { print-color-adjust: exact; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${personalInfo.fullName}</h1>
            <div class="contact-info">
                <span>📧 ${personalInfo.email}</span>
                <span>📱 ${personalInfo.phone}</span>
                <span>📍 ${personalInfo.location}</span>
                ${personalInfo.website ? `<span>🌐 ${personalInfo.website}</span>` : ''}
                ${personalInfo.linkedin ? `<span>💼 LinkedIn</span>` : ''}
                ${personalInfo.github ? `<span>💻 GitHub</span>` : ''}
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">Professional Summary</h2>
                <div class="summary">${personalInfo.summary}</div>
            </div>
            
            ${experience.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Professional Experience</h2>
                ${experience.map(exp => `
                    <div class="experience-item">
                        <div class="item-header">
                            <div>
                                <div class="item-title">${exp.position}</div>
                                <div class="item-company">${exp.company}</div>
                            </div>
                            <div class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                        </div>
                        <div class="item-description">${exp.description}</div>
                        ${exp.achievements.length > 0 ? `
                            <ul class="achievements">
                                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${projects.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Key Projects</h2>
                ${projects.map(project => `
                    <div class="project-item">
                        <div class="item-header">
                            <div>
                                <div class="item-title">${project.name}</div>
                            </div>
                            <div class="item-date">${project.startDate}${project.endDate ? ` - ${project.endDate}` : ''}</div>
                        </div>
                        <div class="item-description">${project.description}</div>
                        <div class="technologies">
                            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${education.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Education</h2>
                ${education.map(edu => `
                    <div class="education-item">
                        <div class="item-header">
                            <div>
                                <div class="item-title">${edu.degree} in ${edu.fieldOfStudy}</div>
                                <div class="item-company">${edu.institution}</div>
                            </div>
                            <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
                        </div>
                        ${edu.gpa ? `<div class="item-description">GPA: ${edu.gpa}</div>` : ''}
                        ${edu.achievements.length > 0 ? `
                            <ul class="achievements">
                                ${edu.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${skills.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-grid">
                    ${Object.entries(groupSkillsByCategory(skills)).map(([category, categorySkills]) => `
                        <div class="skill-category">
                            <h4>${category}</h4>
                            ${categorySkills.map(skill => `
                                <div class="skill-item">
                                    <span>${skill.name}</span>
                                    <span class="skill-level">${skill.level}</span>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="two-column">
                ${certifications.length > 0 ? `
                <div class="certifications">
                    <h3 class="section-title">Certifications</h3>
                    ${certifications.map(cert => `
                        <div class="cert-item">
                            <div class="cert-name">${cert.name}</div>
                            <div class="cert-issuer">${cert.issuer} • ${cert.date}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${languages.length > 0 ? `
                <div class="languages">
                    <h3 class="section-title">Languages</h3>
                    ${languages.map(lang => `
                        <div class="lang-item">
                            <div class="lang-name">${lang.name}</div>
                            <div class="lang-level">${lang.proficiency}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Helper function to group skills by category
function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
}

// AI optimization function (mock)
async function optimizeResumeWithAI(resumeData: ResumeData, jobDescription: string, targetRole: string): Promise<ResumeData> {
  // Mock AI optimization - in production, this would call your AI service
  return {
    ...resumeData,
    personalInfo: {
      ...resumeData.personalInfo,
      summary: `${resumeData.personalInfo.summary} Experienced ${targetRole} with proven track record in delivering results.`
    },
    skills: resumeData.skills.map(skill => ({
      ...skill,
      // Prioritize skills mentioned in job description
      level: jobDescription.toLowerCase().includes(skill.name.toLowerCase()) ? 'Expert' : skill.level
    }))
  };
}

// Start server
const startServer = async () => {
  await ensureDirectories();
  
  app.listen(PORT, () => {
    console.log(`🚀 Resume Builder Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
};

startServer().catch(console.error);