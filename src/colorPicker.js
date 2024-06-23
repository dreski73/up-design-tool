import { currentPalette, updatePaletteDisplay, lockedColors } from './paletteManager';

let selectedColorIndex = null;
let tempColorPicker = null;

export function initializeColorPicker() {
  console.log('Native color picker initialized');
  tempColorPicker = document.createElement('input');
  tempColorPicker.type = 'color';
  tempColorPicker.style.position = 'absolute';
  tempColorPicker.style.opacity = 0;
  document.body.appendChild(tempColorPicker);
}

export function setSelectedColorIndex(index) {
  selectedColorIndex = index;
}

export function attachColorPickerListeners() {
  document.querySelectorAll('.color-box').forEach((box, index) => {
    // Remove existing event listeners before adding new ones
    box.removeEventListener('click', onColorBoxClick);
    box.addEventListener('click', onColorBoxClick);
  });
}

function onColorBoxClick(e) {
  e.stopPropagation();
  const index = [...document.querySelectorAll('.color-box')].indexOf(e.currentTarget);
  if (!lockedColors[index]) {
    selectedColorIndex = index;
    tempColorPicker.value = currentPalette[index];
    tempColorPicker.click();
    tempColorPicker.addEventListener('input', onColorChange);
    tempColorPicker.addEventListener('change', onColorPickerChange);
  }
}

function onColorChange() {
  const color = tempColorPicker.value;
  currentPalette[selectedColorIndex] = color;
  updatePaletteDisplay();
}

function onColorPickerChange() {
  document.body.removeChild(tempColorPicker);
  tempColorPicker = null;
}