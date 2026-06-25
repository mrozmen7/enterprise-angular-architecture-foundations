import { LocalProjectRepository } from './local-project.repository';

describe('LocalProjectRepository', () => {
  it('should provide the validated local project collection', () => {
    const repository = new LocalProjectRepository();
    const projects = repository.getAll();

    expect(projects).toHaveLength(3);
    expect(projects.every((project) => project.id.length > 0)).toBe(true);
  });

  it('should expose cold search observables', () => {
    const repository = new LocalProjectRepository();
    const search = repository.search('Portal');

    expect(typeof search.subscribe).toBe('function');
  });
});
