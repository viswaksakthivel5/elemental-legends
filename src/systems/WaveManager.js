/**
 * WaveManager.js - Level 3 Dark-Fantasy Adventure Progression
 * Manages connected zone transitions, enemy spawns, puzzle gates, and The Hollow Guardian boss:
 * Zone 1: The Forgotten Village (2 Cursed Wanderers + 3 Braziers Fire Puzzle)
 * Zone 2: The Haunted Forest (2 Cursed Wanderers + 2 Void Wraiths + Canal Ice Puzzle)
 * Zone 3: The Ancient Shrine (2 Elite Knights + Lightning Conduit Storm Puzzle)
 * Zone 4: The Ruined Fortress (The Hollow Guardian Epic Boss Encounter)
 */

import * as THREE from 'three';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { soundManager } from '../core/SoundManager.js';

export class WaveManager {
  constructor(scene, vfxManager, puzzleManager) {
    this.scene = scene;
    this.vfx = vfxManager;
    this.puzzleManager = puzzleManager;

    this.currentZone = 1; // 1 = Village, 2 = Forest, 3 = Shrine, 4 = Boss
    this.enemies = [];
    this.boss = null;

    this.totalKills = 0;
    this.zoneState = 'VILLAGE'; // 'VILLAGE', 'FOREST', 'SHRINE', 'BOSS', 'CLEANSED'

    // Flags for zone triggers
    this.hasSpawnedForestEnemies = false;
    this.hasSpawnedShrineEnemies = false;
    this.hasSpawnedBoss = false;

    // UI callbacks
    this.onZoneObjective = null; // (zoneTitle, objectiveText)
    this.onBossSpawn = null; // (boss)
    this.onVictory = null;

    // Projectile spawn listener for enemies
    this.onEnemyProjectile = null;
  }

  startAdventure() {
    this.currentZone = 1;
    this.zoneState = 'VILLAGE';
    this._spawnVillageEnemies();

    if (this.onZoneObjective) {
      this.onZoneObjective(
        'CHAPTER I: THE FORGOTTEN VILLAGE',
        'Inspect the Elder’s Journal and ignite 3 Braziers with Fire to open the Forest Gate.'
      );
    }
  }

  _spawnVillageEnemies() {
    const wandererSpawns = [
      new THREE.Vector3(-5, 0, 16),
      new THREE.Vector3(5, 0, 11)
    ];

    wandererSpawns.forEach(pos => {
      const enemy = new Enemy(this.scene, 'SOLDIER', pos);
      this.enemies.push(enemy);
      this.vfx.spawnShockwave(pos, 2.4, 0x442211);
    });
  }

  _spawnForestEnemies() {
    if (this.hasSpawnedForestEnemies) return;
    this.hasSpawnedForestEnemies = true;
    this.currentZone = 2;
    this.zoneState = 'FOREST';

    if (this.onZoneObjective) {
      this.onZoneObjective(
        'CHAPTER II: THE HAUNTED FOREST',
        'Find the Scholar’s Parchment and cast Ice magic to freeze the Corrupted Canal.'
      );
    }

    // 2 Wanderers + 2 Void Wraiths in Forest
    const forestSpawns = [
      { type: 'SOLDIER', pos: new THREE.Vector3(-6, 0, 1) },
      { type: 'SOLDIER', pos: new THREE.Vector3(6, 0, -2) },
      { type: 'CULTIST', pos: new THREE.Vector3(-10, 0, -6) },
      { type: 'CULTIST', pos: new THREE.Vector3(10, 0, -7) }
    ];

    forestSpawns.forEach(s => {
      const enemy = new Enemy(this.scene, s.type, s.pos);
      if (s.type === 'CULTIST') {
        enemy.onSpawnProjectile = (orig, targ, type) => {
          if (this.onEnemyProjectile) this.onEnemyProjectile(orig, targ, type);
        };
      }
      this.enemies.push(enemy);
      this.vfx.spawnShockwave(s.pos, 2.8, s.type === 'CULTIST' ? 0x7700ff : 0x442211);
    });
  }

