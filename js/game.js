const choices = [...document.querySelectorAll(".choice")];
let selected = 0;

function select(index) {
  selected = Math.max(0, Math.min(choices.length - 1, index));
  choices.forEach((button, i) => {
    const active = i === selected;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function startGame(playerCount) {
  // Ekran tytułowy jest pierwszym etapem. Właściwe sceny gry dołączymy,
  // gdy zaczniemy budować plansze i silnik rozgrywki.
  window.dispatchEvent(new CustomEvent("contra:start", { detail: { playerCount } }));
  console.info(`CONTRA VIETNAM — wybrano ${playerCount} gracza/graczy`);
}

choices.forEach((button, index) => {
  button.addEventListener("click", () => {
    select(index);
    startGame(index + 1);
  });
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") {
    event.preventDefault();
    select(0);
  } else if (key === "arrowdown" || key === "s") {
    event.preventDefault();
    select(1);
  } else if (key === "enter" || key === "z" || key === " ") {
    event.preventDefault();
    startGame(selected + 1);
  }
});

select(0);
