/**
 * ElementalSystem.js
 * Implements the 3 elemental powers: Fire, Ice, Storm.
 * Manages active skills (Q), ultimates (R), elemental passives, and projectile spawning.
 */

import * as THREE from 'three';
import { Projectile } from '../entities/Projectile.js';
import { soundManager } from '../core/SoundManager.js';

export class ElementalSystem {
  constructor(scene, vfxManager) {
    this.scene = scene;
    this.vfx = vfxManager;
    this.projectiles = [];
  }

  update(dt, player, enemies, boss, cameraManager) {
    // Update active projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, player, enemies, boss, (hitPos, element) => {
        this.vfx.spawnHitSparks(hitPos, element, 18);
        cameraManager.addScreenShake(0.2);
      });
      if (proj.isDead) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // --- CAST ELEMENTAL SKILL (Q / F) ---
  castSkill(player, enemies, boss, cameraManager) {
    if (player.skillCooldown > 0 || player.energy < 25) return false;

    player.energy -= 25;
    player.skillCooldown = player.maxSkillCooldown;
    const element = player.element;

    soundManager.playSkill(element);

    const fwd = player.getForward();
    const spawnPos = player.getPosition().clone();
    spawnPos.y += 1.2;

    if (element === 'FIRE') {
      // Fire: Flame Wave Projectile
      this.projectiles.push(new Projectile(this.scene, {
        type: 'FIRE_WAVE',
        origin: spawnPos,
        target: spawnPos.clone().addScaledVector(fwd, 25),
        speed: 22.0,
        damage: 42,
        isFromPlayer: true,
        element: 'FIRE'
      }));
      cameraManager.addScreenShake(0.3);
      this.vfx.spawnShockwave(player.getPosition(), 3.5, 0xff4400);

    } else if (element === 'ICE') {
      // Ice: Glacial Spikes (triple piercing projectiles in fan spread)
      for (let angleOffset of [-0.2, 0, 0.2]) {
        const dir = fwd.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angleOffset);
        this.projectiles.push(new Projectile(this.scene, {
          type: 'ICE_SPIKE',
          origin: spawnPos,
          target: spawnPos.clone().addScaledVector(dir, 28),
          speed: 24.0,
          damage: 32,
          isFromPlayer: true,
          element: 'ICE'
        }));
      }
      cameraManager.addScreenShake(0.25);
      this.vfx.spawnShockwave(player.getPosition(), 3.2, 0x00c3ff);

    } else if (element === 'STORM') {
      // Storm: Thunder Dash through enemies!
      const dashDist = 9.0;
      const targetPos = player.getPosition().clone().addScaledVector(fwd, dashDist);

      // Damage & shock all enemies in dash corridor
      enemies.forEach(e => {
        if (e.isAlive && player.getPosition().distanceTo(e.getPosition()) < dashDist + 1.5) {
          e.takeDamage(38, 'STORM', true);
          this.vfx.spawnHitSparks(e.getPosition(), 'STORM', 20);
        }
      });

      if (boss && boss.isAlive && player.getPosition().distanceTo(boss.getPosition()) < dashDist + 2.5) {
        boss.takeDamage(45, 'STORM');
        this.vfx.spawnHitSparks(boss.getPosition(), 'STORM', 25);
      }

      // Teleport player forward smoothly
      player.position.copy(targetPos);
      player.mesh.position.copy(targetPos);
      this.vfx.spawnShockwave(targetPos, 4.0, 0x3388ff);
      cameraManager.addScreenShake(0.45);
    }

    return true;
  }

  // --- CAST ELEMENTAL ULTIMATE (R) ---
  castUltimate(player, enemies, boss, cameraManager) {
    if (player.ultimateCooldown > 0 || player.energy < 50) return false;

    player.energy -= 50;
    player.ultimateCooldown = player.maxUltimateCooldown;
    const element = player.element;

    soundManager.playUltimate(element);
    cameraManager.addScreenShake(0.85);

    const playerPos = player.getPosition();

    if (element === 'FIRE') {
      // Magma Cataclysm: massive AoE explosion
      this.vfx.spawnShockwave(playerPos, 9.0, 0xff2200);
      this.vfx.spawnHitSparks(playerPos, 'FIRE', 40);

      enemies.forEach(e => {
        if (e.isAlive && playerPos.distanceTo(e.getPosition()) <= 9.0) {
          e.takeDamage(75, 'FIRE', true);
          this.vfx.spawnHitSparks(e.getPosition(), 'FIRE', 25);
        }
      });

      if (boss && boss.isAlive && playerPos.distanceTo(boss.getPosition()) <= 10.0) {
        boss.takeDamage(85, 'FIRE');
        this.vfx.spawnHitSparks(boss.getPosition(), 'FIRE', 30);
      }

    } else if (element === 'ICE') {
      // Absolute Zero Frost Nova: freezes all enemies in wide radius
      this.vfx.spawnShockwave(playerPos, 10.0, 0x00d9ff);
      this.vfx.spawnHitSparks(playerPos, 'ICE', 40);

      enemies.forEach(e => {
        if (e.isAlive && playerPos.distanceTo(e.getPosition()) <= 10.0) {
          e.takeDamage(60, 'ICE', true);
          e.freezeTimer = 3.5; // Freeze for 3.5 seconds!
          this.vfx.spawnHitSparks(e.getPosition(), 'ICE', 25);
        }
      });

      if (boss && boss.isAlive && playerPos.distanceTo(boss.getPosition()) <= 11.0) {
        boss.takeDamage(70, 'ICE');
        this.vfx.spawnHitSparks(boss.getPosition(), 'ICE', 30);
      }

    } else if (element === 'STORM') {
      // Judgment of the Storm: lightning strikes all enemies in arena!
      this.vfx.spawnShockwave(playerPos, 8.0, 0x5599ff);

      enemies.forEach(e => {
        if (e.isAlive) {
          // Lightning bolt strikes down from sky
          e.takeDamage(65, 'STORM', true);
          this.vfx.spawnHitSparks(e.getPosition(), 'STORM', 30);
          this.vfx.spawnShockwave(e.getPosition(), 2.8, 0x66ccff);
        }
      });

      if (boss && boss.isAlive) {
        boss.takeDamage(80, 'STORM');
        this.vfx.spawnHitSparks(boss.getPosition(), 'STORM', 35);
        this.vfx.spawnShockwave(boss.getPosition(), 5.0, 0x66ccff);
      }
    }

    return true;
  }

  // Spawn projectile from enemy or boss
  spawnEnemyProjectile(origin, target, type) {
    this.projectiles.push(new Projectile(this.scene, {
      type,
      origin,
      target,
      speed: type === 'VOID_BOSS' ? 14.0 : 11.0,
      damage: type === 'VOID_BOSS' ? 22 : 16,
      isFromPlayer: false,
      element: 'VOID'
    }));
  }
}
