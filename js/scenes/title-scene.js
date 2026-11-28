export class TitleScene {
  constructor(renderer, input, onStart) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
    this.input = input;
    this.onStart = onStart;
    this.elapsed = 0;
    this.selection = 0;
    this.logo = new Image();
    this.soldiers = new Image();
    this.logoReady = false;
    this.soldiersReady = false;
    this.logo.onload = () => { this.logoReady = true; };
    this.soldiers.onload = () => { this.soldiersReady = true; };
    this.logo.src = "assets/title/contra-logo.png";
    this.soldiers.src = "assets/title/contra-soldiers.png";
  }

  update(dt) {
    this.elapsed += dt;
    if (this.input.wasPressed("arrowup", "w")) this.selection = 0;
    if (this.input.wasPressed("arrowdown", "s")) this.selection = 1;
    if (this.input.wasPressed("enter", "z", " ")) this.onStart(this.selection + 1);
  }

  outlinedText(value, x, y, size, align = "left") {
    const c = this.ctx;
    c.font = `${size}px "Press Start 2P", monospace`;
    c.textAlign = align;
    c.textBaseline = "middle";
    c.fillStyle = "#8c164f";
    c.fillText(value, x + 2, y + 2);
    c.fillStyle = "#e5e5e5";
    c.fillText(value, x, y);
  }

  drawVietnam() {
    // The V gets a small yellow/red flame accent; the rest stays a clean pixel-font wordmark.
    const c = this.ctx;
    c.save();
    c.font = '27px "Press Start 2P", monospace';
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.fillStyle = "#b52b22";
    c.fillText("V", 194, 273);
    c.fillStyle = "#e7df27";
    c.fillText("V", 192, 270);
    c.restore();
    this.outlinedText("IETNAM", 222, 270, 21, "left");
  }

  drawPointer(y, visible) {
    if (!visible) return;
    const c = this.ctx;
    c.fillStyle = "#d9e923";
    c.fillRect(137, y - 7, 28, 8);
    c.fillRect(147, y - 13, 8, 20);
  }

  draw() {
    const r = this.renderer;
    const c = this.ctx;
    r.clear("#000000");

    if (this.logoReady) c.drawImage(this.logo, 126, 94, 393, 162);
    if (this.soldiersReady) c.drawImage(this.soldiers, 337, 239, 180, 144);

    this.drawVietnam();

    const blink = Math.floor(this.elapsed * 3) % 2 === 0;
    r.text("WYBÓR GRACZY", 143, 305, 16, "#bdbdbd", "left");

    const labels = ["1 GRACZ", "2 GRACZY"];
    labels.forEach((label, i) => {
      const y = 345 + i * 40;
      this.drawPointer(y, this.selection === i && blink);
      r.text(label, 176, y, 18, this.selection === i ? "#e5e5e5" : "#bdbdbd", "left");
    });

    r.text("© 2026", 320, 420, 13, "#bdbdbd", "center");
    r.text("PROJEKT FANOWSKI", 320, 443, 13, "#bdbdbd", "center");
    r.text("BY J JAK JAMNIK", 320, 466, 13, "#bdbdbd", "center");
  }
}
