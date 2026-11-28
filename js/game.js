import { Input } from "./core/input.js";
import { Renderer } from "./core/renderer.js";
import { TitleScene } from "./scenes/title-scene.js";

const canvas = document.querySelector("#game");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Brak canvas #game.");

const input = new Input();
const renderer = new Renderer(canvas, 640, 480);
let scene;
let lastTime = 0;
let selectedPlayerCount = 1;

function beginGame(playerCount) {
  selectedPlayerCount = playerCount;
  scene = {
    update() {},
    draw() {
      renderer.clear("#080d19");
      renderer.text("MISSION 01", 320, 210, 24, "#f5df45", "center");
      renderer.text(`${selectedPlayerCount} PLAYER${selectedPlayerCount === 2 ? "S" : ""}`, 320, 252, 16, "#fff", "center");
      renderer.text("SILNIK GRY W BUDOWIE", 320, 460, 12, "#aaa", "center");
    }
  };
}

scene = new TitleScene(renderer, input, beginGame);

function frame(timestamp) {
  const dt = Math.min((timestamp - (lastTime || timestamp)) / 1000, 1 / 30);
  lastTime = timestamp;
  scene.update(dt);
  scene.draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
