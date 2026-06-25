import { computed, isSignal, isWritableSignal } from '@angular/core';
import { PROJECT_SEED } from '../data/project.seed';
import type { ProjectRepository } from '../ports/project-repository';
import { ProjectWorkspaceStore } from './project-workspace.store';

class FakeProjectRepository implements ProjectRepository {
  getAll() {
    return PROJECT_SEED;
  }
}

describe('ProjectWorkspaceStore signals', () => {
  it('should expose readonly source and derived signals', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());

    expect(isSignal(store.state)).toBe(true);
    expect(isWritableSignal(store.state)).toBe(false);
    expect(isSignal(store.filteredProjects)).toBe(true);
    expect(isWritableSignal(store.filteredProjects)).toBe(false);
    expect(Object.isFrozen(store.state())).toBe(true);
  });

  it('should load the initial state through the repository port', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());

    expect(store.state().projects).toHaveLength(3);
    expect(store.filteredProjects()).toHaveLength(3);
    expect(store.projectCount()).toBe(3);
    expect(store.hasActiveFilters()).toBe(false);
  });

  it('should coordinate search and status filtering reactively', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());

    store.updateSearch('portal');
    store.updateStatusFilter('Planning');

    expect(store.searchTerm()).toBe('portal');
    expect(store.statusFilter()).toBe('Planning');
    expect(store.filteredProjects()).toHaveLength(1);
    expect(store.filteredProjects()[0]?.name).toBe('Customer Portal Redesign');
    expect(store.projectCount()).toBe(1);
    expect(store.hasActiveFilters()).toBe(true);
  });

  it('should expose lazy and memoized computed values', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());
    let derivationRuns = 0;
    const observedCount = computed(() => {
      derivationRuns += 1;
      return store.projectCount();
    });

    expect(derivationRuns).toBe(0);

    expect(observedCount()).toBe(3);
    expect(derivationRuns).toBe(1);

    expect(observedCount()).toBe(3);
    expect(derivationRuns).toBe(1);

    store.updateSearch('Helvetia');
    expect(derivationRuns).toBe(1);

    expect(observedCount()).toBe(1);
    expect(derivationRuns).toBe(2);
  });

  it('should not invalidate computed values for a reducer no-op', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());
    let derivationRuns = 0;
    const observedSearch = computed(() => {
      derivationRuns += 1;
      return store.searchTerm();
    });

    expect(observedSearch()).toBe('');
    expect(derivationRuns).toBe(1);

    store.updateSearch('');

    expect(observedSearch()).toBe('');
    expect(derivationRuns).toBe(1);
  });

  it('should coordinate project selection by identity', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());

    store.selectProject('project-payment-platform-migration');

    expect(store.selectedProject()?.customer.name).toBe('Northstar Bank');
  });

  it('should reset filters and clear selection', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());
    store.updateSearch('Bank');
    store.updateStatusFilter('Active');
    store.selectProject('project-payment-platform-migration');

    store.resetFilters();
    store.clearSelection();

    expect(store.searchTerm()).toBe('');
    expect(store.statusFilter()).toBe('All');
    expect(store.selectedProject()).toBeNull();
  });

  it('should update priority through an immutable signal transition', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());
    const previousState = store.state();
    const previousProjects = previousState.projects;

    store.updateProjectPriority('project-payment-platform-migration', 'Low');

    expect(store.state()).not.toBe(previousState);
    expect(store.state().projects).not.toBe(previousProjects);
    expect(store.state().projects[0]?.priority).toBe('Low');
    expect(previousProjects[0]?.priority).toBe('High');
  });

  it('should ignore unsupported presentation values', () => {
    const store = new ProjectWorkspaceStore(new FakeProjectRepository());
    const previousState = store.state();

    store.updateStatusFilter('Unknown');
    store.updateProjectPriority('project-payment-platform-migration', 'Urgent');

    expect(store.state()).toBe(previousState);
  });
});
