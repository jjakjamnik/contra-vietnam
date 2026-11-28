export class TitleScene {
  constructor(renderer, input, onStart) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
    this.input = input;
    this.onStart = onStart;
    this.elapsed = 0;
    this.selection = 0;
    this.logo = null;
    this.logoReady = false;
    this.loadLogo();
  }

  loadLogo() {
    const sheet = new Image();
    sheet.onload = () => {
      const crop = document.createElement("canvas");
      crop.width = 240;
      crop.height = 128;
      const ctx = crop.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(sheet, 20, 448, 240, 128, 0, 0, 240, 128);
      this.removeEdgeBackground(ctx, crop.width, crop.height);
      this.logo = crop;
      this.logoReady = true;
    };
    sheet.src = "assets/miscellaneous/Miscellaneous%20-%20Title%20Screens.png";
  }

  removeEdgeBackground(ctx, width, height) {
    const image = ctx.getImageData(0, 0, width, height);
    const pixels = image.data;
    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let read = 0, write = 0;
    const isKey = index => {
      const p = index * 4;
      return pixels[p] > 190 && pixels[p + 2] > 190 && pixels[p + 1] < 90;
    };
    const add = index => {
      if (!visited[index] && isKey(index)) {
        visited[index] = 1;
        queue[write++] = index;
      }
    };
    for (let x = 0; x < width; x++) {
      add(x);
      add((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      add(y * width);
      add(y * width + width - 1);
    }
    while (read < write) {
      const index = queue[read++];
      pixels[index * 4 + 3] = 0;
      const x = index % width;
      const y = Math.floor(index / width);
      if (x > 0) add(index - 1);
      if (x < width - 1) add(index + 1);
      if (y > 0) add(index - width);
      if (y < height - 1) add(index + width);
    }
    ctx.putImageData(image, 0, 0);
  }

  update(dt) {
    this.elapsed += dt;
    if (this.input.wasPressed("arrowup", "w")) this.selection = 0;
    if (this.input.wasPressed("arrowdown", "s")) this.selection = 1;
    if (this.input.wasPressed("enter", "z", " ")) this.onStart(this.selection + 1);
  }

  draw() {
    const r = this.renderer;
    r.clear("#070d19");
    this.drawBackground();
    if (this.logoReady) {
      this.ctx.drawImage(this.logo, 8, 8, 240, 128);
    } else {
      r.text("CONTRA", 128, 65, 34, "#e83a2e", "center");
    }

    const blink = Math.floor(this.elapsed * 3) % 2 === 0;
    const options = ["1 PLAYER", "2 PLAYERS"];
    options.forEach((label, index) => {
      const y = 190 + index * 15;
      if (this.selection === index && blink) r.text("▶", 77, y, 8, "#f5df45", "center");
      r.text(label, 128, y, 9, this.selection === index ? "#f5df45" : "#deded2", "center");
    });
    r.text("© 1987 KONAMI", 128, 230, 6, "#b5b39a", "center");
  }

  drawBackground() {
    const r = this.renderer;
    r.rect(0, 0, 256, 240, "#080d1b");
    r.rect(0, 105, 256, 78, "#14242a");
    for (let i = 0; i < 38; i++) {
      const x = (i * 71 + 17) % 256;
      const y = 12 + (i * 29) % 90;
      if (Math.sin(this.elapsed * 2.2 + i) > -0.15) r.rect(x, y, 1, 1, "#d5d8c6");
    }
    r.rect(190, 31, 12, 12, "#d8d2a2");
    const ctx = this.ctx;
    ctx.fillStyle = "#18283a";
    ctx.beginPath();
    ctx.moveTo(0, 153); ctx.lineTo(32, 105); ctx.lineTo(66, 143);
    ctx.lineTo(105, 111); ctx.lineTo(146, 151); ctx.lineTo(190, 103);
    ctx.lineTo(230, 143); ctx.lineTo(256, 119); ctx.lineTo(256, 185);
    ctx.lineTo(0, 185); ctx.closePath(); ctx.fill();
    r.rect(0, 179, 256, 61, "#33251c");
    r.rect(0, 179, 256, 4, "#68713b");
    for (let i = 0; i < 17; i++) {
      const x = i * 17 - 4;
      const h = 14 + (i * 13) % 19;
      r.rect(x + 5, 177 - h, 5, h + 8, "#172c22");
      r.rect(x, 167 - h, 17, 7, "#1c3928");
      r.rect(x + 3, 160 - h, 11, 8, "#21432d");
    }
    for (let i = 0; i < 30; i++) {
      const x = (i * 47 + 11) % 256;
      const y = 190 + (i * 17) % 43;
      r.rect(x, y, 2 + i % 3, 1, i % 2 ? "#51402a" : "#263b27");
    }
  }
}
