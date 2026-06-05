const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

sections.forEach((section) => observer.observe(section));

const flappyCanvas = document.querySelector("#flappy-game");
const flappyScore = document.querySelector("#flappy-score");
const flappyMessage = document.querySelector("#flappy-message");
const flappyRestart = document.querySelector("#flappy-restart");
const ctx = flappyCanvas.getContext("2d");

const flappy = {
  player: { x: 70, y: 120, size: 24, velocity: 0 },
  gravity: 0.42,
  jump: -7.5,
  pipes: [],
  score: 0,
  frame: 0,
  running: true,
};

function resetFlappy() {
  flappy.player.y = 120;
  flappy.player.velocity = 0;
  flappy.pipes = [];
  flappy.score = 0;
  flappy.frame = 0;
  flappy.running = true;
  flappyScore.textContent = "0";
  flappyMessage.textContent = "Clique ou appuie sur espace pour sauter";
}

function jumpFlappy() {
  if (!flappy.running) {
    resetFlappy();
    return;
  }

  flappy.player.velocity = flappy.jump;
}

function addPipe() {
  const gap = 86;
  const topHeight = 35 + Math.random() * 105;
  flappy.pipes.push({
    x: flappyCanvas.width,
    width: 48,
    top: topHeight,
    bottom: topHeight + gap,
    passed: false,
  });
}

function drawFlappyBackground() {
  ctx.fillStyle = "#082f49";
  ctx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  ctx.fillStyle = "rgba(34, 211, 238, 0.22)";
  ctx.beginPath();
  ctx.arc(70, 55, 17, 0, Math.PI * 2);
  ctx.arc(90, 55, 23, 0, Math.PI * 2);
  ctx.arc(115, 58, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#064e3b";
  ctx.fillRect(0, flappyCanvas.height - 28, flappyCanvas.width, 28);
}

function drawFlappyPlayer() {
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(flappy.player.x, flappy.player.y, flappy.player.size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(flappy.player.x + 7, flappy.player.y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlappyPipes() {
  ctx.fillStyle = "#34d399";
  flappy.pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, flappyCanvas.height - pipe.bottom - 28);
  });
}

function hasCollision(pipe) {
  const radius = flappy.player.size / 2;
  const playerLeft = flappy.player.x - radius;
  const playerRight = flappy.player.x + radius;
  const playerTop = flappy.player.y - radius;
  const playerBottom = flappy.player.y + radius;
  const insidePipeX = playerRight > pipe.x && playerLeft < pipe.x + pipe.width;
  const hitsPipe = playerTop < pipe.top || playerBottom > pipe.bottom;

  return insidePipeX && hitsPipe;
}

function endFlappyGame() {
  flappy.running = false;
  flappyMessage.textContent = "Perdu ! Clique sur Relancer ou sur le jeu";
}

function updateFlappy() {
  drawFlappyBackground();

  if (flappy.running) {
    flappy.frame += 1;
    flappy.player.velocity += flappy.gravity;
    flappy.player.y += flappy.player.velocity;

    if (flappy.frame % 95 === 0) {
      addPipe();
    }

    flappy.pipes.forEach((pipe) => {
      pipe.x -= 2.2;

      if (!pipe.passed && pipe.x + pipe.width < flappy.player.x) {
        pipe.passed = true;
        flappy.score += 1;
        flappyScore.textContent = flappy.score;
      }

      if (hasCollision(pipe)) {
        endFlappyGame();
      }
    });

    flappy.pipes = flappy.pipes.filter((pipe) => pipe.x + pipe.width > 0);

    if (flappy.player.y < 0 || flappy.player.y + flappy.player.size / 2 > flappyCanvas.height - 28) {
      endFlappyGame();
    }
  }

  drawFlappyPipes();
  drawFlappyPlayer();
  requestAnimationFrame(updateFlappy);
}

flappyCanvas.addEventListener("click", jumpFlappy);
flappyRestart.addEventListener("click", resetFlappy);
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    jumpFlappy();
  }
});

resetFlappy();
updateFlappy();

const calculatorDisplay = document.querySelector("#calculator-display");
const calculatorButtons = document.querySelectorAll(".calculator-buttons button");
let calculatorValue = "0";
let storedValue = null;
let selectedOperator = null;
let shouldResetDisplay = false;

function updateCalculatorDisplay() {
  calculatorDisplay.textContent = calculatorValue;
}

function calculate(firstValue, secondValue, operator) {
  const first = Number(firstValue);
  const second = Number(secondValue);

  if (operator === "+") return first + second;
  if (operator === "-") return first - second;
  if (operator === "*") return first * second;
  if (operator === "/") return second === 0 ? "Erreur" : first / second;
  return second;
}

function addCalculatorNumber(number) {
  if (calculatorValue === "Erreur" || shouldResetDisplay) {
    calculatorValue = number === "." ? "0." : number;
    shouldResetDisplay = false;
    updateCalculatorDisplay();
    return;
  }

  if (number === "." && calculatorValue.includes(".")) return;
  calculatorValue = calculatorValue === "0" && number !== "." ? number : calculatorValue + number;
  updateCalculatorDisplay();
}

function chooseCalculatorOperator(operator) {
  if (selectedOperator && !shouldResetDisplay) {
    calculatorValue = String(calculate(storedValue, calculatorValue, selectedOperator));
    updateCalculatorDisplay();
  }

  storedValue = calculatorValue;
  selectedOperator = operator;
  shouldResetDisplay = true;
}

function resetCalculator() {
  calculatorValue = "0";
  storedValue = null;
  selectedOperator = null;
  shouldResetDisplay = false;
  updateCalculatorDisplay();
}

function deleteCalculatorNumber() {
  if (calculatorValue === "Erreur" || shouldResetDisplay) {
    calculatorValue = "0";
    shouldResetDisplay = false;
  } else {
    calculatorValue = calculatorValue.length > 1 ? calculatorValue.slice(0, -1) : "0";
  }

  updateCalculatorDisplay();
}

function showCalculatorResult() {
  if (!selectedOperator || storedValue === null) return;
  calculatorValue = String(calculate(storedValue, calculatorValue, selectedOperator));
  storedValue = null;
  selectedOperator = null;
  shouldResetDisplay = true;
  updateCalculatorDisplay();
}

calculatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.number) {
      addCalculatorNumber(button.dataset.number);
    } else if (button.dataset.operator) {
      chooseCalculatorOperator(button.dataset.operator);
    } else if (button.dataset.action === "clear") {
      resetCalculator();
    } else if (button.dataset.action === "delete") {
      deleteCalculatorNumber();
    } else if (button.dataset.action === "equals") {
      showCalculatorResult();
    }
  });
});