  _spawnShrineEnemies() {
    if (this.hasSpawnedShrineEnemies) return;
    this.hasSpawnedShrineEnemies = true;
    this.currentZone = 3;
    this.zoneState = 'SHRINE';

    if (this.onZoneObjective) {
      this.onZoneObjective(
        'CHAPTER III: THE ANCIENT SHRINE',
        'Read the Warden’s Inscription and strike the Lightning Conduit with Storm magic.'
      );
    }

    // 2 Elite Knights guarding the path to the Fortress Portcullis
    const shrineSpawns = [
      new THREE.Vector3(-6, 0, -17),
      new THREE.Vector3(6, 0, -19)
    ];

    shrineSpawns.forEach(pos => {
      const knight = new Enemy(this.scene, 'KNIGHT', pos);
      this.enemies.push(knight);
      this.vfx.spawnShockwave(pos, 3.2, 0x441111);
    });
  }

  _spawnBoss() {
    if (this.hasSpawnedBoss) return;
    this.hasSpawnedBoss = true;
    this.currentZone = 4;
    this.zoneState = 'BOSS';

    this.boss = new Boss(this.scene, new THREE.Vector3(0, 0, -37));

    this.boss.onSpawnTelegraph = (pos, radius, dur) => {
      this.vfx.spawnTelegraph(pos, radius, dur);
    };
    this.boss.onSpawnShockwave = (pos, radius) => {
      this.vfx.spawnShockwave(pos, radius, 0x8800ff);
    };
    this.boss.onSpawnProjectile = (orig, targ, type) => {
      if (this.onEnemyProjectile) this.onEnemyProjectile(orig, targ, type);
    };
    this.boss.onDefeat = () => {
      this.zoneState = 'CLEANSED';
      soundManager.playVictory();
      if (this.onVictory) this.onVictory();
    };

    if (this.onZoneObjective) {
      this.onZoneObjective(
        'FINAL CONFRONTATION: THE HOLLOW GUARDIAN',
        'Vanquish the corrupted guardian to cleanse the Hollow Realm!'
      );
    }
    if (this.onBossSpawn) {
      this.onBossSpawn(this.boss);
    }
  }

  update(dt, player, onDamagePlayer, cameraManager) {
    const playerPos = player.getPosition();

    // 1. Zone Trigger Checks based on player position & puzzle states
    if (this.puzzleManager) {
      // Enter Forest when village gate is unlocked and player walks past Z = 4.5
      if (this.puzzleManager.villageGateUnlocked && playerPos.z < 4.0 && !this.hasSpawnedForestEnemies) {
        this._spawnForestEnemies();
      }

      // Enter Shrine when canal is frozen and player walks past Z = -13
      if (this.puzzleManager.canalFrozen && playerPos.z < -13.0 && !this.hasSpawnedShrineEnemies) {
        this._spawnShrineEnemies();
      }

      // Enter Fortress Sanctum when portcullis is raised and player walks past Z = -26
      if (this.puzzleManager.portcullisRaised && playerPos.z < -26.0 && !this.hasSpawnedBoss) {
        this._spawnBoss();
      }
    }

    // 2. Update Active Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, playerPos, onDamagePlayer);

      if (!enemy.isAlive && enemy.stateTime >= 0.9) {
        this.totalKills++;
        this.enemies.splice(i, 1);
      }
    }

    // 3. Update Boss
    if (this.boss && this.boss.isAlive) {
      this.boss.update(dt, playerPos, onDamagePlayer, cameraManager);
    }
  }

  getAliveEnemies() {
    return this.enemies.filter(e => e.isAlive);
  }

  getBoss() {
    return this.boss;
  }

  get currentWave() {
    return this.currentZone;
  }

  startFirstWave() {
    this.startAdventure();
  }
}
