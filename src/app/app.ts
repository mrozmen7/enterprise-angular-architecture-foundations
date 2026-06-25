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

  protected chapterStatus = 'Chapter 3 · Architecture boundaries';

  protected startChapter(): void {
    this.chapterStatus = 'Chapter 3 · In progress';
  }
}
