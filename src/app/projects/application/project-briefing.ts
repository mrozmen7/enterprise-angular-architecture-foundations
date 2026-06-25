import type { ProjectId } from '../domain/project';

export type ProjectBriefing = {
  readonly projectId: ProjectId;
  readonly riskSummary: string;
  readonly activitySummary: string;
};
