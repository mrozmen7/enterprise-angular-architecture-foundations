import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders, FactoryProvider } from '@angular/core';
import { ProjectWorkspaceService } from './application/project-workspace.service';
import { LocalProjectRepository } from './infrastructure/local-project.repository';
import type { ProjectRepository } from './ports/project-repository';

export const PROJECT_REPOSITORY = new InjectionToken<ProjectRepository>('PROJECT_REPOSITORY');

export const PROJECT_WORKSPACE_PROVIDER: FactoryProvider = {
  provide: ProjectWorkspaceService,
  useFactory: (repository: ProjectRepository) => new ProjectWorkspaceService(repository),
  deps: [PROJECT_REPOSITORY],
};

export function provideProjects(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PROJECT_REPOSITORY,
      useClass: LocalProjectRepository,
    },
  ]);
}
