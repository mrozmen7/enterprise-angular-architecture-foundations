import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the product identity', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('OpsFlow');
  });

  it('should render all customer projects initially', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(3);
    expect(compiled.querySelector('.result-count')?.textContent).toContain('3 projects found');
  });

  it('should select a project and render its details', () => {
    const fixture = TestBed.createComponent(App);
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
    expect(compiled.querySelector('.project-detail')?.textContent).toContain('High');
    expect(compiled.querySelector('.project-detail')?.textContent).toContain('2026-10-30');
    expect(compiled.querySelector('.project-card--selected')).toBeTruthy();
  });

  it('should search projects by customer name', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const searchInput = compiled.querySelector<HTMLInputElement>('input[type="search"]');

    if (!searchInput) {
      throw new Error('Search input was not rendered.');
    }

    searchInput.value = 'Helvetia';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(1);
    expect(compiled.querySelector('.project-card')?.textContent).toContain(
      'Compliance Reporting Automation',
    );
  });

  it('should filter projects by status', () => {
    const fixture = TestBed.createComponent(App);
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
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const searchInput = compiled.querySelector<HTMLInputElement>('input[type="search"]');

    if (!searchInput) {
      throw new Error('Search input was not rendered.');
    }

    searchInput.value = 'Unknown project';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(0);
    expect(compiled.querySelector('.empty-state')?.textContent).toContain('No matching projects');
  });
});
