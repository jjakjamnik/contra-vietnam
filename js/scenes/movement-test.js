const SPRITES = {
  idle: "assets/sprites/raw/contra/sprite_02.png",
  walk: [
    "assets/sprites/raw/contra/sprite_02.png",
    "assets/sprites/raw/contra/sprite_03.png",
    "assets/sprites/raw/contra/sprite_04.png",
    "assets/sprites/raw/contra/sprite_05.png"
  ],
  jump: ["assets/sprites/raw/contra/sprite_08.png", "assets/sprites/raw/contra/sprite_09.png"],
  prone: "assets/sprites/raw/contra/sprite_17.png"
};

export function startMovementTest({ playerCount = 1, onExit }) {
  const root = document.createElement("main");
  root.className = "movement-test";
  root.innerHTML = `
    <header class="test-hud">
      <div>CONTRA VIETNAM <span>— TEST RUCHU</span></div>
      <div class="test-hint">A / D lub ← / → RUCH &nbsp; SPACE SKOK &nbsp; ↓ KUCANIE &nbsp; ESC MENU</div>
    </header>
    <div class="test-world">
      <div class="test-sky"></div>
      <div class="test-ground"></div>
      <div class="test-player"><img alt="Bohater Contra"></div>
    </div>
    <footer class="test-footer">TEST MECHANIKI POSTACI · ${playerCount} GRACZ</footer>
  `;
  document.body.append(root);

  const world = root.querySelector(".test-world");
  const player = root.querySelector(".test-player");
  const img = player.querySelector("img");
  const ground = root.querySelector(".test-ground");
  let x = Math.max(30, world.clientWidth * 0.18);
  let y = 0;
  let vy = 0;
  let facing = 1;
  let onGround = true;
  let crouching = false;
  let frame = 0;
  let last = 0;
  let walkClock = 0;
  let jumpClock = 0;
  const keys = new Set();
  const gravity = 1450;
  const jumpVelocity = -540;
  const speed = 190;

  function setSprite(src) {
    if (img.getAttribute("src") !== src) img.src = src;
  }
  function updateSprite(dt) {
    if (crouching && onGround) {
      setSprite(SPRITES.prone);
    } else if (!onGround) {
      jumpClock += dt;
      setSprite(SPRITES.jump[Math.floor(jumpClock / 0.12) % SPRITES.jump.length]);
    } else if (Math.abs(frame) > 0) {
      walkClock += dt;
      const idx = Math.floor(walkClock / 0.11) % SPRITES.walk.length;
      setSprite(SPRITES.walk[idx]);
    } else {
      walkClock = 0;
      setSprite(SPRITES.idle);
    }
    player.classList.toggle("face-left", facing < 0);
    player.classList.toggle("is-crouching", crouching && onGround);
    player.classList.toggle("is-jumping", !onGround);
    player.classList.toggle("is-prone", crouching && onGround);
  }

  function tick(time) {
    const dt = Math.min((time - last) / 1000 || 0, 0.033);
    last = time;
    const left = keys.has("arrowleft") || keys.has("a");
    const right = keys.has("arrowright") || keys.has("d");
    crouching = onGround && (keys.has("arrowdown") || keys.has("s"));
    frame = crouching ? 0 : (right ? 1 : left ? -1 : 0);
    if (frame) facing = frame;
    if (frame) x += frame * speed * dt;
    x = Math.max(0, Math.min(world.clientWidth - 54, x));

    if (!onGround) {
      vy += gravity * dt;
      y += vy * dt;
      if (y >= 0) { y = 0; vy = 0; onGround = true; }
    }

    player.style.transform = `translate(${x}px, ${y}px)`;
    updateSprite(dt);
    requestAnimationFrame(tick);
  }

  function keydown(event) {
    const key = event.key.toLowerCase();
    if (["arrowleft","arrowright","arrowdown"," ","arrowup"].includes(key)) event.preventDefault();
    if (key === "escape") { cleanup(); onExit?.(); return; }
    if ((key === " " || key === "arrowup" || key === "w") && onGround && !crouching) {
      vy = jumpVelocity;
      jumpClock = 0;
      onGround = false;
    }
    keys.add(key);
  }
  function keyup(event) { keys.delete(event.key.toLowerCase()); }
  function resize() { x = Math.min(x, world.clientWidth - 54); }
  function cleanup() {
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
    window.removeEventListener("resize", resize);
    root.remove();
  }
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
}
