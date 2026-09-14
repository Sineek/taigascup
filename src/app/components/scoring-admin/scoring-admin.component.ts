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
  code = '';
  points = 0;
  kind: 'leaders' | 'cards' = 'cards';
  error = '';
  loading = true;

  constructor(private readonly http: HttpClient) {
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

  cardImageError(event: Event, code: string): void {
    const image = event.target as HTMLImageElement;
    if (image.dataset['fallback'] !== 'tried') {
      image.dataset['fallback'] = 'tried';
      image.src = `https://www.onepiece-cardgame.com/images/cardlist/card/${code}.png`;
    } else {
      image.hidden = true;
    }
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

  remove(kind: 'leaders' | 'cards', code: string): void {
    if (this.rules) delete this.rules[kind][code];
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
