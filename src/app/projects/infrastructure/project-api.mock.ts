import {
  HttpErrorResponse,
  HttpResponse,
  type HttpHandlerFn,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PROJECT_SEED } from '../data/project.seed';
import { isProjectPriority } from '../domain/project-priority';
import type { ProjectDto, SaveProjectPriorityDto } from './project-api.dto';
import { mapProjectToDto } from './project-api.mapper';

const PROJECTS_API_URL = '/api/projects';

let serverProjects = createServerProjects();

export const projectApiMockInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (!request.url.startsWith(PROJECTS_API_URL)) {
    return next(request);
  }

  if (request.method === 'GET' && request.url === PROJECTS_API_URL) {
    const query = request.params.get('q')?.trim().toLowerCase() ?? '';
    const projects = serverProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.customer.name.toLowerCase().includes(query),
    );

    return of(new HttpResponse({ status: 200, body: projects }));
  }

  const projectId = readProjectId(request.url);

  if (request.method === 'PATCH' && request.url.endsWith('/priority')) {
    return savePriority(request, projectId);
  }

  if (request.method === 'GET' && request.url.endsWith('/risk-summary')) {
    return of(
      new HttpResponse({
        status: 200,
        body: { summary: `No unresolved critical delivery risk for ${projectId}.` },
      }),
    );
  }

  if (request.method === 'GET' && request.url.endsWith('/activity-summary')) {
    return of(
      new HttpResponse({
        status: 200,
        body: { summary: `Three project activities were recorded for ${projectId} this week.` },
      }),
    );
  }

  return apiError(404, 'The requested project API endpoint does not exist.');
};

export function resetProjectApiMock(): void {
  serverProjects = createServerProjects();
}

function savePriority(request: HttpRequest<unknown>, projectId: string) {
  const projectIndex = serverProjects.findIndex((project) => project.id === projectId);
  const project = serverProjects[projectIndex];

  if (!project) {
    return apiError(404, 'The project could not be found.');
  }

  const body = request.body as Partial<SaveProjectPriorityDto> | null;

  if (!isProjectPriority(body?.priority) || !Number.isInteger(body?.expectedVersion)) {
    return apiError(400, 'The priority update request is invalid.');
  }

  if (body.expectedVersion !== project.version) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 409,
          statusText: 'Conflict',
          url: request.url,
          error: {
            message:
              'Another user changed this project. The latest server version has been restored.',
            currentProject: project,
          },
        }),
    );
  }

  const savedProject: ProjectDto = {
    ...project,
    priority: body.priority,
    version: project.version + 1,
  };
  const nextProjects = [...serverProjects];
  nextProjects[projectIndex] = savedProject;
  serverProjects = nextProjects;

  return of(new HttpResponse({ status: 200, body: savedProject }));
}

function readProjectId(url: string): string {
  const pathAfterCollection = url.slice(`${PROJECTS_API_URL}/`.length);
  return decodeURIComponent(pathAfterCollection.split('/')[0] ?? '');
}

function createServerProjects(): ProjectDto[] {
  return PROJECT_SEED.map(mapProjectToDto);
}

function apiError(status: number, message: string) {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText: 'Project API Error',
        error: { message },
      }),
  );
}
