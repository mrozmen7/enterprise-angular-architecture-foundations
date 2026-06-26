import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, defer, map, Observable, of, tap, throwError } from 'rxjs';
import type { Project } from '../domain/project';
import type { ProjectPriority } from '../domain/project-priority';
import {
  ProjectConflictError,
  type ProjectCollectionSnapshot,
  type ProjectLoadPolicy,
  type ProjectRepository,
} from '../ports/project-repository';
import type { ProjectConflictDto, SaveProjectPriorityDto } from './project-api.dto';
import { mapProjectCollectionDto, mapProjectDto, readSummaryDto } from './project-api.mapper';

type ProjectCacheEntry = {
  readonly projects: readonly Project[];
  readonly fetchedAt: number;
};

const PROJECTS_API_URL = '/api/projects';
const CACHE_TTL_MS = 30_000;

@Injectable()
export class HttpProjectRepository implements ProjectRepository {
  private cache: ProjectCacheEntry | null = null;

  constructor(private readonly http: HttpClient) {}

  loadAll(policy: ProjectLoadPolicy = 'cache-first'): Observable<ProjectCollectionSnapshot> {
    return defer(() => {
      const now = Date.now();

      if (
        policy === 'cache-first' &&
        this.cache !== null &&
        now - this.cache.fetchedAt < CACHE_TTL_MS
      ) {
        return of({
          projects: this.cache.projects,
          source: 'cache' as const,
          fetchedAt: this.cache.fetchedAt,
        });
      }

      return this.http.get<unknown>(PROJECTS_API_URL).pipe(
        map(mapProjectCollectionDto),
        tap((projects) => {
          this.cache = {
            projects,
            fetchedAt: Date.now(),
          };
        }),
        map((projects) => ({
          projects,
          source: 'network' as const,
          fetchedAt: this.cache?.fetchedAt ?? now,
        })),
      );
    });
  }

  search(query: string): Observable<readonly Project[]> {
    const params = new HttpParams().set('q', query.trim());

    return this.http.get<unknown>(PROJECTS_API_URL, { params }).pipe(map(mapProjectCollectionDto));
  }

  savePriority(
    projectId: string,
    priority: ProjectPriority,
    expectedVersion: number,
  ): Observable<Project> {
    const body: SaveProjectPriorityDto = {
      priority,
      expectedVersion,
    };

    return this.http
      .patch<unknown>(`${PROJECTS_API_URL}/${encodeURIComponent(projectId)}/priority`, body)
      .pipe(
        map(mapProjectDto),
        tap((project) => this.updateCachedProject(project)),
        catchError((error: unknown) => this.mapSaveError(error)),
      );
  }

  loadRiskSummary(projectId: string): Observable<string> {
    return this.http
      .get<unknown>(`${PROJECTS_API_URL}/${encodeURIComponent(projectId)}/risk-summary`)
      .pipe(map(readSummaryDto));
  }

  loadActivitySummary(projectId: string): Observable<string> {
    return this.http
      .get<unknown>(`${PROJECTS_API_URL}/${encodeURIComponent(projectId)}/activity-summary`)
      .pipe(map(readSummaryDto));
  }

  private updateCachedProject(project: Project): void {
    if (this.cache === null) {
      return;
    }

    this.cache = {
      ...this.cache,
      projects: Object.freeze(
        this.cache.projects.map((candidate) => (candidate.id === project.id ? project : candidate)),
      ),
    };
  }

  private mapSaveError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      const body = error.error as Partial<ProjectConflictDto> | null;

      if (typeof body?.message === 'string') {
        try {
          return throwError(
            () => new ProjectConflictError(body.message!, mapProjectDto(body.currentProject)),
          );
        } catch {
          // The generic HTTP error below is safer than accepting a malformed conflict response.
        }
      }
    }

    if (error instanceof HttpErrorResponse) {
      return throwError(
        () =>
          new Error(
            error.status === 0
              ? 'The project API is unreachable.'
              : `The project API request failed with status ${error.status}.`,
          ),
      );
    }

    return throwError(() => (error instanceof Error ? error : new Error('Project save failed.')));
  }
}
