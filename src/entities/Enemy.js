/**
 * Enemy.js
 * AI logic, attack patterns, status effects (Burn, Freeze, Shock), and hit reactions
 * for Fallen Soldiers, Void Cultists, and Corrupted Elite Knights.
 */

import * as THREE from 'three';
import { CharacterModelBuilder } from './CharacterModelBuilder.js';
import { soundManager } from '../core/SoundManager.js';

export class Enemy {
  constructor(scene, type = 'SOLDIER', spawnPos = new THREE.Vector3()) {
    this.scene = scene;
    this.type = type; // 'SOLDIER', 'CULTIST', 'KNIGHT'

    let modelData;
    if (type === 'SOLDIER') {
      modelData = CharacterModelBuilder.buildSoldier();
      this.maxHealth = 50;
      this.moveSpeed = 4.2;
      this.attackRange = 2.1;
      this.attackDamage = 12;
      this.attackCooldownMax = 1.8;
    } else if (type === 'CULTIST') {
      modelData = CharacterModelBuilder.buildCultist();
      this.maxHealth = 40;
      this.moveSpeed = 3.0;
      this.attackRange = 12.0;
      this.attackDamage = 16;
      this.attackCooldownMax = 3.2;
    } else { // KNIGHT
      modelData = CharacterModelBuilder.buildEliteKnight();
      this.maxHealth = 120;
      this.moveSpeed = 2.8;
      this.attackRange = 2.8;
      this.attackDamage = 26;
      this.attackCooldownMax = 2.4;
    }

    this.mesh = modelData.root;
    this.joints = modelData.joints;
    this.weapon = modelData.weapon;
    this.crystalMesh = modelData.crystalMesh;

    this.health = this.maxHealth;
    this.isAlive = true;

    this.position = new THREE.Vector3().copy(spawnPos);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    // AI States: 'SPAWNING', 'CHASE', 'TELEGRAPH', 'ATTACKING', 'FLEE', 'STAGGER', 'DEAD'
    this.state = 'CHASE';
    this.stateTime = 0;
    this.attackCooldown = Math.random() * 1.5;

    // Status effects
    this.freezeTimer = 0;
    this.burnTimer = 0;
    this.burnTickTimer = 0;
    this.slowTimer = 0;
    this.shockTimer = 0;

    // Orientation
    this.facingAngle = Math.random() * Math.PI * 2;
    this.walkCycle = 0;
    this.damageFlashTimer = 0;

    // Projectile spawn callback
    this.onSpawnProjectile = null;
  }

  update(dt, playerPosition, onDamagePlayer) {
    if (!this.isAlive) {
      this._updateDeath(dt);
      return;
    }

    this.stateTime += dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    // Update status effects
    if (this._updateStatusEffects(dt)) return; // If completely frozen, skip AI movement

    // Damage flash timer
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= dt;
    }

