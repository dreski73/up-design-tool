// Generate a random color in hexadecimal format
export function generateRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Convert hex color to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex color
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Clamp a number between a min and max value
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// Create a deep clone of an object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Debounce function to limit how often a function is called
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
      const later = () => {
          clearTimeout(timeout);
          func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
}