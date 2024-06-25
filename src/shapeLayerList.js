export default class ShapeLayerList {
  constructor(designTool, paletteManager, patternMaker) {
      this.designTool = designTool;
      this.paletteManager = paletteManager;
      this.patternMaker = patternMaker;
      this.layerListElement = document.getElementById('shapeLayers');
  }

  initializeList() {
      this.updateLayers();
  }

  addLayer(shape) {
      const layerElement = document.createElement('li');
      layerElement.className = 'shape-layer';
      layerElement.innerHTML = this.createLayerHTML(shape);
      this.layerListElement.appendChild(layerElement);
      this.addEventListeners(layerElement, this.designTool.shapes.length - 1);
  }

  updateLayers() {
      this.layerListElement.innerHTML = '';
      this.designTool.shapes.forEach((shape, index) => {
          const layerElement = document.createElement('li');
          layerElement.className = 'shape-layer';
          layerElement.innerHTML = this.createLayerHTML(shape);
          this.layerListElement.appendChild(layerElement);
          this.addEventListeners(layerElement, index);
      });
  }

  removeLayer(index) {
      const layerElements = this.layerListElement.getElementsByClassName('shape-layer');
      if (index >= 0 && index < layerElements.length) {
          this.layerListElement.removeChild(layerElements[index]);
      }
  }

  createLayerHTML(shape) {
    const maxRadius = Math.min(this.designTool.canvas.width, this.designTool.canvas.height) / 2;
    const innerRadiusPercent = (shape.innerRadius / maxRadius) * 100;
    const outerRadiusPercent = (shape.outerRadius / maxRadius) * 100;

    return `
        <select class="shape-color">
            ${this.createColorOptions(shape.colorId)}
        </select>
        <input type="range" class="inner-radius" min="0" max="100" value="${innerRadiusPercent}">
        <input type="range" class="outer-radius" min="0" max="100" value="${outerRadiusPercent}">
        ${shape.type === 'square' ? '<button class="rotate">45°</button>' : ''}
        ${shape.type === 'circle' ? `
            <select class="second-color">
                ${this.createColorOptions(shape.secondColorId)}
            </select>
            <input type="range" class="radial-lines" min="0" max="32" step="8" value="${shape.radialLines || 0}">
        ` : ''}
        <button class="move-up">↑</button>
        <button class="move-down">↓</button>
        <button class="delete">×</button>
    `;
}


  createColorOptions(selectedColorId) {
      return this.paletteManager.getCurrentPalette().map((color, index) =>
          `<option value="${index}" ${index === selectedColorId ? 'selected' : ''}>${color}</option>`
      ).join('');
  }

  addEventListener(event, callback) {
    if (!this.eventListeners) {
        this.eventListeners = {};
    }
    if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
}

  dispatchEvent(event) {
    if (this.eventListeners && this.eventListeners[event.type]) {
        this.eventListeners[event.type].forEach(callback => callback(event));
    }
}

addEventListeners(layerElement, index) {
  if (!layerElement) return;

  const shape = this.designTool.shapes[index];

  const colorSelect = layerElement.querySelector('.shape-color');
  if (colorSelect) {
      colorSelect.addEventListener('change', (e) => {
          this.designTool.updateShapeColor(index, parseInt(e.target.value));
      });
  }

  const innerRadiusInput = layerElement.querySelector('.inner-radius');
  if (innerRadiusInput) {
      innerRadiusInput.addEventListener('input', (e) => {
          const innerRadiusPercent = parseInt(e.target.value);
          const outerRadiusInput = layerElement.querySelector('.outer-radius');
          const outerRadiusPercent = outerRadiusInput ? parseInt(outerRadiusInput.value) : 100;
          this.designTool.updateShapeSize(index, innerRadiusPercent, outerRadiusPercent);
      });
  }

  const outerRadiusInput = layerElement.querySelector('.outer-radius');
  if (outerRadiusInput) {
      outerRadiusInput.addEventListener('input', (e) => {
          const innerRadiusInput = layerElement.querySelector('.inner-radius');
          const innerRadiusPercent = innerRadiusInput ? parseInt(innerRadiusInput.value) : 0;
          const outerRadiusPercent = parseInt(e.target.value);
          this.designTool.updateShapeSize(index, innerRadiusPercent, outerRadiusPercent);
      });
  }

  if (shape.type === 'square') {
      const rotateButton = layerElement.querySelector('.rotate');
      if (rotateButton) {
          rotateButton.addEventListener('click', () => {
              this.designTool.rotateShape(index);
          });
      }
  }

  if (shape.type === 'circle') {
      const secondColorSelect = layerElement.querySelector('.second-color');
      if (secondColorSelect) {
          secondColorSelect.addEventListener('change', (e) => {
              this.designTool.updateShapeSecondColor(index, parseInt(e.target.value));
          });
      }

      const radialLinesInput = layerElement.querySelector('.radial-lines');
      if (radialLinesInput) {
          radialLinesInput.addEventListener('input', (e) => {
              this.designTool.updateRadialLines(index, parseInt(e.target.value));
          });
      }
  }

  const moveUpButton = layerElement.querySelector('.move-up');
  if (moveUpButton) {
      moveUpButton.addEventListener('click', () => {
          this.designTool.moveShapeLayer(index, index - 1);
      });
  }

  const moveDownButton = layerElement.querySelector('.move-down');
  if (moveDownButton) {
      moveDownButton.addEventListener('click', () => {
          this.designTool.moveShapeLayer(index, index + 1);
      });
  }

  const deleteButton = layerElement.querySelector('.delete');
  if (deleteButton) {
      deleteButton.addEventListener('click', () => {
          this.designTool.deleteShape(index);
      });
  }

  const lockButton = layerElement.querySelector('.lock');
  if (lockButton) {
      lockButton.addEventListener('click', () => {
          this.designTool.toggleShapeLock(index);
      });
  }

  const applyPatternButton = layerElement.querySelector('.apply-pattern');
  if (applyPatternButton) {
      applyPatternButton.addEventListener('click', () => {
          const currentPattern = this.patternMaker.getCurrentPattern();
          this.designTool.applyPatternToShape(index, currentPattern);
          const patternScaleInput = layerElement.querySelector('.pattern-scale');
          if (patternScaleInput) {
              patternScaleInput.style.display = 'inline-block';
          }
      });
  }

  const patternScaleInput = layerElement.querySelector('.pattern-scale');
  if (patternScaleInput) {
      patternScaleInput.addEventListener('input', (e) => {
          this.designTool.updateShapePatternScale(index, parseFloat(e.target.value));
      });
  }
}
}