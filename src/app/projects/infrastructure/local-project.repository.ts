import { Injectable } from '@angular/core';
import { defer, delay, mergeMap, of, throwError, timer } from 'rxjs';
import type { Observable } from 'rxjs';
import { PROJECT_SEED } from '../data/project.seed';
import type { Project } from '../domain/project';
import type { ProjectPriority } from '../domain/project-priority';
import type { ProjectRepository } from '../ports/project-repository';

@Injectable()
export class LocalProjectRepository implements ProjectRepository {
  getAll(): readonly Project[] {
    return PROJECT_SEED;
  }

  search(query: string): Observable<readonly Project[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === 'error') {
      return timer(450).pipe(
        mergeMap(() =>
          throwError(() => new Error('The project directory is temporarily unavailable.')),
        ),
      );
    }

    return defer(() =>
      of(
        PROJECT_SEED.filter(
          (project) =>
            project.name.toLowerCase().includes(normalizedQuery) ||
            project.customer.name.toLowerCase().includes(normalizedQuery),
        ),
      ),
    ).pipe(delay(normalizedQuery.length < 4 ? 650 : 350));
  }

  savePriority(projectId: string, priority: ProjectPriority): Observable<Project> {
    const project = PROJECT_SEED.find((candidate) => candidate.id === projectId);

    if (!project) {
      return throwError(() => new Error('The project could not be found.'));
    }

    return of({
      ...project,
      priority,
    }).pipe(delay(500));
  }

  loadRiskSummary(projectId: string): Observable<string> {
    return of(`No unresolved critical delivery risk for ${projectId}.`).pipe(delay(450));
  }

  loadActivitySummary(projectId: string): Observable<string> {
    return of(`Three project activities were recorded for ${projectId} this week.`).pipe(
      delay(650),
    );
  }
}
