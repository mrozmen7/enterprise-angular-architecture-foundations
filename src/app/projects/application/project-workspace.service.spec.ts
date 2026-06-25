import { PROJECT_SEED } from '../data/project.seed';
import type { ProjectRepository } from '../ports/project-repository';
import { ProjectWorkspaceService } from './project-workspace.service';

class FakeProjectRepository implements ProjectRepository {
  getAll() {
    return PROJECT_SEED;
  }
}

describe('ProjectWorkspaceService', () => {
  it('should load its initial project collection through the repository port', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());

    expect(workspace.state.projects).toHaveLength(3);
    expect(workspace.filteredProjects).toHaveLength(3);
  });

  it('should coordinate search and status filtering', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());

    workspace.updateSearch('portal');
    workspace.updateStatusFilter('Planning');

    expect(workspace.filteredProjects).toHaveLength(1);
    expect(workspace.filteredProjects[0]?.name).toBe('Customer Portal Redesign');
  });

  it('should ignore unsupported status values from the presentation boundary', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());

    workspace.updateStatusFilter('Unknown');

    expect(workspace.state.statusFilter).toBe('All');
  });

  it('should coordinate project selection by identity', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());

    workspace.selectProject('project-payment-platform-migration');

    expect(workspace.selectedProject?.customer.name).toBe('Northstar Bank');
  });

  it('should reset filters and clear selection', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());
    workspace.updateSearch('Bank');
    workspace.updateStatusFilter('Active');
    workspace.selectProject('project-payment-platform-migration');

    workspace.resetFilters();
    workspace.clearSelection();

    expect(workspace.state.searchTerm).toBe('');
    expect(workspace.state.statusFilter).toBe('All');
    expect(workspace.selectedProject).toBeNull();
  });

  it('should replace the state reference when a command changes state', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());
    const previousState = workspace.state;

    workspace.updateSearch('Bank');

    expect(workspace.state).not.toBe(previousState);
    expect(previousState.searchTerm).toBe('');
    expect(workspace.state.searchTerm).toBe('Bank');
  });

  it('should update priority through an immutable collection transition', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());
    const previousProjects = workspace.state.projects;

    workspace.updateProjectPriority('project-payment-platform-migration', 'Low');

    expect(workspace.state.projects).not.toBe(previousProjects);
    expect(workspace.state.projects[0]?.priority).toBe('Low');
    expect(previousProjects[0]?.priority).toBe('High');
  });

  it('should ignore unsupported priority values from the presentation boundary', () => {
    const workspace = new ProjectWorkspaceService(new FakeProjectRepository());
    const previousState = workspace.state;

    workspace.updateProjectPriority('project-payment-platform-migration', 'Urgent');

    expect(workspace.state).toBe(previousState);
  });
});
