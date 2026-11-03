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
    ...productsFromGrid('yamato-ace.png', 35, 'contain', [['Yamato & Ace', 'center']]),
    ...productsFromGrid('gol-d-roger.png', 35, 'contain', [['Gol.D.Roger', 'center']]),
    ...productsFromGrid('kung-fu-jugon-karoo.png', 35, 'contain', [['Kung Fu Jugon & Karoo', 'center']]),
    ...productsFromGrid('log-pose-green.png', 35, 'contain', [['Log Pose(Green)', 'center']]),
    ...productsFromGrid('log-pose-blue.png', 35, 'contain', [['Log Pose (Blue)', 'center']]),
    ...productsFromGrid('sabo.png', 35, 'contain', [['Sabo', 'center']]),
    ...productsFromGrid('ace-sabo-luffy.png', 35, 'contain', [['Ace, Sabo & Luffy', 'center']]),
    ...productsFromGrid('monkey-d-luffy-white.png', 35, 'contain', [['Monkey D. Luffy', 'center']]),
    ...productsFromGrid('monkey-d-luffy.png', 35, 'contain', [['Monkey D. Luffy', 'center']]),
    ...productsFromGrid('sabo-store-edition-vol-2.png', 35, 'contain', [['Sabo (Store Edition Vol.2)', 'center']]),
    ...productsFromGrid('nami-limited-edition-vol-6.png', 35, 'contain', [['Nami (Limited Edition Vol.6)', 'center']]),
    ...productsFromGrid('sailor-nami.png', 35, 'contain', [['Sailor Nami', 'center']]),
    ...productsFromGrid('monkey-d-luffy-gear-5.png', 35, 'contain', [['Monkey D. Luffy (Gear 5)', 'center']]),
    ...productsFromGrid('bonney-3nd-anniversary-chinese.png', 45, 'contain', [['Bonney (3nd Anniversary set Chinese)', 'center']]),
    ...productsFromGrid('eustass-kid-sleeve-vol-9.png', 35, 'contain', [['Eustass Kid (Sleeve Vol. 9)', 'center']]),
    ...productsFromGrid('buggy-guild-version.png', 35, 'contain', [['Buggy (Guild Version)', 'center']]),
    ...productsFromGrid('boa-hancock.png', 35, 'contain', [['Boa Hancock', 'center']]),
    ...productsFromGrid('perona.png', 35, 'contain', [['Perona', 'center']]),
    ...productsFromGrid('boa-hancock-sleeves-vol-11.png', 35, 'contain', [['Boa Hancock (Sleeves Vol. 11)', 'center']]),
    ...productsFromGrid('mihawk-perona.png', 35, 'contain', [['Mihawk & Perona', 'center']]),
    ...productsFromGrid('uta-sleeve-vol-3.png', 35, 'contain', [['Uta (Sleeve Vol. 3)', 'center']]),
    ...productsFromGrid('monkey-d-luffy-limited-edition-vol-6.png', 35, 'contain', [['Monkey D. Luffy (Limited Edition Vol. 6)', 'center']]),
    ...productsFromGrid('boa-hancock-sleeves-vol-16.png', 35, 'contain', [['Boa Hancock (Sleeves Vol. 16)', 'center']]),
    ...productsFromGrid('monkey-d-luffy-elbaph.png', 35, 'contain', [['Monkey D. Luffy (Elbaph)', 'center']]),
    ...productsFromGrid('log-pose-xebec.png', 35, 'contain', [['Log Pose(Xebec)', 'center']]),
    ...productsFromGrid('strawhat-crew-championship-25-26kv.png', 40, 'contain', [['Strawhat Crew (Championship 25-26KV)', 'center']]),
    ...productsFromGrid('shiraoshi.png', 40, 'contain', [['Shiraoshi', 'center']]),
    ...productsFromGrid('trafalgar-law.png', 40, 'contain', [['Trafalgar Law', 'center']]),
    ...productsFromGrid('monkey-d-luffy-2nd-anniversary-japan.png', 40, 'contain', [['Monkey D. Luffy (2nd Anniversary set Japan)', 'center']]),
    ...productsFromGrid('log-pose-orange.png', 45, 'contain', [['Log Pose (Orange)', 'center']]),
    ...productsFromGrid('battle-mera-mera-fruit-edition.png', 50, 'contain', [['The Battle for the Mera Mera Fruit Edition', 'center']]),
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
