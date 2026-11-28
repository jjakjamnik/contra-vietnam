export class TitleScene {
  constructor(renderer, input, onStart) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
    this.input = input;
    this.onStart = onStart;
    this.elapsed = 0;
    this.selection = 0;
    this.background = new Image();
    this.backgroundReady = false;
    this.background.onload = () => { this.backgroundReady = true; };
    this.background.onerror = () => console.error("Nie udało się wczytać tła ekranu tytułowego.");
    this.background.src = "assets/title/contra-vietnam-title-bg.png";
  }

  update(dt) {
    this.elapsed += dt;
    if (this.input.wasPressed("arrowup", "w")) this.selection = 0;
    if (this.input.wasPressed("arrowdown", "s")) this.selection = 1;
    if (this.input.wasPressed("enter", "z", " ")) this.onStart(this.selection + 1);
  }

  text(value, x, y, size, color = "#c8c8c8", align = "left") {
    const c = this.ctx;
    c.font = `${size}px "Press Start 2P", monospace`;
    c.textAlign = align;
    c.textBaseline = "middle";
    c.fillStyle = "#111";
    c.fillText(value, x + 1, y + 1);
    c.fillStyle = color;
    c.fillText(value, x, y);
  }

  drawPointer(y, visible) {
    if (!visible) return;
    const c = this.ctx;
    c.fillStyle = "#d9e923";
    c.fillRect(84, y - 7, 28, 8);
    c.fillRect(94, y - 13, 8, 20);
  }

  draw() {
    const r = this.renderer;
    const c = this.ctx;
    r.clear("#000");
    if (this.backgroundReady) c.drawImage(this.background, 0, 0, 640, 480);

    const blink = Math.floor(this.elapsed * 3) % 2 === 0;
    this.text("WYBOR GRACZY", 143, 305, 16);
    ["1 GRACZ", "2 GRACZY"].forEach((label, i) => {
      const y = 345 + i * 40;
      this.drawPointer(y, this.selection === i && blink);
      this.text(label, 130, y, 18, this.selection === i ? "#eeeeee" : "#bdbdbd");
    });
    this.text("© 2026", 320, 420, 13, "#bdbdbd", "center");
    this.text("PROJEKT FANOWSKI", 320, 443, 13, "#bdbdbd", "center");
    this.text("BY J JAK JAMNIK", 320, 466, 13, "#bdbdbd", "center");
  }
}
