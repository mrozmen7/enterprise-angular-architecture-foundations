import { computed, Injector, signal } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  concat,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  forkJoin,
  map,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import type { Observable } from 'rxjs';
import type { Project, ProjectId } from '../domain/project';
import { isProjectPriority, PROJECT_PRIORITIES } from '../domain/project-priority';
import type { ProjectPriority } from '../domain/project-priority';
import type { ProjectRepository } from '../ports/project-repository';
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

export class ProjectWorkspaceStore {
  private readonly stateSource: WritableSignal<ProjectWorkspaceState>;

  private readonly prioritySaveRequests = new Subject<PrioritySaveRequest>();

  private readonly briefingRequests = new Subject<ProjectId>();

  readonly state: Signal<ProjectWorkspaceState>;

  readonly searchTerm = computed(() => this.state().searchTerm);

  readonly statusFilter = computed(() => this.state().statusFilter);

  readonly selectedProject = computed(() => getSelectedProject(this.state()));

  readonly searchRequest: Signal<RequestState<readonly Project[]>>;

  readonly prioritySaveRequest: Signal<RequestState<Project | null>>;

  readonly briefingRequest: Signal<RequestState<ProjectBriefing | null>>;

  readonly filteredProjects = computed(() => {
    const matchingProjectIds = new Set(this.searchRequest().data.map((project) => project.id));
    const statusFilter = this.statusFilter();

    return this.state().projects.filter(
      (project) =>
        matchingProjectIds.has(project.id) &&
        (statusFilter === 'All' || project.status === statusFilter),
    );
  });

  readonly projectCount = computed(() => this.filteredProjects().length);

  readonly hasActiveFilters = computed(
    () => this.searchTerm().trim().length > 0 || this.statusFilter() !== 'All',
  );

  readonly isSearching = computed(() => this.searchRequest().status === 'loading');

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
    const initialProjects = repository.getAll();
    this.stateSource = signal(createProjectWorkspaceState(initialProjects));
    this.state = this.stateSource.asReadonly();

    this.searchRequest = toSignal(this.createSearchRequest(initialProjects), {
      initialValue: idleRequest(initialProjects),
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

  private createSearchRequest(
    initialProjects: readonly Project[],
  ): Observable<RequestState<readonly Project[]>> {
    let latestProjects = initialProjects;

    return toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) =>
        concat(
          of(loadingRequest(latestProjects)),
          this.repository.search(query).pipe(
            tap((projects) => {
              latestProjects = projects;
            }),
            map((projects) => successRequest(projects)),
            catchError((error: unknown) => of(failedRequest(latestProjects, error))),
          ),
        ),
      ),
    );
  }

  private createPrioritySaveRequest(): Observable<RequestState<Project | null>> {
    return this.prioritySaveRequests.pipe(
      concatMap((request) =>
        concat(
          of(loadingRequest<Project | null>(null)),
          this.repository.savePriority(request.projectId, request.priority).pipe(
            tap((project) =>
              this.dispatch({
                type: 'project-priority-changed',
                projectId: project.id,
                priority: project.priority,
              }),
            ),
            map((project) => successRequest<Project | null>(project)),
            catchError((error: unknown) => of(failedRequest<Project | null>(null, error))),
          ),
        ),
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
