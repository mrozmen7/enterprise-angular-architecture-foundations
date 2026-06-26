import { computed, isSignal, isWritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { PROJECT_SEED } from '../data/project.seed';
import type { Project } from '../domain/project';
import type { ProjectPriority } from '../domain/project-priority';
import {
  ProjectConflictError,
  type ProjectCollectionSnapshot,
  type ProjectLoadPolicy,
  type ProjectRepository,
} from '../ports/project-repository';
import { PROJECT_REPOSITORY, PROJECT_WORKSPACE_PROVIDER } from '../project.providers';
import { ProjectWorkspaceStore } from './project-workspace.store';

type ControlledCall<T> = {
  readonly key: string;
  readonly result: Subject<T>;
};

class ControlledProjectRepository implements ProjectRepository {
  readonly loadCalls: ControlledCall<ProjectCollectionSnapshot>[] = [];
  readonly searchCalls: ControlledCall<readonly Project[]>[] = [];
  readonly priorityCalls: ControlledCall<Project>[] = [];
  readonly riskCalls: ControlledCall<string>[] = [];
  readonly activityCalls: ControlledCall<string>[] = [];

  loadAll(policy: ProjectLoadPolicy = 'cache-first') {
    const result = new Subject<ProjectCollectionSnapshot>();
    this.loadCalls.push({ key: policy, result });
    return result.asObservable();
  }

  search(query: string) {
    const result = new Subject<readonly Project[]>();
    this.searchCalls.push({ key: query, result });
    return result.asObservable();
  }

  savePriority(projectId: string, priority: ProjectPriority, expectedVersion: number) {
    const result = new Subject<Project>();
    this.priorityCalls.push({ key: `${projectId}:${priority}:v${expectedVersion}`, result });
    return result.asObservable();
  }

  loadRiskSummary(projectId: string) {
    const result = new Subject<string>();
    this.riskCalls.push({ key: projectId, result });
    return result.asObservable();
  }

  loadActivitySummary(projectId: string) {
    const result = new Subject<string>();
    this.activityCalls.push({ key: projectId, result });
    return result.asObservable();
  }
}

describe('ProjectWorkspaceStore RxJS workflows', () => {
  let repository: ControlledProjectRepository;
  let store: ProjectWorkspaceStore;

  beforeEach(() => {
    vi.useFakeTimers();
    repository = new ControlledProjectRepository();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: PROJECT_REPOSITORY,
          useValue: repository,
        },
        PROJECT_WORKSPACE_PROVIDER,
      ],
    });

    store = TestBed.inject(ProjectWorkspaceStore);
    completeLatestLoad(PROJECT_SEED);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should expose readonly source and derived signals', () => {
    expect(isSignal(store.state)).toBe(true);
    expect(isWritableSignal(store.state)).toBe(false);
    expect(isSignal(store.filteredProjects)).toBe(true);
    expect(isWritableSignal(store.filteredProjects)).toBe(false);
    expect(Object.isFrozen(store.state())).toBe(true);
  });

  it('should expose lazy and memoized computed values', () => {
    let derivationRuns = 0;
    const observedCount = computed(() => {
      derivationRuns += 1;
      return store.projectCount();
    });

    expect(derivationRuns).toBe(0);
    expect(observedCount()).toBe(3);
    expect(observedCount()).toBe(3);
    expect(derivationRuns).toBe(1);
  });

  it('should keep current data visible while a network refresh is running', () => {
    store.refreshProjects();

    expect(repository.loadCalls.at(-1)?.key).toBe('network-only');
    expect(store.isLoadingProjects()).toBe(true);
    expect(store.filteredProjects()).toEqual(PROJECT_SEED);

    const refreshedProjects = [
      {
        ...PROJECT_SEED[0]!,
        version: 2,
        summary: 'Server-refreshed summary.',
      },
    ];
    completeLatestLoad(refreshedProjects);

    expect(store.isLoadingProjects()).toBe(false);
    expect(store.state().projects).toEqual(refreshedProjects);
    expect(store.projectDataSource()).toBe('network');
  });

  it('should debounce search input and ignore duplicate queries', () => {
    store.updateSearch('B');
    flushSignalEffects();
    vi.advanceTimersByTime(100);
    store.updateSearch('Ba');
    flushSignalEffects();
    vi.advanceTimersByTime(100);
    store.updateSearch('Bank');
    flushSignalEffects();
    vi.advanceTimersByTime(299);

    expect(repository.searchCalls).toHaveLength(0);

    vi.advanceTimersByTime(1);

    expect(repository.searchCalls.map((call) => call.key)).toEqual(['Bank']);

    completeLatestSearch([PROJECT_SEED[0]!]);
    store.updateSearch('Bank');
    flushSignalEffects();
    vi.advanceTimersByTime(300);

    expect(repository.searchCalls).toHaveLength(1);
  });

  it('should cancel stale searches with switchMap', () => {
    store.updateSearch('Bank');
    flushSignalEffects();
    vi.advanceTimersByTime(300);
    const staleSearch = repository.searchCalls[0]!.result;

    store.updateSearch('Portal');
    flushSignalEffects();
    vi.advanceTimersByTime(300);
    const latestSearch = repository.searchCalls[1]!.result;

    staleSearch.next([PROJECT_SEED[0]!]);
    staleSearch.complete();

    expect(store.searchTerm()).toBe('Portal');
    expect(store.searchRequest().status).toBe('loading');

    latestSearch.next([PROJECT_SEED[1]!]);
    latestSearch.complete();

    expect(store.searchRequest().status).toBe('success');
    expect(store.filteredProjects().map((project) => project.name)).toEqual([
      'Customer Portal Redesign',
    ]);
  });

  it('should recover after a search error and preserve the last successful result', () => {
    store.updateSearch('Bank');
    flushSignalEffects();
    vi.advanceTimersByTime(300);
    completeLatestSearch([PROJECT_SEED[0]!]);

    store.updateSearch('error');
    flushSignalEffects();
    vi.advanceTimersByTime(300);
    repository.searchCalls.at(-1)!.result.error(new Error('Directory failed.'));

    expect(store.searchError()).toBe('Directory failed.');
    expect(store.filteredProjects()).toEqual([PROJECT_SEED[0]!]);

    store.updateSearch('Portal');
    flushSignalEffects();
    vi.advanceTimersByTime(300);
    completeLatestSearch([PROJECT_SEED[1]!]);

    expect(store.searchError()).toBeNull();
    expect(store.filteredProjects()).toEqual([PROJECT_SEED[1]!]);
  });

  it('should queue priority saves with concatMap', () => {
    store.updateProjectPriority('project-payment-platform-migration', 'Low');
    store.updateProjectPriority('project-customer-portal-redesign', 'High');

    expect(repository.priorityCalls.map((call) => call.key)).toEqual([
      'project-payment-platform-migration:Low:v1',
    ]);

    repository.priorityCalls[0]!.result.next({
      ...PROJECT_SEED[0]!,
      priority: 'Low',
      version: 2,
    });
    repository.priorityCalls[0]!.result.complete();

    expect(repository.priorityCalls.map((call) => call.key)).toEqual([
      'project-payment-platform-migration:Low:v1',
      'project-customer-portal-redesign:High:v1',
    ]);

    repository.priorityCalls[1]!.result.next({
      ...PROJECT_SEED[1]!,
      priority: 'High',
      version: 2,
    });
    repository.priorityCalls[1]!.result.complete();

    expect(store.state().projects[0]?.priority).toBe('Low');
    expect(store.state().projects[1]?.priority).toBe('High');
    expect(store.state().projects[0]?.version).toBe(2);
  });

  it('should optimistically update and roll back after a failed save', () => {
    store.updateProjectPriority('project-payment-platform-migration', 'Low');

    expect(store.state().projects[0]?.priority).toBe('Low');

    repository.priorityCalls[0]!.result.error(new Error('Save failed.'));

    expect(store.prioritySaveError()).toBe('Save failed.');
    expect(store.state().projects[0]?.priority).toBe('High');

    store.updateProjectPriority('project-customer-portal-redesign', 'High');

    expect(repository.priorityCalls).toHaveLength(2);
  });

  it('should reconcile a version conflict with the latest server project', () => {
    const serverProject = {
      ...PROJECT_SEED[0]!,
      version: 4,
      priority: 'Medium' as const,
    };

    store.updateProjectPriority(serverProject.id, 'Low');
    repository.priorityCalls[0]!.result.error(
      new ProjectConflictError(
        'Another user changed this project. The latest server version has been restored.',
        serverProject,
      ),
    );

    expect(store.prioritySaveError()).toContain('Another user changed');
    expect(store.state().projects[0]).toEqual(serverProject);
  });

  it('should ignore duplicate briefing requests while one is active', () => {
    store.generateBriefing('project-payment-platform-migration');
    store.generateBriefing('project-customer-portal-redesign');

    expect(repository.riskCalls).toHaveLength(1);
    expect(repository.activityCalls).toHaveLength(1);
    expect(repository.riskCalls[0]?.key).toBe('project-payment-platform-migration');
  });

  it('should wait for parallel briefing work to complete with forkJoin', () => {
    store.generateBriefing('project-payment-platform-migration');

    repository.riskCalls[0]!.result.next('Risk summary');
    repository.riskCalls[0]!.result.complete();

    expect(store.briefingRequest().status).toBe('loading');

    repository.activityCalls[0]!.result.next('Activity summary');
    repository.activityCalls[0]!.result.complete();

    expect(store.briefingRequest().status).toBe('success');
    expect(store.briefing()).toEqual({
      projectId: 'project-payment-platform-migration',
      riskSummary: 'Risk summary',
      activitySummary: 'Activity summary',
    });
  });

  function flushSignalEffects(): void {
    TestBed.tick();
  }

  function completeLatestSearch(projects: readonly Project[]): void {
    const call = repository.searchCalls.at(-1);

    if (!call) {
      throw new Error('A controlled search call was expected.');
    }

    call.result.next(projects);
    call.result.complete();
  }

  function completeLatestLoad(
    projects: readonly Project[],
    source: ProjectCollectionSnapshot['source'] = 'network',
  ): void {
    const call = repository.loadCalls.at(-1);

    if (!call) {
      throw new Error('A controlled project load was expected.');
    }

    call.result.next({
      projects,
      source,
      fetchedAt: Date.now(),
    });
    call.result.complete();
  }
});
