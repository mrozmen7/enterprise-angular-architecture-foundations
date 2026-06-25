import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders, FactoryProvider } from '@angular/core';
import { ProjectWorkspaceStore } from './application/project-workspace.store';
import { LocalProjectRepository } from './infrastructure/local-project.repository';
import type { ProjectRepository } from './ports/project-repository';

export const PROJECT_REPOSITORY = new InjectionToken<ProjectRepository>('PROJECT_REPOSITORY');

export const PROJECT_WORKSPACE_PROVIDER: FactoryProvider = {
  provide: ProjectWorkspaceStore,
  useFactory: (repository: ProjectRepository) => new ProjectWorkspaceStore(repository),
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
