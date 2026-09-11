import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { GeneratorControlsComponent } from './components/generator-controls/generator-controls.component';
import { PostPreviewComponent } from './components/post-preview/post-preview.component';
import { createInitialState, GeneratorState } from './models/post-generator.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GeneratorControlsComponent, PostPreviewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  @ViewChild(PostPreviewComponent) preview!: PostPreviewComponent;

  state: GeneratorState = createInitialState();
  fontDetected: boolean | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!document.fonts) {
      this.fontDetected = false;
      return;
    }

    await document.fonts.ready;
    this.fontDetected = document.fonts.check('72px "VAG Local"');
  }

  updateState(state: GeneratorState): void {
    this.state = state;
  }

  downloadTop3(): void {
    this.preview.downloadTop3();
  }

  downloadWheel(): void {
    this.preview.downloadWheel();
  }

  downloadBoth(): void {
    this.preview.downloadBoth();
  }
}
