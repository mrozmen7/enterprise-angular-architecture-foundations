import { PROJECT_SEED } from '../data/project.seed';
import {
  createProjectWorkspaceState,
  getFilteredProjects,
  getSelectedProject,
  isProjectStatusFilter,
} from './project-workspace.state';

describe('Project workspace state', () => {
  it('should create a predictable initial state', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);

    expect(state.projects).toHaveLength(3);
    expect(state.searchTerm).toBe('');
    expect(state.statusFilter).toBe('All');
    expect(state.selectedProjectId).toBeNull();
  });

  it('should filter by project or customer name without case sensitivity', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);
    state.searchTerm = 'NORTHSTAR';

    const projects = getFilteredProjects(state);

    expect(projects).toHaveLength(1);
    expect(projects[0]?.name).toBe('Payment Platform Migration');
  });

  it('should combine search and status filters', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);
    state.searchTerm = 'portal';
    state.statusFilter = 'Planning';

    const projects = getFilteredProjects(state);

    expect(projects).toHaveLength(1);
    expect(projects[0]?.customer.name).toBe('Acme Industries');
  });

  it('should return an empty collection when filters do not match', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);
    state.searchTerm = 'Northstar';
    state.statusFilter = 'Completed';

    expect(getFilteredProjects(state)).toEqual([]);
  });

  it('should derive the selected project from its identity', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);
    state.selectedProjectId = 'project-compliance-reporting-automation';

    expect(getSelectedProject(state)?.name).toBe('Compliance Reporting Automation');
  });

  it('should return null when the selected identity is missing', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);
    state.selectedProjectId = 'project-does-not-exist';

    expect(getSelectedProject(state)).toBeNull();
  });

  it('should validate status filter values received from the UI', () => {
    expect(isProjectStatusFilter('All')).toBe(true);
    expect(isProjectStatusFilter('At Risk')).toBe(true);
    expect(isProjectStatusFilter('Unknown')).toBe(false);
  });
});
