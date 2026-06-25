import { PROJECT_SEED } from '../data/project.seed';
import {
  mapProjectCollectionDto,
  mapProjectDto,
  mapProjectToDto,
  ProjectApiContractError,
} from './project-api.mapper';

describe('Project API mapper', () => {
  it('should map a valid API DTO into a validated domain project', () => {
    const dto = mapProjectToDto(PROJECT_SEED[0]!);

    const project = mapProjectDto(dto);

    expect(project).toEqual(PROJECT_SEED[0]);
    expect(project.version).toBe(1);
  });

  it('should reject unsupported values even when HTTP generics claim the response is valid', () => {
    const dto = {
      ...mapProjectToDto(PROJECT_SEED[0]!),
      priority: 'Urgent',
    };

    expect(() => mapProjectDto(dto)).toThrowError(ProjectApiContractError);
    expect(() => mapProjectDto(dto)).toThrowError('unsupported project priority "Urgent"');
  });

  it('should reject a non-array collection response', () => {
    expect(() => mapProjectCollectionDto({ projects: [] })).toThrowError(
      'project collection response must be an array',
    );
  });
});
