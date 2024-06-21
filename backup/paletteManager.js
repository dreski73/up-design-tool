import jsPDF from 'jspdf';

export function addColor() {
  const colorPicker = document.querySelector('.color-picker');
  console.log('Color Picker Element:', colorPicker); // Debugging statement
  if (!colorPicker) {
    console.error('Color picker element not found');
    return;
  }
  const color = colorPicker.value;
  const colorDiv = document.createElement('div');
  colorDiv.style.backgroundColor = color;
  colorDiv.className = 'color-box';
  colorDiv.textContent = color;
  colorDiv.addEventListener('click', () => toggleLockColor(colorDiv));
  document.getElementById('colors').appendChild(colorDiv);
}

function toggleLockColor(colorDiv) {
  if (colorDiv.classList.contains('locked')) {
    colorDiv.classList.remove('locked');
  } else {
    colorDiv.classList.add('locked');
  }
}

export function savePalette() {
  const colors = Array.from(document.getElementById('colors').children).map(div => ({
    color: div.style.backgroundColor,
    locked: div.classList.contains('locked')
  }));
  const paletteName = document.getElementById('paletteName').value || 'Unnamed Palette';
  const palettes = JSON.parse(localStorage.getItem('colorPalettes') || '[]');
  palettes.push({ name: paletteName, colors });
  localStorage.setItem('colorPalettes', JSON.stringify(palettes));
  alert('Palette saved!');
}

export function loadPalette() {
  const palettes = JSON.parse(localStorage.getItem('colorPalettes') || '[]');
  const paletteName = prompt('Enter the name of the palette to load:');
  const palette = palettes.find(p => p.name === paletteName);
  if (palette) {
    const colorsDiv = document.getElementById('colors');
    colorsDiv.innerHTML = '';
    palette.colors.forEach(({ color, locked }) => {
      const colorDiv = document.createElement('div');
      colorDiv.style.backgroundColor = color;
      colorDiv.className = 'color-box';
      colorDiv.textContent = color;
      if (locked) {
        colorDiv.classList.add('locked');
      }
      colorDiv.addEventListener('click', () => toggleLockColor(colorDiv));
      colorsDiv.appendChild(colorDiv);
    });
  } else {
    alert('Palette not found!');
  }
}

export function exportPaletteAsPDF() {
  const doc = new jsPDF();
  const colors = Array.from(document.getElementById('colors').children).map(div => div.style.backgroundColor);
  const paletteName = document.getElementById('paletteName').value || 'Unnamed Palette';

  doc.text(`Palette: ${paletteName}`, 10, 10);
  colors.forEach((color, index) => {
    doc.setFillColor(color);
    doc.rect(10, 20 + index * 10, 10, 10, 'F');
    doc.text(color, 25, 25 + index * 10);
  });

  doc.save(`${paletteName}.pdf`);
}
