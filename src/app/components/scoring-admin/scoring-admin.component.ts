import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  missingImages = new Set<string>();
  code = '';
  points = 0;
  kind: 'leaders' | 'cards' = 'cards';
  error = '';
  loading = true;
  readonly leadersPerPage = 5;
  leaderPage = 1;
  selectedCardCollection = '';

  constructor(private readonly http: HttpClient) {
    this.http.get<Rules>(`assets/scoring/rules.json?v=${Date.now()}`).subscribe({
      next: (rules) => {
        this.rules = rules;
        this.selectedCardCollection = this.cardCollections[0] ?? '';
        this.loading = false;
      },
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

  get cardCollections(): string[] {
    return [...new Set(this.cardEntries.map(([code]) => code.split('-')[0]))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  get selectedCardEntries(): [string, number][] {
    return this.cardEntries.filter(([code]) => code.startsWith(`${this.selectedCardCollection}-`));
  }

  get leaderPageCount(): number {
    return Math.max(1, Math.ceil(this.leaderEntries.length / this.leadersPerPage));
  }

  changeLeaderPage(page: number): void {
    this.leaderPage = Math.min(Math.max(1, page), this.leaderPageCount);
  }

  cardImagePath(code: string): string {
    const collection = code.split('-')[0];
    return `assets/library/Cards/${collection}/${code}_small.jpg`;
  }

  imageLoadError(code: string): void {
    this.missingImages.add(code);
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
    if (this.kind === 'cards') this.selectedCardCollection = code.split('-')[0];
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

