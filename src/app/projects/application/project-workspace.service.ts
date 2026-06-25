import type { Project, ProjectId } from '../domain/project';
import type { ProjectRepository } from '../ports/project-repository';
import {
  createProjectWorkspaceState,
  getFilteredProjects,
  getSelectedProject,
  isProjectStatusFilter,
  PROJECT_STATUS_FILTERS,
  type ProjectWorkspaceState,
} from './project-workspace.state';

export class ProjectWorkspaceService {
  readonly state: ProjectWorkspaceState;

  constructor(repository: ProjectRepository) {
    this.state = createProjectWorkspaceState(repository.getAll());
  }

  get statusOptions(): readonly string[] {
    return PROJECT_STATUS_FILTERS;
  }

  get filteredProjects(): readonly Project[] {
    return getFilteredProjects(this.state);
  }

  get selectedProject(): Project | null {
    return getSelectedProject(this.state);
  }

  updateSearch(searchTerm: string): void {
    this.state.searchTerm = searchTerm;
  }

  updateStatusFilter(status: string): void {
    if (isProjectStatusFilter(status)) {
      this.state.statusFilter = status;
    }
  }

  resetFilters(): void {
    this.state.searchTerm = '';
    this.state.statusFilter = 'All';
  }

  selectProject(projectId: ProjectId): void {
    this.state.selectedProjectId = projectId;
  }

  clearSelection(): void {
    this.state.selectedProjectId = null;
  }
}
