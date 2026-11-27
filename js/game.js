// ============================================================
// CONTRA VIETNAM — grywalny prototyp misji 01
// Canvas NES 256 × 240. Sterowanie: strzałki, Z = strzał, X = skok.
// ============================================================

const canvas = document.getElementById("game-canvas");
const statusMessage = document.getElementById("status-message");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Nie znaleziono #game-canvas.");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Nie udało się uruchomić Canvas 2D.");

const WIDTH = 256;
const HEIGHT = 240;
const GROUND = 181;
const WORLD_WIDTH = 1728;
ctx.imageSmoothingEnabled = false;

const keys = new Set();
let lastFrame = 0;
let elapsed = 0;
let gameStarted = false;
let gameOver = false;
let victory = false;
let score = 0;
let cameraX = 0;
let fireCooldown = 0;
let spawnIndex = 0;

const stars = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 73 + 19) % WIDTH, y: 12 + ((i * 37) % 92), phase: i * 0.7
}));

// Oryginalne arkusze z assets — tło pierwszego etapu i animacje Billa.
const stageImage = new Image();
stageImage.src = "assets/stages/stage-1/Stages%20-%20Stage%201.png";

// Logo CONTRA wycinane z oryginalnego arkusza ekranów tytułowych.
let titleLogo = null;
const titleSheet = new Image();
titleSheet.src = "assets/miscellaneous/Miscellaneous%20-%20Title%20Screens.png";
titleSheet.addEventListener("load", () => {
  const crop = document.createElement("canvas");
  crop.width = 240;
  crop.height = 128;
  const cropCtx = crop.getContext("2d", { willReadFrequently: true });
  cropCtx.drawImage(titleSheet, 20, 448, 240, 128, 0, 0, 240, 128);
  const pixels = cropCtx.getImageData(0, 0, crop.width, crop.height);
  const d = pixels.data;
  // Magenta z arkusza jest usuwana tylko tam, gdzie łączy się z krawędzią.
  const seen = new Uint8Array(crop.width * crop.height);
  const queue = new Int32Array(crop.width * crop.height);
  let head = 0, tail = 0;
  function magenta(i) {
    const p = i * 4;
    return d[p] > 190 && d[p + 2] > 190 && d[p + 1] < 90;
  }
  function seed(i) {
    if (!seen[i] && magenta(i)) { seen[i] = 1; queue[tail++] = i; }
  }
  for (let x = 0; x < crop.width; x++) { seed(x); seed((crop.height - 1) * crop.width + x); }
  for (let y = 0; y < crop.height; y++) { seed(y * crop.width); seed(y * crop.width + crop.width - 1); }
  while (head < tail) {
    const i = queue[head++];
    d[i * 4 + 3] = 0;
    const x = i % crop.width, y = (i / crop.width) | 0;
    if (x) seed(i - 1);
    if (x < crop.width - 1) seed(i + 1);
    if (y) seed(i - crop.width);
    if (y < crop.height - 1) seed(i + crop.width);
  }
  cropCtx.putImageData(pixels, 0, 0);
  titleLogo = crop;
});
// Oryginalne, przezroczyste sprite'y wyciągnięte z grafiki Contra NES.
const playerFrames = ["02", "03", "04", "05", "06"].map(id => {
  const img = new Image();
  img.src = `assets/sprites/raw/contra/sprite_${id}.png`;
  return img;
});
const enemyFrames = ["27", "28"].map(id => {
  const img = new Image();
  img.src = `assets/sprites/raw/contra/sprite_${id}.png`;
  return img;
});

const player = {
  x: 34, y: GROUND, vy: 0, facing: 1, width: 12, height: 23,
  onGround: true, lives: 3, invulnerable: 0
};

