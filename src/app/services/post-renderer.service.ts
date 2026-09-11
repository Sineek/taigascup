import { Injectable } from '@angular/core';
import { GeneratorState, RankSlot, RankState } from '../models/post-generator.model';

@Injectable({ providedIn: 'root' })
export class PostRendererService {
  private readonly colors = {
    brown: '#766c64',
    cream: '#fdf0e0',
  };

  private readonly backgroundOverlayAlpha = 0.50;

  private readonly slots: RankSlot[] = [
    { y: 318, h: 148, x: 339, w: 517, nameX: 358, nameY: 392, font: 72, maxW: 470 },
    { y: 499, h: 148, x: 339, w: 517, nameX: 358, nameY: 573, font: 75, maxW: 470 },
    { y: 681, h: 148, x: 339, w: 517, nameX: 356, nameY: 755, font: 75, maxW: 472 },
  ];

  imageFromSrc(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  imageFromFile(file?: File): Promise<HTMLImageElement | null> {
    if (!file) {
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };

      image.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };

      image.src = objectUrl;
    });
  }

  renderTop3(
    ctx: CanvasRenderingContext2D,
    baseTop3: HTMLImageElement,
    ranks: RankState[],
  ): void {
    ctx.clearRect(0, 0, 1080, 1080);
    ctx.drawImage(baseTop3, 0, 0, 1080, 1080);

    ranks.forEach((rank, index) => {
      const slot = this.slots[index];
      if (!slot) {
        return;
      }

      ctx.fillStyle = this.colors.cream;
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);

      if (rank.img) {
        this.drawCover(ctx, rank.img, slot.x, slot.y, slot.w, slot.h, rank.zoom, rank.x, rank.y);
        this.drawBackgroundOverlay(ctx, slot);
      } else {
        this.drawPlaceholder(ctx, slot);
      }

      this.drawOutlinedName(ctx, rank.nick, slot);
    });
  }

  renderWheel(
    ctx: CanvasRenderingContext2D,
    baseWheel: HTMLImageElement,
    state: GeneratorState,
  ): void {
    ctx.clearRect(0, 0, 1080, 1080);
    ctx.drawImage(baseWheel, 0, 0, 1080, 1080);

    ctx.fillStyle = this.colors.cream;
    ctx.fillRect(155, 82, 790, 190);

    const edition = state.edition || 29;
    const title = `${edition}ª edição`;
    const size = this.fitFont(ctx, title, 150, 770, 88);

    ctx.save();
    ctx.fillStyle = this.colors.brown;
    ctx.font = `${size}px ${this.fontFamily()}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 540, 174);
    ctx.restore();

    ctx.fillStyle = this.colors.cream;
    ctx.fillRect(198, 296, 684, 680);

    if (state.wheel) {
      this.drawContain(
        ctx,
        state.wheel,
        204,
        301,
        672,
        672,
        state.wheelZoom,
        state.wheelX,
        state.wheelY,
      );
      return;
    }

    ctx.save();
    ctx.strokeStyle = '#cfb9a4';
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(540, 637, 316, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#b99f89';
    ctx.font = '28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Envie a roda dos líderes', 540, 642);
    ctx.restore();
  }

  downloadCanvas(canvas: HTMLCanvasElement, name: string): void {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(anchor.href), 1500);
    }, 'image/png');
  }

  private drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    zoom = 100,
    offsetX = 0,
    offsetY = 0,
    alpha = 1,
  ): void {
    const base = Math.max(w / img.width, h / img.height);
    const scale = base * (zoom / 100);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const freeX = Math.max(0, dw - w);
    const freeY = Math.max(0, dh - h);
    const dx = x - (dw - w) / 2 + (offsetX / 100) * (freeX / 2);
    const dy = y - (dh - h) / 2 + (offsetY / 100) * (freeY / 2);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  private drawContain(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    zoom = 100,
    offsetX = 0,
    offsetY = 0,
  ): void {
    const base = Math.min(w / img.width, h / img.height) * (zoom / 100);
    const dw = img.width * base;
    const dh = img.height * base;
    const dx = x + (w - dw) / 2 + (offsetX / 100) * Math.max(0, (w - dw) / 2 + 30);
    const dy = y + (h - dh) / 2 + (offsetY / 100) * Math.max(0, (h - dh) / 2 + 30);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  private drawOutlinedName(ctx: CanvasRenderingContext2D, text: string, slot: RankSlot): void {
    if (!text) {
      return;
    }

    const size = this.fitFont(ctx, text, slot.font, slot.maxW);

    ctx.save();
    ctx.font = `${size}px ${this.fontFamily()}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.fillStyle = '#fff';
    ctx.strokeText(text, slot.nameX, slot.nameY);
    ctx.fillText(text, slot.nameX, slot.nameY);
    ctx.restore();
  }

  private drawBackgroundOverlay(ctx: CanvasRenderingContext2D, slot: RankSlot): void {
    ctx.save();
    ctx.globalAlpha = this.backgroundOverlayAlpha;
    ctx.fillStyle = this.colors.brown;
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    ctx.restore();
  }

  private drawPlaceholder(ctx: CanvasRenderingContext2D, slot: RankSlot): void {
    ctx.save();
    ctx.fillStyle = this.colors.cream;
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    ctx.fillStyle = '#b99f89';
    ctx.font = '24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Envie a imagem', slot.x + slot.w / 2, slot.y + slot.h / 2);
    ctx.restore();
  }

  private fitFont(
    ctx: CanvasRenderingContext2D,
    text: string,
    start: number,
    maxWidth: number,
    min = 34,
  ): number {
    let size = start;

    while (size > min) {
      ctx.font = `${size}px ${this.fontFamily()}`;
      if (ctx.measureText(text).width <= maxWidth) {
        break;
      }
      size -= 1;
    }

    return size;
  }

  private fontFamily(): string {
    return '"VAG Local", "VAG Rounded BT", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  }
}
