import type { ProjectWorkspaceCommand } from './project-workspace.command';
import type { ProjectWorkspaceState } from './project-workspace.state';

export function reduceProjectWorkspace(
  state: ProjectWorkspaceState,
  command: ProjectWorkspaceCommand,
): ProjectWorkspaceState {
  switch (command.type) {
    case 'search-changed':
      return command.searchTerm === state.searchTerm
        ? state
        : freezeState({
            ...state,
            searchTerm: command.searchTerm,
          });

    case 'status-filter-changed':
      return command.statusFilter === state.statusFilter
        ? state
        : freezeState({
            ...state,
            statusFilter: command.statusFilter,
          });

    case 'project-selected': {
      const projectExists = state.projects.some((project) => project.id === command.projectId);

      if (!projectExists || state.selectedProjectId === command.projectId) {
        return state;
      }

      return freezeState({
        ...state,
        selectedProjectId: command.projectId,
      });
    }

    case 'project-priority-changed': {
      const project = state.projects.find((candidate) => candidate.id === command.projectId);

      if (!project || project.priority === command.priority) {
        return state;
      }

      const projects = state.projects.map((candidate) =>
        candidate.id === command.projectId
          ? {
              ...candidate,
              priority: command.priority,
            }
          : candidate,
      );

      return freezeState({
        ...state,
        projects: Object.freeze(projects),
      });
    }

    case 'projects-synchronized': {
      const selectedProjectStillExists =
        state.selectedProjectId === null ||
        command.projects.some((project) => project.id === state.selectedProjectId);

      return freezeState({
        ...state,
        projects: Object.freeze([...command.projects]),
        selectedProjectId: selectedProjectStillExists ? state.selectedProjectId : null,
      });
    }

    case 'project-synchronized': {
      const projectIndex = state.projects.findIndex(
        (candidate) => candidate.id === command.project.id,
      );

      if (projectIndex === -1 || state.projects[projectIndex] === command.project) {
        return state;
      }

      const projects = [...state.projects];
      projects[projectIndex] = command.project;

      return freezeState({
        ...state,
        projects: Object.freeze(projects),
      });
    }

    case 'filters-reset':
      return state.searchTerm === '' && state.statusFilter === 'All'
        ? state
        : freezeState({
            ...state,
            searchTerm: '',
            statusFilter: 'All',
          });

    case 'selection-cleared':
      return state.selectedProjectId === null
        ? state
        : freezeState({
            ...state,
            selectedProjectId: null,
          });

    default:
      return assertNever(command);
  }
}

function freezeState(state: ProjectWorkspaceState): ProjectWorkspaceState {
  return Object.freeze(state);
}

function assertNever(value: never): never {
  throw new Error(`Unhandled project workspace command: ${JSON.stringify(value)}`);
}
