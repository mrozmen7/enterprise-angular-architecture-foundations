import type { Customer } from './customer';
import type { ProjectPriority } from './project-priority';
import type { ProjectStatus } from './project-status';
import type { TeamMember } from './team-member';

export type ProjectId = string;
export type IsoDate = `${number}-${number}-${number}`;

export type Project = {
  readonly id: ProjectId;
  readonly name: string;
  readonly customer: Customer;
  readonly owner: TeamMember;
  readonly status: ProjectStatus;
  readonly priority: ProjectPriority;
  readonly summary: string;
  readonly startDate: IsoDate;
  readonly targetDate: IsoDate;
};

export type CreateProjectInput = Project;

export class ProjectValidationError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`Project validation failed: ${issues.join(' ')}`);
    this.name = 'ProjectValidationError';
  }
}

export function createProject(input: CreateProjectInput): Project {
  const project = {
    ...input,
    name: input.name.trim(),
    summary: input.summary.trim(),
    customer: {
      ...input.customer,
      name: input.customer.name.trim(),
      industry: input.customer.industry.trim(),
    },
    owner: {
      ...input.owner,
      name: input.owner.name.trim(),
      role: input.owner.role.trim(),
    },
  };

  const issues = validateProject(project);

  if (issues.length > 0) {
    throw new ProjectValidationError(issues);
  }

  return project;
}

export function validateProject(project: Project): readonly string[] {
  const issues: string[] = [];

  validateRequiredText(project.id, 'Project id', issues);
  validateRequiredText(project.name, 'Project name', issues);
  validateRequiredText(project.summary, 'Project summary', issues);
  validateRequiredText(project.customer.id, 'Customer id', issues);
  validateRequiredText(project.customer.name, 'Customer name', issues);
  validateRequiredText(project.customer.industry, 'Customer industry', issues);
  validateRequiredText(project.owner.id, 'Project owner id', issues);
  validateRequiredText(project.owner.name, 'Project owner name', issues);
  validateRequiredText(project.owner.role, 'Project owner role', issues);

  const hasValidStartDate = isIsoDate(project.startDate);
  const hasValidTargetDate = isIsoDate(project.targetDate);

  if (!hasValidStartDate) {
    issues.push('Start date must be a valid ISO date in YYYY-MM-DD format.');
  }

  if (!hasValidTargetDate) {
    issues.push('Target date must be a valid ISO date in YYYY-MM-DD format.');
  }

  if (hasValidStartDate && hasValidTargetDate && project.targetDate < project.startDate) {
    issues.push('Target date cannot be before start date.');
  }

  return issues;
}

function validateRequiredText(value: string, fieldName: string, issues: string[]): void {
  if (value.trim().length === 0) {
    issues.push(`${fieldName} is required.`);
  }
}

function isIsoDate(value: string): value is IsoDate {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDatePattern.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
}