const bullets = [];
const enemies = [];
const enemySpawns = [260, 420, 560, 760, 920, 1080, 1260, 1450, 1630, 1780];

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function text(value, x, y, size = 8, color = "#fff", align = "left") {
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function drawTitle() {
  rect(0, 0, WIDTH, HEIGHT, "#080d1b");
  rect(0, 100, WIDTH, 80, "#182a2c");
  for (const s of stars) if (Math.sin(elapsed * 2 + s.phase) > 0.1) rect(s.x, s.y, 1, 1, "#d7d9c6");
  rect(194, 27, 16, 16, "#e8dca8");
  // Góry i sylwetki dżungli.
  ctx.fillStyle = "#18263a";
  ctx.beginPath();
  ctx.moveTo(0, 145); ctx.lineTo(32, 90); ctx.lineTo(67, 133);
  ctx.lineTo(103, 99); ctx.lineTo(143, 143); ctx.lineTo(185, 92);
  ctx.lineTo(230, 135); ctx.lineTo(256, 112); ctx.lineTo(256, 180);
  ctx.lineTo(0, 180); ctx.closePath(); ctx.fill();
  drawJungle(0);
  const titleFighter = playerFrames[0];
  if (titleFighter && titleFighter.complete && titleFighter.naturalWidth) {
    const w = titleFighter.naturalWidth * 1.7;
    const h = titleFighter.naturalHeight * 1.7;
    ctx.drawImage(titleFighter, 72 - w / 2, 181 - h, w, h);
    ctx.save();
    ctx.translate(188, 0); ctx.scale(-1, 1);
    ctx.drawImage(titleFighter, -w / 2, 181 - h, w, h);
    ctx.restore();
  }
  if (titleLogo) ctx.drawImage(titleLogo, 24, 22, 208, 111);
  else {
    text("CONTRA", 128, 62, 34, "#e83a2e", "center");
    text("VIETNAM", 128, 85, 10, "#f4d94c", "center");
  }
  text("VIETNAM", 128, 145, 10, "#f4d94c", "center");
  if (Math.floor(elapsed * 2) % 2 === 0) text("PRESS START", 128, 171, 9, "#f5df45", "center");
  text("1 PLAYER     HIGH SCORE  000000", 128, 225, 6, "#b5b39a", "center");
}

function drawJungle(offset) {
  rect(0, 155, WIDTH, 30, "#152b24");
  for (let i = -2; i < 17; i++) {
    const worldX = i * 22;
    const x = ((worldX - offset * 0.35) % (WIDTH + 22) + WIDTH + 22) % (WIDTH + 22) - 11;
    const h = 16 + ((i * 13 + 260) % 22);
    rect(x + 7, 164 - h, 5, h + 18, "#172c22");
    rect(x, 164 - h, 19, 7, "#1c3928");
    rect(x + 3, 157 - h, 13, 8, "#21432d");
  }
  rect(0, 181, WIDTH, 59, "#33251c");
  rect(0, 181, WIDTH, 4, "#68713b");
  rect(0, 186, WIDTH, 2, "#45532f");
  for (let i = 0; i < 34; i++) {
    const x = ((i * 47 + 11 - offset) % WIDTH + WIDTH) % WIDTH;
    const y = 193 + (i * 17 % 42);
    rect(x, y, 3 + (i % 3), 1, i % 2 ? "#51402a" : "#263b27");
  }
}

function drawStage() {
  if (stageImage.complete && stageImage.naturalWidth > 0) {
    // Oryginalna panorama jest złożona z ekranów NES 256 px.
    // Rysujemy w skali 1:1, bez rozciągania w pionie.
    const sourceX = Math.max(0, Math.min(stageImage.naturalWidth - WIDTH, cameraX));
    ctx.drawImage(stageImage, sourceX, 0, WIDTH, Math.min(136, stageImage.naturalHeight),
      0, 45, WIDTH, Math.min(136, stageImage.naturalHeight));
  } else {
    drawJungle(cameraX);
  }
}

function drawPlayerSprite() {
  const moving = keys.has("arrowleft") || keys.has("arrowright") ||
                 keys.has("a") || keys.has("d");
  const frameIndex = moving ? Math.floor(elapsed * 10) % playerFrames.length : 0;
  const sprite = playerFrames[frameIndex];
  const dx = player.x - cameraX;
  if (!sprite || !sprite.complete || !sprite.naturalWidth) {
    drawSoldier(dx, player.y, 1, player.facing);
    return;
  }
  const scale = 1.35;
  const w = sprite.naturalWidth * scale;
  const h = sprite.naturalHeight * scale;
  ctx.save();
  if (player.invulnerable > 0 && Math.floor(elapsed * 12) % 2 === 1) ctx.globalAlpha = 0.35;
  if (player.facing < 0) {
    ctx.translate(dx, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, -w / 2, player.y - h, w, h);
  } else {
    ctx.drawImage(sprite, dx - w / 2, player.y - h, w, h);
  }
  ctx.restore();
}

function drawSoldier(x, feetY, scale = 1, facing = 1, tint = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(feetY));
  ctx.scale(facing * scale, scale);
  const green = tint ? "#7a4935" : "#53633b";
  rect(-5, -4, 5, 4, "#17191b");
  rect(2, -4, 5, 4, "#17191b");
  rect(-4, -13, 4, 10, green);
  rect(1, -13, 4, 10, tint ? "#986044" : "#657345");
  rect(-6, -19, 12, 9, green);
  rect(-5, -23, 10, 5, "#b58b61");
  rect(-6, -24, 12, 3, tint ? "#49372d" : "#303d2b");
  rect(-8, -17, 4, 5, "#b58b61");
  rect(5, -17, 4, 4, "#b58b61");
  rect(5, -18, 15, 2, "#252a2a");
  rect(17, -19, 3, 4, "#171d1d");
  rect(-4, -15, 8, 2, "#293a2b");
  ctx.restore();
}

