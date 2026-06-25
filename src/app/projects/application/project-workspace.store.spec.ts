import { computed, isSignal, isWritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { PROJECT_SEED } from '../data/project.seed';
import type { Project } from '../domain/project';
import type { ProjectPriority } from '../domain/project-priority';
import type { ProjectRepository } from '../ports/project-repository';
import { PROJECT_REPOSITORY, PROJECT_WORKSPACE_PROVIDER } from '../project.providers';
import { ProjectWorkspaceStore } from './project-workspace.store';

type ControlledCall<T> = {
  readonly key: string;
  readonly result: Subject<T>;
};

class ControlledProjectRepository implements ProjectRepository {
  readonly searchCalls: ControlledCall<readonly Project[]>[] = [];
  readonly priorityCalls: ControlledCall<Project>[] = [];
  readonly riskCalls: ControlledCall<string>[] = [];
  readonly activityCalls: ControlledCall<string>[] = [];

  getAll(): readonly Project[] {
    return PROJECT_SEED;
  }

  search(query: string) {
    const result = new Subject<readonly Project[]>();
    this.searchCalls.push({ key: query, result });
    return result.asObservable();
  }

  savePriority(projectId: string, priority: ProjectPriority) {
    const result = new Subject<Project>();
    this.priorityCalls.push({ key: `${projectId}:${priority}`, result });
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

  it('should debounce search input and ignore duplicate queries', () => {
    startInitialSearch();
    completeLatestSearch(PROJECT_SEED);
    repository.searchCalls.length = 0;

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
    startInitialSearch();
    completeLatestSearch(PROJECT_SEED);
    repository.searchCalls.length = 0;

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
    startInitialSearch();
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
      'project-payment-platform-migration:Low',
    ]);

    repository.priorityCalls[0]!.result.next({
      ...PROJECT_SEED[0]!,
      priority: 'Low',
    });
    repository.priorityCalls[0]!.result.complete();

    expect(repository.priorityCalls.map((call) => call.key)).toEqual([
      'project-payment-platform-migration:Low',
      'project-customer-portal-redesign:High',
    ]);

    repository.priorityCalls[1]!.result.next({
      ...PROJECT_SEED[1]!,
      priority: 'High',
    });
    repository.priorityCalls[1]!.result.complete();

    expect(store.state().projects[0]?.priority).toBe('Low');
    expect(store.state().projects[1]?.priority).toBe('High');
  });

  it('should keep the priority queue alive after a failed save', () => {
    store.updateProjectPriority('project-payment-platform-migration', 'Low');
    repository.priorityCalls[0]!.result.error(new Error('Save failed.'));

    expect(store.prioritySaveError()).toBe('Save failed.');

    store.updateProjectPriority('project-customer-portal-redesign', 'High');

    expect(repository.priorityCalls).toHaveLength(2);
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

  function startInitialSearch(): void {
    flushSignalEffects();
    vi.advanceTimersByTime(300);
    expect(repository.searchCalls[0]?.key).toBe('');
  }

  function completeLatestSearch(projects: readonly Project[]): void {
    const call = repository.searchCalls.at(-1);

    if (!call) {
      throw new Error('A controlled search call was expected.');
    }

    call.result.next(projects);
    call.result.complete();
  }
});
