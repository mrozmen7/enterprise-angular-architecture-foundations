import type { Project, ProjectId } from '../domain/project';
import { isProjectPriority, PROJECT_PRIORITIES } from '../domain/project-priority';
import type { ProjectRepository } from '../ports/project-repository';
import type { ProjectWorkspaceCommand } from './project-workspace.command';
import { reduceProjectWorkspace } from './project-workspace.reducer';
import {
  createProjectWorkspaceState,
  getFilteredProjects,
  getSelectedProject,
  isProjectStatusFilter,
  PROJECT_STATUS_FILTERS,
  type ProjectWorkspaceState,
} from './project-workspace.state';

export class ProjectWorkspaceService {
  private currentState: ProjectWorkspaceState;

  constructor(repository: ProjectRepository) {
    this.currentState = createProjectWorkspaceState(repository.getAll());
  }

  get state(): ProjectWorkspaceState {
    return this.currentState;
  }

  get statusOptions(): readonly string[] {
    return PROJECT_STATUS_FILTERS;
  }

  get priorityOptions(): readonly string[] {
    return PROJECT_PRIORITIES;
  }

  get filteredProjects(): readonly Project[] {
    return getFilteredProjects(this.state);
  }

  get selectedProject(): Project | null {
    return getSelectedProject(this.state);
  }

  updateSearch(searchTerm: string): void {
    this.dispatch({
      type: 'search-changed',
      searchTerm,
    });
  }

  updateStatusFilter(status: string): void {
    if (isProjectStatusFilter(status)) {
      this.dispatch({
        type: 'status-filter-changed',
        statusFilter: status,
      });
    }
  }

  resetFilters(): void {
    this.dispatch({ type: 'filters-reset' });
  }

  selectProject(projectId: ProjectId): void {
    this.dispatch({
      type: 'project-selected',
      projectId,
    });
  }

  updateProjectPriority(projectId: ProjectId, priority: string): void {
    if (isProjectPriority(priority)) {
      this.dispatch({
        type: 'project-priority-changed',
        projectId,
        priority,
      });
    }
  }

  clearSelection(): void {
    this.dispatch({ type: 'selection-cleared' });
  }

  private dispatch(command: ProjectWorkspaceCommand): void {
    this.currentState = reduceProjectWorkspace(this.currentState, command);
  }
}
