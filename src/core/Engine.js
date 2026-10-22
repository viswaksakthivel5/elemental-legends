/**
 * Engine.js
 * Central game director and orchestration loop.
 * Integrates 3D rendering, combat physics, AI, audio, camera, and UI.
 */

import * as THREE from 'three';
import { GameRenderer } from './Renderer.js';
import { CameraManager } from './CameraManager.js';
import { InputManager } from './InputManager.js';
import { soundManager } from './SoundManager.js';
import { World } from '../world/World.js';
import { Player } from '../entities/Player.js';
import { VFXManager } from '../systems/VFXManager.js';
import { ElementalSystem } from '../systems/ElementalSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { WaveManager } from '../systems/WaveManager.js';
import { UIManager } from '../ui/UIManager.js';

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
    this.elementalSystem = new ElementalSystem(this.scene, this.vfxManager);
    this.combatSystem = new CombatSystem(this.vfxManager, this.cameraManager);
    this.world = new World(this.scene);

    this.player = null;
    this.waveManager = null;
    this.uiManager = new UIManager(this);

    // Game lifecycle state
    this.gameState = 'TITLE'; // 'TITLE', 'PLAYING', 'PAUSED', 'DEFEAT', 'VICTORY'
    this.clock = new THREE.Clock();
    this.gameStartTime = 0;
    this.totalGameTime = 0;

    // Resize listener
    window.addEventListener('resize', () => {
      this.renderer.onResize(this.camera);
    });

    // Start render loop
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  startNewGame() {
    // Clean up old entities if restarting
    if (this.player && this.player.mesh) {
      this.scene.remove(this.player.mesh);
    }
    if (this.waveManager) {
      this.waveManager.enemies.forEach(e => {
        if (e.mesh && e.mesh.parent) this.scene.remove(e.mesh);
      });
      if (this.waveManager.boss && this.waveManager.boss.mesh) {
        this.scene.remove(this.waveManager.boss.mesh);
      }
    }

    // Spawn new Player
    this.player = new Player(this.scene);
    this.player.position.set(0, 0, 10);
    this.player.mesh.position.copy(this.player.position);

    // Spawn Wave Manager
    this.waveManager = new WaveManager(this.scene, this.vfxManager);

    this.waveManager.onWaveStart = (wNum, title, desc) => {
      this.uiManager.setObjective(title, desc);
    };

    this.waveManager.onEnemyProjectile = (origin, target, type) => {
      this.elementalSystem.spawnEnemyProjectile(origin, target, type);
    };

    this.waveManager.onVictory = () => {
      this.gameState = 'VICTORY';
      this.cameraManager.isCinematic = true;
      const minutes = Math.floor(this.totalGameTime / 60);
      const seconds = Math.floor(this.totalGameTime % 60);
      const timeStr = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      setTimeout(() => {
        this.uiManager.showVictory({
          time: timeStr,
          maxCombo: this.combatSystem.maxComboAchieved,
          totalDamage: Math.round(this.combatSystem.totalDamageDealt)
        });
        this.inputManager.exitPointerLock();
      }, 2500);
    };

    this.combatSystem.maxComboAchieved = 0;
    this.combatSystem.totalDamageDealt = 0;
    this.combatSystem.currentComboCount = 0;

    this.totalGameTime = 0;
    this.gameStartTime = performance.now();
    this.gameState = 'PLAYING';
    this.cameraManager.isCinematic = false;

    // Start BGM and first wave
    soundManager.startBGM();
    soundManager.setCombatIntensity(1);
    this.waveManager.startFirstWave();

    // Request pointer lock for immediate action
    this.inputManager.requestPointerLock();
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
  }

  _loop() {
    requestAnimationFrame(this._loop);

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // Cap delta time to prevent physics anomalies

    if (this.gameState === 'PLAYING') {
      this.totalGameTime += dt;

      // Check Pause Key
      if (this.inputManager.consumeAction('pause')) {
        this.pauseGame();
        return;
      }

      // Check Target Lock Toggle
      if (this.inputManager.consumeAction('lockTarget')) {
        const aliveEnemies = this.waveManager.getAliveEnemies();
        const boss = this.waveManager.getBoss();
        let targetCandidate = null;

        if (boss && boss.isAlive) {
          targetCandidate = boss;
        } else if (aliveEnemies.length > 0) {
          targetCandidate = aliveEnemies[0];
        }

        this.cameraManager.toggleLockOn(targetCandidate);
      }

      // Check Skill (Q) & Ultimate (R)
      if (this.inputManager.consumeAction('skill')) {
        this.elementalSystem.castSkill(
          this.player,
          this.waveManager.getAliveEnemies(),
          this.waveManager.getBoss(),
          this.cameraManager
        );
      }

      if (this.inputManager.consumeAction('ultimate')) {
        this.elementalSystem.castUltimate(
          this.player,
          this.waveManager.getAliveEnemies(),
          this.waveManager.getBoss(),
          this.cameraManager
        );
      }

      // Update Player
      this.player.update(dt, this.inputManager, this.cameraManager);

      // Check Player Death
      if (!this.player.isAlive && this.gameState !== 'DEFEAT') {
        this.gameState = 'DEFEAT';
        this.inputManager.exitPointerLock();
        setTimeout(() => {
          this.uiManager.showDefeat({
            wave: this.waveManager.currentWave,
            maxCombo: this.combatSystem.maxComboAchieved,
            totalDamage: Math.round(this.combatSystem.totalDamageDealt),
            kills: this.waveManager.totalKills
          });
        }, 1600);
      }

      // Update Wave Manager & Enemies
      this.waveManager.update(dt, this.player, (dmg) => {
        const damaged = this.player.takeDamage(dmg);
        if (damaged) {
          this.uiManager.triggerDamageVignette();
          this.cameraManager.addScreenShake(0.35);
        }
      }, this.cameraManager);

      // Update Combat Hits & Melee Collisions
      this.combatSystem.update(
        dt,
        this.player,
        this.waveManager.getAliveEnemies(),
        this.waveManager.getBoss()
      );

      // Update Elemental System & Projectiles
      this.elementalSystem.update(
        dt,
        this.player,
        this.waveManager.getAliveEnemies(),
        this.waveManager.getBoss(),
        this.cameraManager
      );

      // Update World animations & lighting
      this.world.update(dt, this.player.element);

      // Update VFX & Particles
      this.vfxManager.update(dt);

      // Update Camera Tracking
      this.cameraManager.update(dt, this.player.getPosition(), this.inputManager);

      // Update HUD Displays
      this.uiManager.updateHUD(this.player, this.waveManager, this.combatSystem);

    } else if (this.gameState === 'TITLE' || this.gameState === 'PAUSED' || this.gameState === 'VICTORY') {
      // Idle world rotation / particles during menus or cinematic victory
      this.world.update(dt, 'FIRE');
      this.vfxManager.update(dt);

      if (this.player) {
        this.cameraManager.update(dt, this.player.getPosition(), this.inputManager);
      } else {
        // Orbit around arena center
        const dummyPos = new THREE.Vector3(0, 1.5, 0);
        this.cameraManager.yaw += dt * 0.15;
        this.cameraManager.update(dt, dummyPos, this.inputManager);
      }
    }

    // Render Scene with Bloom Post-Processing
    this.renderer.render(this.scene, this.camera);
  }
}
