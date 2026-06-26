export type ProjectDto = {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly customer: {
    readonly id: string;
    readonly name: string;
    readonly industry: string;
  };
  readonly owner: {
    readonly id: string;
    readonly name: string;
    readonly role: string;
  };
  readonly status: string;
  readonly priority: string;
  readonly summary: string;
  readonly startDate: string;
  readonly targetDate: string;
};

export type SaveProjectPriorityDto = {
  readonly priority: string;
  readonly expectedVersion: number;
};

export type ProjectConflictDto = {
  readonly message: string;
  readonly currentProject: unknown;
};

export type ProjectBriefingPartDto = {
  readonly summary: string;
};
