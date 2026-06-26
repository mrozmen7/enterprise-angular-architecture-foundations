import type { Project, ProjectId } from '../domain/project';
import type { ProjectPriority } from '../domain/project-priority';
import type { ProjectStatusFilter } from './project-workspace.state';

export type ProjectWorkspaceCommand =
  | {
      readonly type: 'search-changed';
      readonly searchTerm: string;
    }
  | {
      readonly type: 'status-filter-changed';
      readonly statusFilter: ProjectStatusFilter;
    }
  | {
      readonly type: 'project-selected';
      readonly projectId: ProjectId;
    }
  | {
      readonly type: 'project-priority-changed';
      readonly projectId: ProjectId;
      readonly priority: ProjectPriority;
    }
  | {
      readonly type: 'projects-synchronized';
      readonly projects: readonly Project[];
    }
  | {
      readonly type: 'project-synchronized';
      readonly project: Project;
    }
  | {
      readonly type: 'filters-reset';
    }
  | {
      readonly type: 'selection-cleared';
    };
