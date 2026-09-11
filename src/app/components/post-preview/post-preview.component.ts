import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GeneratorState } from '../../models/post-generator.model';
import { PostRendererService } from '../../services/post-renderer.service';

@Component({
  selector: 'app-post-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-preview.component.html',
  styleUrl: './post-preview.component.css',
})
export class PostPreviewComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) state!: GeneratorState;

  @ViewChild('top3Canvas', { static: true }) top3Canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wheelCanvas', { static: true }) wheelCanvas!: ElementRef<HTMLCanvasElement>;

  private baseTop3: HTMLImageElement | null = null;
  private baseWheel: HTMLImageElement | null = null;
  private initialized = false;

  constructor(private readonly renderer: PostRendererService) {}

  async ngAfterViewInit(): Promise<void> {
    [this.baseWheel, this.baseTop3] = await Promise.all([
      this.renderer.imageFromSrc('assets/templates/template-wheel.jpg'),
      this.renderer.imageFromSrc('assets/templates/template-top3.jpg'),
    ]);

    this.initialized = true;
    this.render();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.initialized) {
      this.render();
    }
  }

  downloadTop3(): void {
    this.renderer.downloadCanvas(
      this.top3Canvas.nativeElement,
      `taigas-cup-${this.editionValue()}-colocacao.png`,
    );
  }

  downloadWheel(): void {
    this.renderer.downloadCanvas(
      this.wheelCanvas.nativeElement,
      `taigas-cup-${this.editionValue()}-roda.png`,
    );
  }

  downloadBoth(): void {
    this.downloadTop3();
    setTimeout(() => this.downloadWheel(), 250);
  }

  private render(): void {
    if (!this.baseTop3 || !this.baseWheel) {
      return;
    }

    const top3Context = this.top3Canvas.nativeElement.getContext('2d');
    const wheelContext = this.wheelCanvas.nativeElement.getContext('2d');

    if (!top3Context || !wheelContext) {
      return;
    }

    this.renderer.renderTop3(top3Context, this.baseTop3, this.state.top3);
    this.renderer.renderWheel(wheelContext, this.baseWheel, this.state);
  }

  private editionValue(): string {
    return String(this.state.edition || 'edicao').trim();
  }
}
