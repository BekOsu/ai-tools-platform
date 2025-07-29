import React, { useState } from 'react';
import { Project } from '../../../types/resume';

interface ProjectsEditorProps {
  data: Project[];
  onUpdate: (data: Project[]) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [projects, setProjects] = useState<Project[]>(data || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addProject = () => {
    const newProject: Project = {
      title: '',
      description: '',
      technologies: [],
      url: '',
      github_url: '',
      start_date: '',
      end_date: '',
      is_ongoing: false,
      team_size: undefined,
      role: '',
      achievements: [],
      order: projects.length,
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setEditingIndex(projects.length);
    onUpdate(updatedProjects);
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updatedProjects = projects.map((project, i) =>
      i === index ? { ...project, [field]: value } : project
    );
    setProjects(updatedProjects);
    onUpdate(updatedProjects);
  };

  const removeProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    setEditingIndex(null);
    onUpdate(updatedProjects);
  };

  const addTechnology = (projectIndex: number, tech: string) => {
    const project = projects[projectIndex];
    const updatedTechnologies = [...(project.technologies || []), tech];
    updateProject(projectIndex, 'technologies', updatedTechnologies);
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const project = projects[projectIndex];
    const updatedTechnologies = (project.technologies || []).filter((_, i) => i !== techIndex);
    updateProject(projectIndex, 'technologies', updatedTechnologies);
  };

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🚀</div>
          <p className="text-gray-500 mb-4">No projects added yet</p>
          <button
            onClick={addProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        projects.map((project, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Project Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {project.title || 'Project Title'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {project.start_date} - {project.is_ongoing ? 'Ongoing' : project.end_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => removeProject(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Project Form */}
            {editingIndex === index && (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="E-commerce Platform"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Role
                    </label>
                    <input
                      type="text"
                      value={project.role}
                      onChange={(e) => updateProject(index, 'role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Lead Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={project.team_size || ''}
                      onChange={(e) => updateProject(index, 'team_size', parseInt(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="4"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what the project does, your contributions, and the impact..."
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      value={project.start_date}
                      onChange={(e) => updateProject(index, 'start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {!project.is_ongoing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="month"
                        value={project.end_date}
                        onChange={(e) => updateProject(index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={project.is_ongoing}
                        onChange={(e) => updateProject(index, 'is_ongoing', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Ongoing project</span>
                    </label>
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={project.url}
                      onChange={(e) => updateProject(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://myproject.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Repository
                    </label>
                    <input
                      type="url"
                      value={project.github_url}
                      onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Technologies Used
                  </label>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {(project.technologies || []).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tech}
                        <button
                          onClick={() => removeTechnology(index, techIndex)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add technology (e.g., React, Node.js)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            addTechnology(index, input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Key Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Achievements & Impact
                  </label>
                  <textarea
                    value={project.achievements.join('\n')}
                    onChange={(e) => updateProject(index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="• Increased user engagement by 40%&#10;• Reduced page load time by 60%&#10;• Implemented secure payment processing"
                  />
                  <p className="text-sm text-gray-500 mt-1">One achievement per line. Include metrics when possible.</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Add Project Button */}
      {projects.length > 0 && (
        <button
          onClick={addProject}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Another Project
        </button>
      )}
    </div>
  );
};