    const distToPlayer = this.position.distanceTo(playerPosition);
    const toPlayer = new THREE.Vector3().subVectors(playerPosition, this.position);
    toPlayer.y = 0;
    const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);

    // Face player
    let diff = targetAngle - this.facingAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.facingAngle += diff * Math.min(1.0, dt * 7.0);
    this.mesh.rotation.y = this.facingAngle;

    // State machine
    switch (this.state) {
      case 'CHASE':
        this._updateChase(dt, playerPosition, distToPlayer, toPlayer);
        break;
      case 'TELEGRAPH':
        this._updateTelegraph(dt, playerPosition, distToPlayer, onDamagePlayer);
        break;
      case 'ATTACKING':
        this._updateAttacking(dt);
        break;
      case 'FLEE':
        this._updateFlee(dt, playerPosition, toPlayer);
        break;
      case 'STAGGER':
        this._updateStagger(dt);
        break;
    }

    this.mesh.position.copy(this.position);
  }

  _updateChase(dt, playerPosition, dist, toPlayer) {
    // Cultist keeps distance, Soldier & Knight close in
    if (this.type === 'CULTIST') {
      if (dist < 5.0) {
        this.state = 'FLEE';
        this.stateTime = 0;
        return;
      }
      if (dist <= this.attackRange && this.attackCooldown <= 0) {
        this.state = 'TELEGRAPH';
        this.stateTime = 0;
        return;
      }
      // Hover in place with floating bob
      this.mesh.position.y = this.position.y + Math.sin(this.stateTime * 3.0) * 0.15;
      if (this.crystalMesh) {
        this.crystalMesh.rotation.y += dt * 3.0;
      }
      return;
    }

    // Soldier & Knight Melee chase
    if (dist <= this.attackRange && this.attackCooldown <= 0) {
      this.state = 'TELEGRAPH';
      this.stateTime = 0;
      return;
    }

    const speedMod = this.slowTimer > 0 ? 0.5 : 1.0;
    const step = toPlayer.normalize().multiplyScalar(this.moveSpeed * speedMod * dt);
    this.position.add(step);

    // Walk animation
    this.walkCycle += dt * 8.0;
    const swing = Math.sin(this.walkCycle);
    if (this.joints.hipL && this.joints.hipR) {
      this.joints.hipL.rotation.x = swing * 0.5;
      this.joints.hipR.rotation.x = -swing * 0.5;
    }
  }

  _updateFlee(dt, playerPosition, toPlayer) {
    if (this.stateTime > 1.2 || toPlayer.length() > 8.0) {
      this.state = 'CHASE';
      this.stateTime = 0;
      return;
    }

    // Move away from player
    const away = toPlayer.clone().negate().normalize();
    this.position.addScaledVector(away, this.moveSpeed * 1.5 * dt);
  }

  _updateTelegraph(dt, playerPosition, dist, onDamagePlayer) {
    const telegraphDuration = this.type === 'KNIGHT' ? 0.75 : (this.type === 'CULTIST' ? 0.9 : 0.45);

    // Raise weapon / charge energy
    const t = this.stateTime / telegraphDuration;
    if (this.joints.shoulderR) {
      this.joints.shoulderR.rotation.x = -t * 1.8;
    }

    if (this.stateTime >= telegraphDuration) {
      // Execute attack!
      this.state = 'ATTACKING';
      this.stateTime = 0;
      this.attackCooldown = this.attackCooldownMax;

      if (this.type === 'CULTIST') {
        // Fire homing void orb projectile
        if (this.onSpawnProjectile) {
          const spawnPoint = new THREE.Vector3().copy(this.position);
          spawnPoint.y += 1.6;
          this.onSpawnProjectile(spawnPoint, playerPosition, 'VOID');
        }
      } else {
        // Melee swing
        soundManager.playSlash(this.type === 'KNIGHT' ? 'heavy' : 'light');
        if (dist <= this.attackRange + 0.8) {
          onDamagePlayer(this.attackDamage);
        }
      }
    }
  }

  _updateAttacking(dt) {
    const attackDuration = 0.4;
    const t = this.stateTime / attackDuration;

    if (this.joints.shoulderR) {
      this.joints.shoulderR.rotation.x = 0.8 * (1.0 - t);
    }

    if (this.stateTime >= attackDuration) {
      this.state = 'CHASE';
      this.stateTime = 0;
    }
  }

  _updateStagger(dt) {
    if (this.stateTime >= 0.35) {
      this.state = 'CHASE';
      this.stateTime = 0;
      return;
    }
    const t = this.stateTime / 0.35;
    if (this.joints.spine) {
      this.joints.spine.rotation.x = -Math.sin(t * Math.PI) * 0.4;
    }
  }

  _updateStatusEffects(dt) {
    // Freeze
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      return true; // Frozen: skip action
    }

    // Slow
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
    }

    // Burn
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.burnTickTimer += dt;
      if (this.burnTickTimer >= 0.4) {
        this.burnTickTimer = 0;
        this.takeDamage(6, 'FIRE', false); // Burn DoT
      }
    }

    // Shock
    if (this.shockTimer > 0) {
      this.shockTimer -= dt;
    }

    return false;
  }

  takeDamage(amount, element = 'PHYSICAL', isStagger = true) {
    if (!this.isAlive) return;

    this.health = Math.max(0, this.health - amount);
    soundManager.playHit(element);

    // Apply elemental debuffs
    if (element === 'FIRE') {
      this.burnTimer = 3.5;
    } else if (element === 'ICE') {
      if (amount > 20) {
        this.freezeTimer = 2.4; // Frozen solid
      } else {
        this.slowTimer = 3.0; // Slowed
      }
    } else if (element === 'STORM') {
      this.shockTimer = 1.5;
    }

    if (this.health <= 0) {
      this.isAlive = false;
      this.state = 'DEAD';
      this.stateTime = 0;
      return;
    }

    // Stagger (Knights resist light hits, stagger on heavy)
    if (isStagger && (this.type !== 'KNIGHT' || amount >= 25)) {
      this.state = 'STAGGER';
      this.stateTime = 0;
    }
  }

  _updateDeath(dt) {
    this.stateTime += dt;
    if (this.stateTime < 0.9) {
      const t = this.stateTime / 0.9;
      this.mesh.position.y = this.position.y - t * 0.6;
      this.mesh.scale.multiplyScalar(0.97);
    } else {
      this.scene.remove(this.mesh);
    }
  }

  getPosition() {
    return this.position;
  }
}
