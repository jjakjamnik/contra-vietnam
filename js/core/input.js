export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    window.addEventListener("keydown", event => {
      const key = this.normalize(event.key);
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      if (!this.down.has(key)) this.pressed.add(key);
      this.down.add(key);
    });
    window.addEventListener("keyup", event => this.down.delete(this.normalize(event.key)));
    window.addEventListener("blur", () => {
      this.down.clear();
      this.pressed.clear();
    });
  }
  normalize(key) { return key.toLowerCase(); }
  isDown(...keys) { return keys.some(key => this.down.has(key)); }
  wasPressed(...keys) { return keys.some(key => this.pressed.has(key)); }
  endFrame() { this.pressed.clear(); }
}
