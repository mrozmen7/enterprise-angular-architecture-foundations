import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideProjects } from './projects/project.providers';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideProjects()],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the product identity and project workspace feature', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('OpsFlow');
    expect(compiled.querySelector('app-project-workspace')).toBeTruthy();
    expect(compiled.querySelectorAll('.project-card')).toHaveLength(3);
  });
});
