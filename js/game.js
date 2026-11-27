// ============================================================
// CONTRA VIETNAM — ekran tytułowy / pierwszy etap oprawy
// Canvas NES 256 × 240, bez zewnętrznych bibliotek.
// ============================================================

const canvas = document.getElementById("game-canvas");
const statusMessage = document.getElementById("status-message");

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Nie znaleziono elementu #game-canvas.");
}

const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Nie udało się uruchomić Canvas 2D.");

const WIDTH = 256;
const HEIGHT = 240;
ctx.imageSmoothingEnabled = false;

const keys = new Set();
let gameStarted = false;
let lastFrame = 0;
let elapsed = 0;

const stars = Array.from({ length: 34 }, (_, i) => ({
    x: (i * 73 + 19) % WIDTH,
    y: 12 + ((i * 37) % 92),
    speed: 2 + (i % 4),
    phase: i * 0.7
}));

function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawSky() {
    rect(0, 0, WIDTH, HEIGHT, "#080d1b");
    rect(0, 88, WIDTH, 48, "#111b2b");
    rect(0, 128, WIDTH, 38, "#26302b");

    // Księżyc i gwiazdy.
    rect(196, 27, 15, 15, "#e8dca8");
    rect(192, 31, 4, 7, "#e8dca8");
    rect(211, 31, 4, 7, "#e8dca8");
    rect(200, 23, 7, 4, "#e8dca8");
    rect(200, 42, 7, 4, "#e8dca8");
    stars.forEach((star) => {
        const twinkle = Math.sin(elapsed * 2 + star.phase) > 0.15;
        if (twinkle) rect(star.x, star.y, 1, 1, "#d7d9c6");
    });

    // Dalekie góry.
    ctx.fillStyle = "#18263a";
    ctx.beginPath();
    ctx.moveTo(0, 135);
    ctx.lineTo(0, 112);
    ctx.lineTo(35, 83);
    ctx.lineTo(63, 116);
    ctx.lineTo(94, 91);
    ctx.lineTo(130, 126);
    ctx.lineTo(165, 92);
    ctx.lineTo(205, 124);
    ctx.lineTo(232, 101);
    ctx.lineTo(256, 119);
    ctx.lineTo(256, 150);
    ctx.closePath();
    ctx.fill();

    // Hory na drugim planie.
    ctx.fillStyle = "#243b3a";
    ctx.beginPath();
    ctx.moveTo(0, 151);
    ctx.lineTo(0, 129);
    ctx.lineTo(27, 112);
    ctx.lineTo(55, 142);
    ctx.lineTo(87, 118);
    ctx.lineTo(119, 146);
    ctx.lineTo(155, 119);
    ctx.lineTo(190, 145);
    ctx.lineTo(222, 116);
    ctx.lineTo(256, 139);
    ctx.lineTo(256, 166);
    ctx.closePath();
    ctx.fill();
}

function drawJungle() {
    // Zarys dżungli.
    rect(0, 155, WIDTH, 25, "#152b24");
    for (let i = 0; i < 13; i++) {
        const x = i * 22 - 4;
        const h = 16 + (i * 13 % 22);
        rect(x + 7, 164 - h, 5, h + 18, "#172c22");
        rect(x, 164 - h, 19, 7, "#1c3928");
        rect(x + 3, 157 - h, 13, 8, "#21432d");
    }

    // Pierwszy plan — ziemia.
    rect(0, 181, WIDTH, 59, "#33251c");
    rect(0, 181, WIDTH, 4, "#68713b");
    rect(0, 186, WIDTH, 2, "#45532f");
    for (let i = 0; i < 30; i++) {
        const x = (i * 47 + 11) % WIDTH;
        const y = 193 + (i * 17 % 42);
        rect(x, y, 3 + (i % 3), 1, i % 2 ? "#51402a" : "#263b27");
    }

    // Liście po bokach.
    for (let i = 0; i < 6; i++) {
        rect(i * 5, 151 + i * 5, 13, 3, "#285034");
        rect(WIDTH - 13 - i * 5, 157 + i * 4, 13, 3, "#285034");
    }
}

function drawSoldier(x, y, scale = 1, facing = 1) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(facing * scale, scale);

    // Buty, nogi, tułów, głowa, karabin — prosta sylwetka pixel-art.
    rect(-5, 18, 5, 4, "#17191b");
    rect(2, 18, 5, 4, "#17191b");
    rect(-4, 10, 4, 9, "#53633b");
    rect(1, 10, 4, 9, "#657345");
    rect(-6, 4, 12, 9, "#52643c");
    rect(-5, 1, 10, 5, "#b58b61");
    rect(-6, 0, 12, 3, "#303d2b");
    rect(-8, 6, 4, 4, "#b58b61");
    rect(5, 6, 4, 3, "#b58b61");
    rect(5, 5, 15, 2, "#252a2a");
    rect(17, 4, 3, 4, "#171d1d");
    rect(-4, 8, 8, 2, "#293a2b");
    ctx.restore();
}

function drawTitle() {
    drawSky();
    drawJungle();

    // Migające światła w bazie.
    const blink = Math.floor(elapsed * 3) % 2 === 0;
    rect(30, 169, 5, 3, blink ? "#f1b34a" : "#75452d");
    rect(218, 163, 4, 3, blink ? "#d94c35" : "#6e3029");

    drawSoldier(72, 157, 1.15, 1);
    drawSoldier(188, 160, 0.9, -1);

    // Logo.
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 34px monospace";
    ctx.fillStyle = "#5b1715";
    ctx.fillText("CONTRA", 130, 65);
    ctx.fillStyle = "#e83a2e";
    ctx.fillText("CONTRA", 127, 62);

    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#f4d94c";
    ctx.fillText("VIETNAM", 128, 84);

    rect(72, 96, 112, 1, "#9d4930");
    ctx.font = "7px monospace";
    ctx.fillStyle = "#d7d2b5";
    ctx.fillText("THE JUNGLE WAR BEGINS", 128, 108);

    if (gameStarted) {
        rect(48, 126, 160, 22, "#101820");
        rect(48, 126, 160, 1, "#d5b94c");
        rect(48, 147, 160, 1, "#d5b94c");
        ctx.font = "bold 8px monospace";
        ctx.fillStyle = "#f5df45";
        ctx.fillText("MISSION 01", 128, 137);
        ctx.font = "6px monospace";
        ctx.fillStyle = "#eeeeee";
        ctx.fillText("COMING SOON", 128, 151);
    } else if (Math.floor(elapsed * 2) % 2 === 0) {
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#f5df45";
        ctx.fillText("PRESS ENTER", 128, 139);
    }

    ctx.font = "6px monospace";
    ctx.fillStyle = "#b5b39a";
    ctx.fillText("1 PLAYER     HIGH SCORE  000000", 128, 225);
}

function updateStatus(message) {
    if (statusMessage) statusMessage.textContent = message;
}

function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        event.preventDefault();
    }
    keys.add(key);

    if (key === "enter" && !gameStarted) {
        gameStarted = true;
        updateStatus("MISJA 01 — EKRAN TYTUŁOWY / DEMO");
    }
}

function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => keys.clear());

function gameLoop(timestamp = 0) {
    const delta = Math.min((timestamp - lastFrame) / 1000 || 0, 0.05);
    lastFrame = timestamp;
    elapsed += delta;
    drawTitle();
    requestAnimationFrame(gameLoop);
}

drawTitle();
updateStatus("EKRAN TYTUŁOWY GOTOWY — WCIŚNIJ ENTER");
requestAnimationFrame(gameLoop);

export { canvas, ctx, WIDTH, HEIGHT, keys };