function resetGame() {
  player.x = 34; player.y = GROUND; player.vy = 0; player.facing = 1; player.aimX = 1; player.aimY = 0;
  player.lives = 3; player.invulnerable = 0; player.onGround = true;
  bullets.length = 0; enemies.length = 0;
  cameraX = 0; score = 0; spawnIndex = 0; fireCooldown = 0;
  gameOver = false; victory = false;
}

function startGame() {
  resetGame();
  gameStarted = true;
  if (statusMessage) statusMessage.textContent = "MISJA 01 — POWODZENIA, ŻOŁNIERZU!";
}

function spawnEnemies() {
  while (spawnIndex < enemySpawns.length && enemySpawns[spawnIndex] < cameraX + WIDTH + 100) {
    const x = enemySpawns[spawnIndex++];
    enemies.push({ x, y: GROUND, alive: true, fire: 0, speed: 13 + (spawnIndex % 3) * 3 });
  }
}

function update(dt) {
  if (!gameStarted || gameOver || victory) return;
  elapsed += dt;
  fireCooldown = Math.max(0, fireCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);

  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const up = keys.has("arrowup") || keys.has("w");
  const down = keys.has("arrowdown") || keys.has("s");
  const jump = keys.has("x") || keys.has(" ");
  const speed = 76;
  if (left) { player.x -= speed * dt; player.facing = -1; }
  if (right) { player.x += speed * dt; player.facing = 1; }

  // Kierunek strzału wybierany niezależnie od skoku:
  // góra/dół + lewo/prawo pozwalają strzelać także po skosie.
  let aimX = right ? 1 : left ? -1 : 0;
  let aimY = up ? -1 : down ? 1 : 0;
  if (aimX === 0 && aimY === 0) aimX = player.facing;
  if (aimX !== 0 || aimY !== 0) {
    const length = Math.hypot(aimX, aimY) || 1;
    player.aimX = aimX / length;
    player.aimY = aimY / length;
  }
  if (jump && player.onGround) { player.vy = -164; player.onGround = false; }
  player.x = Math.max(8, Math.min(WORLD_WIDTH - 24, player.x));

  player.vy += 420 * dt;
  player.y += player.vy * dt;
  if (player.y >= GROUND) { player.y = GROUND; player.vy = 0; player.onGround = true; }

  if ((keys.has("z") || keys.has("j")) && fireCooldown <= 0) {
    const ax = player.aimX ?? player.facing;
    const ay = player.aimY ?? 0;
    bullets.push({
      x: player.x + ax * 12,
      y: player.y - 15 + ay * 3,
      vx: ax * 230,
      vy: ay * 230,
      life: 1.2
    });
    fireCooldown = 0.19;
  }

  cameraX = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, player.x - 75));
  spawnEnemies();

  for (const b of bullets) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    for (const e of enemies) {
      if (e.alive && Math.abs(b.x - e.x) < 11 && Math.abs(b.y - (e.y - 13)) < 14) {
        e.alive = false; b.life = 0; score += 100; break;
      }
    }
  }
  for (let i = bullets.length - 1; i >= 0; i--) if (bullets[i].life <= 0) bullets.splice(i, 1);

  for (const e of enemies) {
    if (!e.alive) continue;
    const direction = Math.sign(player.x - e.x);
    if (Math.abs(player.x - e.x) > 22) e.x += direction * e.speed * dt;
    if (player.invulnerable <= 0 && Math.abs(player.x - e.x) < 11 && Math.abs(player.y - e.y) < 20) hurtPlayer();
  }
  for (let i = enemies.length - 1; i >= 0; i--) if (!enemies[i].alive) enemies.splice(i, 1);

  if (player.x >= WORLD_WIDTH - 28) {
    victory = true;
    if (statusMessage) statusMessage.textContent = "MISJA UKOŃCZONA!";
  }
}

