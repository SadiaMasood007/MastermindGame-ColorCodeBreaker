const COLORS = ["red", "green", "blue", "yellow", "white", "black"];
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 10;

let secretCode = [];
let currentGuess = [];
let currentRow = 0;
let selectedColor = null;
let allowDuplicates = false;

function openDupModal() {
  document.getElementById("dupModal").style.display = "block";
}

function startGame(duplicatesAllowed) {
  allowDuplicates = duplicatesAllowed;
  document.getElementById("dupModal").style.display = "none";

  generateCode();
  currentRow = 0;
  currentGuess = [];
  selectedColor = null;

  document.getElementById("message").textContent = "";
  document.getElementById("secret-code-row").innerHTML = "";
  createBoard();
  createColorPalette();
  renderSecretCode(true); 
}

function generateCode() {
  secretCode = [];
  while (secretCode.length < CODE_LENGTH) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (allowDuplicates || !secretCode.includes(color)) {
      secretCode.push(color);
    }
  }
  console.log("Secret Code:", secretCode);
}

function createBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    row.id = `row-${i}`;

    for (let j = 0; j < CODE_LENGTH; j++) {
      const slot = document.createElement("div");
      slot.classList.add("guess-slot");
      slot.dataset.row = i;
      slot.dataset.index = j;
      if (i === 0) {
        slot.addEventListener("click", () => selectSlot(i, j));
      }
      row.appendChild(slot);
    }

    const feedbackBox = document.createElement("div");
    feedbackBox.classList.add("feedback-box");
    feedbackBox.id = `feedback-${i}`;
    for (let f = 0; f < 4; f++) {
      const peg = document.createElement("div");
      peg.classList.add("feedback-peg");
      feedbackBox.appendChild(peg);
    }

    row.appendChild(feedbackBox);

    const checkButton = document.createElement("button");
    checkButton.textContent = "Check";
    checkButton.id = `check-btn-${i}`;
    checkButton.disabled = i !== 0;
    checkButton.onclick = () => submitGuess(i);
    row.appendChild(checkButton);

    board.appendChild(row);
  }
}

function createColorPalette() {
  const palette = document.getElementById("color-palette");
  palette.innerHTML = "";
  COLORS.forEach(color => {
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color-choice");
    colorDiv.style.backgroundColor = color;
    colorDiv.onclick = () => selectedColor = color;
    palette.appendChild(colorDiv);
  });
}

function selectSlot(row, index) {
  if (selectedColor === null || row !== currentRow) return;
  const slot = document.querySelector(`#row-${row} .guess-slot:nth-child(${index + 1})`);
  slot.style.backgroundColor = selectedColor;
  currentGuess[index] = selectedColor;
}

function submitGuess(row) {
  if (currentGuess.length !== CODE_LENGTH || currentGuess.includes(undefined)) {
    alert("Please fill all 4 colors before checking.");
    return;
  }

  const feedback = getFeedback(currentGuess, secretCode);
  const feedbackPegs = document.querySelectorAll(`#feedback-${row} .feedback-peg`);

  let pegIndex = 0;
  for (let i = 0; i < feedback.black; i++) {
    feedbackPegs[pegIndex++].style.backgroundColor = "black";
  }
  for (let i = 0; i < feedback.white; i++) {
    feedbackPegs[pegIndex++].style.backgroundColor = "white";
  }

  if (feedback.black === CODE_LENGTH) {
    document.getElementById("message").textContent = "🎉 You cracked the code!";
    disableBoard();
    renderSecretCode(false); 
    return;
  }

  if (currentRow + 1 >= MAX_ATTEMPTS) {
    document.getElementById("message").textContent = `😥 Game over. Code was: ${secretCode.join(", ")}`;
    disableBoard();
    renderSecretCode(false);
    return;
  }

  document.getElementById(`check-btn-${row}`).disabled = true;
  currentRow++;
  currentGuess = [];

  const nextSlots = document.querySelectorAll(`#row-${currentRow} .guess-slot`);
  nextSlots.forEach((slot, i) => {
    slot.addEventListener("click", () => selectSlot(currentRow, i));
  });

  document.getElementById(`check-btn-${currentRow}`).disabled = false;
}

function getFeedback(guess, code) {
  let black = 0;
  let white = 0;

  const guessCopy = [...guess];
  const codeCopy = [...code];

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === code[i]) {
      black++;
      guessCopy[i] = null;
      codeCopy[i] = null;
    }
  }

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i]) {
      const index = codeCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        white++;
        codeCopy[index] = null;
      }
    }
  }

  return { black, white };
}

function disableBoard() {
  document.querySelectorAll(".guess-slot").forEach(slot => slot.onclick = null);
  document.querySelectorAll("button[id^='check-btn']").forEach(btn => btn.disabled = true);
}

function renderSecretCode(hidden = true) {
  const row = document.getElementById("secret-code-row");
  row.innerHTML = "";
  secretCode.forEach(color => {
    const div = document.createElement("div");
    div.classList.add("secret-slot");
    div.style.backgroundColor = hidden ? "lightgray" : color;
    div.textContent = hidden ? "?" : "";
    row.appendChild(div);
  });
}

function showRules() {
  document.getElementById("rulesModal").style.display = "block";
}

function closeRules() {
  document.getElementById("rulesModal").style.display = "none";
}

window.onclick = function(event) {
  if (event.target === document.getElementById("rulesModal")) closeRules();
  if (event.target === document.getElementById("dupModal")) document.getElementById("dupModal").style.display = "none";
};
startGame();