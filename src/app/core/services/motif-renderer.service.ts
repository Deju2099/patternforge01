import { Injectable } from '@angular/core';
import { CellConfig } from '../models/puzzle.model';
import { ShadeIndex } from '../models/motif.model';

const SHADE_MAP: Record<ShadeIndex, string> = {
  0: '#E6E3E3', // very light tone
  1: '#ADA1A1', // light grey
  2: '#544E4E', // medium grey
  3: '#0C0101', // deep black
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
    ctx.fillStyle = '#eef1f5';
    this.roundRect(ctx, 1.2, 1.2, 77.6, 77.6, 10);
    ctx.fill();
    ctx.restore();
  }

  private drawBarStack(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { shadeIndex = 2, size = 1 } = cell.params;
    const count = Math.max(2, Math.min(6, cell.params.count ?? 3));

    // Fit the entire stack inside the canvas by scaling bar width to the count.
    const spacing = 4 + size; // slightly increase spacing for larger sizes
    const availableWidth = 54 + size * 6; // usable width before touching the frame rounding
    const barWidth = Math.max(6, (availableWidth - spacing * (count - 1)) / count);
    const totalWidth = barWidth * count + spacing * (count - 1);
    const startX = 40 - totalWidth / 2;
    const centerY = 40;

    // Short/mid/large sizing: noticeably squash small and stretch large bars.
    const height = 24 + size * 12;

    ctx.save();
    ctx.fillStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    for (let i = 0; i < count; i++) {
      const offset = i * (barWidth + spacing);
      ctx.fillRect(startX + offset, centerY - height / 2, barWidth, height);
    }
    ctx.restore();
  }

  private drawStaircase(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { shadeIndex = 1, rotation = 0 } = cell.params;
    const count = Math.max(2, Math.min(6, cell.params.count ?? 4));
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
    const { shadeIndex = 3 } = cell.params;
    const dotsPerSide = Math.max(2, Math.min(6, cell.params.count ?? 3));
    const gap = 50 / (dotsPerSide - 1);
    const radius = 4;
    ctx.save();
    ctx.fillStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    for (let i = 0; i < dotsPerSide; i++) {
      for (let j = 0; j < dotsPerSide; j++) {
        ctx.beginPath();
        ctx.arc(15 + i * gap, 15 + j * gap, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawIsoCube(ctx: CanvasRenderingContext2D, cell: CellConfig): void {
    const { shadeIndex = 2, size = 1 } = cell.params;
    const base = 16 + size * 4;
    const shade = Math.max(0, Math.min(3, shadeIndex)) as ShadeIndex;
    const light = SHADE_MAP[Math.max(0, shade - 1) as ShadeIndex];
    const medium = SHADE_MAP[shade];
    const dark = SHADE_MAP[Math.min(3, shade + 1) as ShadeIndex];
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
    const { shadeIndex = 1, rotation = 0 } = cell.params;
    const count = Math.max(2, Math.min(6, cell.params.count ?? 3));
    const innerRadius = 20;
    const spokeStart = innerRadius - 4;
    const spokeEnd = innerRadius + 8;
    const tipRadius = innerRadius + 16;
    ctx.save();
    ctx.translate(40, 40);
    ctx.rotate((Math.PI / 2) * (rotation % 4));
    ctx.strokeStyle = SHADE_MAP[shadeIndex as ShadeIndex];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const baseX = Math.cos(angle) * spokeStart;
      const baseY = Math.sin(angle) * spokeStart;
      const headBaseX = Math.cos(angle) * spokeEnd;
      const headBaseY = Math.sin(angle) * spokeEnd;
      const tipX = Math.cos(angle) * tipRadius;
      const tipY = Math.sin(angle) * tipRadius;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(headBaseX, headBaseY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(headBaseX - Math.cos(angle - 0.45) * 7, headBaseY - Math.sin(angle - 0.45) * 7);
      ctx.lineTo(headBaseX - Math.cos(angle + 0.45) * 7, headBaseY - Math.sin(angle + 0.45) * 7);
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
