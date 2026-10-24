/**
 * Engine.js - Level 4 Central Game Director
 * Coordinates 3D rendering, LevelManager (5 distinct playable levels),
 * EchoVisionManager (signature mechanic), SaveManager, Elemental combat,
 * Camera tracking, Audio, and UI.
 */

import * as THREE from 'three';
import { GameRenderer } from './Renderer.js';
import { CameraManager } from './CameraManager.js';
import { InputManager } from './InputManager.js';
import { soundManager } from './SoundManager.js';
import { Player } from '../entities/Player.js';
import { VFXManager } from '../systems/VFXManager.js';
import { ElementalSystem } from '../systems/ElementalSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { PuzzleManager } from '../systems/PuzzleManager.js';
import { EchoVisionManager } from '../systems/EchoVisionManager.js';
import { LevelManager } from '../world/LevelManager.js';
import { UIManager } from '../ui/UIManager.js';
import { SaveManager } from '../systems/SaveManager.js';

export class GameEngine {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // Core Three.js Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );

    // Systems
    this.renderer = new GameRenderer(this.container);
    this.renderer.setupPostProcessing(this.scene, this.camera);

    this.cameraManager = new CameraManager(this.camera, this.renderer.getDomElement());
    this.inputManager = new InputManager();
    this.inputManager.init(this.renderer.getDomElement());

    this.vfxManager = new VFXManager(this.scene, this.camera);
    this.puzzleManager = new PuzzleManager(this.scene, this.vfxManager);
    this.elementalSystem = new ElementalSystem(this.scene, this.vfxManager);
    this.combatSystem = new CombatSystem(this.vfxManager, this.cameraManager);

    // Echo Vision Signature Mechanic
    this.echoVisionManager = new EchoVisionManager(this.scene, this.camera);

    // Initial Hero Player Entity
    this.player = new Player(this.scene);
    this.player.position.set(0, 0, 18);
    this.player.mesh.position.copy(this.player.position);
    this.cameraManager.snapToTarget(this.player.getPosition());

    // Level 4 Multi-Level Campaign Manager
    this.levelManager = new LevelManager(this);

    // UI Manager
    this.uiManager = new UIManager(this);

    // Connect Echo Vision callback to UI
    this.echoVisionManager.onToggle = (isActive) => {
      this.uiManager.setEchoVisionStatus(isActive);
    };

    // Connect Puzzle Manager UI callbacks
    this.puzzleManager.onPromptChange = (prompt) => {
      this.uiManager.setInteractionPrompt(prompt);
    };
    this.puzzleManager.onClueOpen = (clue) => {
      this.uiManager.showClue(clue.title, clue.text);
    };
    this.puzzleManager.onObjectiveUpdate = (desc) => {
      const meta = this.levelManager ? this.levelManager.currentLevelIndex : 1;
      this.uiManager.setObjective(`OBJECTIVE`, desc);
    };

    // Game lifecycle state
    this.gameState = 'TITLE'; // 'TITLE', 'PLAYING', 'PAUSED', 'LEVEL_CLEAR', 'DEFEAT', 'VICTORY'
    this.clock = new THREE.Clock();
    this.gameStartTime = 0;
    this.totalGameTime = 0;

    // Load initial title environment (Village preview)
    this.levelManager.loadLevel(1);

    // Resize listener
    window.addEventListener('resize', () => {
      this.renderer.onResize(this.camera);
    });

    // Start render loop
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  startLevel(levelNum) {
    this.levelManager.loadLevel(levelNum);

    this.combatSystem.maxComboAchieved = 0;
    this.combatSystem.totalDamageDealt = 0;
    this.combatSystem.currentComboCount = 0;

    this.totalGameTime = 0;
    this.gameStartTime = performance.now();
    this.gameState = 'PLAYING';
    this.cameraManager.isCinematic = false;

    // Request pointer lock for immediate action
    this.inputManager.requestPointerLock();
  }

  startNewGame() {
    this.startLevel(1);
  }

  resumeGame() {
    this.gameState = 'PLAYING';
    this.uiManager.hidePauseMenu();
    this.inputManager.requestPointerLock();
  }

  pauseGame() {
    if (this.gameState !== 'PLAYING') return;
    this.gameState = 'PAUSED';
    this.uiManager.showPauseMenu();
    this.inputManager.exitPointerLock();
  }

  returnToTitle() {
    this.gameState = 'TITLE';
    this.inputManager.exitPointerLock();
    soundManager.stopBGM();
    if (this.echoVisionManager && this.echoVisionManager.isActive) {
      this.echoVisionManager.deactivate();
    }
  }

