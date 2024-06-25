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
      let html = `
          <div class="layer-controls">
              <select class="shape-color">
                  ${this.createColorOptions(shape.colorId)}
              </select>
      `;

      if (shape.type === 'letter') {
          const sizePercent = (shape.size / (maxRadius * 2)) * 100;
          html += `
              <select class="letter-select">
                  ${this.createLetterOptions(shape.letter)}
              </select>
              <input type="range" class="letter-size" min="10" max="100" value="${sizePercent}">
          `;
      } else {
          const innerRadiusPercent = (shape.innerRadius / maxRadius) * 100;
          const outerRadiusPercent = (shape.outerRadius / maxRadius) * 100;
          html += `
              <input type="range" class="inner-radius" min="0" max="100" value="${innerRadiusPercent}">
              <input type="range" class="outer-radius" min="0" max="100" value="${outerRadiusPercent}">
          `;

          if (shape.type === 'square') {
              html += '<button class="rotate">45°</button>';
          } else if (shape.type === 'circle') {
              html += `
                  <select class="second-color">
                      ${this.createColorOptions(shape.secondColorId)}
                  </select>
                  <input type="range" class="radial-lines" min="0" max="32" step="8" value="${shape.radialLines || 0}">
              `;
          }
      }

      html += `
          <select class="pattern-select">
              <option value="">No Pattern</option>
              ${this.createPatternOptions(shape.pattern)}
          </select>
          <input type="range" class="pattern-scale" min="0.1" max="2" step="0.1" value="${shape.patternScale}" style="display: ${shape.pattern ? 'inline-block' : 'none'};">
          </div>
          <div class="layer-buttons">
              <button class="move-up">↑</button>
              <button class="move-down">↓</button>
              <button class="delete">×</button>
          </div>
      `;

      return html;
  }

  createColorOptions(selectedColorId) {
      return this.paletteManager.getCurrentPalette().map((color, index) =>
          `<option value="${index}" ${index === selectedColorId ? 'selected' : ''}>${color}</option>`
      ).join('');
  }

  createLetterOptions(selectedLetter) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return letters.split('').map(letter =>
          `<option value="${letter}" ${letter === selectedLetter ? 'selected' : ''}>${letter}</option>`
      ).join('');
  }

  createPatternOptions(selectedPattern) {
      const patterns = this.patternMaker.getPatternList();
      return patterns.map(pattern =>
          `<option value="${pattern}" ${pattern === selectedPattern ? 'selected' : ''}>${pattern}</option>`
      ).join('');
  }

  addEventListeners(layerElement, index) {
      const shape = this.designTool.shapes[index];

      const colorSelect = layerElement.querySelector('.shape-color');
      if (colorSelect) {
          colorSelect.addEventListener('change', (e) => {
              this.designTool.updateShapeColor(index, parseInt(e.target.value));
          });
      }

      if (shape.type === 'letter') {
          const letterSelect = layerElement.querySelector('.letter-select');
          if (letterSelect) {
              letterSelect.addEventListener('change', (e) => {
                  this.designTool.updateLetterShape(index, e.target.value);
              });
          }

          const letterSizeInput = layerElement.querySelector('.letter-size');
          if (letterSizeInput) {
              letterSizeInput.addEventListener('input', (e) => {
                  const sizePercent = parseInt(e.target.value);
                  this.designTool.updateShapeSize(index, 0, sizePercent);
              });
          }
      } else {
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
                  const outerRadiusPercent = parseInt(e.target.value);
                  const innerRadiusInput = layerElement.querySelector('.inner-radius');
                  const innerRadiusPercent = innerRadiusInput ? parseInt(innerRadiusInput.value) : 0;
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
          } else if (shape.type === 'circle') {
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
      }

      const patternSelect = layerElement.querySelector('.pattern-select');
      if (patternSelect) {
          patternSelect.addEventListener('change', (e) => {
              const selectedPattern = e.target.value;
              if (selectedPattern) {
                  this.designTool.applyPatternToShape(index, selectedPattern);
                  const patternScaleInput = layerElement.querySelector('.pattern-scale');
                  if (patternScaleInput) {
                      patternScaleInput.style.display = 'inline-block';
                  }
              } else {
                  this.designTool.removePatternFromShape(index);
                  const patternScaleInput = layerElement.querySelector('.pattern-scale');
                  if (patternScaleInput) {
                      patternScaleInput.style.display = 'none';
                  }
              }
          });
      }

      const patternScaleInput = layerElement.querySelector('.pattern-scale');
      if (patternScaleInput) {
          patternScaleInput.addEventListener('input', (e) => {
              this.designTool.updateShapePatternScale(index, parseFloat(e.target.value));
          });
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
  }
}
