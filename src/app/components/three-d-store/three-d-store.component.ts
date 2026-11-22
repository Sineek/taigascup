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
  readonly whatsappNumber = '553598114920';

  // Adicione as fotos em src/assets/3d e cadastre os produtos neste array.
  readonly products: ThreeDProduct[] = [
    // {
    //   name: 'Nome do produto',
    //   price: 0,
    //   image: asset('produto.png'),
    //   description: 'Descrição curta do item.',
    //   badge: 'Feito sob encomenda',
    // },
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
