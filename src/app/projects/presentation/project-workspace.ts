import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProjectWorkspaceService } from '../application/project-workspace.service';
import { PROJECT_WORKSPACE_PROVIDER } from '../project.providers';

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.html',
  styleUrl: './project-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PROJECT_WORKSPACE_PROVIDER],
})
export class ProjectWorkspace {
  protected readonly workspace = inject(ProjectWorkspaceService);
}
