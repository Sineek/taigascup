import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { GeneratorControlsComponent } from './components/generator-controls/generator-controls.component';
import { DeckCalculatorComponent } from './components/deck-calculator/deck-calculator.component';
import { ScoringAdminComponent } from './components/scoring-admin/scoring-admin.component';
import { PostPreviewComponent } from './components/post-preview/post-preview.component';
import { createInitialState, GeneratorState } from './models/post-generator.model';

type Page = 'home' | 'generator' | 'calculator' | 'admin';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GeneratorControlsComponent, DeckCalculatorComponent, ScoringAdminComponent, PostPreviewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  @ViewChild(PostPreviewComponent) preview?: PostPreviewComponent;

  page: Page = this.pageFromHash();
  state: GeneratorState = createInitialState();
  fontDetected: boolean | null = null;

  @HostListener('window:hashchange')
  onHashChange(): void {
    this.page = this.pageFromHash();
  }

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
    this.preview?.downloadTop3();
  }

  downloadWheel(): void {
    this.preview?.downloadWheel();
  }

  downloadBoth(): void {
    this.preview?.downloadBoth();
  }

  private pageFromHash(): Page {
    switch (window.location.hash) {
      case '#/gerador':
        return 'generator';
      case '#/calculadora':
        return 'calculator';
      case '#/administrativo':
        return 'admin';
      default:
        return 'home';
    }
  }
}
