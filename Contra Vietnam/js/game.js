// ============================================================
// CONTRA VIETNAM — punkt startowy silnika
// Plik ładowany przez index.html jako moduł ES.
// ============================================================

const canvas = document.getElementById("game-canvas");
const statusMessage = document.getElementById("status-message");

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Nie znaleziono elementu #game-canvas.");
}

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("Nie udało się uruchomić Canvas 2D.");
}

// Oryginalna rozdzielczość ekranu gry: 256 × 240.
const WIDTH = 256;
const HEIGHT = 240;

ctx.imageSmoothingEnabled = false;

const keys = new Set();
let gameStarted = false;

function drawStartScreen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#e52b25";
    ctx.font = "bold 28px monospace";
    ctx.fillText("CONTRA", WIDTH / 2, 82);

    ctx.fillStyle = "#f5df45";
    ctx.font = "bold 9px monospace";
    ctx.fillText("VIETNAM", WIDTH / 2, 105);

    ctx.fillStyle = "#eeeeee";
    ctx.font = "8px monospace";
    ctx.fillText(
        gameStarted ? "SILNIK URUCHOMIONY" : "PRESS ENTER",
        WIDTH / 2,
        166
    );

    ctx.fillStyle = "#777777";
    ctx.fillText("© CONTRA VIETNAM", WIDTH / 2, 220);
}

function updateStatus(message) {
    if (statusMessage) {
        statusMessage.textContent = message;
    }
}

function handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        event.preventDefault();
    }

    keys.add(key);

    if (key === "enter" && !gameStarted) {
        gameStarted = true;
        updateStatus("SILNIK GOTOWY — GRA W PRZYGOTOWANIU");
        drawStartScreen();
    }
}

function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => keys.clear());

function gameLoop() {
    // W kolejnych etapach tutaj dojdą aktualizacja świata,
    // kolizje, przeciwnicy, animacje i renderowanie poziomu.
    requestAnimationFrame(gameLoop);
}

drawStartScreen();
updateStatus("SILNIK ZAŁADOWANY — WCIŚNIJ ENTER");
gameLoop();

// Udostępniamy podstawowe elementy do dalszej rozbudowy modułów.
export { canvas, ctx, WIDTH, HEIGHT, keys };
