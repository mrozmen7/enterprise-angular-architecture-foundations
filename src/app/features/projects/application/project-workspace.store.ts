import { computed, Injector, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  concat,
  concatMap,
  debounceTime,
  defer,
  distinctUntilChanged,
  exhaustMap,
  forkJoin,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import type { Observable } from 'rxjs';
import type { Project, ProjectId } from '../domain/project';
import { isProjectPriority, PROJECT_PRIORITIES } from '../domain/project-priority';
import type { ProjectPriority } from '../domain/project-priority';
import {
  ProjectConflictError,
  type ProjectCollectionSnapshot,
  type ProjectLoadPolicy,
  type ProjectRepository,
} from '../ports/project-repository';
import type { ProjectBriefing } from './project-briefing';
import type { ProjectWorkspaceCommand } from './project-workspace.command';
import { reduceProjectWorkspace } from './project-workspace.reducer';
import {
  createProjectWorkspaceState,
  getSelectedProject,
  isProjectStatusFilter,
  PROJECT_STATUS_FILTERS,
  type ProjectWorkspaceState,
} from './project-workspace.state';
import {
  failedRequest,
  idleRequest,
  loadingRequest,
  successRequest,
  type RequestState,
} from './request-state';

type PrioritySaveRequest = {
  readonly projectId: ProjectId;
  readonly priority: ProjectPriority;
};

const EMPTY_PROJECT_SNAPSHOT: ProjectCollectionSnapshot = Object.freeze({
  projects: Object.freeze([]),
  source: 'network',
  fetchedAt: 0,
});

export class ProjectWorkspaceStore {
  private readonly stateSource: WritableSignal<ProjectWorkspaceState>;

  private readonly prioritySaveRequests = new Subject<PrioritySaveRequest>();

  private readonly briefingRequests = new Subject<ProjectId>();

  private readonly projectRefreshRequests = new Subject<ProjectLoadPolicy>();

  readonly state: Signal<ProjectWorkspaceState>;

  readonly searchTerm = computed(() => this.state().searchTerm);

  readonly statusFilter = computed(() => this.state().statusFilter);

  readonly selectedProject = computed(() => getSelectedProject(this.state()));

  readonly searchRequest: Signal<RequestState<readonly Project[]>>;

  readonly projectsRequest: Signal<RequestState<ProjectCollectionSnapshot>>;

  readonly prioritySaveRequest: Signal<RequestState<Project | null>>;

  readonly briefingRequest: Signal<RequestState<ProjectBriefing | null>>;

  readonly filteredProjects = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim();
    const matchingProjectIds =
      normalizedSearchTerm.length === 0
        ? null
        : new Set(this.searchRequest().data.map((project) => project.id));
    const statusFilter = this.statusFilter();

    return this.state().projects.filter(
      (project) =>
        (matchingProjectIds === null || matchingProjectIds.has(project.id)) &&
        (statusFilter === 'All' || project.status === statusFilter),
    );
  });

  readonly projectCount = computed(() => this.filteredProjects().length);

  readonly hasActiveFilters = computed(
    () => this.searchTerm().trim().length > 0 || this.statusFilter() !== 'All',
  );

  readonly isSearching = computed(() => this.searchRequest().status === 'loading');

  readonly isLoadingProjects = computed(() => this.projectsRequest().status === 'loading');

  readonly projectsLoadError = computed(() => {
    const request = this.projectsRequest();
    return request.status === 'error' ? request.message : null;
  });

  readonly projectDataSource = computed(() => this.projectsRequest().data.source);

  readonly lastSynchronizedAt = computed(() => this.projectsRequest().data.fetchedAt);

  readonly searchError = computed(() => {
    const request = this.searchRequest();
    return request.status === 'error' ? request.message : null;
  });

  readonly isSavingPriority = computed(() => this.prioritySaveRequest().status === 'loading');

  readonly prioritySaveError = computed(() => {
    const request = this.prioritySaveRequest();
    return request.status === 'error' ? request.message : null;
  });

  readonly isGeneratingBriefing = computed(() => this.briefingRequest().status === 'loading');

  readonly briefingError = computed(() => {
    const request = this.briefingRequest();
    return request.status === 'error' ? request.message : null;
  });

  readonly briefing = computed(() => {
    const request = this.briefingRequest();
    return request.status === 'success' ? request.data : null;
  });

  constructor(
    private readonly repository: ProjectRepository,
    injector: Injector,
  ) {
    this.stateSource = signal(createProjectWorkspaceState([]));
    this.state = this.stateSource.asReadonly();

    this.projectsRequest = toSignal(this.createProjectsRequest(), {
      initialValue: idleRequest(EMPTY_PROJECT_SNAPSHOT),
      injector,
    });

    this.searchRequest = toSignal(this.createSearchRequest(), {
      initialValue: idleRequest<readonly Project[]>([]),
      injector,
    });

    this.prioritySaveRequest = toSignal(this.createPrioritySaveRequest(), {
      initialValue: idleRequest<Project | null>(null),
      injector,
    });

    this.briefingRequest = toSignal(this.createBriefingRequest(), {
      initialValue: idleRequest<ProjectBriefing | null>(null),
      injector,
    });
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

  refreshProjects(): void {
    this.projectRefreshRequests.next('network-only');
  }

  selectProject(projectId: ProjectId): void {
    this.dispatch({
      type: 'project-selected',
      projectId,
    });
  }

  updateProjectPriority(projectId: ProjectId, priority: string): void {
    if (isProjectPriority(priority)) {
      this.prioritySaveRequests.next({
        projectId,
        priority,
      });
    }
  }

  generateBriefing(projectId: ProjectId): void {
    this.briefingRequests.next(projectId);
  }

  clearSelection(): void {
    this.dispatch({ type: 'selection-cleared' });
  }

  private createProjectsRequest(): Observable<RequestState<ProjectCollectionSnapshot>> {
    let latestSnapshot = EMPTY_PROJECT_SNAPSHOT;

    return this.projectRefreshRequests.pipe(
      startWith<ProjectLoadPolicy>('cache-first'),
      switchMap((policy) =>
        concat(
          of(loadingRequest(latestSnapshot)),
          this.repository.loadAll(policy).pipe(
            tap((snapshot) => {
              latestSnapshot = snapshot;
              this.dispatch({
                type: 'projects-synchronized',
                projects: snapshot.projects,
              });
            }),
            map((snapshot) => successRequest(snapshot)),
            catchError((error: unknown) => of(failedRequest(latestSnapshot, error))),
          ),
        ),
      ),
    );
  }

  private createSearchRequest(): Observable<RequestState<readonly Project[]>> {
    let latestProjects: readonly Project[] = [];

    return toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query.trim().length === 0) {
          latestProjects = [];
          return of(successRequest(latestProjects));
        }

        return concat(
          of(loadingRequest(latestProjects)),
          this.repository.search(query).pipe(
            tap((projects) => {
              latestProjects = projects;
            }),
            map((projects) => successRequest(projects)),
            catchError((error: unknown) => of(failedRequest(latestProjects, error))),
          ),
        );
      }),
    );
  }

  private createPrioritySaveRequest(): Observable<RequestState<Project | null>> {
    return this.prioritySaveRequests.pipe(
      concatMap((request) =>
        defer(() => {
          const previousProject =
            this.state().projects.find((project) => project.id === request.projectId) ?? null;

          if (previousProject === null) {
            return of(
              failedRequest<Project | null>(null, new Error('The project could not be found.')),
            );
          }

          this.dispatch({
            type: 'project-priority-changed',
            projectId: request.projectId,
            priority: request.priority,
          });

          return concat(
            of(loadingRequest<Project | null>(previousProject)),
            this.repository
              .savePriority(request.projectId, request.priority, previousProject.version)
              .pipe(
                tap((project) =>
                  this.dispatch({
                    type: 'project-synchronized',
                    project,
                  }),
                ),
                map((project) => successRequest<Project | null>(project)),
                catchError((error: unknown) => {
                  const restoredProject =
                    error instanceof ProjectConflictError ? error.serverProject : previousProject;

                  this.dispatch({
                    type: 'project-synchronized',
                    project: restoredProject,
                  });

                  return of(failedRequest<Project | null>(restoredProject, error));
                }),
              ),
          );
        }),
      ),
    );
  }

  private createBriefingRequest(): Observable<RequestState<ProjectBriefing | null>> {
    return this.briefingRequests.pipe(
      exhaustMap((projectId) =>
        concat(
          of(loadingRequest<ProjectBriefing | null>(null)),
          forkJoin({
            riskSummary: this.repository.loadRiskSummary(projectId),
            activitySummary: this.repository.loadActivitySummary(projectId),
          }).pipe(
            map(({ riskSummary, activitySummary }) =>
              successRequest<ProjectBriefing | null>({
                projectId,
                riskSummary,
                activitySummary,
              }),
            ),
            catchError((error: unknown) => of(failedRequest<ProjectBriefing | null>(null, error))),
          ),
        ),
      ),
    );
  }

  private dispatch(command: ProjectWorkspaceCommand): void {
    this.stateSource.update((state) => reduceProjectWorkspace(state, command));
  }
}
