export default class PatternMaker {
  constructor(paletteManager) {
      this.paletteManager = paletteManager;
  }

  getPatternList() {
      return ['zigzag', 'stripes', 'checkerboard', 'dots', 'crosshatch'];
  }

  getPatternForShape(shape, ctx) {
      const colors = [
          this.paletteManager.getColorById(shape.colorId),
          this.paletteManager.getColorById(shape.secondColorId || shape.colorId)
      ];
      const patternSize = 62 * shape.patternScale;

      switch (shape.pattern) {
          case 'zigzag':
              return this.createZigzagPattern(ctx, colors, patternSize);
          case 'stripes':
              return this.createStripesPattern(ctx, colors, patternSize);
          case 'checkerboard':
              return this.createCheckerboardPattern(ctx, colors, patternSize);
          case 'dots':
              return this.createDotsPattern(ctx, colors, patternSize);
          case 'crosshatch':
              return this.createCrosshatchPattern(ctx, colors, patternSize);
          default:
              return null;
      }
  }

  createZigzagPattern(ctx, colors, size) {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = size;
      const patternCtx = patternCanvas.getContext('2d');

      patternCtx.fillStyle = colors[0];
      patternCtx.fillRect(0, 0, size, size);

      patternCtx.fillStyle = colors[1];
      patternCtx.beginPath();
      patternCtx.moveTo(0, 0);
      patternCtx.lineTo(size / 2, 0);
      patternCtx.lineTo(size, size / 2);
      patternCtx.lineTo(size / 2, size);
      patternCtx.lineTo(0, size / 2);
      patternCtx.closePath();
      patternCtx.fill();

      return ctx.createPattern(patternCanvas, 'repeat');
  }

  createStripesPattern(ctx, colors, size) {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = size;
      const patternCtx = patternCanvas.getContext('2d');

      patternCtx.fillStyle = colors[0];
      patternCtx.fillRect(0, 0, size, size);

      patternCtx.fillStyle = colors[1];
      patternCtx.fillRect(0, 0, size / 2, size);

      return ctx.createPattern(patternCanvas, 'repeat');
  }

  createCheckerboardPattern(ctx, colors, size) {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = size;
      const patternCtx = patternCanvas.getContext('2d');

      patternCtx.fillStyle = colors[0];
      patternCtx.fillRect(0, 0, size, size);

      patternCtx.fillStyle = colors[1];
      patternCtx.fillRect(0, 0, size / 2, size / 2);
      patternCtx.fillRect(size / 2, size / 2, size / 2, size / 2);

      return ctx.createPattern(patternCanvas, 'repeat');
  }

  createDotsPattern(ctx, colors, size) {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = size;
      const patternCtx = patternCanvas.getContext('2d');

      patternCtx.fillStyle = colors[0];
      patternCtx.fillRect(0, 0, size, size);

      patternCtx.fillStyle = colors[1];
      patternCtx.beginPath();
      patternCtx.arc(size / 4, size / 4, size / 8, 0, Math.PI * 2);
      patternCtx.arc(3 * size / 4, 3 * size / 4, size / 8, 0, Math.PI * 2);
      patternCtx.fill();

      return ctx.createPattern(patternCanvas, 'repeat');
  }

  createCrosshatchPattern(ctx, colors, size) {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = size;
      const patternCtx = patternCanvas.getContext('2d');

      patternCtx.fillStyle = colors[0];
      patternCtx.fillRect(0, 0, size, size);

      patternCtx.strokeStyle = colors[1];
      patternCtx.lineWidth = size / 10;

      patternCtx.beginPath();
      patternCtx.moveTo(0, 0);
      patternCtx.lineTo(size, size);
      patternCtx.moveTo(size, 0);
      patternCtx.lineTo(0, size);
      patternCtx.stroke();

      return ctx.createPattern(patternCanvas, 'repeat');
  }
}
