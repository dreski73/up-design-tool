import { generateRandomColor } from './utils.js';
import PatternMaker from './patternMaker.js';
import ShapeLayerList from './shapeLayerList.js';

export default class DesignTool {
    constructor(paletteManager, patternMaker) {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.shapes = [];
        this.gridSize = 10;
        this.paletteManager = paletteManager;
        this.patternMaker = patternMaker;
        this.shapeLayerList = new ShapeLayerList(this, this.paletteManager, this.patternMaker);
        this.designs = [];
    }

    initializeCanvas() {
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.drawGrid();
        this.drawFrame();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#d3d3d3';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawFrame() {
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    addShape(type) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxSize = Math.min(this.canvas.width, this.canvas.height) * 0.9;
        const colorId = this.paletteManager.getNextColorId();
        const sizeDecrement = 0.1;
        const shapeCount = this.shapes.length;
        const outerRadius = (maxSize / 2) * Math.max(0.3, 1 - (shapeCount * sizeDecrement));

        const shape = {
            type,
            x: centerX,
            y: centerY,
            outerRadius: outerRadius,
            innerRadius: 0,
            colorId,
            pattern: null,
            patternScale: 1,
            rotation: 0,
            radialLines: type === 'circle' ? 0 : undefined,
            secondColorId: type === 'circle' ? this.paletteManager.getNextColorId() : undefined
        };
        this.shapes.unshift(shape);
        this.shapeLayerList.addLayer(shape);
        this.drawShapes();
        this.dispatchEvent(new CustomEvent('shapesChanged'));
    }

