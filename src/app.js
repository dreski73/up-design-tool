import DesignTool from './designTool.js';
import PaletteManager from './paletteManager.js';
import PatternMaker from './patternMaker.js';
import ShapeLayerList from './shapeLayerList.js';
import { generateRandomColor } from './utils.js';

class App {
    constructor() {
        this.paletteManager = new PaletteManager();
        this.patternMaker = new PatternMaker(this.paletteManager);
        this.designTool = new DesignTool(this.paletteManager, this.patternMaker);
        this.shapeLayerList = new ShapeLayerList(this.designTool, this.paletteManager, this.patternMaker);

        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.initializeCurrentPalette();
        this.designTool.initializeCanvas();
        this.patternMaker.initializePatternTool();
        this.shapeLayerList.initializeList();
    }

    setupEventListeners() {
        // Design Tool buttons
        document.getElementById('addSquare').addEventListener('click', () => this.designTool.addShape('square'));
        document.getElementById('addCircle').addEventListener('click', () => this.designTool.addShape('circle'));
        document.getElementById('reset').addEventListener('click', () => this.designTool.resetCanvas());
        document.getElementById('save').addEventListener('click', () => this.designTool.saveDesign());
        document.getElementById('export').addEventListener('click', () => this.designTool.exportDesign());

        // Palette Manager buttons
        document.getElementById('addColor').addEventListener('click', () => this.paletteManager.addColor());
        document.getElementById('randomizePalette').addEventListener('click', () => this.paletteManager.randomizePalette());
        document.getElementById('savePalette').addEventListener('click', () => this.paletteManager.savePalette());

        // Pattern Maker
        document.getElementById('patternSelect').addEventListener('change', (e) => this.patternMaker.changePattern(e.target.value));

        // Event listeners for palette changes
        this.paletteManager.addEventListener('paletteChanged', () => {
            this.designTool.updateShapeColors();
            this.shapeLayerList.updateLayers();
            this.patternMaker.updatePatternColors();
        });

        // Event listener for shape changes
        this.designTool.addEventListener('shapesChanged', () => {
            this.shapeLayerList.updateLayers();
        });

        // Event listener for design list changes
        this.designTool.addEventListener('designListChanged', () => {
            this.updateDesignList();
        });

        // Event listener for palette list changes
        this.paletteManager.addEventListener('paletteListChanged', () => {
            this.updatePaletteList();
        });

        // Event listeners for shape layer controls
        this.shapeLayerList.addEventListener('secondColorChanged', (e) => {
            this.updateShapeSecondColor(e.detail.index, e.detail.colorId);
        });
        this.shapeLayerList.addEventListener('radialLinesChanged', (e) => {
            this.updateRadialLines(e.detail.index, e.detail.lines);
        });
        this.shapeLayerList.addEventListener('shapeLockToggled', (e) => {
            this.toggleShapeLock(e.detail.index);
        });
        this.shapeLayerList.addEventListener('patternScaleChanged', (e) => {
            this.updateShapePatternScale(e.detail.index, e.detail.scale);
        });
    }

    initializeCurrentPalette() {
        const initialColors = Array(5).fill().map(() => generateRandomColor());
        this.paletteManager.setCurrentPalette(initialColors);
    }

    updateDesignList() {
        const designListElement = document.getElementById('designList');
        designListElement.innerHTML = '';
        this.designTool.designs.forEach((design, index) => {
            const designItem = document.createElement('li');
            designItem.innerHTML = `
                <span>${design.name}</span>
                <button class="use-design">Use</button>
                <button class="delete-design">×</button>
                <button class="export-design">Export</button>
            `;
            designItem.querySelector('.use-design').addEventListener('click', () => this.designTool.loadDesign(index));
            designItem.querySelector('.delete-design').addEventListener('click', () => this.designTool.deleteDesign(index));
            designItem.querySelector('.export-design').addEventListener('click', () => this.designTool.exportDesign(index));
            designListElement.appendChild(designItem);
        });
    }

    updatePaletteList() {
        const paletteListElement = document.getElementById('paletteList');
        paletteListElement.innerHTML = '';
        this.paletteManager.savedPalettes.forEach((palette, index) => {
            const paletteItem = document.createElement('li');
            paletteItem.className = 'palette-item';
            paletteItem.innerHTML = `
                <span class="palette-name">${palette.name}</span>
                <div class="palette-colors">
                    ${palette.colors.map(color => `<div class="color-box small" style="background-color: ${color};"></div>`).join('')}
                </div>
                <div class="palette-buttons">
                    <button class="use-palette">Use</button>
                    <button class="delete-palette">×</button>
                    <button class="export-palette">Export</button>
                </div>
            `;
            paletteItem.querySelector('.use-palette').addEventListener('click', () => this.paletteManager.usePalette(index));
            paletteItem.querySelector('.delete-palette').addEventListener('click', () => this.paletteManager.deletePalette(index));
            paletteItem.querySelector('.export-palette').addEventListener('click', () => this.paletteManager.exportPalette(index));
            paletteListElement.appendChild(paletteItem);
        });
    }

    updateShapeSecondColor(index, colorId) {
        this.designTool.updateShapeSecondColor(index, colorId);
        this.shapeLayerList.updateLayers();
    }

    updateRadialLines(index, lines) {
        this.designTool.updateRadialLines(index, lines);
        this.shapeLayerList.updateLayers();
    }

    toggleShapeLock(index) {
        this.designTool.toggleShapeLock(index);
        this.shapeLayerList.updateLayers();
    }

    updateShapePatternScale(index, scale) {
        this.designTool.updateShapePatternScale(index, scale);
        this.shapeLayerList.updateLayers();
    }
}

export default App;