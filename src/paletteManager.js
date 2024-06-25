import { generateRandomColor } from './utils.js';

export default class PaletteManager {
    constructor() {
        this.currentPalette = [];
        this.savedPalettes = [];
        this.predefinedPalettes = [
            { name: "Beach Towels", colors: ["#FFDDC1", "#F5B895", "#F5A68C", "#F28C8C", "#F28282"] },
            { name: "Beautiful Blues", colors: ["#D9F0FF", "#A6DFFF", "#73CFFF", "#40BFFF", "#0DAFFF"] },
            { name: "Pastel Rainbow", colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"] },
            { name: "Metro UI Colors", colors: ["#D11141", "#00B159", "#00AEDB", "#F37735", "#FFC425"] },
            { name: "Purple Skyline", colors: ["#D4A5A5", "#C08497", "#F7AF9D", "#F7E3AF", "#F3EEC3"] }
        ];
        this.maxColors = 10;
        this.currentPaletteElement = document.getElementById('currentPaletteColors');
        this.paletteListElement = document.getElementById('paletteList');
        this.currentColorIndex = 0;
        this.initializePalettes();
    }

    initializePalettes() {
        this.setCurrentPalette(Array(5).fill().map(() => generateRandomColor()));
        this.updateSavedPalettesDisplay();
    }

    setCurrentPalette(colors) {
        this.currentPalette = colors;
        this.updateCurrentPaletteDisplay();
        this.dispatchEvent(new CustomEvent('paletteChanged'));
    }

    addColor() {
        if (this.currentPalette.length < this.maxColors) {
            const newColor = generateRandomColor();
            this.currentPalette.push(newColor);
            this.updateCurrentPaletteDisplay();
            this.dispatchEvent(new CustomEvent('paletteChanged'));
        }
    }

    removeColor(index) {
        if (this.currentPalette.length > 1) {
            this.currentPalette.splice(index, 1);
            this.updateCurrentPaletteDisplay();
            this.dispatchEvent(new CustomEvent('paletteChanged'));
        }
    }

    randomizePalette() {
        this.currentPalette = Array(this.currentPalette.length).fill().map(() => generateRandomColor());
        this.updateCurrentPaletteDisplay();
        this.dispatchEvent(new CustomEvent('paletteChanged'));
    }

    savePalette() {
        const paletteName = `My Palette ${this.savedPalettes.length + 1}`;
        this.savedPalettes.unshift({ name: paletteName, colors: [...this.currentPalette] });
        this.updateSavedPalettesDisplay();
        this.dispatchEvent(new CustomEvent('paletteListChanged'));
    }

    updateCurrentPaletteDisplay() {
        this.currentPaletteElement.innerHTML = '';
        this.currentPalette.forEach((color, index) => {
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = color;
            colorBox.draggable = true;
            colorBox.addEventListener('click', () => this.openColorPicker(index));
            colorBox.addEventListener('dragstart', (e) => this.dragStart(e, index));
            colorBox.addEventListener('dragover', this.dragOver);
            colorBox.addEventListener('drop', (e) => this.drop(e, index));

            const deleteIcon = document.createElement('span');
            deleteIcon.innerHTML = '×';
            deleteIcon.className = 'delete-icon';
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeColor(index);
            });

            const lockIcon = document.createElement('span');
            lockIcon.innerHTML = '🔓';
            lockIcon.className = 'lock-icon';
            lockIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLock(index);
            });

