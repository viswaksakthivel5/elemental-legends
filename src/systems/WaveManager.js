/**
 * WaveManager.js
 * Controls game progression across 3 escalating waves:
 * Wave 1: Corrupted Soldiers
 * Wave 2: Elite Knights & Void Cultists
 * Wave 3: The Fallen King Boss Encounter
 */

import * as THREE from 'three';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { soundManager } from '../core/SoundManager.js';

export class WaveManager {
  constructor(scene, vfxManager) {
    this.scene = scene;
    this.vfx = vfxManager;

    this.currentWave = 0;
    this.enemies = [];
    this.boss = null;

    this.totalKills = 0;
    this.waveState = 'NOT_STARTED'; // 'NOT_STARTED', 'IN_PROGRESS', 'WAVE_CLEARED', 'BOSS_ACTIVE', 'ALL_CLEARED'
    this.transitionTimer = 0;

    // UI callbacks
    this.onWaveStart = null; // (waveNumber, waveTitle, objective)
    this.onWaveClear = null; // (waveNumber)
    this.onBossSpawn = null; // (boss)
    this.onVictory = null;

    // Projectile spawn listener for enemies
    this.onEnemyProjectile = null;
  }

  startFirstWave() {
    this.currentWave = 0;
    this._nextWave();
  }

  _nextWave() {
    this.currentWave++;

    // Clear any dead enemy meshes remaining
    this.enemies.forEach(e => {
      if (e.mesh && e.mesh.parent) this.scene.remove(e.mesh);
    });
    this.enemies = [];

    if (this.currentWave === 1) {
      // Wave 1: 4 Corrupted Soldiers
      this.waveState = 'IN_PROGRESS';
      if (this.onWaveStart) {
        this.onWaveStart(1, 'WAVE 1: CORRUPTED VANGUARD', 'Defeat the Fallen Soldiers (0/4)');
      }

      const spawnPoints = [
        new THREE.Vector3(-10, 0, -12),
        new THREE.Vector3(10, 0, -12),
        new THREE.Vector3(-6, 0, -18),
        new THREE.Vector3(6, 0, -18)
      ];

      spawnPoints.forEach(pos => {
        const enemy = new Enemy(this.scene, 'SOLDIER', pos);
        this.enemies.push(enemy);
        this.vfx.spawnShockwave(pos, 2.5, 0x661111);
      });

    } else if (this.currentWave === 2) {
      // Wave 2: 2 Elite Knights + 2 Void Cultists
      this.waveState = 'IN_PROGRESS';
      if (this.onWaveStart) {
        this.onWaveStart(2, 'WAVE 2: ABYSSAL ELITES', 'Eliminate the Elite Knights & Void Cultists (0/4)');
      }

      const knightSpawns = [
        new THREE.Vector3(-8, 0, -14),
        new THREE.Vector3(8, 0, -14)
      ];
      knightSpawns.forEach(pos => {
        const knight = new Enemy(this.scene, 'KNIGHT', pos);
        this.enemies.push(knight);
        this.vfx.spawnShockwave(pos, 3.2, 0x441111);
      });

      const cultistSpawns = [
        new THREE.Vector3(-14, 0, -22),
        new THREE.Vector3(14, 0, -22)
      ];
      cultistSpawns.forEach(pos => {
        const cultist = new Enemy(this.scene, 'CULTIST', pos);
        cultist.onSpawnProjectile = (orig, targ, type) => {
          if (this.onEnemyProjectile) this.onEnemyProjectile(orig, targ, type);
        };
        this.enemies.push(cultist);
        this.vfx.spawnShockwave(pos, 2.8, 0x9922ff);
      });

    } else if (this.currentWave === 3) {
      // Wave 3: The Fallen King Boss Battle!
      this.waveState = 'BOSS_ACTIVE';
      this.boss = new Boss(this.scene, new THREE.Vector3(0, 0, -22));

      this.boss.onSpawnTelegraph = (pos, radius, dur) => {
        this.vfx.spawnTelegraph(pos, radius, dur);
      };
      this.boss.onSpawnShockwave = (pos, radius) => {
        this.vfx.spawnShockwave(pos, radius, 0x7700ff);
      };
      this.boss.onSpawnProjectile = (orig, targ, type) => {
        if (this.onEnemyProjectile) this.onEnemyProjectile(orig, targ, type);
      };
      this.boss.onDefeat = () => {
        this.waveState = 'ALL_CLEARED';
        soundManager.playVictory();
        if (this.onVictory) this.onVictory();
      };

      if (this.onWaveStart) {
        this.onWaveStart(3, 'FINAL ENCOUNTER: THE FALLEN KING', 'Slay the Corrupted Sovereign of the Ruined Realm');
      }
      if (this.onBossSpawn) {
        this.onBossSpawn(this.boss);
      }
    }
  }

  update(dt, player, onDamagePlayer, cameraManager) {
    // 1. Update Normal Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, player.getPosition(), onDamagePlayer);

      if (!enemy.isAlive && enemy.stateTime >= 0.9) {
        this.totalKills++;
        this.enemies.splice(i, 1);
      }
    }

    // 2. Update Boss
    if (this.boss && this.boss.isAlive) {
      this.boss.update(dt, player.getPosition(), onDamagePlayer, cameraManager);
    }

    // 3. Check wave completion
    if (this.waveState === 'IN_PROGRESS' && this.enemies.length === 0) {
      this.waveState = 'WAVE_CLEARED';
      this.transitionTimer = 3.5;
      soundManager.playVictory();
      if (this.onWaveClear) this.onWaveClear(this.currentWave);
    }

    if (this.waveState === 'WAVE_CLEARED') {
      this.transitionTimer -= dt;
      if (this.transitionTimer <= 0) {
        this._nextWave();
      }
    }
  }

  getAliveEnemies() {
    return this.enemies.filter(e => e.isAlive);
  }

  getBoss() {
    return this.boss;
  }
}
