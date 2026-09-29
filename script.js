"use strict";

const deck = document.querySelector("#deck");
const slides = [...document.querySelectorAll(".slide")];
const currentCount = document.querySelector("#slide-count");
const progressBar = document.querySelector("#progress-bar");
const previousButton = document.querySelector("#previous-slide");
const nextButton = document.querySelector("#next-slide");
const timerDisplay = document.querySelector("#timer-display");
const timerToggleButton = document.querySelector("#timer-toggle");
const timerToggleIcon = document.querySelector("#timer-toggle-icon");
const timerResetButton = document.querySelector("#timer-reset");
const timerDuration = 7 * 60;
let activeIndex = 0;
let remainingSeconds = timerDuration;
let timerDeadline;
let timerInterval;
let isTimerPaused = false;

document.querySelector("#slide-total").textContent = String(slides.length).padStart(2, "0");

function updateNavigation(index) {
  activeIndex = index;
  currentCount.textContent = String(index + 1).padStart(2, "0");
  progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
  previousButton.disabled = index === 0;
  nextButton.disabled = index === slides.length - 1;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === index);
  });
}

function updateTimer() {
  if (!isTimerPaused) {
    remainingSeconds = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  timerToggleIcon.textContent = isTimerPaused ? "▶" : "Ⅱ";
  timerToggleButton.setAttribute("aria-label", isTimerPaused ? "Reprendre le minuteur" : "Mettre le minuteur en pause");
  timerToggleButton.title = isTimerPaused ? "Reprendre le minuteur" : "Mettre le minuteur en pause";
  timerToggleButton.disabled = isTimerPaused && remainingSeconds === 0;

  if (remainingSeconds === 0) {
    isTimerPaused = true;
    clearInterval(timerInterval);
    timerToggleIcon.textContent = "▶";
    timerToggleButton.setAttribute("aria-label", "Minuteur terminé");
    timerToggleButton.title = "Minuteur terminé";
    timerToggleButton.disabled = true;
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  remainingSeconds = timerDuration;
  isTimerPaused = false;
  timerDeadline = Date.now() + timerDuration * 1000;
  timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
}

function toggleTimer() {
  if (isTimerPaused) {
    if (remainingSeconds === 0) return;
    isTimerPaused = false;
    timerDeadline = Date.now() + remainingSeconds * 1000;
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    remainingSeconds = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    isTimerPaused = true;
    clearInterval(timerInterval);
  }

  updateTimer();
}

function goToSlide(index) {
  const boundedIndex = Math.max(0, Math.min(index, slides.length - 1));
  slides[boundedIndex].scrollIntoView({ behavior: "smooth", block: "start" });
}

const slideObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        updateNavigation(slides.indexOf(entry.target));
      }
    }
  },
  { root: deck, threshold: 0.6 },
);

slides.forEach((slide) => slideObserver.observe(slide));
previousButton.addEventListener("click", () => goToSlide(activeIndex - 1));
nextButton.addEventListener("click", () => goToSlide(activeIndex + 1));
timerToggleButton.addEventListener("click", toggleTimer);
timerResetButton.addEventListener("click", resetTimer);

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goToSlide(activeIndex + 1);
  } else if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goToSlide(activeIndex - 1);
  } else if (event.key === "Home") {
    event.preventDefault();
    goToSlide(0);
  } else if (event.key === "End") {
    event.preventDefault();
    goToSlide(slides.length - 1);
  }
});

updateNavigation(0);
resetTimer();
