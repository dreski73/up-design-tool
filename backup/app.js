import Sortable from 'sortablejs';
import './styles.css';
import './colorPicker';
import { createPattern } from './patternMaker';
import { initializeDesignTool } from './designTool';
import { addColor, savePalette, loadPalette, exportPaletteAsPDF } from './paletteManager';

function run() {
  const app = document.getElementById('container');
  app.innerHTML = `
    <h1>Welcome to UP Design Tool</h1>
    <div class="controls">
      <input type="color" class="color-picker" title="Select Color">
      <input type="text" id="paletteName" placeholder="Palette Name">
      <button id="addColor" title="Add selected color to palette">Add Color</button>
      <button id="savePalette" title="Save current color palette">Save Palette</button>
      <button id="selectRectangle" title="Draw rectangles">Rectangle</button>
      <button id="selectCircle" title="Draw circles">Circle</button>
      <button id="addRadialLine" title="Add radial lines">Radial Line</button>
      <button id="bringToFront" title="Bring selected shape to front">Bring to Front</button>
      <button id="sendToBack" title="Send selected shape to back">Send to Back</button>
      <button id="undo" title="Undo last action">Undo</button>
      <button id="saveDesign" title="Save current design">Save Design</button>
      <button id="loadDesign" title="Load a saved design">Load Design</button>
      <button id="exportPNG" title="Export design as PNG">Export as PNG</button>
      <button id="exportJPEG" title="Export design as JPEG">Export as JPEG</button>
      <button id="exportPalettePDF" title="Export Palette as PDF">Export Palette as PDF</button>
    </div>
    <p>Selected Color: <span id="colorValue">#ff0000</span></p>
    <div id="palette">
      <h2>Color Palette</h2>
      <div id="colors" class="sortable"></div>
    </div>
    <div id="savedPalettesContainer">
      <h2>Saved Palettes</h2>
      <div id="savedPalettes"></div>
    </div>
    <div id="savedDesignsContainer">
      <h2>Saved Designs</h2>
      <div id="savedDesigns"></div>
    </div>
    <canvas id="designCanvas" width="800" height="600" style="border: 1px solid black;"></canvas>
    <div id="patternFrame">
      <h2>Pattern Tool</h2>
      <button id="createPattern" title="Create a pattern with selected colors">Create Pattern</button>
      <canvas id="patternCanvas" width="200" height="200"></canvas>
    </div>
  `;

  const colorValue = document.getElementById('colorValue');
  const colorsDiv = document.getElementById('colors');
  const paletteNameInput = document.getElementById('paletteName');
  const patternCanvas = document.getElementById('patternCanvas');
  const savedPalettesContainer = document.getElementById('savedPalettes');
  const savedDesignsContainer = document.getElementById('savedDesigns');

  let designTool = initializeDesignTool(); // Initialize the design tool by default

  // Function to add event listeners to buttons
  function addButtonEventListener(buttonId, handler) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', handler);
    }
  }

  // Event handlers
  function handleAddColor() {
    addColor();
  }

  function handleSavePalette() {
    savePalette();
    updateSavedPalettes();
  }

  function handleCreatePattern() {
    const colors = Array.from(colorsDiv.children).map(div => div.style.backgroundColor);
    if (colors.length >= 2) {
      createPattern(patternCanvas, colors[0], colors[1]);
      if (designTool) {
        designTool.setPattern(patternCanvas);
      }
    } else {
      alert('Please add at least two colors to the palette to create a pattern.');
    }
  }

  function handleShapeSelection(shape) {
    if (designTool) {
      designTool.setShape(shape);
    }
  }

  function handleBringToFront() {
    if (designTool && designTool.selectedShapeIndex !== null) {
      designTool.bringToFront(designTool.selectedShapeIndex);
    }
  }

  function handleSendToBack() {
    if (designTool && designTool.selectedShapeIndex !== null) {
      designTool.sendToBack(designTool.selectedShapeIndex);
    }
  }

  function handleUndo() {
    if (designTool) {
      designTool.undo();
    }
  }

  function handleSaveDesign() {
    const designName = prompt('Enter a name for the design:');
    if (designTool && designName) {
      designTool.saveDesign(designName);
      updateSavedDesigns();
    }
  }

  function handleLoadDesign() {
    const designName = prompt('Enter the name of the design to load:');
    if (designTool && designName) {
      designTool.loadDesign(designName);
    }
  }

  function handleExportDesign(format) {
    if (designTool) {
      designTool.exportDesign(format);
    }
  }

  function handleExportPalettePDF() {
    exportPaletteAsPDF();
  }

  // Add event listeners to buttons
  addButtonEventListener('addColor', handleAddColor);
  addButtonEventListener('savePalette', handleSavePalette);
  addButtonEventListener('createPattern', handleCreatePattern);
  addButtonEventListener('selectRectangle', () => handleShapeSelection('rectangle'));
  addButtonEventListener('selectCircle', () => handleShapeSelection('circle'));
  addButtonEventListener('addRadialLine', () => handleShapeSelection('radialLine'));
  addButtonEventListener('bringToFront', handleBringToFront);
  addButtonEventListener('sendToBack', handleSendToBack);
  addButtonEventListener('undo', handleUndo);
  addButtonEventListener('saveDesign', handleSaveDesign);
  addButtonEventListener('loadDesign', handleLoadDesign);
  addButtonEventListener('exportPNG', () => handleExportDesign('png'));
  addButtonEventListener('exportJPEG', () => handleExportDesign('jpeg'));
  addButtonEventListener('exportPalettePDF', handleExportPalettePDF);

  // Optimize color picker event listener
  document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = document.querySelector('.color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', (event) => {
        const color = event.target.value;
        colorValue.textContent = color;
        if (designTool) {
          designTool.setColor(color);
        }
      });
    } else {
      console.error('Color picker element not found');
    }

    // Enable drag and drop for color boxes
    if (colorsDiv) {
      new Sortable(colorsDiv, {
        animation: 150,
        ghostClass: 'sortable-ghost'
      });
    } else {
      console.error('Colors div element not found');
    }

    // Update saved palettes display
    updateSavedPalettes();
    // Update saved designs display
    updateSavedDesigns();
  });

  // Function to update the saved palettes display
  function updateSavedPalettes() {
    const palettes = JSON.parse(localStorage.getItem('colorPalettes') || '[]');
    savedPalettesContainer.innerHTML = '';
    palettes.forEach((palette, index) => {
      const paletteDiv = document.createElement('div');
      paletteDiv.className = 'palette-item';
      paletteDiv.dataset.index = index;

      const paletteName = document.createElement('span');
      paletteName.textContent = palette.name;
      paletteDiv.appendChild(paletteName);

      const colorsContainer = document.createElement('div');
      colorsContainer.className = 'colors-container';
      palette.colors.forEach(({ color }) => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color;
        colorsContainer.appendChild(colorBox);
      });
      paletteDiv.appendChild(colorsContainer);

      const loadButton = document.createElement('button');
      loadButton.textContent = 'Load';
      loadButton.className = 'load-button';
      loadButton.addEventListener('click', () => loadPaletteByName(palette.name));
      paletteDiv.appendChild(loadButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        deletePalette(index);
      });
      paletteDiv.appendChild(deleteButton);

      savedPalettesContainer.appendChild(paletteDiv);
    });
  }

  // Function to load a palette by name
  function loadPaletteByName(paletteName) {
    const palettes = JSON.parse(localStorage.getItem('colorPalettes') || '[]');
    const palette = palettes.find(p => p.name === paletteName);
    if (palette) {
      colorsDiv.innerHTML = '';
      palette.colors.forEach(({ color, locked }) => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = color;
        colorDiv.className = 'color-box';
        colorDiv.textContent = color;
        if (locked) {
          colorDiv.classList.add('locked');
        }
        colorDiv.addEventListener('click', () => toggleLockColor(colorDiv));
        colorsDiv.appendChild(colorDiv);
      });
    } else {
      alert('Palette not found!');
    }
  }

  // Function to update the saved designs display
  function updateSavedDesigns() {
    const designs = JSON.parse(localStorage.getItem('designs') || '[]');
    savedDesignsContainer.innerHTML = '';
    designs.forEach((design, index) => {
      const designDiv = document.createElement('div');
      designDiv.className = 'design-item';
      designDiv.dataset.index = index;

      const designName = document.createElement('span');
      designName.textContent = design.name;
      designDiv.appendChild(designName);

      const loadButton = document.createElement('button');
      loadButton.textContent = 'Load';
      loadButton.className = 'load-button';
      loadButton.addEventListener('click', () => loadDesignByName(design.name));
      designDiv.appendChild(loadButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        deleteDesign(index);
      });
      designDiv.appendChild(deleteButton);

      savedDesignsContainer.appendChild(designDiv);
    });
  }

  // Function to load a design by name
  function loadDesignByName(designName) {
    const designs = JSON.parse(localStorage.getItem('designs') || '[]');
    const design = designs.find(d => d.name === designName);
    if (design) {
      // Clear existing shapes
      designTool.clearShapes();
      // Load shapes from the design
      design.shapes.forEach(shape => {
        designTool.addShape(shape);
      });
    } else {
      alert('Design not found!');
    }
  }

  // Function to delete a design by index
  function deleteDesign(index) {
    let designs = JSON.parse(localStorage.getItem('designs') || '[]');
    designs.splice(index, 1);
    localStorage.setItem('designs', JSON.stringify(designs));
    updateSavedDesigns();
  }

  // Function to delete a palette by index
  function deletePalette(index) {
    let palettes = JSON.parse(localStorage.getItem('colorPalettes') || '[]');
    palettes.splice(index, 1);
    localStorage.setItem('colorPalettes', JSON.stringify(palettes));
    updateSavedPalettes();
  }

  // Function to toggle lock color
  function toggleLockColor(colorDiv) {
    if (colorDiv.classList.contains('locked')) {
      colorDiv.classList.remove('locked');
    } else {
      colorDiv.classList.add('locked');
    }
  }

  // Ensure the palette list and design list are visible on launch
  updateSavedPalettes();
  updateSavedDesigns();
}

document.addEventListener('DOMContentLoaded', run);

export { run };
