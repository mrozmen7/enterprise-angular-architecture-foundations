import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  createProjectWorkspaceState,
  getFilteredProjects,
  getSelectedProject,
  isProjectStatusFilter,
  PROJECT_STATUS_FILTERS,
} from './projects/application/project-workspace.state';
import { PROJECT_SEED } from './projects/data/project.seed';
import type { ProjectId } from './projects/domain/project';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly productName = 'OpsFlow';

  protected chapterStatus = 'Chapter 2 · Domain modeling';

  protected readonly workspaceState = createProjectWorkspaceState(PROJECT_SEED);

  protected get statusOptions(): readonly string[] {
    return PROJECT_STATUS_FILTERS;
  }

  protected get searchTerm(): string {
    return this.workspaceState.searchTerm;
  }

  protected get statusFilter(): string {
    return this.workspaceState.statusFilter;
  }

  protected get filteredProjects() {
    return getFilteredProjects(this.workspaceState);
  }

  protected get selectedProject() {
    return getSelectedProject(this.workspaceState);
  }

  protected startChapter(): void {
    this.chapterStatus = 'Chapter 2 · In progress';
  }

  protected updateSearch(searchTerm: string): void {
    this.workspaceState.searchTerm = searchTerm;
  }

  protected updateStatusFilter(status: string): void {
    if (isProjectStatusFilter(status)) {
      this.workspaceState.statusFilter = status;
    }
  }

  protected resetFilters(): void {
    this.workspaceState.searchTerm = '';
    this.workspaceState.statusFilter = 'All';
  }

  protected selectProject(projectId: ProjectId): void {
    this.workspaceState.selectedProjectId = projectId;
  }

  protected clearSelection(): void {
    this.workspaceState.selectedProjectId = null;
  }
}
