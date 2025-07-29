'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ResumeJob {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result_url?: string;
  metadata: any;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export default function ResumeDemoPage() {
  const [activeTab, setActiveTab] = useState('builder');
  const [loading, setLoading] = useState(false);
  const [resumeJob, setResumeJob] = useState<ResumeJob | null>(null);
  
  // Personal Information
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, AI/ML integration, and cloud architecture. Passionate about building scalable solutions and leading high-performing teams.'
  });

  // Work Experience
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      company: 'Tech Corp',
      position: 'Senior Software Engineer',
      startDate: '2021-01',
      endDate: 'Present',
      description: 'Led development of microservices architecture handling 1M+ daily requests. Implemented AI-powered features using Python and TensorFlow, reducing processing time by 40%.'
    },
    {
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      startDate: '2019-06',
      endDate: '2020-12',
      description: 'Built responsive web applications using React, Node.js, and PostgreSQL. Collaborated with designers and product managers to deliver user-centric solutions.'
    }
  ]);

  // Education
  const [education, setEducation] = useState<Education[]>([
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduationDate: '2019-05',
      gpa: '3.8'
    }
  ]);

  // Skills
  const [skills, setSkills] = useState<string[]>([
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL', 'TensorFlow', 'Git'
  ]);

  // Resume templates
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  // Generate resume
  const generateResume = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal_info: personalInfo,
          work_experience: workExperience,
          education: education,
          skills: skills,
          template: selectedTemplate,
          format: selectedFormat,
          options: {
            include_photo: false,
            color_scheme: 'blue',
            font_family: 'calibri'
          }
        })
      });
      
      const data = await response.json();
      setResumeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Resume generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resume analysis and optimization
  const analyzeResume = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal_info: personalInfo,
          work_experience: workExperience,
          education: education,
          skills: skills,
          target_position: 'Software Engineer',
          industry: 'Technology'
        })
      });
      
      const data = await response.json();
      setResumeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Resume analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ATS scan simulation
  const scanATS = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/resume/ats-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal_info: personalInfo,
          work_experience: workExperience,
          education: education,
          skills: skills,
          job_description: 'Software Engineer position requiring React, Node.js, Python, and cloud experience. Bachelor\'s degree in Computer Science preferred.'
        })
      });
      
      const data = await response.json();
      setResumeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('ATS scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/resume/job/${jobId}`);
        const jobData = await response.json();
        setResumeJob(jobData);
        
        if (jobData.status === 'processing') {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };
    poll();
  };

  // Add work experience
  const addWorkExperience = () => {
    setWorkExperience([...workExperience, {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  // Remove work experience
  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  // Add education
  const addEducation = () => {
    setEducation([...education, {
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    }]);
  };

  // Remove education
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Add skill
  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  // Remove skill
  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'builder', label: 'Resume Builder', icon: '📝' },
    { id: 'analysis', label: 'Resume Analysis', icon: '🔍' },
    { id: 'ats', label: 'ATS Scanner', icon: '🤖' },
    { id: 'templates', label: 'Templates', icon: '🎨' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Resume Builder Demo
        </h1>
        <p className="text-gray-600">
          Professional resume generation, ATS optimization, and career analysis with AI assistance
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Resume Builder */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Full Name"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
              />
              <Input
                label="Email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
              />
              <Input
                label="Phone"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
              />
              <Input
                label="Location"
                value={personalInfo.location}
                onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Summary
              </label>
              <textarea
                value={personalInfo.summary}
                onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief professional summary..."
              />
            </div>
          </Card>

          {/* Work Experience */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Work Experience</h2>
              <Button onClick={addWorkExperience} variant="secondary">
                Add Experience
              </Button>
            </div>
            <div className="space-y-4">
              {workExperience.map((exp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Experience {index + 1}</h3>
                    <button
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[index].company = e.target.value;
                        setWorkExperience(updated);
                      }}
                    />
                    <Input
                      label="Position"
                      value={exp.position}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[index].position = e.target.value;
                        setWorkExperience(updated);
                      }}
                    />
                    <Input
                      label="Start Date"
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[index].startDate = e.target.value;
                        setWorkExperience(updated);
                      }}
                    />
                    <Input
                      label="End Date"
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[index].endDate = e.target.value;
                        setWorkExperience(updated);
                      }}
                      placeholder="Present if current"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[index].description = e.target.value;
                        setWorkExperience(updated);
                      }}
                      className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Key achievements and responsibilities..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Education</h2>
              <Button onClick={addEducation} variant="secondary">
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Education {index + 1}</h3>
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[index].institution = e.target.value;
                        setEducation(updated);
                      }}
                    />
                    <Input
                      label="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[index].degree = e.target.value;
                        setEducation(updated);
                      }}
                    />
                    <Input
                      label="Field of Study"
                      value={edu.field}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[index].field = e.target.value;
                        setEducation(updated);
                      }}
                    />
                    <Input
                      label="Graduation Date"
                      type="month"
                      value={edu.graduationDate}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[index].graduationDate = e.target.value;
                        setEducation(updated);
                      }}
                    />
                    <Input
                      label="GPA (Optional)"
                      value={edu.gpa || ''}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[index].gpa = e.target.value;
                        setEducation(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                    addSkill(input.value);
                    input.value = '';
                  }}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-blue-900">{skill}</span>
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Generation Controls */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generate Resume</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">Word Document</option>
                  <option value="html">HTML</option>
                </select>
              </div>
            </div>
            
            <Button onClick={generateResume} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Resume'}
            </Button>
          </Card>
        </div>
      )}

      {/* Resume Analysis */}
      {activeTab === 'analysis' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resume Analysis & Optimization</h2>
          <p className="text-gray-600 mb-4">
            Get AI-powered insights to improve your resume's effectiveness and impact.
          </p>
          
          <Button onClick={analyzeResume} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </Card>
      )}

      {/* ATS Scanner */}
      {activeTab === 'ats' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">ATS Compatibility Scanner</h2>
          <p className="text-gray-600 mb-4">
            Check how well your resume performs against Applicant Tracking Systems.
          </p>
          
          <Button onClick={scanATS} disabled={loading}>
            {loading ? 'Scanning...' : 'Run ATS Scan'}
          </Button>
        </Card>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resume Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['modern', 'classic', 'creative', 'minimal'].map((template) => (
              <div
                key={template}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Template Preview</span>
                </div>
                <h3 className="font-medium capitalize">{template}</h3>
                <p className="text-sm text-gray-600">
                  {template === 'modern' && 'Clean, contemporary design'}
                  {template === 'classic' && 'Traditional, professional layout'}
                  {template === 'creative' && 'Unique, eye-catching design'}
                  {template === 'minimal' && 'Simple, elegant structure'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Job Status */}
      {resumeJob && (
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Processing Status</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              resumeJob.status === 'completed' ? 'bg-green-500' :
              resumeJob.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="capitalize font-medium">{resumeJob.status}</span>
            <span className="text-sm text-gray-600">Job ID: {resumeJob.job_id}</span>
          </div>
          
          {resumeJob.status === 'completed' && (
            <div className="space-y-2">
              <Button 
                onClick={() => window.open(`http://localhost:8000/api/resume/download/${resumeJob.job_id}`, '_blank')}
              >
                Download Resume
              </Button>
              
              {resumeJob.metadata && resumeJob.metadata.analysis && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Analysis Results</h3>
                  {/* Display analysis results here */}
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(resumeJob.metadata.analysis, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Service Features */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Service Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">📝</div>
            <h3 className="font-semibold">Smart Builder</h3>
            <p className="text-sm text-gray-600">AI-assisted content generation</p>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-2xl mb-2">🤖</div>
            <h3 className="font-semibold">ATS Optimization</h3>
            <p className="text-sm text-gray-600">Applicant tracking system friendly</p>
          </div>
          <div className="text-center">
            <div className="text-purple-600 text-2xl mb-2">🎨</div>
            <h3 className="font-semibold">Professional Templates</h3>
            <p className="text-sm text-gray-600">Industry-specific designs</p>
          </div>
          <div className="text-center">
            <div className="text-orange-600 text-2xl mb-2">📊</div>
            <h3 className="font-semibold">Performance Analytics</h3>
            <p className="text-sm text-gray-600">Resume effectiveness metrics</p>
          </div>
        </div>
      </Card>
    </div>
  );
}