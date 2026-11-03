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
    ...productsFromGrid('luffy-ace.png', 35, 'contain', [['Luffy & Ace', 'center']]),
    ...productsFromGrid('three-admirals.png', 35, 'contain', [['The Three Admirals', 'center']]),
    ...productsFromGrid('impel-down.png', 35, 'contain', [['Impel Down', 'center']]),
    ...productsFromGrid('luffy-pixel.png', 35, 'contain', [['Luffy Pixel', 'center']]),
    ...productsFromGrid('crew-hats.png', 35, 'contain', [['Chapéus da Tripulação', 'center']]),
    ...productsFromGrid('luffy-with-meat.png', 35, 'contain', [['Luffy With Meat', 'center']]),
    ...productsFromGrid('marine.png', 45, 'contain', [['Marinha', 'center']]),
    ...productsFromGrid('going-merry.png', 45, 'contain', [['Going Merry', 'center']]),
    ...productsFromGrid('marshall-teach.png', 50, 'contain', [['Marshall D. Teach', 'center']]),
    ...productsFromGrid('jewelry-bonney.png', 35, 'contain', [['Jewelry Bonney', 'center']]),
    ...productsFromGrid('charlotte-katakuri.png', 35, 'contain', [['Charlotte Katakuri', 'center']]),
    ...productsFromGrid('panda.png', 45, 'contain', [['Panda', 'center']]),
    ...productsFromGrid('king.png', 35, 'contain', [['King', 'center']]),
    ...productsFromGrid('roronoa-zoro.png', 35, 'contain', [['Roronoa Zoro', 'center']]),
    ...productsFromGrid('zoro-jolly-roger.png', 40, 'contain', [['Roronoa Zoro (Jolly Roger)', 'center']]),
    ...productsFromGrid('franky-jolly-roger.png', 40, 'contain', [['Franky (Jolly Roger)', 'center']]),
    ...productsFromGrid('roger-jolly-roger.png', 40, 'contain', [['Gol D. Roger (Jolly Roger)', 'center']]),
    ...productsFromGrid('nami-jolly-roger.png', 40, 'contain', [['Nami (Jolly Roger)', 'center']]),
    ...productsFromGrid('brook-jolly-roger.png', 40, 'contain', [['Brook (Jolly Roger)', 'center']]),
    ...productsFromGrid('tony-tony-chopper.png', 35, 'contain', [['Tony Tony Chopper', 'center']]),
    ...productsFromGrid('gecko-moria.png', 35, 'contain', [['Gecko Moria', 'center']]),
    ...productsFromGrid('sogeking.png', 35, 'contain', [['Sogeking', 'center']]),
    ...productsFromGrid('law-bepo.png', 35, 'contain', [['Law & Bepo', 'center']]),
    ...productsFromGrid('yamato.png', 35, 'contain', [['Yamato', 'center']]),
    ...productsFromGrid('dracule-mihawk.png', 35, 'contain', [['Dracule Mihawk', 'center']]),
    ...productsFromGrid('nami-vivi.png', 35, 'contain', [['Nami and Vivi', 'center']]),
    ...productsFromGrid('big-mom.png', 35, 'contain', [['Big Mom', 'center']]),
    ...productsFromGrid('enel.png', 35, 'contain', [['Enel', 'center']]),
    ...productsFromGrid('buggy.png', 35, 'contain', [['Buggy', 'center']]),
    ...productsFromGrid('sleeves-35-a.png', 35, '440%', [
      ['One Piece Stickers', '95% 22%'],
      ['Ace', '95% 90%'],
    ]),
    ...productsFromGrid('sleeves-35-b.png', 35, '330%', [
      ['Chopper Pattern', '4% 19%'], ['Logo Verde', '20% 77%'], ['Logo Azul', '80% 77%'],
    ]),
    ...productsFromGrid('sleeves-35-c.png', 35, '430%', [
      ['Luffy em Chamas', '67% 14%'], ['Tripulação em Chamas', '96% 14%'],
      ['Luffy Branco', '5% 48%'], ['Luffy Vermelho', '67% 48%'], ['Sabo', '96% 48%'],
      ['Nami Retrato', '36% 83%'], ['Nami Aventureira', '67% 83%'], ['Gear 5', '96% 83%'],
    ]),
    ...productsFromGrid('sleeves-premium-a.png', 45, '310%', [
      ['Uta Floral', '7% 82%'],
    ]),
    ...productsFromGrid('sleeves-35-d.png', 35, '430%', [
      ['Batalha Monocromática', '5% 49%'], ['Piratas da Big Mom', '36% 49%'], ['Boa Hancock Rosa', '96% 49%'],
      ['Mihawk', '67% 83%'], ['Boa Hancock Roxa', '96% 83%'],
    ]),
    ...productsFromGrid('sleeves-35-f.png', 35, '330%', [
      ['Uta Coelhinha', '5% 10%'], ['Gear 5 Épico', '96% 10%'], ['Boa Hancock', '5% 52%'],
      ['Uta Aventura', '50% 52%'], ['Logo Azul Escuro', '50% 93%'],
    ]),
    ...productsFromGrid('sleeves-40.png', 40, '420%', [
      ['Tripulação no Mar', '35% 8%'], ['Uta no Mar', '65% 8%'], ['Law', '95% 8%'],
      ['Ace 2º Aniversário', '4% 48%'],
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
