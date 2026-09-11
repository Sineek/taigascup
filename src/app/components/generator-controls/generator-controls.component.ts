import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LibraryImage } from '../../models/image-library.model';
import { GeneratorState, RankState } from '../../models/post-generator.model';
import { PostRendererService } from '../../services/post-renderer.service';
import { ImageLibraryComponent } from '../image-library/image-library.component';
import { RankEditorComponent } from '../rank-editor/rank-editor.component';

@Component({
  selector: 'app-generator-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, RankEditorComponent, ImageLibraryComponent],
  templateUrl: './generator-controls.component.html',
  styleUrl: './generator-controls.component.css',
})
export class GeneratorControlsComponent {
  @Input({ required: true }) state!: GeneratorState;
  @Input() fontDetected: boolean | null = null;

  @Output() stateChange = new EventEmitter<GeneratorState>();
  @Output() downloadTop3 = new EventEmitter<void>();
  @Output() downloadWheel = new EventEmitter<void>();
  @Output() downloadBoth = new EventEmitter<void>();

  wheelLibraryOpen = false;

  constructor(private readonly renderer: PostRendererService) {}

  get missingFields(): string[] {
    const missing: string[] = [];

    if (!this.state.wheel) {
      missing.push('roda');
    }

    this.state.top3.forEach((rank, index) => {
      if (!rank.nick.trim()) {
        missing.push(`nick do ${index + 1}º`);
      }
      if (!rank.img) {
        missing.push(`imagem do ${index + 1}º`);
      }
    });

    return missing;
  }

  get isValid(): boolean {
    return this.missingFields.length === 0;
  }

  patchState(changes: Partial<GeneratorState>): void {
    this.stateChange.emit({ ...this.state, ...changes });
  }

  updateRank(index: number, rank: RankState): void {
    const top3 = this.state.top3.map((current, currentIndex) =>
      currentIndex === index ? rank : current,
    );
    this.patchState({ top3 });
  }

  async onWheelFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const wheel = await this.renderer.imageFromFile(file);
    this.patchState({ wheel, wheelName: file?.name ?? null });
  }

  async onWheelLibrarySelected(item: LibraryImage): Promise<void> {
    const wheel = await this.renderer.imageFromSrc(item.path);
    this.patchState({ wheel, wheelName: item.name });
    this.wheelLibraryOpen = false;
  }

  clearWheel(): void {
    this.patchState({ wheel: null, wheelName: null, wheelZoom: 100, wheelX: 0, wheelY: 0 });
  }

  trackRankByIndex(index: number): number {
    return index;
  }

}
