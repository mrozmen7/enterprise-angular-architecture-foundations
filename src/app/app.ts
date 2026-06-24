import { ChangeDetectionStrategy, Component } from '@angular/core';

type Project = {
  id: number;
  name: string;
  customer: string;
  status: string;
  owner: string;
  summary: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly productName = 'OpsFlow';

  protected chapterStatus = 'Foundation ready · Chapter 1 next';

  protected searchTerm = '';

  protected statusFilter = 'All';

  protected selectedProject: Project | null = null;

  protected readonly statusOptions = ['All', 'Active', 'Planning', 'At Risk'];

  protected readonly projects: Project[] = [
    {
      id: 1,
      name: 'Payment Platform Migration',
      customer: 'Northstar Bank',
      status: 'Active',
      owner: 'Maya Chen',
      summary: 'Move the bank payment platform to a resilient cloud-based architecture.',
    },
    {
      id: 2,
      name: 'Customer Portal Redesign',
      customer: 'Acme Industries',
      status: 'Planning',
      owner: 'Jonas Keller',
      summary: 'Redesign the customer portal around faster self-service workflows.',
    },
    {
      id: 3,
      name: 'Compliance Reporting Automation',
      customer: 'Helvetia Finance',
      status: 'At Risk',
      owner: 'Sofia Rossi',
      summary: 'Automate regulated reports and reduce manual reconciliation work.',
    },
  ];

  protected get filteredProjects(): Project[] {
    const normalizedSearchTerm = this.searchTerm.trim().toLowerCase();

    return this.projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(normalizedSearchTerm) ||
        project.customer.toLowerCase().includes(normalizedSearchTerm);

      const matchesStatus = this.statusFilter === 'All' || project.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  protected startChapter(): void {
    this.chapterStatus = 'Chapter 1 · In progress';
  }

  protected updateSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
  }

  protected updateStatusFilter(status: string): void {
    this.statusFilter = status;
  }

  protected resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All';
  }

  protected selectProject(project: Project): void {
    this.selectedProject = project;
  }

  protected clearSelection(): void {
    this.selectedProject = null;
  }
}