function hurtPlayer() {
  player.lives--;
  player.invulnerable = 1.4;
  player.x = Math.max(20, player.x - 35);
  if (player.lives <= 0) {
    gameOver = true;
    if (statusMessage) statusMessage.textContent = "KONIEC GRY — ENTER, ABY SPRÓBOWAĆ PONOWNIE";
  }
}

function drawGame() {
  drawStage();
  // Małe bunkry / przeszkody w tle.
  for (const bx of [350, 840, 1320, 1700]) {
    const x = bx - cameraX;
    if (x > -30 && x < WIDTH + 30) {
      rect(x, 164, 24, 17, "#39413a"); rect(x + 4, 158, 16, 7, "#4e5944");
      rect(x + 9, 168, 6, 8, "#171e1b");
    }
  }
  for (const e of enemies) {
    const sx = e.x - cameraX;
    if (sx > -25 && sx < WIDTH + 25) {
      const frame = enemyFrames[Math.floor(elapsed * 7) % enemyFrames.length];
      if (frame && frame.complete && frame.naturalWidth) {
        const w = frame.naturalWidth * 1.35, h = frame.naturalHeight * 1.35;
        ctx.save();
        if (e.x < player.x) { ctx.translate(sx, 0); ctx.scale(-1, 1); ctx.drawImage(frame, -w / 2, e.y - h, w, h); }
        else ctx.drawImage(frame, sx - w / 2, e.y - h, w, h);
        ctx.restore();
      } else drawSoldier(sx, e.y, 0.95, e.x < player.x ? -1 : 1, true);
    }
  }
  for (const b of bullets) {
    const sx = b.x - cameraX;
    rect(sx - 2, b.y, 5, 2, "#ffe88a");
    rect(sx - 1, b.y - 1, 3, 1, "#fff5c8");
  }
  const px = player.x - cameraX;
  if (player.invulnerable <= 0 || Math.floor(elapsed * 12) % 2 === 0) {
    drawPlayerSprite();
  }

  // HUD.
  rect(0, 0, WIDTH, 15, "#10131a");
  rect(0, 14, WIDTH, 1, "#a18a4a");
  text("1P", 5, 7, 7, "#f2df62");
  text("SCORE", 28, 7, 6, "#eee");
  text(String(score).padStart(6, "0"), 62, 7, 7, "#fff");
  text("LIFE", 151, 7, 6, "#eee");
  text("♥".repeat(Math.max(0, player.lives)), 184, 7, 8, "#ef5146");
  text("STAGE 1", 250, 7, 6, "#f2df62", "right");

  if (gameOver || victory) {
    rect(38, 91, 180, 48, "#101820");
    rect(38, 91, 180, 1, "#e2c34e"); rect(38, 138, 180, 1, "#e2c34e");
    text(victory ? "MISSION COMPLETE" : "GAME OVER", 128, 108, 11, "#f5df45", "center");
    text("PRESS ENTER", 128, 124, 7, "#fff", "center");
  }
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
  keys.add(key);
  if (key === "enter") {
    if (!gameStarted || gameOver || victory) startGame();
  }
}
function handleKeyUp(event) { keys.delete(event.key.toLowerCase()); }
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => keys.clear());

function frame(timestamp = 0) {
  const dt = Math.min((timestamp - lastFrame) / 1000 || 0, 0.05);
  lastFrame = timestamp;
  if (!gameStarted) {
    elapsed += dt;
    drawTitle();
  } else {
    update(dt);
    drawGame();
  }
  requestAnimationFrame(frame);
}

if (statusMessage) statusMessage.textContent = "EKRAN TYTUŁOWY — ENTER: START";
requestAnimationFrame(frame);

export { canvas, ctx, WIDTH, HEIGHT, keys };
