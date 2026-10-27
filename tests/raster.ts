// A tiny in-memory raster that records solid fills, so flat drawings can be compared pixel by pixel in Node.

export class Raster {
  readonly px: string[];
  fillStyle: string = '#000';

  constructor(readonly size: number) {
    this.px = new Array<string>(size * size).fill('');
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.paint(x, y, w, h, '');
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.paint(x, y, w, h, String(this.fillStyle));
  }

  private paint(x: number, y: number, w: number, h: number, v: string): void {
    const x0 = Math.max(0, Math.round(x));
    const y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(this.size, Math.round(x + w));
    const y1 = Math.min(this.size, Math.round(y + h));
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) this.px[yy * this.size + xx] = v;
    }
  }
}
