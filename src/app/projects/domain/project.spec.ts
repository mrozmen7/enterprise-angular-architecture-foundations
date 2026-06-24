import type { Customer } from './customer';
import { isProjectPriority } from './project-priority';
import { createProject, ProjectValidationError } from './project';
import type { IsoDate, Project } from './project';
import { isProjectStatus } from './project-status';
import type { TeamMember } from './team-member';

const customer: Customer = {
  id: 'customer-northstar-bank',
  name: 'Northstar Bank',
  industry: 'Banking',
};

const owner: TeamMember = {
  id: 'team-member-maya-chen',
  name: 'Maya Chen',
  role: 'Delivery Manager',
};

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-payment-platform-migration',
    name: 'Payment Platform Migration',
    customer,
    owner,
    status: 'Active',
    priority: 'High',
    summary: 'Move the bank payment platform to a resilient cloud-based architecture.',
    startDate: '2026-01-12',
    targetDate: '2026-10-30',
    ...overrides,
  };
}

describe('Project domain model', () => {
  it('should create a valid project and normalize business text', () => {
    const project = createProject(
      buildProject({
        name: '  Payment Platform Migration  ',
        summary: '  Cloud migration program.  ',
      }),
    );

    expect(project.name).toBe('Payment Platform Migration');
    expect(project.summary).toBe('Cloud migration program.');
  });

  it('should reject a project without a name', () => {
    expect(() => createProject(buildProject({ name: '   ' }))).toThrowError(ProjectValidationError);
    expect(() => createProject(buildProject({ name: '   ' }))).toThrowError(
      'Project name is required.',
    );
  });

  it('should reject an impossible calendar date', () => {
    expect(() => createProject(buildProject({ startDate: '2026-02-30' as IsoDate }))).toThrowError(
      'Start date must be a valid ISO date',
    );
  });

  it('should reject a target date before the start date', () => {
    expect(() =>
      createProject(
        buildProject({
          startDate: '2026-08-01',
          targetDate: '2026-07-31',
        }),
      ),
    ).toThrowError('Target date cannot be before start date.');
  });

  it('should recognize only supported project statuses at runtime', () => {
    expect(isProjectStatus('Active')).toBe(true);
    expect(isProjectStatus('Paused')).toBe(false);
    expect(isProjectStatus(null)).toBe(false);
  });

  it('should recognize only supported project priorities at runtime', () => {
    expect(isProjectPriority('High')).toBe(true);
    expect(isProjectPriority('Urgent')).toBe(false);
    expect(isProjectPriority(1)).toBe(false);
  });
});
