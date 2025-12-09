import { Injectable } from '@angular/core';
import { CellConfig } from '../models/puzzle.model';
import { ShadeIndex } from '../models/motif.model';

const SHADE_MAP: Record<ShadeIndex, string> = {
  0: '#e5e7eb', // light grey
  1: '#9ca3af', // medium grey
  2: '#0f172a', // near black
  3: '#0f172a', // collapse darker requests into a single dark tone
};

/**
 * Draws greyscale motifs using an 80x80 unit coordinate space, scaled to the
 * actual canvas size for responsive rendering.
 */
@Injectable({ providedIn: 'root' })
export class MotifRendererService {
  render(canvas: HTMLCanvasElement, cell: CellConfig | null): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width, canvas.height) / 80;
    ctx.save();
    ctx.scale(scale, scale);
    this.drawCellFrame(ctx);
    if (!cell) {
      ctx.restore();
      return;
    }

    switch (cell.motifId) {
      case 'barStack':
        this.drawBarStack(ctx, cell);
        break;
      case 'staircase':
        this.drawStaircase(ctx, cell);
        break;
      case 'doubleFrame':
        this.drawDoubleFrame(ctx, cell);
        break;
      case 'dotGrid':
        this.drawDotGrid(ctx, cell);
        break;
      case 'isoCube':
        this.drawIsoCube(ctx, cell);
        break;
      case 'arrowRing':
        this.drawArrowRing(ctx, cell);
        break;
      default:
        this.drawDotGrid(ctx, cell);
        break;
    }

    ctx.restore();
  }

  private drawCellFrame(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.lineWidth = 0;
    ctx.fillStyle = 'rgba(235, 237, 240, 0.65)';
    this.roundRect(ctx, 3, 3, 74, 74, 10);
    ctx.fill();
    ctx.restore();
  }

  private drawBarStack(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { count = 3, shadeIndex = 2, size = 1 } = cell.params;
    const width = 10 + size * 6;
    const spacing = 6;
    const startX = 20 - width / 2;
    const centerY = 40;
    ctx.save();
    ctx.fillStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * (width + spacing);
      ctx.fillRect(40 + startX + offset, centerY - 20, width, 40);
    }
    ctx.restore();
  }

  private drawStaircase(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { count = 4, shadeIndex = 1, rotation = 0 } = cell.params;
    const stepSize = 12;
    ctx.save();
    ctx.translate(40, 40);
    ctx.rotate((Math.PI / 2) * (rotation % 4));
    ctx.translate(-40, -40);
    ctx.fillStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    for (let i = 0; i < count; i++) {
      ctx.fillRect(12 + i * stepSize, 52 - i * stepSize, stepSize, stepSize);
    }
    ctx.restore();
  }

  private drawDoubleFrame(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { shadeIndex = 0, borderThickness = 2, size = 1 } = cell.params;
    const outer = 16 + size * 8;
    const inner = outer - 10;
    ctx.save();
    ctx.strokeStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    ctx.lineWidth = borderThickness;
    this.roundRect(ctx, 40 - outer, 40 - outer, outer * 2, outer * 2, 8);
    ctx.stroke();
    this.roundRect(ctx, 40 - inner, 40 - inner, inner * 2, inner * 2, 6);
    ctx.stroke();
    ctx.restore();
  }

  private drawDotGrid(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { count = 9, shadeIndex = 3 } = cell.params;
    const dots = Math.max(3, Math.min(5, count));
    const gap = 50 / (dots - 1);
    ctx.save();
    ctx.fillStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    for (let i = 0; i < dots; i++) {
      for (let j = 0; j < dots; j++) {
        ctx.beginPath();
        ctx.arc(15 + i * gap, 15 + j * gap, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawIsoCube(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { shadeIndex = 2, size = 1 } = cell.params;
    const base = 16 + size * 4;
    const shade = Math.min(shadeIndex, 2) as ShadeIndex;
    const light = SHADE_MAP[Math.max(0, shade - 1) as ShadeIndex];
    const medium = SHADE_MAP[shade];
    const dark = SHADE_MAP[2];
    ctx.save();
    ctx.translate(40, 40);
    ctx.strokeStyle = medium;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -base);
    ctx.lineTo(base, -base / 2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-base, -base / 2);
    ctx.closePath();
    ctx.fillStyle = light;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(base, -base / 2);
    ctx.lineTo(base, base / 2);
    ctx.lineTo(0, base);
    ctx.closePath();
    ctx.fillStyle = dark;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-base, -base / 2);
    ctx.lineTo(-base, base / 2);
    ctx.lineTo(0, base);
    ctx.closePath();
    ctx.fillStyle = medium;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawArrowRing(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { shadeIndex = 1, rotation = 0, count = 3 } = cell.params;
    const innerRadius = 20;
    ctx.save();
    ctx.translate(40, 40);
    ctx.rotate((Math.PI / 2) * (rotation % 4));
    ctx.strokeStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
    const arrowCount = Math.max(3, count);
    for (let i = 0; i < arrowCount; i++) {
      const angle = (i / arrowCount) * Math.PI * 2;
      const tipX = Math.cos(angle) * (innerRadius + 12);
      const tipY = Math.sin(angle) * (innerRadius + 12);
      const baseX = Math.cos(angle) * (innerRadius - 2);
      const baseY = Math.sin(angle) * (innerRadius - 2);
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - Math.cos(angle - 0.4) * 6, tipY - Math.sin(angle - 0.4) * 6);
      ctx.lineTo(tipX - Math.cos(angle + 0.4) * 6, tipY - Math.sin(angle + 0.4) * 6);
      ctx.closePath();
      ctx.fillStyle = SHADE_MAP[shadeIndex as ShadeIndex];
      ctx.fill();
    }
    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }
}
