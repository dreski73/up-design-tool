import './styles.css';
import Sortable from 'sortablejs';
import { initializeColorPicker, attachColorPickerListeners } from './colorPicker';
import { addColor, savePalette, randomizeColors, updatePaletteDisplay, updateSavedPalettes, currentPalette, lockedColors } from './paletteManager';
import { initializeDesignTool } from './designTool';
import { debounce } from './utils';

export function run() {
  console.log('Running the app...');

  const app = document.getElementById('container');

  if (!app) {
    console.error('App element not found');
    return;
  }

  initializeColorPicker();
  updatePaletteDisplay();
  updateSavedPalettes();
  attachColorPickerListeners();

  const saveButton = document.getElementById('savePalette');
  const addColorButton = document.getElementById('addColorButton');
  const randomizeButton = document.getElementById('randomizeButton');

  const debouncedSave = debounce(savePalette, 300);

  saveButton.addEventListener('click', debouncedSave);
  addColorButton.addEventListener('click', addColor);
  randomizeButton.addEventListener('click', randomizeColors);

  console.log('Event listeners added');

  new Sortable(document.getElementById('colors'), {
    animation: 150,
    onEnd: function(evt) {
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

  initializeDesignTool();

  console.log('Sortable initialized');
}