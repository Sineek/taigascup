import { Component } from '@angular/core';

interface ThreeDProduct {
  name: string;
  price: number;
  image: string;
  description: string;
  badge?: string;
}

const asset = (file: string): string => `assets/3d/${file}`;

@Component({
  selector: 'app-three-d-store',
  standalone: true,
  templateUrl: './three-d-store.component.html',
  styleUrl: './three-d-store.component.css',
})
export class ThreeDStoreComponent {
  readonly whatsappNumber = '5535997420366';

  // Adicione as fotos em src/assets/3d e cadastre os produtos neste array.
  readonly products: ThreeDProduct[] = [
    {
      name: 'Deckbox Law',
      price: 100,
      image: asset('deckbox-law.png'),
      description: 'Deckbox temática de Trafalgar Law produzida em impressão 3D.',
      badge: '3D',
    },
    {
      name: 'Deckbox Shanks',
      price: 100,
      image: asset('deckbox-shanks.png'),
      description: 'Deckbox temática de Shanks produzida em impressão 3D.',
      badge: '3D',
    },
    {
      name: 'Insert NOVA LATA',
      price: 79.99,
      image: asset('insert-nova-lata.png'),
      description: 'Insert para organizar cartas, marcadores e acessórios do One Piece Card Game.',
      badge: '3D',
    },
  ];

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  whatsappUrl(product?: ThreeDProduct): string {
    const message = product
      ? `Olá! Tenho interesse no item 3D ${product.name}, anunciado por ${this.formatPrice(product.price)}.`
      : 'Olá! Gostaria de saber mais sobre os itens impressos em 3D da Taiga\'s Cup.';
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}
