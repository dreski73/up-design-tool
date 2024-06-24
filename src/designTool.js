import { currentPalette } from './paletteManager'; // Import currentPalette

let eventListenersAdded = false;

function updatePalette(newPaletteColors) {
  currentPalette.length = 0;
  newPaletteColors.forEach(color => currentPalette.push(color));
  shapes.forEach((shape, index) => {
    shape.color = currentPalette[index % currentPalette.length];
    shape.radialColor = currentPalette[(index + 1) % currentPalette.length];
  });
  redrawShapes();
  updateShapeLayerList();
}

export function initializeDesignTool() {
  const designCanvas = document.getElementById('designCanvas');
  const ctx = designCanvas.getContext('2d');
  let shapes = [];
  let colorIndex = 0;

  function drawShape(shape) {
    const { type, x, y, outerRadius, innerRadius, color, radials, radialColor, rotation } = shape;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = color;
    ctx.beginPath();
    if (type === 'circle') {
      ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
      if (innerRadius > 0) {
        ctx.moveTo(innerRadius, 0);
        ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI, true);
      }
    } else if (type === 'square') {
      ctx.rect(-outerRadius, -outerRadius, 2 * outerRadius, 2 * outerRadius);
      if (innerRadius > 0) {
        ctx.moveTo(-innerRadius, -innerRadius);
        ctx.rect(-innerRadius, -innerRadius, 2 * innerRadius, 2 * innerRadius);
      }
    } else if (type === 'radialOutline') {
      if (radials === 0) {
        ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
        if (innerRadius > 0) {
          ctx.moveTo(innerRadius, 0);
          ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI, true);
        }
      } else {
        for (let i = 0; i < radials; i++) {
          const angle = (i * 2 * Math.PI) / radials;
          const nextAngle = ((i + 1) * 2 * Math.PI) / radials;
          const outerX = outerRadius * Math.cos(angle);
          const outerY = outerRadius * Math.sin(angle);
          const nextOuterX = outerRadius * Math.cos(nextAngle);
          const nextOuterY = outerRadius * Math.sin(nextAngle);
          const innerX = innerRadius * Math.cos(angle);
          const innerY = innerRadius * Math.sin(angle);
          const nextInnerX = innerRadius * Math.cos(nextAngle);
          const nextInnerY = innerRadius * Math.sin(nextAngle);

          ctx.beginPath();
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(outerX, outerY);
          ctx.arc(0, 0, outerRadius, angle, nextAngle);
          ctx.lineTo(nextInnerX, nextInnerY);
          ctx.arc(0, 0, innerRadius, nextAngle, angle, true);
          ctx.closePath();
          ctx.fillStyle = i % 2 === 0 ? color : radialColor;
          ctx.fill();
        }
      }
    }
    ctx.fill('evenodd');
    ctx.restore();
  }

  function addShape(type) {
    const color = currentPalette[colorIndex % currentPalette.length];
    const radialColor = currentPalette[(colorIndex + 1) % currentPalette.length];
    colorIndex++;
    const shapeCount = shapes.length;
    const outerRadius = 500 * Math.pow(0.75, shapeCount);
    const shape = {
      type,
      x: designCanvas.width / 2,
      y: designCanvas.height / 2,
      outerRadius: outerRadius,
      innerRadius: 0,
      color,
      radials: 0,
      radialColor,
      rotation: 0
    };
    shapes.push(shape);
    drawShape(shape);
    addShapeLayer(shape);
  }

  function toggleRotation(shape) {
    shape.rotation = shape.rotation === 45 ? 0 : 45;
    redrawShapes();
  }
  function shuffleColors() {
    shapes.forEach(shape => {
      let newColor, newRadialColor;
      do {
        newColor = currentPalette[Math.floor(Math.random() * currentPalette.length)];
      } while (newColor === shape.radialColor);
      do {
        newRadialColor = currentPalette[Math.floor(Math.random() * currentPalette.length)];
      } while (newRadialColor === newColor);
      shape.color = newColor;
      shape.radialColor = newRadialColor;
    });
    redrawShapes();
    updateShapeLayerList();
  }

  function addShapeLayer(shape) {
    const shapeLayerList = document.getElementById('shapeLayerList');
    const layer = document.createElement('div');
    layer.classList.add('shape-layer');

    const icon = document.createElement('span');
    icon.textContent = shape.type === 'circle' ? '○' : (shape.type === 'square' ? '□' : '⨁');
    icon.style.color = shape.color;
    layer.appendChild(icon);

    const colorSelect = document.createElement('select');
    currentPalette.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      colorSelect.appendChild(option);
    });
    colorSelect.value = shape.color;
    colorSelect.addEventListener('change', (e) => {
      shape.color = e.target.value;
      redrawShapes();
    });
    layer.appendChild(colorSelect);

    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('slider-container');

    const innerRadiusSlider = document.createElement('input');
    innerRadiusSlider.type = 'range';
    innerRadiusSlider.min = 0;
    innerRadiusSlider.max = 100;
    innerRadiusSlider.value = shape.innerRadius / 5;
    innerRadiusSlider.addEventListener('input', (e) => {
      shape.innerRadius = e.target.value * 5;
      redrawShapes();
    });
    sliderContainer.appendChild(innerRadiusSlider);

    const outerRadiusSlider = document.createElement('input');
    outerRadiusSlider.type = 'range';
    outerRadiusSlider.min = 0;
    outerRadiusSlider.max = 100;
    outerRadiusSlider.value = shape.outerRadius / 5;
    outerRadiusSlider.addEventListener('input', (e) => {
      shape.outerRadius = e.target.value * 5;
      redrawShapes();
    });
    sliderContainer.appendChild(outerRadiusSlider);

    layer.appendChild(sliderContainer);

    const radialsSlider = document.createElement('input');
    radialsSlider.type = 'range';
    radialsSlider.min = 0;
    radialsSlider.max = 6;
    radialsSlider.value = shape.radials;
    radialsSlider.addEventListener('input', (e) => {
      const values = [0, 4, 8, 16, 32, 64, 128];
      shape.radials = values[e.target.value];
      redrawShapes();
    });
    layer.appendChild(radialsSlider);

    const radialColorSelect = document.createElement('select');
    currentPalette.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      radialColorSelect.appendChild(option);
    });
    radialColorSelect.value = shape.radialColor;
    radialColorSelect.addEventListener('change', (e) => {
      shape.radialColor = e.target.value;
      redrawShapes();
    });
    layer.appendChild(radialColorSelect);

    if (shape.type === 'square') {
      const rotateButton = document.createElement('button');
      rotateButton.textContent = '45°';
      rotateButton.addEventListener('click', () => toggleRotation(shape));
      layer.appendChild(rotateButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.style.fontSize = '10px'; // Decrease size of the X button
    deleteButton.addEventListener('click', () => {
      shapes = shapes.filter(s => s !== shape);
      layer.remove();
      redrawShapes();
    });
    layer.appendChild(deleteButton);

    shapeLayerList.appendChild(layer);
  }

  function redrawShapes() {
    ctx.clearRect(0, 0, designCanvas.width, designCanvas.height);
    shapes.forEach(drawShape);
  }

  function resetCanvas() {
    shapes = [];
    ctx.clearRect(0, 0, designCanvas.width, designCanvas.height);
    document.getElementById('shapeLayerList').innerHTML = '';
  }

  function saveDesign() {
    const savedDesigns = JSON.parse(localStorage.getItem('savedDesigns')) || [];
    const design = {
      name: `Design ${savedDesigns.length + 1}`,
      shapes: shapes.map(shape => ({ ...shape }))
    };
    savedDesigns.push(design);
    localStorage.setItem('savedDesigns', JSON.stringify(savedDesigns));
    updateSavedDesigns();
  }

  function loadDesign(design) {
    shapes = design.shapes.map(shape => ({ ...shape }));
    redrawShapes();
    updateShapeLayerList();
  }

  function updateSavedDesigns() {
    const savedDesignsContainer = document.getElementById('savedDesigns');
    savedDesignsContainer.innerHTML = '';
    const savedDesigns = JSON.parse(localStorage.getItem('savedDesigns')) || [];
    savedDesigns.forEach((design, index) => {
      const designElement = document.createElement('div');
      designElement.classList.add('saved-design');
      designElement.textContent = design.name;

      const loadButton = document.createElement('button');
      loadButton.textContent = 'Load';
      loadButton.addEventListener('click', () => loadDesign(design));
      designElement.appendChild(loadButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', () => {
        savedDesigns.splice(index, 1);
        localStorage.setItem('savedDesigns', JSON.stringify(savedDesigns));
        updateSavedDesigns();
      });
      designElement.appendChild(deleteButton);

      savedDesignsContainer.appendChild(designElement);
    });
  }

  function updateShapeLayerList() {
    const shapeLayerList = document.getElementById('shapeLayerList');
    shapeLayerList.innerHTML = '';
    shapes.forEach(shape => addShapeLayer(shape));
  }

  if (!eventListenersAdded) {
    document.getElementById('addSquare').addEventListener('click', () => addShape('square'));
    document.getElementById('addCircle').addEventListener('click', () => addShape('circle'));
    document.getElementById('addRadial').addEventListener('click', () => addShape('radialOutline'));
    document.getElementById('shuffleColors').addEventListener('click', shuffleColors);
    document.getElementById('resetCanvas').addEventListener('click', resetCanvas);
    document.getElementById('saveDesign').addEventListener('click', saveDesign);
    eventListenersAdded = true;
  }

  updateSavedDesigns();
  console.log('Design tool initialized');
}

export function changePalette(newPaletteColors) {
  updatePalette(newPaletteColors);
}