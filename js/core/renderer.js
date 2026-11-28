export class Renderer {
  constructor(canvas, width = 256, height = 240) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    if (!this.ctx) throw new Error("Canvas 2D nie jest dostępny.");
    this.width = width;
    this.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }
  clear(color = "#000") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  rect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), width, height);
  }
  text(value, x, y, size = 8, color = "#fff", align = "left") {
    const ctx = this.ctx;
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  }
}
