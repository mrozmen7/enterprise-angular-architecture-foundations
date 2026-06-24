import type { Project, ProjectId } from '../domain/project';
import { PROJECT_STATUSES } from '../domain/project-status';
import type { ProjectStatus } from '../domain/project-status';

export const PROJECT_STATUS_FILTERS = ['All', ...PROJECT_STATUSES] as const;

export type ProjectStatusFilter = 'All' | ProjectStatus;

export type ProjectWorkspaceState = {
  projects: readonly Project[];
  searchTerm: string;
  statusFilter: ProjectStatusFilter;
  selectedProjectId: ProjectId | null;
};

export function createProjectWorkspaceState(projects: readonly Project[]): ProjectWorkspaceState {
  return {
    projects,
    searchTerm: '',
    statusFilter: 'All',
    selectedProjectId: null,
  };
}

export function getFilteredProjects(state: ProjectWorkspaceState): readonly Project[] {
  const normalizedSearchTerm = state.searchTerm.trim().toLowerCase();

  return state.projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(normalizedSearchTerm) ||
      project.customer.name.toLowerCase().includes(normalizedSearchTerm);

    const matchesStatus = state.statusFilter === 'All' || project.status === state.statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export function getSelectedProject(state: ProjectWorkspaceState): Project | null {
  if (state.selectedProjectId === null) {
    return null;
  }

  return state.projects.find((project) => project.id === state.selectedProjectId) ?? null;
}

export function isProjectStatusFilter(value: unknown): value is ProjectStatusFilter {
  return PROJECT_STATUS_FILTERS.some((status) => status === value);
}
