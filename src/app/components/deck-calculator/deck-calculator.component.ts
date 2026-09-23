import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Rules {
  version: string;
  pointCap: number;
  leaders: Record<string, number>;
  cards: Record<string, number>;
}

interface DeckLine {
  code: string;
  quantity: number;
  points: number;
}

@Component({
  selector: 'app-deck-calculator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './deck-calculator.component.html',
  styleUrl: './deck-calculator.component.css',
})
export class DeckCalculatorComponent {
  deckText = '';
  rules: Rules | null = null;
  loading = true;
  error = '';
  leader: DeckLine | null = null;
  cards: DeckLine[] = [];
  missingImages = new Set<string>();
  total = 0;
  evaluated = false;

  constructor(private readonly http: HttpClient) {
    this.http.get<Rules>(`assets/scoring/rules.json?v=${Date.now()}`).subscribe({
      next: (rules) => {
        this.rules = rules;
        this.loading = false;
      },
      error: () => {
        this.error = 'A tabela de pontuação não está disponível.';
        this.loading = false;
      },
    });
  }

  get cardCount(): number {
    return this.cards.reduce((sum, card) => sum + card.quantity, 0);
  }

  get eligible(): boolean {
    return this.evaluated && !this.error && this.cardCount === 50 &&
      this.total <= (this.rules?.pointCap ?? 0);
  }

  cardImagePath(code: string): string {
    const collection = code.split('-')[0];
    return `assets/library/Cards/${collection}/${code}_small.jpg`;
  }

  imageLoadError(code: string): void {
    this.missingImages.add(code);
  }

  lineTotal(line: DeckLine): number {
    return line.quantity * line.points;
  }

  lineExceedsCap(line: DeckLine): boolean {
    return this.lineTotal(line) >= (this.rules?.pointCap ?? 100);
  }

  calculate(): void {
    this.error = '';
    this.evaluated = false;
    this.leader = null;
    this.cards = [];
    this.missingImages.clear();
    this.total = 0;

    if (!this.rules) {
      this.error = 'A tabela de pontuação não está disponível.';
      return;
    }

    const lines = this.deckText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) {
      this.error = 'Cole uma lista com o líder na primeira linha.';
      return;
    }

    const parsed: { code: string; quantity: number }[] = [];
    for (const [index, line] of lines.entries()) {
      const match = /^(\d+)\s*x\s*([A-Za-z]{1,5}\d{2,3}-\d{3})$/i.exec(line);
      if (!match) {
        this.error = `Linha ${index + 1} inválida: ${line}`;
        return;
      }
      const quantity = Number(match[1]);
      if (quantity < 1) {
        this.error = `Linha ${index + 1}: a quantidade deve ser maior que zero.`;
        return;
      }
      parsed.push({ quantity, code: match[2].toUpperCase() });
    }

    if (parsed[0].quantity !== 1) {
      this.error = 'A primeira linha deve conter exatamente 1 líder.';
      return;
    }

    const counts = new Map<string, number>();
    for (const card of parsed.slice(1)) {
      counts.set(card.code, (counts.get(card.code) ?? 0) + card.quantity);
    }
    const tooMany = [...counts].find(([, quantity]) => quantity > 4);
    if (tooMany) {
      this.error = `O código ${tooMany[0]} aparece ${tooMany[1]} vezes (máximo: 4).`;
      return;
    }

    this.leader = {
      ...parsed[0],
      points: this.rules.leaders[parsed[0].code] ?? 0,
    };
    this.cards = [...counts].map(([code, quantity]) => ({
      code,
      quantity,
      points: this.rules!.cards[code] ?? 0,
    }));
    this.total = this.leader.points + this.cards.reduce(
      (sum, card) => sum + card.quantity * card.points, 0,
    );
    this.evaluated = true;
  }
}

