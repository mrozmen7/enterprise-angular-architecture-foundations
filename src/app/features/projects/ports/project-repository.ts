import type { Observable } from 'rxjs';
import type { Project } from '../domain/project';
import type { ProjectPriority } from '../domain/project-priority';

export type ProjectLoadPolicy = 'cache-first' | 'network-only';

export type ProjectCollectionSnapshot = {
  readonly projects: readonly Project[];
  readonly source: 'cache' | 'network';
  readonly fetchedAt: number;
};

export class ProjectConflictError extends Error {
  constructor(
    message: string,
    readonly serverProject: Project,
  ) {
    super(message);
    this.name = 'ProjectConflictError';
  }
}

export interface ProjectRepository {
  loadAll(policy?: ProjectLoadPolicy): Observable<ProjectCollectionSnapshot>;
  search(query: string): Observable<readonly Project[]>;
  savePriority(
    projectId: string,
    priority: ProjectPriority,
    expectedVersion: number,
  ): Observable<Project>;
  loadRiskSummary(projectId: string): Observable<string>;
  loadActivitySummary(projectId: string): Observable<string>;
}
