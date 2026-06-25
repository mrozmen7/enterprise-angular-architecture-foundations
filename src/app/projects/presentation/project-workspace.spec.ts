import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PROJECT_SEED } from '../data/project.seed';
import type { ProjectPriority } from '../domain/project-priority';
import type { ProjectRepository } from '../ports/project-repository';
import { PROJECT_REPOSITORY } from '../project.providers';
import { ProjectWorkspace } from './project-workspace';

describe('ProjectWorkspace presentation', () => {
  let repositoryProjects = PROJECT_SEED;

  const fakeRepository: ProjectRepository = {
    getAll: () => repositoryProjects,
    search: (query) =>
      of(
        repositoryProjects.filter(
          (project) =>
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.customer.name.toLowerCase().includes(query.toLowerCase()),
        ),
      ),
    savePriority: (projectId, priority: ProjectPriority) =>
      of({
        ...repositoryProjects.find((project) => project.id === projectId)!,
        priority,
      }),
    loadRiskSummary: () => of('Risk summary'),
    loadActivitySummary: () => of('Activity summary'),
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    repositoryProjects = PROJECT_SEED;

    await TestBed.configureTestingModule({
      imports: [ProjectWorkspace],
      providers: [{ provide: PROJECT_REPOSITORY, useValue: fakeRepository }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render projects supplied through the repository port', () => {
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(3);
    expect(compiled.querySelector('.result-count')?.textContent).toContain('3 projects found');
  });

  it('should work unchanged when DI supplies a different repository result', () => {
    repositoryProjects = [PROJECT_SEED[1]!];
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(1);
    expect(compiled.querySelector('.project-card')?.textContent).toContain(
      'Customer Portal Redesign',
    );
    expect(compiled.textContent).not.toContain('Northstar Bank');
  });

  it('should select a project and render its details', () => {
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const firstDetailsButton = compiled.querySelector<HTMLButtonElement>(
      '.project-card .button--primary',
    );

    firstDetailsButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.project-detail h2')?.textContent).toContain(
      'Payment Platform Migration',
    );
    expect(compiled.querySelector('.project-detail')?.textContent).toContain('Maya Chen');
    expect(compiled.querySelector('.project-card--selected')).toBeTruthy();
  });

  it('should update the selected project priority', () => {
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const firstDetailsButton = compiled.querySelector<HTMLButtonElement>(
      '.project-card .button--primary',
    );

    firstDetailsButton?.click();
    fixture.detectChanges();

    const prioritySelect = compiled.querySelector<HTMLSelectElement>(
      'select[aria-label="Project priority"]',
    );

    if (!prioritySelect) {
      throw new Error('Project priority control was not rendered.');
    }

    const lowOption = Array.from(prioritySelect.options).find((option) => option.value === 'Low');

    if (!lowOption) {
      throw new Error('Low priority option was not rendered.');
    }

    lowOption.selected = true;
    prioritySelect.value = 'Low';
    prioritySelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(compiled.querySelector('.project-card')?.textContent).toContain('Priority: Low');
    expect(prioritySelect.value).toBe('Low');
  });

  it('should search projects by customer name', () => {
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const searchInput = compiled.querySelector<HTMLInputElement>('input[type="search"]');

    if (!searchInput) {
      throw new Error('Search input was not rendered.');
    }

    searchInput.value = 'Helvetia';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(1);
    expect(compiled.querySelector('.project-card')?.textContent).toContain(
      'Compliance Reporting Automation',
    );
  });

  it('should filter projects by status', () => {
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statusSelect = compiled.querySelector<HTMLSelectElement>('select');

    if (!statusSelect) {
      throw new Error('Status filter was not rendered.');
    }

    const planningOption = Array.from(statusSelect.options).find(
      (option) => option.value === 'Planning',
    );

    if (!planningOption) {
      throw new Error('Planning status option was not rendered.');
    }

    planningOption.selected = true;
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(1);
    expect(compiled.querySelector('.project-card')?.textContent).toContain(
      'Customer Portal Redesign',
    );
  });

  it('should render an empty state when no project matches', () => {
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const searchInput = compiled.querySelector<HTMLInputElement>('input[type="search"]');

    if (!searchInput) {
      throw new Error('Search input was not rendered.');
    }

    searchInput.value = 'Unknown project';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(0);
    expect(compiled.querySelector('.empty-state')?.textContent).toContain('No matching projects');
  });

  it('should generate a parallel project briefing', () => {
    const fixture = TestBed.createComponent(ProjectWorkspace);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const firstDetailsButton = compiled.querySelector<HTMLButtonElement>(
      '.project-card .button--primary',
    );

    firstDetailsButton?.click();
    fixture.detectChanges();

    const briefingButton = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Generate briefing'),
    );

    briefingButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.briefing')?.textContent).toContain('Risk summary');
    expect(compiled.querySelector('.briefing')?.textContent).toContain('Activity summary');
  });
});
