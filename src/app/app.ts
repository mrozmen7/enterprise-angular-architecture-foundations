import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProjectWorkspace } from './projects/presentation/project-workspace';

@Component({
  selector: 'app-root',
  imports: [ProjectWorkspace],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly productName = 'OpsFlow';

  protected chapterStatus = 'Chapter 5 · Signals and derived state';

  protected startChapter(): void {
    this.chapterStatus = 'Chapter 5 · In progress';
  }
}
