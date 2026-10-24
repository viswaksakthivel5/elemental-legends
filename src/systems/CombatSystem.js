/**
 * CombatSystem.js
 * Collision detection for melee swings, combo chaining, damage calculations,
 * elemental procs, knockback physics, and combo hit counter.
 */

import * as THREE from 'three';
import { soundManager } from '../core/SoundManager.js';

export class CombatSystem {
  constructor(vfxManager, cameraManager) {
    this.vfx = vfxManager;
    this.camera = cameraManager;

    this.hitEnemiesThisSwing = new Set();
    this.lastAttackState = null;

    // Combo statistics
    this.currentComboCount = 0;
    this.comboTimer = 0;
    this.maxComboAchieved = 0;
    this.totalDamageDealt = 0;

    this.onComboUpdate = null; // (comboCount, rank)
  }

  update(dt, player, enemies, boss) {
    // Reset hit cache when new attack starts
    if (player.state !== this.lastAttackState) {
      this.hitEnemiesThisSwing.clear();
      this.lastAttackState = player.state;
    }

    // Combo streak decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.currentComboCount = 0;
        if (this.onComboUpdate) this.onComboUpdate(0, '');
      }
    }

    // Check melee swing collision during active attack frames
    if (player.isWeaponActive) {
      this._checkPlayerMeleeHits(player, enemies, boss);
    }
  }

  _checkPlayerMeleeHits(player, enemies, boss) {
    const playerPos = player.getPosition();
    const playerFwd = player.getForward();

    let baseDamage = 18;
    let isHeavy = false;
    let hitRange = 2.8;

    if (player.state === 'ATTACK1') {
      baseDamage = 18;
    } else if (player.state === 'ATTACK2') {
      baseDamage = 24;
    } else if (player.state === 'ATTACK3') {
      baseDamage = 34;
      hitRange = 3.2;
    } else if (player.state === 'HEAVY_ATTACK') {
      baseDamage = 56;
      isHeavy = true;
      hitRange = 3.6;
    }

    baseDamage *= (player.damageMultiplier || 1.0);

    // Check normal enemies
    enemies.forEach(enemy => {
      if (!enemy.isAlive || this.hitEnemiesThisSwing.has(enemy)) return;

      const enemyPos = enemy.getPosition();
      const dist = playerPos.distanceTo(enemyPos);

      if (dist <= hitRange) {
        const toEnemy = new THREE.Vector3().subVectors(enemyPos, playerPos).normalize();
        const dot = playerFwd.dot(toEnemy);

        // 130 degree cone in front of player
        if (dot > 0.1 || dist < 1.4) {
          this.hitEnemiesThisSwing.add(enemy);
          this._applyHit(enemy, baseDamage, player.element, isHeavy, playerFwd);
        }
      }
    });

    // Check Boss
    if (boss && boss.isAlive && !this.hitEnemiesThisSwing.has(boss)) {
      const bossPos = boss.getPosition();
      const dist = playerPos.distanceTo(bossPos);

      if (dist <= hitRange + 1.8) {
        const toBoss = new THREE.Vector3().subVectors(bossPos, playerPos).normalize();
        const dot = playerFwd.dot(toBoss);

        if (dot > 0.05 || dist < 2.5) {
          this.hitEnemiesThisSwing.add(boss);
          this._applyHitToBoss(boss, baseDamage, player.element, isHeavy);
        }
      }
    }
  }

  _applyHit(enemy, damage, element, isHeavy, hitDir) {
    const isCrit = Math.random() < 0.25 || isHeavy;
    const finalDamage = isCrit ? damage * 1.5 : damage;

    enemy.takeDamage(finalDamage, element, true);
    this.totalDamageDealt += finalDamage;

    // Knockback
    const knockback = isHeavy ? 2.5 : 0.8;
    enemy.position.addScaledVector(hitDir, knockback);

    // Visuals & Sound
    this.vfx.spawnHitSparks(enemy.getPosition(), element, isHeavy ? 24 : 14);
    this.vfx.spawnDamageText(enemy.getPosition(), finalDamage, isCrit, element);
    this.camera.addScreenShake(isHeavy ? 0.45 : 0.15);

    // Increment combo
    this._addCombo();

    // Storm Chain Lightning Proc
    if (element === 'STORM' && Math.random() < 0.4) {
      soundManager.playSkill('STORM');
      this.vfx.spawnShockwave(enemy.getPosition(), 2.2, 0x66ccff);
    }
  }

  _applyHitToBoss(boss, damage, element, isHeavy) {
    const isCrit = Math.random() < 0.25 || isHeavy;
    const finalDamage = isCrit ? damage * 1.4 : damage;

    boss.takeDamage(finalDamage, element);
    this.totalDamageDealt += finalDamage;

    this.vfx.spawnHitSparks(boss.getPosition(), element, isHeavy ? 28 : 16);
    this.vfx.spawnDamageText(boss.getPosition(), finalDamage, isCrit, element);
    this.camera.addScreenShake(isHeavy ? 0.5 : 0.2);

    this._addCombo();
  }

  _addCombo() {
    this.currentComboCount++;
    this.comboTimer = 2.8;
    if (this.currentComboCount > this.maxComboAchieved) {
      this.maxComboAchieved = this.currentComboCount;
    }

    let rank = 'D';
    if (this.currentComboCount >= 20) rank = 'S';
    else if (this.currentComboCount >= 14) rank = 'A';
    else if (this.currentComboCount >= 8) rank = 'B';
    else if (this.currentComboCount >= 4) rank = 'C';

    if (this.onComboUpdate) {
      this.onComboUpdate(this.currentComboCount, rank);
    }
  }
}
