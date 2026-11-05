"use strict";

const scenes = Array.from(document.querySelectorAll(".tour-scene"));
const sceneButtons = Array.from(document.querySelectorAll("[data-scene]"));
const playButton = document.getElementById("tour-play");
const description = document.getElementById("tour-description");
const counter = document.querySelector(".tour-counter");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const captions = [
    "Arrange the controls and define their labels, values, and layout.",
    "Use JavaScript actions to translate a selection into a command.",
    "Test the dialog and inspect the generated R command."
];
let currentScene = 0;
let playing = false;
let timer;

function showScene(index) {
    currentScene = index;

    scenes.forEach((scene, sceneIndex) => {
        scene.hidden = sceneIndex !== index;
        scene.classList.toggle("entering", sceneIndex === index);
        sceneButtons[sceneIndex].setAttribute("aria-pressed", String(sceneIndex === index));
    });

    description.textContent = captions[index];
    counter.textContent = `0${index + 1} / 03`;
}

function setPlaying(value) {
    playing = value;
    window.clearInterval(timer);
    playButton.textContent = playing ? "Pause tour Ⅱ" : "Play tour ▷";
    playButton.setAttribute("aria-label", playing ? "Pause screenshot tour" : "Play screenshot tour");

    if (playing) {
        timer = window.setInterval(() => {
            showScene((currentScene + 1) % scenes.length);
        }, 6500);
    }
}

playButton.hidden = false;
document.querySelector(".tour-steps").hidden = false;

playButton.addEventListener("click", () => {
    setPlaying(!playing);
});

sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setPlaying(false);
        showScene(Number(button.dataset.scene));
    });
});

reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
        setPlaying(false);
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        setPlaying(false);
    }
});

setPlaying(!reducedMotion.matches);
