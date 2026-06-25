import { Injectable } from '@angular/core';
import { PROJECT_SEED } from '../data/project.seed';
import type { Project } from '../domain/project';
import type { ProjectRepository } from '../ports/project-repository';

@Injectable()
export class LocalProjectRepository implements ProjectRepository {
  getAll(): readonly Project[] {
    return PROJECT_SEED;
  }
}
