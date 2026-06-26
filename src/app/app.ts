import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProjectWorkspace } from './features/projects/presentation/project-workspace';

@Component({
  selector: 'app-root',
  imports: [ProjectWorkspace],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly productName = 'OpsFlow';

  protected readonly chapterStatus = 'Reference architecture · Complete';
}
