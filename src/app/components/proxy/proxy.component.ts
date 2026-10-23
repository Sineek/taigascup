import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

interface CardCatalogEntry { code: string; name: string; image: string; thumbnail: string; }
interface ProxyItem extends CardCatalogEntry { quantity: number; }

@Component({
  selector: 'app-proxy',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './proxy.component.html',
  styleUrl: './proxy.component.css',
})
export class ProxyComponent {
  cards: CardCatalogEntry[] = [];
  items: ProxyItem[] = [];
  search = '';
  list = '';
  searchOpen = false;
  message = '';
  generating = false;

  constructor() {
    fetch('assets/library/cards.json').then((response) => response.json()).then((cards: CardCatalogEntry[]) => this.cards = cards)
      .catch(() => this.message = 'Não foi possível carregar o catálogo de cartas.');
  }

  get suggestions(): CardCatalogEntry[] {
    const query = this.normalize(this.search);
    if (!this.searchOpen || query.length < 2) return [];
    return this.cards.filter((card) => this.normalize(`${card.code} ${card.name}`).includes(query)).slice(0, 12);
  }

  addCard(card: CardCatalogEntry, quantity = 1): void {
    const existing = this.items.find((item) => item.code === card.code);
    if (existing) existing.quantity += quantity;
    else this.items.push({ ...card, quantity });
    this.search = '';
    this.searchOpen = false;
    this.message = '';
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
  closeSearch(): void { window.setTimeout(() => this.searchOpen = false, 150); }

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

  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
}
