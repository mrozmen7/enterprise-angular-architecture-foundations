import { PROJECT_SEED } from '../data/project.seed';
import { reduceProjectWorkspace } from './project-workspace.reducer';
import { createProjectWorkspaceState } from './project-workspace.state';

describe('Project workspace reducer', () => {
  it('should create a new state without mutating the previous state', () => {
    const previousState = createProjectWorkspaceState(PROJECT_SEED);

    const nextState = reduceProjectWorkspace(previousState, {
      type: 'search-changed',
      searchTerm: 'Bank',
    });

    expect(nextState).not.toBe(previousState);
    expect(previousState.searchTerm).toBe('');
    expect(nextState.searchTerm).toBe('Bank');
    expect(nextState.projects).toBe(previousState.projects);
  });

  it('should preserve the state reference when a command changes nothing', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);

    const nextState = reduceProjectWorkspace(state, {
      type: 'search-changed',
      searchTerm: '',
    });

    expect(nextState).toBe(state);
  });

  it('should select only an identity that exists in the project collection', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);

    const selectedState = reduceProjectWorkspace(state, {
      type: 'project-selected',
      projectId: 'project-payment-platform-migration',
    });
    const invalidState = reduceProjectWorkspace(selectedState, {
      type: 'project-selected',
      projectId: 'missing-project',
    });

    expect(selectedState.selectedProjectId).toBe('project-payment-platform-migration');
    expect(invalidState).toBe(selectedState);
  });

  it('should reset filters while preserving projects and selection', () => {
    const initialState = createProjectWorkspaceState(PROJECT_SEED);
    const searchedState = reduceProjectWorkspace(initialState, {
      type: 'search-changed',
      searchTerm: 'Bank',
    });
    const filteredState = reduceProjectWorkspace(searchedState, {
      type: 'status-filter-changed',
      statusFilter: 'Active',
    });
    const selectedState = reduceProjectWorkspace(filteredState, {
      type: 'project-selected',
      projectId: 'project-payment-platform-migration',
    });

    const resetState = reduceProjectWorkspace(selectedState, {
      type: 'filters-reset',
    });

    expect(resetState.searchTerm).toBe('');
    expect(resetState.statusFilter).toBe('All');
    expect(resetState.selectedProjectId).toBe('project-payment-platform-migration');
    expect(resetState.projects).toBe(selectedState.projects);
  });

  it('should immutably update one project priority', () => {
    const previousState = createProjectWorkspaceState(PROJECT_SEED);
    const previousTarget = previousState.projects[0]!;
    const previousUnchangedProject = previousState.projects[1]!;

    const nextState = reduceProjectWorkspace(previousState, {
      type: 'project-priority-changed',
      projectId: previousTarget.id,
      priority: 'Low',
    });

    expect(nextState).not.toBe(previousState);
    expect(nextState.projects).not.toBe(previousState.projects);
    expect(previousTarget.priority).toBe('High');
    expect(nextState.projects[0]?.priority).toBe('Low');
    expect(nextState.projects[0]).not.toBe(previousTarget);
    expect(nextState.projects[1]).toBe(previousUnchangedProject);
  });

  it('should preserve the state reference when priority is already correct', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);

    const nextState = reduceProjectWorkspace(state, {
      type: 'project-priority-changed',
      projectId: 'project-payment-platform-migration',
      priority: 'High',
    });

    expect(nextState).toBe(state);
  });

  it('should replace the server collection and clear a missing selection', () => {
    const selectedState = reduceProjectWorkspace(createProjectWorkspaceState(PROJECT_SEED), {
      type: 'project-selected',
      projectId: PROJECT_SEED[2]!.id,
    });

    const synchronizedState = reduceProjectWorkspace(selectedState, {
      type: 'projects-synchronized',
      projects: [PROJECT_SEED[0]!],
    });

    expect(synchronizedState.projects).toEqual([PROJECT_SEED[0]!]);
    expect(synchronizedState.selectedProjectId).toBeNull();
  });

  it('should reconcile one project with the complete server representation', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);
    const serverProject = {
      ...PROJECT_SEED[0]!,
      version: 2,
      priority: 'Low' as const,
    };

    const synchronizedState = reduceProjectWorkspace(state, {
      type: 'project-synchronized',
      project: serverProject,
    });

    expect(synchronizedState.projects[0]).toBe(serverProject);
    expect(synchronizedState.projects[1]).toBe(state.projects[1]);
  });

  it('should freeze every state returned by the reducer', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);
    const nextState = reduceProjectWorkspace(state, {
      type: 'status-filter-changed',
      statusFilter: 'At Risk',
    });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.projects)).toBe(true);
    expect(Object.isFrozen(nextState)).toBe(true);
  });

  it('should reject an unknown command at runtime', () => {
    const state = createProjectWorkspaceState(PROJECT_SEED);

    expect(() =>
      reduceProjectWorkspace(state, {
        type: 'unknown-command',
      } as never),
    ).toThrowError('Unhandled project workspace command');
  });
});