  _loop() {
    requestAnimationFrame(this._loop);

    try {
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Cap delta time

      if (this.gameState === 'PLAYING') {
        this.totalGameTime += dt;

        // 1. Check Pause Key (ESC)
        if (this.inputManager.consumeAction('pause')) {
          this.pauseGame();
          return;
        }

        // 2. Check Echo Vision Toggle (V / C)
        if (this.inputManager.consumeAction('echoVision')) {
          this.echoVisionManager.toggle();
        }

        // 3. Check Interaction / Read Clue (E)
        if (this.inputManager.consumeAction('interact')) {
          if (this.uiManager.isClueOpen()) {
            this.uiManager.hideClue();
          } else {
            this.levelManager.onPlayerInteract(this.player);
          }
        }

        // 4. Check Target Lock Toggle (TAB)
        if (this.inputManager.consumeAction('lockTarget')) {
          const aliveEnemies = this.levelManager.getAliveEnemies();
          const boss = this.levelManager.getBoss();
          let targetCandidate = null;

          if (boss && boss.isAlive) {
            targetCandidate = boss;
          } else if (aliveEnemies.length > 0) {
            targetCandidate = aliveEnemies[0];
          }

          this.cameraManager.toggleLockOn(targetCandidate);
        }

        // 5. Check Skill (Q / F) & Ultimate (R)
        if (this.inputManager.consumeAction('skill')) {
          this.elementalSystem.castSkill(
            this.player,
            this.levelManager.getAliveEnemies(),
            this.levelManager.getBoss(),
            this.cameraManager
          );
          this.puzzleManager.checkAttackPuzzleTriggers(this.player.getPosition(), this.player.element);
        }

        if (this.inputManager.consumeAction('ultimate')) {
          this.elementalSystem.castUltimate(
            this.player,
            this.levelManager.getAliveEnemies(),
            this.levelManager.getBoss(),
            this.cameraManager
          );
          this.puzzleManager.checkAttackPuzzleTriggers(this.player.getPosition(), this.player.element);
        }

        // 6. Check Melee weapon strikes triggering puzzles
        if (this.player.isWeaponActive) {
          this.puzzleManager.checkAttackPuzzleTriggers(this.player.getPosition(), this.player.element);
        }

        // 7. Update Player
        this.player.update(dt, this.inputManager, this.cameraManager);

        // 8. Check Player Death
        if (!this.player.isAlive && this.gameState !== 'DEFEAT') {
          this.gameState = 'DEFEAT';
          this.inputManager.exitPointerLock();
          soundManager.playGameOver();
          setTimeout(() => {
            this.uiManager.showDefeat({
              maxCombo: this.combatSystem.maxComboAchieved,
              totalDamage: Math.round(this.combatSystem.totalDamageDealt),
              kills: this.levelManager.totalKillsThisLevel
            });
          }, 1600);
        }

        // 9. Update Active Level Entities & Objectives
        this.levelManager.update(dt, this.player, (dmg) => {
          const damaged = this.player.takeDamage(dmg);
          if (damaged) {
            this.uiManager.triggerDamageVignette();
            this.cameraManager.addScreenShake(0.35);
          }
        }, this.cameraManager);

        // 10. Update Combat Hits & Melee Collisions
        this.combatSystem.update(
          dt,
          this.player,
          this.levelManager.getAliveEnemies(),
          this.levelManager.getBoss()
        );

        // 11. Update Elemental System & Projectiles
        this.elementalSystem.update(
          dt,
          this.player,
          this.levelManager.getAliveEnemies(),
          this.levelManager.getBoss(),
          this.cameraManager
        );

        // 12. Update Environmental Puzzles & Clue Proximity
        this.puzzleManager.update(
          dt,
          this.player.getPosition(),
          this.player.element,
          this.cameraManager
        );

        // 13. Update Echo Vision
        this.echoVisionManager.update(dt, this.player.getPosition());

        // 14. Update VFX & Particles
        this.vfxManager.update(dt);

        // 15. Update Camera Tracking
        this.cameraManager.update(dt, this.player.getPosition(), this.inputManager);

        // 16. Update HUD Displays
        this.uiManager.updateHUD(this.player, this.combatSystem);

      } else if (this.gameState === 'TITLE' || this.gameState === 'PAUSED' || this.gameState === 'LEVEL_CLEAR' || this.gameState === 'VICTORY') {
        // Idle world ambient particles during menus or victory
        this.vfxManager.update(dt);

        if (this.player) {
          if (this.gameState === 'TITLE') {
            // Slow cinematic orbit showcasing warrior and atmosphere
            this.cameraManager.yaw += dt * 0.22;
            this.cameraManager.pitch = 0.16;
            this.cameraManager.targetDistance = 4.2;
            this.cameraManager.update(dt, this.player.getPosition(), this.inputManager);
          } else {
            this.cameraManager.update(dt, this.player.getPosition(), this.inputManager);
          }
        }
      }

      // Render Scene
      this.renderer.render(this.scene, this.camera);
    } catch (err) {
      console.error('[Elemental Legends] Loop error:', err);
    }
  }
}
