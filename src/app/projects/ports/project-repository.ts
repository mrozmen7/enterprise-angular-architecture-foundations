import type { Project } from '../domain/project';

export interface ProjectRepository {
  getAll(): readonly Project[];
}
