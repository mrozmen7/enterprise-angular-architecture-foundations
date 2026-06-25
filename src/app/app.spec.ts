import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import {
  projectApiMockInterceptor,
  resetProjectApiMock,
} from './projects/infrastructure/project-api.mock';
import { provideProjects } from './projects/project.providers';

describe('App shell', () => {
  beforeEach(async () => {
    resetProjectApiMock();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(withInterceptors([projectApiMockInterceptor])),
        provideProjects(),
      ],
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
