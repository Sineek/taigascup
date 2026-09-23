import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface LibraryImage {
  fileName: string;
  path: string;
}

interface LibraryIndex {
  backgrounds: LibraryImage[];
}

interface Rules {
  version: string;
  pointCap: number;
  leaders: Record<string, number>;
  cards: Record<string, number>;
}

@Component({
  selector: 'app-scoring-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './scoring-admin.component.html',
  styleUrl: './scoring-admin.component.css',
})
export class ScoringAdminComponent {
  rules: Rules | null = null;
  imageByCode: Record<string, string> = {};
  code = '';
  points = 0;
  kind: 'leaders' | 'cards' = 'cards';
  error = '';
  loading = true;
  refreshingImages = false;
  imageRefreshMessage = '';
  readonly leadersPerPage = 5;
  readonly cardsPerPage = 10;
  leaderPage = 1;
  cardPage = 1;

  constructor(private readonly http: HttpClient) {
    this.refreshImages(false);
    this.http.get<Rules>(`assets/scoring/rules.json?v=${Date.now()}`).subscribe({
      next: (rules) => { this.rules = rules; this.loading = false; },
      error: () => { this.error = 'Não foi possível carregar a tabela.'; this.loading = false; },
    });
  }

  get leaderEntries(): [string, number][] {
    return Object.entries(this.rules?.leaders ?? {}).sort(([a], [b]) => a.localeCompare(b));
  }

  get cardEntries(): [string, number][] {
    return Object.entries(this.rules?.cards ?? {}).sort(([a], [b]) => a.localeCompare(b));
  }

  get paginatedLeaderEntries(): [string, number][] {
    const start = (this.leaderPage - 1) * this.leadersPerPage;
    return this.leaderEntries.slice(start, start + this.leadersPerPage);
  }

  get paginatedCardEntries(): [string, number][] {
    const start = (this.cardPage - 1) * this.cardsPerPage;
    return this.cardEntries.slice(start, start + this.cardsPerPage);
  }

  get leaderPageCount(): number {
    return Math.max(1, Math.ceil(this.leaderEntries.length / this.leadersPerPage));
  }

  get cardPageCount(): number {
    return Math.max(1, Math.ceil(this.cardEntries.length / this.cardsPerPage));
  }

  changeLeaderPage(page: number): void {
    this.leaderPage = Math.min(Math.max(1, page), this.leaderPageCount);
  }

  changeCardPage(page: number): void {
    this.cardPage = Math.min(Math.max(1, page), this.cardPageCount);
  }

  refreshImages(showMessage = true): void {
    this.refreshingImages = true;
    this.imageRefreshMessage = '';
    const version = Date.now();
    forkJoin({
      library: this.http.get<LibraryIndex>(`assets/library/library.json?v=${version}`),
      fallback: this.http.get<Record<string, string>>(`assets/scoring/ligaonepiece-images.json?v=${version}`),
    }).subscribe({
      next: ({ library, fallback }) => {
        const nextImages: Record<string, string> = { ...fallback };
        for (const image of library.backgrounds ?? []) {
          const code = image.fileName.match(/^([A-Z]{1,5}\d{2,3}-\d{3})\s+-\s+/)?.[1];
          if (code) nextImages[code] = image.path;
        }
        const codes = [
          ...Object.keys(this.rules?.leaders ?? {}),
          ...Object.keys(this.rules?.cards ?? {}),
        ];
        const added = codes.filter((code) => !this.imageByCode[code] && nextImages[code]).length;
        const missing = codes.filter((code) => !nextImages[code]).length;
        this.imageByCode = nextImages;
        this.refreshingImages = false;
        if (showMessage) {
          this.imageRefreshMessage = missing
            ? `${added} imagem(ns) atualizada(s). Ainda faltam ${missing}; adicione a referência dessas cartas ao arquivo ligaonepiece-images.json, publique no GitHub e tente novamente.`
            : `Imagens atualizadas. ${added} nova(s) miniatura(s) encontrada(s).`;
        }
      },
      error: () => {
        this.refreshingImages = false;
        if (showMessage) this.imageRefreshMessage = 'Não foi possível atualizar as imagens. Tente novamente.';
      },
    });
  }

  imageLoadError(code: string): void {
    this.imageByCode[code] = '';
  }

  save(): void {
    if (!this.rules) return;
    const code = this.code.trim().toUpperCase();
    if (!/^[A-Z]{1,5}\d{2,3}-\d{3}$/.test(code) ||
        !Number.isInteger(this.points) || this.points < 0 || this.points > 100) {
      this.error = 'Informe um código válido e pontos inteiros entre 0 e 100.';
      return;
    }
    this.rules[this.kind][code] = this.points;
    this.code = '';
    this.points = 0;
    this.error = '';
  }

  download(): void {
    if (!this.rules) return;
    const data = JSON.stringify(this.rules, null, 2) + '\n';
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rules.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
