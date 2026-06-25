import { createProject } from '../domain/project';
import type { IsoDate, Project } from '../domain/project';
import { isProjectPriority } from '../domain/project-priority';
import { isProjectStatus } from '../domain/project-status';
import type { ProjectDto } from './project-api.dto';

export class ProjectApiContractError extends Error {
  constructor(message: string) {
    super(`Project API contract error: ${message}`);
    this.name = 'ProjectApiContractError';
  }
}

export function mapProjectDto(value: unknown): Project {
  if (!isRecord(value)) {
    throw new ProjectApiContractError('project response must be an object.');
  }

  const customer = readRecord(value, 'customer');
  const owner = readRecord(value, 'owner');
  const status = readString(value, 'status');
  const priority = readString(value, 'priority');

  if (!isProjectStatus(status)) {
    throw new ProjectApiContractError(`unsupported project status "${status}".`);
  }

  if (!isProjectPriority(priority)) {
    throw new ProjectApiContractError(`unsupported project priority "${priority}".`);
  }

  return createProject({
    id: readString(value, 'id'),
    version: readNumber(value, 'version'),
    name: readString(value, 'name'),
    customer: {
      id: readString(customer, 'id'),
      name: readString(customer, 'name'),
      industry: readString(customer, 'industry'),
    },
    owner: {
      id: readString(owner, 'id'),
      name: readString(owner, 'name'),
      role: readString(owner, 'role'),
    },
    status,
    priority,
    summary: readString(value, 'summary'),
    startDate: readString(value, 'startDate') as IsoDate,
    targetDate: readString(value, 'targetDate') as IsoDate,
  });
}

export function mapProjectCollectionDto(value: unknown): readonly Project[] {
  if (!Array.isArray(value)) {
    throw new ProjectApiContractError('project collection response must be an array.');
  }

  return Object.freeze(value.map(mapProjectDto));
}

export function mapProjectToDto(project: Project): ProjectDto {
  return {
    id: project.id,
    version: project.version,
    name: project.name,
    customer: { ...project.customer },
    owner: { ...project.owner },
    status: project.status,
    priority: project.priority,
    summary: project.summary,
    startDate: project.startDate,
    targetDate: project.targetDate,
  };
}

export function readSummaryDto(value: unknown): string {
  if (!isRecord(value)) {
    throw new ProjectApiContractError('briefing response must be an object.');
  }

  return readString(value, 'summary');
}

function readRecord(value: Record<string, unknown>, key: string): Record<string, unknown> {
  const nestedValue = value[key];

  if (!isRecord(nestedValue)) {
    throw new ProjectApiContractError(`"${key}" must be an object.`);
  }

  return nestedValue;
}

function readString(value: Record<string, unknown>, key: string): string {
  const fieldValue = value[key];

  if (typeof fieldValue !== 'string') {
    throw new ProjectApiContractError(`"${key}" must be a string.`);
  }

  return fieldValue;
}

function readNumber(value: Record<string, unknown>, key: string): number {
  const fieldValue = value[key];

  if (typeof fieldValue !== 'number') {
    throw new ProjectApiContractError(`"${key}" must be a number.`);
  }

  return fieldValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
