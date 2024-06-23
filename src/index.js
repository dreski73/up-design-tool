import './styles.css';
import { run } from './app';

if (!window.__appInitialized) {
  window.__appInitialized = true;
  document.addEventListener('DOMContentLoaded', () => {
    run();
  });
}