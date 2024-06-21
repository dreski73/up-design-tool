// src/designTool.js

export function initializeDesignTool() {
  const container = document.getElementById('container');
  const canvas = document.createElement('canvas');
  canvas.id = 'designCanvas';
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = '1px solid black';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const gridSize = 20;
  let isDrawing = false;
  let isResizing = false;
  let isMoving = false;
  let startX, startY;
  let selectedColor = '#FF0000';
  let selectedPattern = null;
  let selectedShape = 'rectangle';
  let selectedShapeIndex = null;
  const shapes = [];
  const history = [];
  let historyIndex = -1;

  const linePatterns = {
    zigzag: (ctx, shape) => {
      const { x, y, outerRadius, innerRadius, radialLines } = shape;
      ctx.beginPath();
      for (let i = 0; i < radialLines; i++) {
        const angle = (i * 2 * Math.PI) / radialLines;
        const outerX = x + outerRadius * Math.cos(angle);
        const outerY = y + outerRadius * Math.sin(angle);
        const innerX = x + innerRadius * Math.cos(angle + Math.PI / radialLines);
        const innerY = y + innerRadius * Math.sin(angle + Math.PI / radialLines);
        ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.stroke();
    },
    // Add more predefined line patterns here
  };

  const backgroundPatterns = {
    // Add predefined background patterns here
  };

  function addShape(shape) {
    shapes.push(shape);
    redraw();
  }

  function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
  function addRadialLines(shape, radialLines) {
    const { x, y, outerRadius, innerRadius } = shape;
    for (let i = 0; i < radialLines; i++) {
      const angle = (i * 2 * Math.PI) / radialLines;
      const outerX = x + outerRadius * Math.cos(angle);
      const outerY = y + outerRadius * Math.sin(angle);
      const innerX = x + innerRadius * Math.cos(angle + Math.PI / radialLines);
      const innerY = y + innerRadius * Math.sin(angle + Math.PI / radialLines);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
      ctx.stroke();
    }
  }

  function snapToGrid(value) {
    return Math.round(value / gridSize) * gridSize;
  }

  function saveState() {
    if (historyIndex < history.length - 1) {
      history.splice(historyIndex + 1);
    }
    history.push(JSON.stringify(shapes));
    historyIndex++;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      shapes.length = 0;
      shapes.push(...JSON.parse(history[historyIndex]));
      redraw();
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      shapes.length = 0;
      shapes.push(...JSON.parse(history[historyIndex]));
      redraw();
    }
  }

  function saveDesign(name) {
    const design = {
      name,
      data: JSON.stringify(shapes)
    };
    const designs = JSON.parse(localStorage.getItem('designs') || '[]');
    designs.push(design);
    localStorage.setItem('designs', JSON.stringify(designs));
    alert('Design saved!');
  }

  function loadDesign(name) {
    const designs = JSON.parse(localStorage.getItem('designs') || '[]');
    const design = designs.find(d => d.name === name);
    if (design) {
      shapes.length = 0;
      shapes.push(...JSON.parse(design.data));
      redraw();
    } else {
      alert('Design not found!');
    }
  }

  function exportDesign(format) {
    const link = document.createElement('a');
    link.download = `design.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  }

  function drawShape(ctx, shape) {
    ctx.fillStyle = shape.pattern ? ctx.createPattern(shape.pattern, 'repeat') : shape.color;
    ctx.save();
    ctx.translate(shape.x, shape.y);
    if (shape.type === 'rectangle') {
      ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
    } else if (shape.type === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, shape.radius, 0, 2 * Math.PI);
      ctx.fill();
    } else if (shape.type === 'ring') {
      ctx.beginPath();
      ctx.arc(0, 0, shape.outerRadius, 0, 2 * Math.PI);
      ctx.arc(0, 0, shape.innerRadius, 0, 2 * Math.PI, true);
      ctx.fill();
    } else if (shape.type === 'radialLine') {
      addRadialLines(shape, shape.radialLines);
    }
    ctx.restore();
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    shapes.forEach(shape => drawShape(ctx, shape));
  }

  function getShapeAt(x, y) {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (shape.type === 'rectangle' && x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
        return i;
      } else if (shape.type === 'circle' && Math.sqrt(Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)) <= shape.radius) {
        return i;
      } else if (shape.type === 'ring') {
        const distance = Math.sqrt(Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2));
        if (distance <= shape.outerRadius && distance >= shape.innerRadius) {
          return i;
        }
      }
    }
    return null;
  }

  function bringToFront(index) {
    if (index !== null && index < shapes.length) {
      const shape = shapes.splice(index, 1)[0];
      shapes.push(shape);
      redraw();
    }
  }

  function sendToBack(index) {
    if (index !== null && index < shapes.length) {
      const shape = shapes.splice(index, 1)[0];
      shapes.unshift(shape);
      redraw();
    }
  }

  canvas.addEventListener('mousedown', (event) => {
    const x = snapToGrid(event.offsetX);
    const y = snapToGrid(event.offsetY);
    const shapeIndex = getShapeAt(x, y);
    if (shapeIndex !== null) {
      selectedShapeIndex = shapeIndex;
      const shape = shapes[shapeIndex];
      if (event.shiftKey) {
        isResizing = true;
      } else {
        isMoving = true;
        startX = x - shape.x;
        startY = y - shape.y;
      }
    } else {
      isDrawing = true;
      startX = x;
      startY = y;
      saveState();
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
      const currentX = snapToGrid(event.offsetX);
      const currentY = snapToGrid(event.offsetY);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      if (selectedPattern) {
        ctx.fillStyle = ctx.createPattern(selectedPattern, 'repeat');
      } else {
        ctx.fillStyle = selectedColor;
      }
      if (selectedShape === 'rectangle') {
        ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
      } else if (selectedShape === 'circle') {
        const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.fill();
      } else if (selectedShape === 'ring') {
        const outerRadius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        const innerRadius = outerRadius / 2; // Example ratio, can be adjusted
        ctx.beginPath();
        ctx.arc(startX, startY, outerRadius, 0, 2 * Math.PI);
        ctx.arc(startX, startY, innerRadius, 0, 2 * Math.PI, true);
        ctx.fill();
      } else if (selectedShape === 'radialLine') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }
    } else if (isMoving && selectedShapeIndex !== null) {
      const shape = shapes[selectedShapeIndex];
      shape.x = snapToGrid(event.offsetX - startX);
      shape.y = snapToGrid(event.offsetY - startY);
      redraw();
    } else if (isResizing && selectedShapeIndex !== null) {
      const shape = shapes[selectedShapeIndex];
      const currentX = snapToGrid(event.offsetX);
      const currentY = snapToGrid(event.offsetY);
      if (shape.type === 'rectangle') {
        shape.width = currentX - shape.x;
        shape.height = currentY - shape.y;
      } else if (shape.type === 'circle') {
        shape.radius = Math.sqrt(Math.pow(currentX - shape.x, 2) + Math.pow(currentY - shape.y, 2));
      } else if (shape.type === 'ring') {
        shape.outerRadius = Math.sqrt(Math.pow(currentX - shape.x, 2) + Math.pow(currentY - shape.y, 2));
        shape.innerRadius = shape.outerRadius / 2; // Example ratio, can be adjusted
      }
      redraw();
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    isMoving = false;
    isResizing = false;
    selectedShapeIndex = null;
  });

  drawGrid();

  return {
    setColor: (color) => {
      selectedColor = color;
      selectedPattern = null;
    },
    setPattern: (patternCanvas) => {
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        redraw();
      } else {
        console.error('Failed to create pattern');
      }
    },
    setShape: (shape) => {
      selectedShape = shape;
    },
    setLinePattern: (pattern) => {
      if (selectedShapeIndex !== null) {
        shapes[selectedShapeIndex].linePattern = pattern;
        redraw();
      }
    },
    setBackgroundPattern: (pattern) => {
      if (selectedShapeIndex !== null) {
        shapes[selectedShapeIndex].pattern = pattern;
        redraw();
      }
    },
    undo,
    redo,
    saveDesign,
    loadDesign,
    exportDesign,
    bringToFront,
    sendToBack
  };
}
