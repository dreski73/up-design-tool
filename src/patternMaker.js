export default class PatternMaker {
  constructor(paletteManager) {
      this.canvas = document.getElementById('patternCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.patternSelect = document.getElementById('patternSelect');
      this.currentPattern = 'zigzag';
      this.paletteManager = paletteManager;
  }

  initializePatternTool() {
      this.patternSelect.addEventListener('change', (e) => this.changePattern(e.target.value));
      this.drawPattern();
  }

  changePattern(pattern) {
      this.currentPattern = pattern;
      this.drawPattern();
  }

  drawPattern() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const colors = this.paletteManager.getCurrentPalette().slice(0, 3);
      switch (this.currentPattern) {
          case 'zigzag':
              this.drawZigzag(colors);
              break;
          case 'stripes':
              this.drawStripes(colors);
              break;
          case 'herringbone':
              this.drawHerringbone(colors);
              break;
          case 'chevron':
              this.drawChevron(colors);
              break;
          case 'alternatingSquares':
              this.drawAlternatingSquares(colors);
              break;
          case 'checkerboard':
              this.drawCheckerboard(colors);
              break;
          case 'isometricCubes':
              this.drawIsometricCubes(colors);
              break;
      }
  }

  drawZigzag(colors) {
      const lineWidth = 5;
      const amplitude = 20;
      const period = 40;

      this.ctx.lineWidth = lineWidth;

      for (let i = 0; i < colors.length; i++) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = colors[i];
          for (let x = 0; x <= this.canvas.width; x += period) {
              this.ctx.lineTo(x, amplitude * Math.sin((x + i * period / 3) / period * Math.PI * 2) + this.canvas.height / 2);
          }
          this.ctx.stroke();
      }
  }

  drawStripes(colors) {
      const stripeWidth = 20;

      for (let i = 0; i < this.canvas.width; i += stripeWidth * colors.length) {
          colors.forEach((color, index) => {
              this.ctx.fillStyle = color;
              this.ctx.fillRect(i + index * stripeWidth, 0, stripeWidth, this.canvas.height);
          });
      }
  }

  drawHerringbone(colors) {
      const size = 20;
      const halfSize = size / 2;

      for (let y = 0; y < this.canvas.height; y += size) {
          for (let x = 0; x < this.canvas.width; x += size) {
              this.ctx.fillStyle = colors[Math.floor((x + y) / size) % colors.length];
              this.ctx.beginPath();
              this.ctx.moveTo(x, y);
              this.ctx.lineTo(x + halfSize, y + size);
              this.ctx.lineTo(x + size, y + size);
              this.ctx.lineTo(x + halfSize, y);
              this.ctx.closePath();
              this.ctx.fill();
          }
      }
  }

  drawChevron(colors) {
      const size = 20;
      const halfSize = size / 2;

      for (let y = 0; y < this.canvas.height; y += size) {
          for (let x = 0; x < this.canvas.width; x += size) {
              this.ctx.fillStyle = colors[Math.floor(y / size) % colors.length];
              this.ctx.beginPath();
              this.ctx.moveTo(x, y + size);
              this.ctx.lineTo(x + halfSize, y);
              this.ctx.lineTo(x + size, y + size);
              this.ctx.closePath();
              this.ctx.fill();
          }
      }
  }

  drawAlternatingSquares(colors) {
      const size = 20;

      for (let y = 0; y < this.canvas.height; y += size) {
          for (let x = 0; x < this.canvas.width; x += size) {
              this.ctx.fillStyle = colors[(Math.floor(x / size) + Math.floor(y / size)) % colors.length];
              this.ctx.fillRect(x, y, size, size);
          }
      }
  }

  drawCheckerboard(colors) {
      const size = 20;

      for (let y = 0; y < this.canvas.height; y += size) {
          for (let x = 0; x < this.canvas.width; x += size) {
              this.ctx.fillStyle = colors[(Math.floor(x / size) + Math.floor(y / size)) % 2];
              this.ctx.fillRect(x, y, size, size);
          }
      }
  }

  drawIsometricCubes(colors) {
      const size = 20;
      const halfSize = size / 2;

      for (let y = 0; y < this.canvas.height + size; y += size * 1.5) {
          for (let x = 0; x < this.canvas.width + size; x += size * 2) {
              // Top face
              this.ctx.fillStyle = colors[0];
              this.ctx.beginPath();
              this.ctx.moveTo(x, y + halfSize);
              this.ctx.lineTo(x + size, y);
              this.ctx.lineTo(x + size * 2, y + halfSize);
              this.ctx.lineTo(x + size, y + size);
              this.ctx.closePath();
              this.ctx.fill();

              // Left face
              this.ctx.fillStyle = colors[1];
              this.ctx.beginPath();
              this.ctx.moveTo(x, y + halfSize);
              this.ctx.lineTo(x + size, y + size);
              this.ctx.lineTo(x + size, y + size * 1.5);
              this.ctx.lineTo(x, y + size);
              this.ctx.closePath();
              this.ctx.fill();

              // Right face
              this.ctx.fillStyle = colors[2];
              this.ctx.beginPath();
              this.ctx.moveTo(x + size, y + size);
              this.ctx.lineTo(x + size * 2, y + halfSize);
              this.ctx.lineTo(x + size * 2, y + size);
              this.ctx.lineTo(x + size, y + size * 1.5);
              this.ctx.closePath();
              this.ctx.fill();
          }
      }
  }

  getPatternForShape(shape) {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = shape.outerRadius * 2;
      patternCanvas.height = shape.outerRadius * 2;
      const patternCtx = patternCanvas.getContext('2d');

      // Scale the pattern to fit the shape
      const scale = shape.outerRadius * 2 / this.canvas.width;
      patternCtx.scale(scale, scale);

      // Draw the pattern on the new canvas
      const colors = this.paletteManager.getCurrentPalette().slice(0, 3);
      switch (this.currentPattern) {
          case 'zigzag':
              this.drawZigzag(colors, patternCtx);
              break;
          case 'stripes':
              this.drawStripes(colors, patternCtx);
              break;
          case 'herringbone':
              this.drawHerringbone(colors, patternCtx);
              break;
          case 'chevron':
              this.drawChevron(colors, patternCtx);
              break;
          case 'alternatingSquares':
              this.drawAlternatingSquares(colors, patternCtx);
              break;
          case 'checkerboard':
              this.drawCheckerboard(colors, patternCtx);
              break;
          case 'isometricCubes':
              this.drawIsometricCubes(colors, patternCtx);
              break;
      }

      return patternCtx.createPattern(patternCanvas, 'repeat');
  }

  updatePatternColors() {
      this.drawPattern();
  }

  getCurrentPattern() {
      return this.currentPattern;
  }
}