    drawShapes() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawFrame();
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            this.ctx.save();
            this.ctx.translate(shape.x, shape.y);
            this.ctx.rotate(shape.rotation * Math.PI / 180);
            if (shape.type === 'square') {
                this.drawSquareAnnulus(shape);
            } else if (shape.type === 'circle') {
                this.drawCircularAnnulus(shape);
            }
            this.ctx.restore();
        }
    }

    drawSquareAnnulus(shape) {
        const outerSize = shape.outerRadius * 2;
        const innerSize = shape.innerRadius * 2;
        this.ctx.beginPath();
        this.ctx.rect(-outerSize / 2, -outerSize / 2, outerSize, outerSize);
        this.ctx.rect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
        this.ctx.closePath();
        if (shape.pattern) {
            const pattern = this.patternMaker.getPatternForShape(shape);
            this.ctx.fillStyle = pattern;
        } else {
            this.ctx.fillStyle = this.paletteManager.getColorById(shape.colorId);
        }
        this.ctx.fill('evenodd');
    }

    drawCircularAnnulus(shape) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shape.outerRadius, 0, Math.PI * 2);
        this.ctx.arc(0, 0, shape.innerRadius, 0, Math.PI * 2, true);
        this.ctx.closePath();
        if (shape.pattern) {
            const pattern = this.patternMaker.getPatternForShape(shape);
            this.ctx.fillStyle = pattern;
            this.ctx.fill();
        } else if (shape.radialLines > 0) {
            this.drawRadialLines(shape);
        } else {
            this.ctx.fillStyle = this.paletteManager.getColorById(shape.colorId);
            this.ctx.fill();
        }
    }

    drawRadialLines(shape) {
        const angleStep = (Math.PI * 2) / shape.radialLines;
        for (let i = 0; i < shape.radialLines; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, shape.outerRadius, i * angleStep, (i + 1) * angleStep);
            this.ctx.closePath();
            this.ctx.fillStyle = i % 2 === 0 ?
                this.paletteManager.getColorById(shape.colorId) :
                this.paletteManager.getColorById(shape.secondColorId);
            this.ctx.fill();
        }
    }

    updateShapeColor(index, colorId) {
        if (index >= 0 && index < this.shapes.length) {
            this.shapes[index].colorId = colorId;
            this.drawShapes();
        }
    }

    updateShapeSize(index, innerRadiusPercent, outerRadiusPercent) {
        if (index >= 0 && index < this.shapes.length) {
            const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
            this.shapes[index].innerRadius = (innerRadiusPercent / 100) * maxRadius;
            this.shapes[index].outerRadius = (outerRadiusPercent / 100) * maxRadius;
            this.drawShapes();
        }
    }

    rotateShape(index) {
        if (index >= 0 && index < this.shapes.length && this.shapes[index].type === 'square') {
            this.shapes[index].rotation = (this.shapes[index].rotation + 45) % 360;
            this.drawShapes();
        }
    }

    updateRadialLines(index, lines) {
        if (index >= 0 && index < this.shapes.length && this.shapes[index].type === 'circle') {
            this.shapes[index].radialLines = lines;
            this.drawShapes();
        }
    }

    deleteShape(index) {
        if (index >= 0 && index < this.shapes.length) {
            this.shapes.splice(index, 1);
            this.shapeLayerList.removeLayer(index);
            this.drawShapes();
            this.dispatchEvent(new CustomEvent('shapesChanged'));
        }
    }

    moveShapeLayer(oldIndex, newIndex) {
        if (oldIndex >= 0 && oldIndex < this.shapes.length && newIndex >= 0 && newIndex < this.shapes.length) {
            const [shape] = this.shapes.splice(oldIndex, 1);
            this.shapes.splice(newIndex, 0, shape);
            this.shapeLayerList.updateLayers();
            this.drawShapes();
        }
    }

    applyPatternToShape(shapeIndex, patternName, scale = 1) {
        if (shapeIndex >= 0 && shapeIndex < this.shapes.length) {
            const shape = this.shapes[shapeIndex];
            shape.pattern = patternName;
            shape.patternScale = scale;
            this.drawShapes();
        }
    }

    resetCanvas() {
        this.shapes = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawFrame();
        this.shapeLayerList.updateLayers();
        this.dispatchEvent(new CustomEvent('shapesChanged'));
    }

    saveDesign() {
        const designName = `My Design ${this.designs.length + 1}`;
        const design = {
            name: designName,
            shapes: JSON.parse(JSON.stringify(this.shapes)),
            palette: this.paletteManager.getCurrentPalette()
        };
        this.designs.push(design);
        this.dispatchEvent(new CustomEvent('designListChanged'));
    }

    loadDesign(index) {
        if (index >= 0 && index < this.designs.length) {
            const design = this.designs[index];
            this.shapes = JSON.parse(JSON.stringify(design.shapes));
            this.paletteManager.setCurrentPalette(design.palette);
            this.drawShapes();
            this.shapeLayerList.updateLayers();
            this.dispatchEvent(new CustomEvent('shapesChanged'));
        }
    }

    deleteDesign(index) {
        if (index >= 0 && index < this.designs.length) {
            this.designs.splice(index, 1);
            this.dispatchEvent(new CustomEvent('designListChanged'));
        }
    }

    exportDesign() {
        // Implement PDF export functionality
        console.log('Export functionality to be implemented');
    }

    updateShapeColors() {
        this.drawShapes();
    }

    updateShapeSecondColor(index, colorId) {
        if (index >= 0 && index < this.shapes.length && this.shapes[index].type === 'circle') {
            this.shapes[index].secondColorId = colorId;
            this.drawShapes();
        }
    }

    toggleShapeLock(index) {
        if (index >= 0 && index < this.shapes.length) {
            this.shapes[index].locked = !this.shapes[index].locked;
            this.dispatchEvent(new CustomEvent('shapesChanged'));
        }
    }

    updateShapePatternScale(index, scale) {
        if (index >= 0 && index < this.shapes.length && this.shapes[index].pattern) {
            this.shapes[index].patternScale = scale;
            this.drawShapes();
        }
    }

    addEventListener(event, callback) {
        this.canvas.addEventListener(event, callback);
    }

    dispatchEvent(event) {
        this.canvas.dispatchEvent(event);
    }
}
