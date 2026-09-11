import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import {
  ImageLibraryCategory,
  LibraryImage,
} from '../../models/image-library.model';
import { ImageLibraryService } from '../../services/image-library.service';

@Component({
  selector: 'app-image-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-library.component.html',
  styleUrl: './image-library.component.css',
})
export class ImageLibraryComponent implements OnInit {
  @Input({ required: true }) category!: ImageLibraryCategory;
  @Input() title = 'Biblioteca de imagens';

  @Output() selected = new EventEmitter<LibraryImage>();
  @Output() closed = new EventEmitter<void>();

  images: LibraryImage[] = [];
  search = '';
  collection = 'all';
  loading = true;

  constructor(private readonly libraryService: ImageLibraryService) {}

  ngOnInit(): void {
    this.libraryService
      .getManifest()
      .pipe(take(1))
      .subscribe((manifest) => {
        this.images = manifest[this.category] ?? [];
        this.loading = false;
      });
  }

  get collections(): string[] {
    return [...new Set(this.images.map((image) => image.collection))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { numeric: true }),
    );
  }

  get filteredImages(): LibraryImage[] {
    const normalizedSearch = this.normalize(this.search);

    return this.images.filter((image) => {
      const matchesCollection =
        this.collection === 'all' || image.collection === this.collection;
      const searchable = this.normalize(
        `${image.name} ${image.fileName} ${image.collection}`,
      );
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);

      return matchesCollection && matchesSearch;
    });
  }

  choose(image: LibraryImage): void {
    this.selected.emit(image);
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  trackByPath(_index: number, image: LibraryImage): string {
    return image.path;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
