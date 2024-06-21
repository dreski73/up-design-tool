import { currentPalette, updatePaletteDisplay, lockedColors } from './paletteManager';

let selectedColorIndex = null;

export function initializeColorPicker() {
  // No need to initialize anything specific for the native color picker
  console.log('Native color picker initialized');
}

export function setSelectedColorIndex(index) {
  selectedColorIndex = index;
}

export function attachColorPickerListeners() {
  document.querySelectorAll('.color-box').forEach((box, index) => {
    console.log(`Attaching event listener to color box ${index}`);
    box.addEventListener('click', () => {
      if (!lockedColors[index]) {
        console.log(`Color box ${index} clicked`);
        selectedColorIndex = index;

        // Create a temporary color input element to use the native color picker
        const tempColorPicker = document.createElement('input');
        tempColorPicker.type = 'color';
        tempColorPicker.value = currentPalette[index]; // Set the picker to the current color
        tempColorPicker.style.position = 'absolute';
        tempColorPicker.style.opacity = 0; // Hide the element but keep it clickable
        document.body.appendChild(tempColorPicker);

        tempColorPicker.click(); // Programmatically trigger the color picker

        tempColorPicker.addEventListener('input', () => {
          const color = tempColorPicker.value;
          console.log(`Color changed to: ${color}`);
          currentPalette[selectedColorIndex] = color;
          updatePaletteDisplay();
        });

        // Remove the temporary element once the color picker closes
        tempColorPicker.addEventListener('change', () => {
          document.body.removeChild(tempColorPicker);
        });
      }
    });
  });
}