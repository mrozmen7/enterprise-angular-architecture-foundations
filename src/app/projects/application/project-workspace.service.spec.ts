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
});
