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
      this.drawPatternWithColors(this.ctx, colors, this.currentPattern);
  }

  drawPatternWithColors(ctx, colors, pattern) {
      switch (pattern) {
          case 'zigzag':
              this.drawZigzag(ctx, colors);
              break;
          case 'stripes':
              this.drawStripes(ctx, colors);
              break;
          case 'herringbone':
              this.drawHerringbone(ctx, colors);
              break;
          case 'chevron':
              this.drawChevron(ctx, colors);
              break;
          case 'alternatingSquares':
              this.drawAlternatingSquares(ctx, colors);
              break;
          case 'checkerboard':
              this.drawCheckerboard(ctx, colors);
              break;
          case 'isometricCubes':
              this.drawIsometricCubes(ctx, colors);
              break;
      }
  }

  drawZigzag(ctx, colors) {
      const lineWidth = 5;
      const amplitude = 20;
      const period = 40;
      ctx.lineWidth = lineWidth;
      for (let i = 0; i < colors.length; i++) {
          ctx.beginPath();
          ctx.strokeStyle = colors[i];
          for (let x = 0; x <= ctx.canvas.width; x += period) {
              ctx.lineTo(x, amplitude * Math.sin((x + i * period / 3) / period * Math.PI * 2) + ctx.canvas.height / 2);
          }
          ctx.stroke();
      }
  }

  drawStripes(ctx, colors) {
      const stripeWidth = 20;
      for (let i = 0; i < ctx.canvas.width; i += stripeWidth * colors.length) {
          colors.forEach((color, index) => {
              ctx.fillStyle = color;
              ctx.fillRect(i + index * stripeWidth, 0, stripeWidth, ctx.canvas.height);
          });
      }
  }

  drawHerringbone(ctx, colors) {
      const size = 20;
      const halfSize = size / 2;
      for (let y = 0; y < ctx.canvas.height; y += size) {
          for (let x = 0; x < ctx.canvas.width; x += size) {
              ctx.fillStyle = colors[Math.floor((x + y) / size) % colors.length];
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + halfSize, y + size);
              ctx.lineTo(x + size, y + size);
              ctx.lineTo(x + halfSize, y);
              ctx.closePath();
              ctx.fill();
          }
      }
  }

  drawChevron(ctx, colors) {
      const size = 20;
      const halfSize = size / 2;
      for (let y = 0; y < ctx.canvas.height; y += size) {
          for (let x = 0; x < ctx.canvas.width; x += size) {
              ctx.fillStyle = colors[Math.floor(y / size) % colors.length];
              ctx.beginPath();
              ctx.moveTo(x, y + size);
              ctx.lineTo(x + halfSize, y);
              ctx.lineTo(x + size, y + size);
              ctx.closePath();
              ctx.fill();
          }
      }
  }

  drawAlternatingSquares(ctx, colors) {
      const size = 20;
      for (let y = 0; y < ctx.canvas.height; y += size) {
          for (let x = 0; x < ctx.canvas.width; x += size) {
              ctx.fillStyle = colors[(Math.floor(x / size) + Math.floor(y / size)) % colors.length];
              ctx.fillRect(x, y, size, size);
          }
      }
  }

  drawCheckerboard(ctx, colors) {
      const size = 20;
      for (let y = 0; y < ctx.canvas.height; y += size) {
          for (let x = 0; x < ctx.canvas.width; x += size) {
              ctx.fillStyle = colors[(Math.floor(x / size) + Math.floor(y / size)) % 2];
              ctx.fillRect(x, y, size, size);
          }
      }
  }

  drawIsometricCubes(ctx, colors) {
      const size = 20;
      const halfSize = size / 2;
      for (let y = 0; y < ctx.canvas.height + size; y += size * 1.5) {
          for (let x = 0; x < ctx.canvas.width + size; x += size * 2) {
              // Top face
              ctx.fillStyle = colors[0];
              ctx.beginPath();
              ctx.moveTo(x, y + halfSize);
              ctx.lineTo(x + size, y);
              ctx.lineTo(x + size * 2, y + halfSize);
              ctx.lineTo(x + size, y + size);
              ctx.closePath();
              ctx.fill();
              // Left face
              ctx.fillStyle = colors[1];
              ctx.beginPath();
              ctx.moveTo(x, y + halfSize);
              ctx.lineTo(x + size, y + size);
              ctx.lineTo(x + size, y + size * 1.5);
              ctx.lineTo(x, y + size);
              ctx.closePath();
              ctx.fill();
              // Right face
              ctx.fillStyle = colors[2];
              ctx.beginPath();
              ctx.moveTo(x + size, y + size);
              ctx.lineTo(x + size * 2, y + halfSize);
              ctx.lineTo(x + size * 2, y + size);
              ctx.lineTo(x + size, y + size * 1.5);
              ctx.closePath();
              ctx.fill();
          }
      }
  }

  getPatternList() {
      return ['zigzag', 'stripes', 'herringbone', 'chevron', 'alternatingSquares', 'checkerboard', 'isometricCubes'];
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
      this.drawPatternWithColors(patternCtx, colors, shape.pattern);

      return patternCtx.createPattern(patternCanvas, 'repeat');
  }

  updatePatternColors() {
      this.drawPattern();
  }

  getCurrentPattern() {
      return this.currentPattern;
  }
}
