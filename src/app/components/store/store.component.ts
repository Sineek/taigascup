import { Component } from '@angular/core';

interface StoreProduct {
  name: string;
  price: number;
  image: string;
  size: string;
  position: string;
}

const asset = (file: string): string => `assets/store/${file}`;

const productsFromGrid = (
  image: string,
  price: number,
  size: string,
  entries: Array<[string, string]>,
): StoreProduct[] => entries.map(([name, position]) => ({ name, price, image: asset(image), size, position }));

@Component({
  selector: 'app-store',
  standalone: true,
  templateUrl: './store.component.html',
  styleUrl: './store.component.css',
})
export class StoreComponent {
  readonly whatsappNumber = '553598114920';
  readonly products: StoreProduct[] = [
    ...productsFromGrid('sleeves-35-a.png', 35, '440%', [
      ['Luffy vs. Kuzan', '8% 22%'], ['Marineford', '37% 22%'], ['Tripulação Chibi', '66% 22%'], ['One Piece Stickers', '95% 22%'],
      ['Luffy Pixel', '8% 56%'], ['Big Mom', '37% 56%'], ['Luffy Holográfico', '66% 56%'], ['Law e Bepo', '95% 56%'],
      ['Yamato', '66% 90%'], ['Ace', '95% 90%'],
    ]),
    ...productsFromGrid('sleeves-35-b.png', 35, '330%', [
      ['Chopper Pattern', '4% 19%'], ['Chapéus da Tripulação', '96% 19%'], ['Logo Verde', '20% 77%'], ['Logo Azul', '80% 77%'],
    ]),
    ...productsFromGrid('sleeves-35-c.png', 35, '430%', [
      ['Luffy em Chamas', '67% 14%'], ['Tripulação em Chamas', '96% 14%'],
      ['Luffy Branco', '5% 48%'], ['Luffy e Tripulação', '36% 48%'], ['Luffy Vermelho', '67% 48%'], ['Sabo', '96% 48%'],
      ['Nami Retrato', '36% 83%'], ['Nami Aventureira', '67% 83%'], ['Gear 5', '96% 83%'],
    ]),
    ...productsFromGrid('sleeves-premium-a.png', 45, '310%', [
      ['Marinha', '6% 38%'], ['Going Merry', '50% 38%'], ['Uta Floral', '7% 82%'], ['Panda', '51% 82%'],
    ]),
    ...productsFromGrid('sleeves-premium-a.png', 50, '310%', [['Marshall D. Teach', '95% 60%']]),
    ...productsFromGrid('sleeves-35-d.png', 35, '430%', [
      ['Uta Colorida', '5% 16%'], ['Armadura Negra', '36% 16%'], ['Irmãos em Chamas', '67% 16%'], ['Zoro Verde', '96% 16%'],
      ['Batalha Monocromática', '5% 49%'], ['Piratas da Big Mom', '36% 49%'], ['Uta e Shanks', '67% 49%'], ['Boa Hancock Rosa', '96% 49%'],
      ['Buggy', '36% 83%'], ['Mihawk', '67% 83%'], ['Boa Hancock Roxa', '96% 83%'],
    ]),
    ...productsFromGrid('sleeves-35-e.png', 35, '215%', [
      ['Enel', '4% 8%'], ['Impel Down', '96% 8%'], ['Vivi e Nami', '4% 92%'], ['Família Charlotte', '96% 92%'],
    ]),
    ...productsFromGrid('sleeves-35-f.png', 35, '330%', [
      ['Uta Coelhinha', '5% 10%'], ['Gear 5 Épico', '96% 10%'], ['Boa Hancock', '5% 52%'],
      ['Uta Aventura', '50% 52%'], ['Chopper Pattern Rosa', '96% 52%'], ['Logo Azul Escuro', '50% 93%'],
    ]),
    ...productsFromGrid('sleeves-40.png', 40, '420%', [
      ['Tripulação no Mar', '35% 8%'], ['Uta no Mar', '65% 8%'], ['Law', '95% 8%'],
      ['Ace 2º Aniversário', '4% 48%'], ['Nami', '35% 48%'], ['Brook', '65% 48%'], ['Franky', '95% 48%'],
      ['Zoro', '20% 88%'], ['Gol D. Roger', '82% 88%'],
    ]),
    ...productsFromGrid('sleeves-special.png', 45, '205%', [['Logo Laranja', '3% 50%']]),
    ...productsFromGrid('sleeves-special.png', 50, '205%', [['Tripulação — Formato Horizontal', '97% 50%']]),
  ];

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  whatsappUrl(product?: StoreProduct): string {
    const message = product
      ? `Olá! Tenho interesse no sleeve oficial ${product.name}, anunciado por ${this.formatPrice(product.price)}.`
      : 'Olá! Gostaria de saber mais sobre os sleeves oficiais disponíveis na loja Taiga\'s Cup.';
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}
