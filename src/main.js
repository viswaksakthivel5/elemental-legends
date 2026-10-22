/**
 * main.js
 * Application entry point for ELEMENTAL LEGENDS: RISE OF THE FALLEN KING.
 */

import { GameEngine } from './core/Engine.js';

window.addEventListener('DOMContentLoaded', () => {
  // Initialize the 3D Game Engine
  window.game = new GameEngine();
});
