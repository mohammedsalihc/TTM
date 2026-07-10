import DashboardLayout from '../components/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';

function Projects() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} projects</p>
        </div>
        <button
          type="button"
          className="shrink-0 bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-indigo-500 transition-colors"
        >
          + Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Projects;
