import type { Observable } from 'rxjs';
import type { Project } from '../domain/project';
import type { ProjectPriority } from '../domain/project-priority';

export interface ProjectRepository {
  getAll(): readonly Project[];
  search(query: string): Observable<readonly Project[]>;
  savePriority(projectId: string, priority: ProjectPriority): Observable<Project>;
  loadRiskSummary(projectId: string): Observable<string>;
  loadActivitySummary(projectId: string): Observable<string>;
}
