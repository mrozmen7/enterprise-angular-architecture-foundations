export const PROJECT_PRIORITIES = ['Low', 'Medium', 'High'] as const;

export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export function isProjectPriority(value: unknown): value is ProjectPriority {
  return PROJECT_PRIORITIES.some((priority) => priority === value);
}
