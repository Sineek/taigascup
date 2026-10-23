import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
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
  @Output() stateChange = new EventEmitter<GeneratorState>();

  @ViewChild('top4Canvas', { static: true }) top4Canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wheelCanvas', { static: true }) wheelCanvas!: ElementRef<HTMLCanvasElement>;

  private baseTop3: HTMLImageElement | null = null;
  private baseWheel: HTMLImageElement | null = null;
  private initialized = false;
  draggingRankIndex: number | null = null;
  private dragStartClientY = 0;
  private dragStartPositionY = 0;
  draggingWheelLeaderIndex: number | null = null;
  private wheelDragStartClientX = 0;
  private wheelDragStartClientY = 0;
  private wheelDragStartX = 0;
  private wheelDragStartY = 0;
  private wheelDragFrame: number | null = null;
  private pendingWheelPosition: { x: number; y: number } | null = null;

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
      this.top4Canvas.nativeElement,
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

  startRankDrag(event: PointerEvent): void {
    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const canvasX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (event.clientY - rect.top) * (canvas.height / rect.height);
    const slotIndex = [300, 438, 576, 714].findIndex(
      (slotY) => canvasY >= slotY && canvasY <= slotY + 122,
    );

    if (slotIndex < 0 || canvasX < 339 || canvasX > 856 || !this.state.top4[slotIndex]?.img) {
      return;
    }

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    this.draggingRankIndex = slotIndex;
    this.dragStartClientY = event.clientY;
    this.dragStartPositionY = this.state.top4[slotIndex].y;
  }

  moveRankDrag(event: PointerEvent): void {
    if (this.draggingRankIndex === null) return;

    const canvas = event.currentTarget as HTMLCanvasElement;
    const rank = this.state.top4[this.draggingRankIndex];
    const image = rank.img;
    if (!image) return;

    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scale = Math.max(517 / image.width, 122 / image.height) * (rank.zoom / 100);
    const freeY = Math.max(0, image.height * scale - 122);
    if (freeY === 0) return;

    const deltaCanvasY = (event.clientY - this.dragStartClientY) * (canvas.height / rect.height);
    const nextY = Math.max(
      -100,
      Math.min(100, this.dragStartPositionY + (deltaCanvasY * 100) / (freeY / 2)),
    );
    const top4 = this.state.top4.map((current, index) =>
      index === this.draggingRankIndex ? { ...current, x: 0, y: nextY } : current,
    );
    this.stateChange.emit({ ...this.state, top4 });
  }

  stopRankDrag(event: PointerEvent): void {
    if (this.draggingRankIndex === null) return;
    const canvas = event.currentTarget as HTMLCanvasElement;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    this.draggingRankIndex = null;
  }

  startWheelLeaderDrag(event: PointerEvent): void {
    if (!this.state.wheelLeaders.length) return;
    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    const dx = x - 540;
    const dy = y - 637;
    if (Math.hypot(dx, dy) > 336) return;

    const total = this.state.wheelLeaders.reduce((sum, leader) => sum + leader.count, 0);
    const firstSector = (Math.PI * 2 * this.state.wheelLeaders[0].count) / total;
    const firstStart = -Math.PI / 3 - firstSector / 2;
    const normalized = ((Math.atan2(dy, dx) - firstStart) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    let accumulated = 0;
    let index = this.state.wheelLeaders.length - 1;
    for (let current = 0; current < this.state.wheelLeaders.length; current += 1) {
      accumulated += (Math.PI * 2 * this.state.wheelLeaders[current].count) / total;
      if (normalized < accumulated) {
        index = current;
        break;
      }
    }
    const leader = this.state.wheelLeaders[index];
    if (!leader?.img) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    this.draggingWheelLeaderIndex = index;
    this.wheelDragStartClientX = event.clientX;
    this.wheelDragStartClientY = event.clientY;
    this.wheelDragStartX = leader.x;
    this.wheelDragStartY = leader.y;
  }

  moveWheelLeaderDrag(event: PointerEvent): void {
    if (this.draggingWheelLeaderIndex === null) return;
    event.preventDefault();
    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(-500, Math.min(500, this.wheelDragStartX + (event.clientX - this.wheelDragStartClientX) * scaleX));
    const y = Math.max(-500, Math.min(500, this.wheelDragStartY + (event.clientY - this.wheelDragStartClientY) * scaleY));
    this.pendingWheelPosition = { x, y };
    if (this.wheelDragFrame === null) {
      this.wheelDragFrame = requestAnimationFrame(() => {
        this.applyPendingWheelPosition();
        this.wheelDragFrame = null;
      });
    }
  }

  stopWheelLeaderDrag(event: PointerEvent): void {
    if (this.draggingWheelLeaderIndex === null) return;
    if (this.wheelDragFrame !== null) {
      cancelAnimationFrame(this.wheelDragFrame);
      this.wheelDragFrame = null;
    }
    this.applyPendingWheelPosition();
    const canvas = event.currentTarget as HTMLCanvasElement;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    this.draggingWheelLeaderIndex = null;
  }

  private applyPendingWheelPosition(): void {
    if (this.draggingWheelLeaderIndex === null || !this.pendingWheelPosition) return;
    const position = this.pendingWheelPosition;
    this.pendingWheelPosition = null;
    const wheelLeaders = this.state.wheelLeaders.map((leader, index) =>
      index === this.draggingWheelLeaderIndex ? { ...leader, ...position } : leader,
    );
    this.stateChange.emit({ ...this.state, wheelLeaders });
  }

  private render(): void {
    if (!this.baseTop3 || !this.baseWheel) {
      return;
    }

    const top4Context = this.top4Canvas.nativeElement.getContext('2d');
    const wheelContext = this.wheelCanvas.nativeElement.getContext('2d');

    if (!top4Context || !wheelContext) {
      return;
    }

    this.renderer.renderTop4(top4Context, this.baseTop3, this.state.top4);
    this.renderer.renderWheel(wheelContext, this.baseWheel, this.state);
  }

  private editionValue(): string {
    return String(this.state.edition || 'edicao').trim();
  }
}


