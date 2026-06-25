import { computed, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import type { ProjectId } from '../domain/project';
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

export class ProjectWorkspaceStore {
  private readonly stateSource: WritableSignal<ProjectWorkspaceState>;

  readonly state: Signal<ProjectWorkspaceState>;

  readonly searchTerm = computed(() => this.state().searchTerm);

  readonly statusFilter = computed(() => this.state().statusFilter);

  readonly filteredProjects = computed(() => getFilteredProjects(this.state()));

  readonly selectedProject = computed(() => getSelectedProject(this.state()));

  readonly projectCount = computed(() => this.filteredProjects().length);

  readonly hasActiveFilters = computed(
    () => this.searchTerm().trim().length > 0 || this.statusFilter() !== 'All',
  );

  constructor(repository: ProjectRepository) {
    this.stateSource = signal(createProjectWorkspaceState(repository.getAll()));
    this.state = this.stateSource.asReadonly();
  }

  get statusOptions(): readonly string[] {
    return PROJECT_STATUS_FILTERS;
  }

  get priorityOptions(): readonly string[] {
    return PROJECT_PRIORITIES;
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
    this.stateSource.update((state) => reduceProjectWorkspace(state, command));
  }
}
