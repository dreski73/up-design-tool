import './styles.css';
import Sortable from 'sortablejs';
import { initializeColorPicker, attachColorPickerListeners, setSelectedColorIndex } from './colorPicker';
import { addColor, savePalette, randomizeColors, updatePaletteDisplay, updateSavedPalettes, currentPalette, lockedColors } from './paletteManager';

// Debounce function to prevent multiple rapid calls
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function run() {
  console.log('Running the app...');

  const app = document.getElementById('container');

  if (!app) {
    console.error('App element not found');
    return;
  }

  // Initialize components
  initializeColorPicker();
  updatePaletteDisplay();
  updateSavedPalettes();
  attachColorPickerListeners();

  // Add event listeners for buttons
  const saveButton = document.getElementById('savePalette');
  const addColorButton = document.getElementById('addColorBox');
  const randomizeButton = document.getElementById('randomizeColorsBox');

  const debouncedSave = debounce(savePalette, 300);

  // Remove any existing event listeners to ensure single listener
  if (saveButton) {
    saveButton.replaceWith(saveButton.cloneNode(true));
    document.getElementById('savePalette').addEventListener('click', () => {
      console.log('Save button clicked');
      debouncedSave();
    });
  }

  if (addColorButton) {
    addColorButton.addEventListener('click', () => {
      addColor();
    });
  }

  if (randomizeButton) {
    randomizeButton.addEventListener('click', () => {
      randomizeColors();
    });
  }

  console.log('Event listeners added');

  // Make color palette sortable
  new Sortable(document.getElementById('colors'), {
    animation: 150,
    onEnd: function(evt) {
      console.log('Sorted color palette', evt);
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      if (!lockedColors[oldIndex]) {
        const movedItem = currentPalette.splice(oldIndex, 1)[0];
        currentPalette.splice(newIndex, 0, movedItem);
        const movedLock = lockedColors.splice(oldIndex, 1)[0];
        lockedColors.splice(newIndex, 0, movedLock);
        updatePaletteDisplay();
      }
    }
  });

  console.log('Sortable initialized');
}

document.addEventListener('DOMContentLoaded', run);
console.log('DOMContentLoaded event listener added');