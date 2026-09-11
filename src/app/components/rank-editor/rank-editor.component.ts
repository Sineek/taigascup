import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LibraryImage } from '../../models/image-library.model';
import { RankState } from '../../models/post-generator.model';
import { PostRendererService } from '../../services/post-renderer.service';
import { ImageLibraryComponent } from '../image-library/image-library.component';

@Component({
  selector: 'app-rank-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageLibraryComponent],
  templateUrl: './rank-editor.component.html',
  styleUrl: './rank-editor.component.css',
})
export class RankEditorComponent {
  @Input({ required: true }) rank!: RankState;
  @Input({ required: true }) index = 0;
  @Output() rankChange = new EventEmitter<RankState>();

  libraryOpen = false;

  constructor(private readonly renderer: PostRendererService) {}

  patch(changes: Partial<RankState>): void {
    this.rankChange.emit({ ...this.rank, ...changes });
  }

  async onImageFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const image = await this.renderer.imageFromFile(file);
    this.patch({ img: image, imageName: file?.name ?? null });
  }

  async onLibrarySelected(item: LibraryImage): Promise<void> {
    const image = await this.renderer.imageFromSrc(item.path);
    this.patch({ img: image, imageName: item.name });
    this.libraryOpen = false;
  }

  clearImage(): void {
    this.patch({ img: null, imageName: null, zoom: 100, x: 0, y: 0 });
  }
}
