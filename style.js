// All vowels and traditional Filipino Abakada consonants
const vowels = ["A", "E", "I", "O", "U"];

const consonants = [
  "B", "K", "D", "G", "H",
  "L", "M", "N", "NG", "P",
  "R", "S", "T", "W", "Y"
];

// Generate all 75 consonant-vowel combinations
const syllables = consonants.flatMap(consonant =>
  vowels.map(vowel => consonant + vowel)
);

// Alphabet mode includes vowels and consonants
const alphabet = [...vowels, ...consonants];

// Current learning mode
let mode = "alphabet";

// Randomized card deck and navigation history
let deck = [];
let currentIndex = 0;
let history = [];

// Quiz state
let quizAnswer = "";
let quizLocked = false;

// HTML elements
const cardContent = document.getElementById("card-content");
const cardLabel = document.getElementById("card-label");
const cardMessage = document.getElementById("card-message");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");

const flashcard = document.getElementById("flashcard");
const flashcardControls = document.getElementById("flashcard-controls");
const quizArea = document.getElementById("quiz-area");
const quizChoices = document.getElementById("quiz-choices");
const quizFeedback = document.getElementById("quiz-feedback");

const previousBtn = document.getElementById("previous-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const soundBtn = document.getElementById("sound-btn");
const nextQuestionBtn = document.getElementById("next-question");

const mascotMessage = document.querySelector("#mascot-message p");

// Randomly shuffle an array using Fisher-Yates
function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Create a new randomized deck
function createDeck(cards) {
  deck = shuffleArray(cards);

  // Prevent repeating the last card from the previous round
  if (
    history.length > 0 &&
    deck.length > 1 &&
    deck[0] === history[history.length - 1]
  ) {
    [deck[0], deck[1]] = [deck[1], deck[0]];
  }

  currentIndex = 0;
  history = [];

  updateCard();
}

// Get the collection for the selected mode
function getCards() {
  if (mode === "alphabet") return alphabet;
  return syllables;
}

// Display the current card
function updateCard() {
  if (mode === "quiz") {
    showQuiz();
    return;
  }

  const card = deck[currentIndex];

  cardContent.textContent = card;

  cardLabel.textContent =
    mode === "alphabet" ? "LETTER" : "SYLLABLE";

  cardMessage.textContent =
    mode === "alphabet"
      ? `${card} is part of the Abakada!`
      : `Let's learn ${card}!`;

  progressText.textContent =
    `Card ${currentIndex + 1} of ${deck.length}`;

  progressBar.style.width =
    `${((currentIndex + 1) / deck.length) * 100}%`;

  previousBtn.disabled = currentIndex === 0;

  previousBtn.style.opacity =
    currentIndex === 0 ? "0.5" : "1";

  flashcard.style.animation = "none";
  void flashcard.offsetWidth;
  flashcard.style.animation = "cardEnter 0.35s ease";
}

// Move to the next card
function nextCard() {
  if (currentIndex < deck.length - 1) {
    history.push(deck[currentIndex]);
    currentIndex++;
  } else {
    // Start a new randomized round
    createDeck(getCards());
    mascotMessage.textContent =
      "Amazing! A new round is ready! 🌈";
    return;
  }

  updateCard();
}

// Return to the previous card
function previousCard() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCard();
  }
}

// Shuffle the current collection immediately
function shuffleCards() {
  createDeck(getCards());

  mascotMessage.textContent =
    "Shuffled! Let's learn something new! 🎲";
}

// Switch learning mode
function changeMode(newMode) {
  mode = newMode;

  document.querySelectorAll(".mode-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === newMode
    );
  });

  const isQuiz = mode === "quiz";

  flashcard.classList.toggle("hidden", isQuiz);
  flashcardControls.classList.toggle("hidden", isQuiz);
  shuffleBtn.classList.toggle("hidden", isQuiz);
  quizArea.classList.toggle("hidden", !isQuiz);

  if (isQuiz) {
    createDeck(syllables);
    showQuiz();
  } else {
    createDeck(getCards());
  }
}

// Filipino text-to-speech pronunciation
function speak(text) {
  if (!("speechSynthesis" in window)) {
    mascotMessage.textContent =
      "Sorry! Your browser does not support pronunciation.";
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "fil-PH";
  utterance.rate = 0.75;
  utterance.pitch = 1.2;

  window.speechSynthesis.speak(utterance);
}

// Generate a randomized quiz question
function showQuiz() {
  quizLocked = false;

  quizFeedback.textContent = "";
  nextQuestionBtn.classList.add("hidden");

  const cards = syllables;

  quizAnswer = cards[Math.floor(Math.random() * cards.length)];

  cardContent.textContent = "?";
  cardLabel.textContent = "QUIZ TIME";
  cardMessage.textContent = "Listen carefully!";

  progressText.textContent = "Quiz Time!";
  progressBar.style.width = "100%";

  // Randomize the answer choices
  const wrongAnswers = shuffleArray(
    cards.filter(card => card !== quizAnswer)
  ).slice(0, 3);

  const choices = shuffleArray([
    quizAnswer,
    ...wrongAnswers
  ]);

  quizChoices.innerHTML = "";

  choices.forEach(choice => {
    const button = document.createElement("button");

    button.className = "quiz-choice";
    button.textContent = choice;

    button.addEventListener("click", () => {
      checkAnswer(button, choice);
    });

    quizChoices.appendChild(button);
  });

  speak(quizAnswer);
}

// Check the selected answer
function checkAnswer(button, choice) {
  if (quizLocked) return;

  quizLocked = true;

  const buttons = document.querySelectorAll(".quiz-choice");

  buttons.forEach(answerButton => {
    answerButton.disabled = true;

    if (answerButton.textContent === quizAnswer) {
      answerButton.classList.add("correct");
    }
  });

  if (choice === quizAnswer) {
    quizFeedback.textContent = "🎉 Correct! You're amazing!";
    mascotMessage.textContent = "You got it! Great job! ⭐";
  } else {
    button.classList.add("wrong");

    quizFeedback.textContent =
      `Not quite! The answer is ${quizAnswer}.`;

    mascotMessage.textContent =
      "Keep trying! You're learning! 💖";
  }

  cardContent.textContent = quizAnswer;

  nextQuestionBtn.classList.remove("hidden");
}

// Event listeners
nextBtn.addEventListener("click", nextCard);
previousBtn.addEventListener("click", previousCard);
shuffleBtn.addEventListener("click", shuffleCards);

soundBtn.addEventListener("click", () => {
  speak(deck[currentIndex]);
});

nextQuestionBtn.addEventListener("click", showQuiz);

document.querySelectorAll(".mode-btn").forEach(button => {
  button.addEventListener("click", () => {
    changeMode(button.dataset.mode);
  });
});

// Start the website
createDeck(alphabet);
