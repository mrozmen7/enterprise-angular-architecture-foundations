import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PROJECT_SEED } from '../data/project.seed';
import { ProjectConflictError } from '../ports/project-repository';
import { HttpProjectRepository } from './http-project.repository';
import { mapProjectToDto } from './project-api.mapper';

describe('HttpProjectRepository', () => {
  let repository: HttpProjectRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T12:00:00.000Z'));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HttpProjectRepository],
    });

    repository = TestBed.inject(HttpProjectRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
  });

  it('should load, validate, and cache a project collection for thirty seconds', () => {
    let firstSource: string | undefined;
    let secondSource: string | undefined;

    repository.loadAll().subscribe((snapshot) => {
      firstSource = snapshot.source;
      expect(snapshot.projects).toEqual(PROJECT_SEED);
    });

    const request = httpTesting.expectOne('/api/projects');
    expect(request.request.method).toBe('GET');
    request.flush(PROJECT_SEED.map(mapProjectToDto));

    repository.loadAll().subscribe((snapshot) => {
      secondSource = snapshot.source;
      expect(snapshot.projects).toEqual(PROJECT_SEED);
    });

    expect(firstSource).toBe('network');
    expect(secondSource).toBe('cache');
    httpTesting.expectNone('/api/projects');
  });

  it('should bypass a fresh cache for an explicit server refresh', () => {
    repository.loadAll().subscribe();
    httpTesting.expectOne('/api/projects').flush(PROJECT_SEED.map(mapProjectToDto));

    repository.loadAll('network-only').subscribe((snapshot) => {
      expect(snapshot.source).toBe('network');
    });

    httpTesting.expectOne('/api/projects').flush(PROJECT_SEED.map(mapProjectToDto));
  });

  it('should treat an expired cache entry as stale and reload from the network', () => {
    repository.loadAll().subscribe();
    httpTesting.expectOne('/api/projects').flush(PROJECT_SEED.map(mapProjectToDto));

    vi.advanceTimersByTime(30_001);
    repository.loadAll().subscribe((snapshot) => {
      expect(snapshot.source).toBe('network');
    });

    httpTesting.expectOne('/api/projects').flush(PROJECT_SEED.map(mapProjectToDto));
  });

  it('should send search parameters through the HTTP boundary', () => {
    let resultCount = 0;

    repository.search('  Bank  ').subscribe((projects) => {
      resultCount = projects.length;
    });

    const request = httpTesting.expectOne(
      (candidate) => candidate.url === '/api/projects' && candidate.params.get('q') === 'Bank',
    );
    request.flush([mapProjectToDto(PROJECT_SEED[0]!)]);

    expect(resultCount).toBe(1);
  });

  it('should send the expected version and update its cache after a successful save', () => {
    repository.loadAll().subscribe();
    httpTesting.expectOne('/api/projects').flush(PROJECT_SEED.map(mapProjectToDto));

    const savedProject = {
      ...PROJECT_SEED[0]!,
      priority: 'Low' as const,
      version: 2,
    };

    repository
      .savePriority(savedProject.id, savedProject.priority, 1)
      .subscribe((project) => expect(project).toEqual(savedProject));

    const request = httpTesting.expectOne(`/api/projects/${savedProject.id}/priority`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      priority: 'Low',
      expectedVersion: 1,
    });
    request.flush(mapProjectToDto(savedProject));

    repository.loadAll().subscribe((snapshot) => {
      expect(snapshot.source).toBe('cache');
      expect(snapshot.projects[0]).toEqual(savedProject);
    });
  });

  it('should convert HTTP 409 into a domain-level conflict containing server truth', () => {
    const serverProject = {
      ...PROJECT_SEED[0]!,
      version: 3,
      priority: 'Medium' as const,
    };
    let receivedError: unknown;

    repository.savePriority(serverProject.id, 'Low', 1).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(`/api/projects/${serverProject.id}/priority`).flush(
      {
        message: 'Another user changed this project.',
        currentProject: mapProjectToDto(serverProject),
      },
      {
        status: 409,
        statusText: 'Conflict',
      },
    );

    expect(receivedError).toBeInstanceOf(ProjectConflictError);
    expect((receivedError as ProjectConflictError).serverProject).toEqual(serverProject);
  });
});
