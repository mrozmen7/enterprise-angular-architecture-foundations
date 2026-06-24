export const PROJECT_STATUSES = ['Planning', 'Active', 'At Risk', 'Completed'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return PROJECT_STATUSES.some((status) => status === value);
}
