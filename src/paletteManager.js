import { attachColorPickerListeners } from './colorPicker';

export let currentPalette = [
  '#FF0000', // Red
  '#0000FF', // Blue
  '#008000', // Green
  '#FFFF00', // Yellow
  '#FFA500'  // Orange
];

export let lockedColors = [false, false, false, false, false];

export function addColor() {
  const newColor = getRandomColor();
  currentPalette.push(newColor);
  lockedColors.push(false);
  updatePaletteDisplay();
}

export function lockColor(index) {
  lockedColors[index] = !lockedColors[index];
  updatePaletteDisplay();
}

export function deleteColor(index) {
  if (!lockedColors[index]) {
    currentPalette.splice(index, 1);
    lockedColors.splice(index, 1);
    updatePaletteDisplay();
  }
}

export function randomizeColors() {
  currentPalette = currentPalette.map((color, index) => {
    return lockedColors[index] ? color : getRandomColor();
  });
  updatePaletteDisplay();
}

export function savePalette() {
  const paletteName = document.getElementById('paletteName').value || 'Untitled';
  const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];

  savedPalettes.push({ name: paletteName, colors: currentPalette.slice() });
  localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
  updateSavedPalettes();
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function updatePaletteDisplay() {
  const paletteContainer = document.getElementById('colors');
  paletteContainer.innerHTML = '';

  currentPalette.forEach((color, index) => {
    const colorBox = document.createElement('div');
    colorBox.style.backgroundColor = color;
    colorBox.classList.add('color-box');
    if (lockedColors[index]) {
      colorBox.classList.add('locked');
      colorBox.setAttribute('draggable', 'false');
    } else {
      colorBox.removeAttribute('draggable');
    }

    const lockSymbol = document.createElement('div');
    lockSymbol.classList.add('lock-symbol');
    lockSymbol.innerHTML = lockedColors[index] ? '🔒' : '🔓';
    lockSymbol.addEventListener('click', (e) => {
      e.stopPropagation();
      lockColor(index);
    });

    const deleteSymbol = document.createElement('div');
    deleteSymbol.classList.add('delete-symbol');
    deleteSymbol.innerHTML = '✖';
    deleteSymbol.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteColor(index);
    });

    colorBox.appendChild(lockSymbol);
    colorBox.appendChild(deleteSymbol);

    paletteContainer.appendChild(colorBox);
  });

  attachColorPickerListeners();
}

export function updateSavedPalettes() {
  const savedPalettesContainer = document.getElementById('savedPalettes');
  savedPalettesContainer.innerHTML = '';

  const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];

  savedPalettes.forEach((palette, index) => {
    const paletteElement = document.createElement('div');
    paletteElement.classList.add('saved-palette');

    const paletteName = document.createElement('span');
    paletteName.textContent = palette.name;
    paletteElement.appendChild(paletteName);

    palette.colors.forEach(color => {
      const colorBox = document.createElement('div');
      colorBox.style.backgroundColor = color;
      colorBox.style.width = '20px';
      colorBox.style.height = '20px';
      colorBox.style.display = 'inline-block';
      colorBox.style.margin = '0 2px';
      paletteElement.appendChild(colorBox);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePalette(index);
    });
    paletteElement.appendChild(deleteButton);

    paletteElement.addEventListener('click', () => loadPalette(palette));

    savedPalettesContainer.appendChild(paletteElement);
  });
}

function deletePalette(index) {
  const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];
  savedPalettes.splice(index, 1);
  localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
  updateSavedPalettes();
}

function loadPalette(palette) {
  currentPalette = palette.colors.slice();
  updatePaletteDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
  updatePaletteDisplay();
  updateSavedPalettes();
});