import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function createPattern() {
  console.log('Creating pattern...');
  const patternCanvas = document.getElementById('patternCanvas');

  if (!patternCanvas) {
    console.error('Pattern canvas element not found');
    return;
  }

  const ctx = patternCanvas.getContext('2d');

  if (!ctx) {
    console.error('Canvas context not found');
    return;
  }

  console.log('Clearing the canvas...');
  ctx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  console.log('Pattern created');
}

export function exportPatternAsImage(format) {
  console.log(`Exporting pattern as ${format}`);
  const patternCanvas = document.getElementById('patternCanvas');

  if (!patternCanvas) {
    console.error('Pattern canvas element not found');
    return;
  }

  if (format === 'png') {
    patternCanvas.toBlob(function(blob) {
      saveAs(blob, 'pattern.png');
    });
  } else if (format === 'jpeg') {
    patternCanvas.toBlob(function(blob) {
      saveAs(blob, 'pattern.jpeg');
    }, 'image/jpeg');
  }
}

export function exportPatternAsPDF() {
  console.log('Exporting pattern as PDF');
  const patternCanvas = document.getElementById('patternCanvas');

  if (!patternCanvas) {
    console.error('Pattern canvas element not found');
    return;
  }

  html2canvas(patternCanvas).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10);
    pdf.save('pattern.pdf');
  }).catch(error => {
    console.error('Error exporting pattern as PDF:', error);
  });
}