            colorBox.appendChild(deleteIcon);
            colorBox.appendChild(lockIcon);
            this.currentPaletteElement.appendChild(colorBox);
        });

        // Add buttons
        const addButton = document.createElement('button');
        addButton.innerHTML = '+';
        addButton.addEventListener('click', () => this.addColor());

        const randomizeButton = document.createElement('button');
        randomizeButton.innerHTML = 'R';
        randomizeButton.addEventListener('click', () => this.randomizePalette());

        const saveButton = document.createElement('button');
        saveButton.innerHTML = 'S';
        saveButton.addEventListener('click', () => this.savePalette());

        this.currentPaletteElement.appendChild(addButton);
        this.currentPaletteElement.appendChild(randomizeButton);
        this.currentPaletteElement.appendChild(saveButton);
    }

    updateSavedPalettesDisplay() {
        this.paletteListElement.innerHTML = '';
        [...this.savedPalettes, ...this.predefinedPalettes].forEach((palette, index) => {
            const paletteItem = document.createElement('li');
            paletteItem.innerHTML = `
                <span class="palette-name" ${index < this.savedPalettes.length ? 'contenteditable="true"' : ''}>${palette.name}</span>
                ${palette.colors.map(color => `<div class="color-box small" style="background-color: ${color};"></div>`).join('')}
                <button class="use-palette">Use</button>
                ${index < this.savedPalettes.length ? '<button class="delete-palette">×</button>' : ''}
                <button class="export-palette">Export</button>
            `;
            paletteItem.querySelector('.palette-name').addEventListener('blur', (e) => {
                if (index < this.savedPalettes.length) {
                    this.renamePalette(index, e.target.textContent);
                }
            });
            paletteItem.querySelector('.use-palette').addEventListener('click', () => this.usePalette(index));
            if (index < this.savedPalettes.length) {
                paletteItem.querySelector('.delete-palette').addEventListener('click', () => this.deletePalette(index));
            }
            paletteItem.querySelector('.export-palette').addEventListener('click', () => this.exportPalette(index));
            this.paletteListElement.appendChild(paletteItem);
        });
    }

    usePalette(index) {
        const palette = index < this.savedPalettes.length ? this.savedPalettes[index] : this.predefinedPalettes[index - this.savedPalettes.length];
        this.setCurrentPalette([...palette.colors]);
    }

    deletePalette(index) {
        this.savedPalettes.splice(index, 1);
        this.updateSavedPalettesDisplay();
        this.dispatchEvent(new CustomEvent('paletteListChanged'));
    }

    renamePalette(index, newName) {
        this.savedPalettes[index].name = newName;
        this.dispatchEvent(new CustomEvent('paletteListChanged'));
    }

    exportPalette(index) {
        const palette = index < this.savedPalettes.length ? this.savedPalettes[index] : this.predefinedPalettes[index - this.savedPalettes.length];
        // Implement export functionality here
        console.log(`Exporting palette: ${palette.name}`);
    }

    openColorPicker(index) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = this.currentPalette[index];
        input.addEventListener('change', (e) => {
            this.currentPalette[index] = e.target.value;
            this.updateCurrentPaletteDisplay();
            this.dispatchEvent(new CustomEvent('paletteChanged'));
        });
        input.click();
    }

    toggleLock(index) {
        const colorBox = this.currentPaletteElement.children[index];
        const lockIcon = colorBox.querySelector('.lock-icon');
        if (lockIcon.innerHTML === '🔓') {
            lockIcon.innerHTML = '🔒';
            colorBox.draggable = false;
        } else {
            lockIcon.innerHTML = '🔓';
            colorBox.draggable = true;
        }
    }

    dragStart(e, index) {
        e.dataTransfer.setData('text/plain', index);
    }

    dragOver(e) {
        e.preventDefault();
    }

    drop(e, targetIndex) {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text'));
        if (sourceIndex !== targetIndex) {
            const [color] = this.currentPalette.splice(sourceIndex, 1);
            this.currentPalette.splice(targetIndex, 0, color);
            this.updateCurrentPaletteDisplay();
            this.dispatchEvent(new CustomEvent('paletteChanged'));
        }
    }

    getNextColorId() {
        const colorId = this.currentColorIndex;
        this.currentColorIndex = (this.currentColorIndex + 1) % this.currentPalette.length;
        return colorId;
    }

    getCurrentPaletteColor(colorId) {
        return this.currentPalette[colorId];
    }

    getCurrentPalette() {
        return this.currentPalette;
    }

    getColorById(colorId) {
        return this.currentPalette[colorId] || this.currentPalette[0];
    }

    addEventListener(event, callback) {
        document.addEventListener(event, callback);
    }

    dispatchEvent(event) {
        document.dispatchEvent(event);
    }
}