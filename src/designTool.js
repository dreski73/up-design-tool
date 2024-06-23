let eventListenersAdded = false;

export function initializeDesignTool() {
  const designCanvas = document.getElementById('designCanvas');
  const ctx = designCanvas.getContext('2d');
  let shapes = [];
  const colors = ['#FF0000', '#0000FF', '#008000', '#FFFF00', '#FFA500'];
  let colorIndex = 0;

  function drawShape(shape) {
    const { type, x, y, outerRadius, innerRadius, color, radials, lineThickness, radialColor, rotation } = shape;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = color;
    ctx.beginPath();
    if (type === 'circle') {
      ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
      ctx.moveTo(innerRadius, 0);
      ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI, true);
    } else if (type === 'square') {
      ctx.rect(-outerRadius, -outerRadius, 2 * outerRadius, 2 * outerRadius);
      ctx.moveTo(-innerRadius, -innerRadius);
      ctx.rect(-innerRadius, -innerRadius, 2 * innerRadius, 2 * innerRadius);
    }
    ctx.fill('evenodd');

    // Draw radial array
    if (radials > 0) {
      ctx.strokeStyle = radialColor;
      // Calculate maximum line thickness based on radials
      const maxThickness = 40 / radials;
      ctx.lineWidth = (lineThickness / 100) * 40; // Convert percentage to thickness
      for (let i = 0; i < radials; i++) {
        const angle = (i * 2 * Math.PI) / radials;
        const outerX = outerRadius * Math.cos(angle);
        const outerY = outerRadius * Math.sin(angle);
        const innerX = innerRadius * Math.cos(angle);
        const innerY = innerRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function addShape(type) {
    const color = colors[colorIndex % colors.length];
    const radialColor = colors[(colorIndex + 1) % colors.length];
    colorIndex++;
    const shape = {
      type,
      x: designCanvas.width / 2,
      y: designCanvas.height / 2,
      outerRadius: 150,
      innerRadius: 100,
      color,
      radials: 0,
      lineThickness: 10, // Start with 10% thickness
      radialColor,
      rotation: 0 // Initial rotation
    };
    shapes.push(shape);
    drawShape(shape);
    addShapeLayer(shape);
  }

  function addShapeLayer(shape) {
    const shapeLayerList = document.getElementById('shapeLayerList');
    const layer = document.createElement('div');
    layer.classList.add('shape-layer');

    const icon = document.createElement('span');
    icon.textContent = shape.type === 'circle' ? '○' : '□';
    icon.style.color = shape.color;
    layer.appendChild(icon);

    const colorSelect = document.createElement('select');
    colors.forEach(color => {
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

    const outerRadiusSlider = document.createElement('input');
    outerRadiusSlider.type = 'range';
    outerRadiusSlider.min = 0;
    outerRadiusSlider.max = 100;
    outerRadiusSlider.value = shape.outerRadius / 2.5;
    outerRadiusSlider.addEventListener('input', (e) => {
      shape.outerRadius = e.target.value * 2.5;
      redrawShapes();
    });
    layer.appendChild(outerRadiusSlider);

    const innerRadiusSlider = document.createElement('input');
    innerRadiusSlider.type = 'range';
    innerRadiusSlider.min = 0;
    innerRadiusSlider.max = 100;
    innerRadiusSlider.value = shape.innerRadius / 2.5;
    innerRadiusSlider.addEventListener('input', (e) => {
      shape.innerRadius = e.target.value * 2.5;
      redrawShapes();
    });
    layer.appendChild(innerRadiusSlider);

    const radialsSlider = document.createElement('input');
    radialsSlider.type = 'range';
    radialsSlider.min = 0;
    radialsSlider.max = 5;
    radialsSlider.value = shape.radials;
    radialsSlider.addEventListener('input', (e) => {
      const values = [4, 8, 16, 32, 64, 128];
      shape.radials = values[e.target.value];
      redrawShapes();
    });
    layer.appendChild(radialsSlider);

    /*
    // Original code for even number increments
    const radialsSlider = document.createElement('input');
    radialsSlider.type = 'range';
    radialsSlider.min = 0;
    radialsSlider.max = 50;
    radialsSlider.value = shape.radials;
    radialsSlider.addEventListener('input', (e) => {
      shape.radials = Math.round(e.target.value / 2) * 2; // Ensure even numbers
      redrawShapes();
    });
    layer.appendChild(radialsSlider);
    */

    const lineThicknessSlider = document.createElement('input');
    lineThicknessSlider.type = 'range';
    lineThicknessSlider.min = 0;
    lineThicknessSlider.max = 100;
    lineThicknessSlider.value = shape.lineThickness;
    lineThicknessSlider.addEventListener('input', (e) => {
      shape.lineThickness = e.target.value;
      redrawShapes();
    });
    layer.appendChild(lineThicknessSlider);

    const radialColorSelect = document.createElement('select');
    colors.forEach(color => {
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

    const rotationSlider = document.createElement('input');
    rotationSlider.type = 'range';
    rotationSlider.min = 0;
    rotationSlider.max = 360;
    rotationSlider.value = shape.rotation;
    rotationSlider.addEventListener('input', (e) => {
      shape.rotation = e.target.value;
      redrawShapes();
    });
    layer.appendChild(rotationSlider);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
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
    document.getElementById('saveDesign').addEventListener('click', saveDesign);
    eventListenersAdded = true;
  }

  updateSavedDesigns();
  console.log('Design tool initialized');
}