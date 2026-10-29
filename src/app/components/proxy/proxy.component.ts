import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

type CardColor = 'red' | 'green' | 'blue' | 'purple' | 'black' | 'yellow';
type ProxyInputMode = 'search' | 'list';
interface CardCatalogEntry { code: string; name: string; colors: CardColor[]; image: string; thumbnail: string; }
interface ProxyItem extends CardCatalogEntry { quantity: number; }

const COLOR_SEARCH_ALIASES: Record<CardColor, string> = {
  red: 'red vermelho vermelha',
  green: 'green verde',
  blue: 'blue azul',
  purple: 'purple roxo roxa',
  black: 'black preto preta',
  yellow: 'yellow amarelo amarela',
};

@Component({
  selector: 'app-proxy',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './proxy.component.html',
  styleUrl: './proxy.component.css',
})
export class ProxyComponent {
  readonly colorFilters: { color: CardColor; label: string }[] = [
    { color: 'black', label: 'Preto' },
    { color: 'purple', label: 'Roxo' },
    { color: 'blue', label: 'Azul' },
    { color: 'red', label: 'Vermelho' },
    { color: 'yellow', label: 'Amarelo' },
    { color: 'green', label: 'Verde' },
  ];
  cards: CardCatalogEntry[] = [];
  items: ProxyItem[] = [];
  inputMode: ProxyInputMode = 'search';
  selectedColor: CardColor | null = null;
  search = '';
  list = '';
  message = '';
  generating = false;
  previewCard: CardCatalogEntry | null = null;
  private previewTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const catalogUrl = `assets/library/cards.json?v=${Date.now()}`;
    fetch(catalogUrl, { cache: 'no-store' }).then((response) => response.json()).then((cards: CardCatalogEntry[]) => {
      this.cards = [...cards].sort((left, right) => this.compareCardCodes(left.code, right.code));
    })
      .catch(() => this.message = 'Não foi possível carregar o catálogo de cartas.');
  }

  get filteredCards(): CardCatalogEntry[] {
    const query = this.normalize(this.search);
    const terms = query.split(/\s+/).filter(Boolean);
    return this.cards.filter((card) => {
      if (this.selectedColor && !(card.colors ?? []).includes(this.selectedColor)) return false;
      if (!terms.length) return true;
      const searchable = this.searchableText(card);
      return terms.every((term) => searchable.includes(term));
    });
  }

  setInputMode(mode: ProxyInputMode): void {
    this.inputMode = mode;
    this.message = '';
  }

  toggleColor(color: CardColor): void {
    this.selectedColor = this.selectedColor === color ? null : color;
  }

  addCard(card: CardCatalogEntry, quantity = 1): void {
    const existing = this.items.find((item) => item.code === card.code);
    if (existing) existing.quantity += quantity;
    else this.items.push({ ...card, quantity });
    this.message = '';
  }

  startPreview(card: CardCatalogEntry): void {
    this.stopPreview();
    this.previewTimer = setTimeout(() => {
      this.previewCard = card;
      this.previewTimer = null;
    }, 3000);
  }

  stopPreview(): void {
    if (this.previewTimer) clearTimeout(this.previewTimer);
    this.previewTimer = null;
    this.previewCard = null;
  }

  addList(): void {
    const missing: string[] = [];
    for (const rawLine of this.list.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const match = line.match(/^(\d+)\s*x?\s*([A-Za-z]{1,5}\d{0,2}-\d{3})$/i);
      if (!match) { missing.push(line); continue; }
      const card = this.cards.find((entry) => entry.code === match[2].toUpperCase());
      if (card) this.addCard(card, Number(match[1])); else missing.push(match[2].toUpperCase());
    }
    this.message = missing.length ? `Não encontradas: ${missing.join(', ')}` : 'Lista adicionada ao painel.';
  }

  change(item: ProxyItem, amount: number): void { item.quantity = Math.max(1, item.quantity + amount); }
  remove(item: ProxyItem): void { this.items = this.items.filter((entry) => entry !== item); }
  clearCards(): void {
    this.items = [];
    this.list = '';
    this.message = 'Todas as cartas foram removidas.';
  }
  async generatePdf(): Promise<void> {
    if (!this.items.length || this.generating) return;
    this.generating = true;
    this.message = 'Preparando o PDF…';
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const copies = this.items.flatMap((item) => Array.from({ length: item.quantity }, () => item));
      const width = 63;
      const height = 88;
      const left = (210 - width * 3) / 2;
      const top = (297 - height * 3) / 2;
      const cache = new Map<string, string>();
      for (let index = 0; index < copies.length; index += 1) {
        if (index > 0 && index % 9 === 0) pdf.addPage('a4', 'portrait');
        const card = copies[index];
        let data = cache.get(card.code);
        if (!data) { data = await this.imageData(card.image); cache.set(card.code, data); }
        const slot = index % 9;
        const x = left + (slot % 3) * width;
        const y = top + Math.floor(slot / 3) * height;
        pdf.addImage(data, 'JPEG', x, y, width, height, undefined, 'FAST');
        pdf.setDrawColor(128, 128, 128);
        pdf.setLineWidth(0.265);
        pdf.rect(x, y, width, height);
      }
      pdf.save('taigas-cup-proxies.pdf');
      this.message = `PDF gerado com ${copies.length} carta${copies.length === 1 ? '' : 's'} em tamanho real (63 × 88 mm).`;
    } catch {
      this.message = 'Não foi possível gerar o PDF. Confira se todas as imagens estão disponíveis.';
    } finally { this.generating = false; }
  }

  private imageData(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        canvas.getContext('2d')?.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.96));
      };
      image.onerror = reject; image.src = src;
    });
  }

  private searchableText(card: CardCatalogEntry): string {
    const colors = (card.colors ?? []).filter((color): color is CardColor => color in COLOR_SEARCH_ALIASES);
    const aliases = colors.map((color) => COLOR_SEARCH_ALIASES[color]).join(' ');
    const multi = colors.length > 1 ? 'multicolor multicor multicolored multicolorida multicolorido' : '';
    return this.normalize(`${card.code} ${card.name} ${aliases} ${multi}`);
  }

  private compareCardCodes(left: string, right: string): number {
    const leftParts = this.parseCardCode(left);
    const rightParts = this.parseCardCode(right);
    const familyPriority: Record<string, number> = { OP: 0, EB: 1, ST: 2, P: 3 };
    const leftPriority = familyPriority[leftParts.family] ?? 10;
    const rightPriority = familyPriority[rightParts.family] ?? 10;
    return leftPriority - rightPriority
      || rightParts.collection - leftParts.collection
      || rightParts.number - leftParts.number
      || right.localeCompare(left, undefined, { numeric: true });
  }

  private parseCardCode(code: string): { family: string; collection: number; number: number } {
    const match = code.toUpperCase().match(/^([A-Z]+)(\d*)-(\d+)$/);
    return {
      family: match?.[1] ?? code.toUpperCase(),
      collection: Number(match?.[2] ?? -1),
      number: Number(match?.[3] ?? -1),
    };
  }

  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
}
