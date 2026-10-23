/**
 * main.js
 * Application entry point for ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM.
 */

import { GameEngine } from './core/Engine.js';

function initGame() {
  if (window.game) return;
  try {
    window.game = new GameEngine();
    console.log('[Elemental Legends] 3D Game Engine successfully initialized.');
  } catch (err) {
    console.error('[Elemental Legends] Failed to initialize GameEngine:', err);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGame);
} else {
  // DOM is already ready
  initGame();
}
