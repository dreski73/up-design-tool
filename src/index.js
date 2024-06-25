import './styles.css';
import App from './app';

if (!window.__appInitialized) {
  window.__appInitialized = true;

  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
}