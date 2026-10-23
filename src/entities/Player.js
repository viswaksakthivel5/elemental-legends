/**
 * Player.js
 * Controls the ancient elemental warrior: full 3D hierarchical mesh, procedural animation blending,
 * 3-hit attack combo, heavy attack, invincible dodge roll, taking damage, and elemental switching.
 */

import * as THREE from 'three';
import { CharacterModelBuilder } from './CharacterModelBuilder.js';
import { soundManager } from '../core/SoundManager.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    // Build character model
    const charData = CharacterModelBuilder.buildHero();
    this.mesh = charData.root;
    this.joints = charData.joints;
    this.sword = charData.sword;
    this.cape = charData.capeMesh;
    this.runeMaterials = charData.runeMaterials;

    this.scene.add(this.mesh);

    // Position & Orientation
    this.position = new THREE.Vector3(0, 0, 0);
    this.mesh.position.copy(this.position);
    this.facingAngle = 0;
    this.targetFacingAngle = 0;

    // Combat & Stats
    this.maxHealth = 100;
    this.health = 100;
    this.maxEnergy = 100;
    this.energy = 100;
    this.energyRegenRate = 8; // per second

    this.isAlive = true;
    this.isInvincible = false; // Dodge i-frames
    this.invincibilityTimer = 0;

    // Movement speeds
    this.moveSpeed = 6.2;
    this.dodgeSpeed = 13.5;
    this.velocity = new THREE.Vector3();

    // State machine
    // 'IDLE', 'RUN', 'DODGE', 'ATTACK1', 'ATTACK2', 'ATTACK3', 'HEAVY_ATTACK', 'HURT', 'DEAD'
    this.state = 'IDLE';
    this.stateTime = 0;

    // Combo system
    this.comboHit = 0; // 0, 1, 2, 3
    this.comboResetTimer = 0;
    this.canQueueNextCombo = false;
    this.hasPendingCombo = false;

    // Cooldowns
    this.skillCooldown = 0;
    this.maxSkillCooldown = 6.0;
    this.ultimateCooldown = 0;
    this.maxUltimateCooldown = 16.0;

    // Current Element: 'FIRE', 'ICE', 'STORM'
    this.element = 'FIRE';

    // Animation cycle helpers
    this.walkCycle = 0;
    this.capeSway = 0;
    this.damageFlashTimer = 0;

    // Weapon hit collider query points
    this.swordWorldTip = new THREE.Vector3();
    this.isWeaponActive = false; // true only during active damage frames

    // Apply initial elemental visual styling
    this.setElement('FIRE');
  }

  setElement(newElement) {
    this.element = newElement;
    soundManager.playSwitchElement(newElement);

    let bladeColor = 0xff4400;
    let auraColor = 0xff6600;
    let runeColor = 0xff2200;

    if (newElement === 'ICE') {
      bladeColor = 0x00c3ff;
      auraColor = 0x66ddff;
      runeColor = 0x0099ff;
    } else if (newElement === 'STORM') {
      bladeColor = 0x3388ff;
      auraColor = 0x77bbff;
      runeColor = 0x2266ff;
    }

    if (this.sword) {
      if (this.sword.bladeMesh && this.sword.bladeMesh.material && this.sword.bladeMesh.material.emissive) {
        this.sword.bladeMesh.material.emissive.setHex(bladeColor);
      }
      if (this.sword.auraMesh && this.sword.auraMesh.material) {
        this.sword.auraMesh.material.color.setHex(auraColor);
      }
      if (this.sword.gemMesh && this.sword.gemMesh.material) {
        if (this.sword.gemMesh.material.color) this.sword.gemMesh.material.color.setHex(runeColor);
        if (this.sword.gemMesh.material.emissive) this.sword.gemMesh.material.emissive.setHex(bladeColor);
      }
    }

    this.runeMaterials.forEach(mat => {
      mat.color.setHex(runeColor);
      mat.emissive.setHex(bladeColor);
    });
  }

  cycleElement() {
    if (this.element === 'FIRE') this.setElement('ICE');
    else if (this.element === 'ICE') this.setElement('STORM');
    else this.setElement('FIRE');
  }

  update(dt, inputManager, cameraManager) {
    if (!this.isAlive) {
      this._animateDeath(dt);
      return;
    }

    this.stateTime += dt;
    this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * dt);

    // Update cooldown timers
    if (this.skillCooldown > 0) this.skillCooldown = Math.max(0, this.skillCooldown - dt);
    if (this.ultimateCooldown > 0) this.ultimateCooldown = Math.max(0, this.ultimateCooldown - dt);

    // Update invincibility
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= dt;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
      }
    }

    // Update damage flash
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= dt;
      if (this.damageFlashTimer <= 0) {
        this._resetMaterials();
      }
    }

    // Check combo reset
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0 && !this.state.startsWith('ATTACK')) {
        this.comboHit = 0;
      }
    }

    // Check input actions
    this._handleInputs(inputManager, cameraManager);

    // State machine update
    switch (this.state) {
      case 'IDLE':
        this._updateIdle(dt, inputManager, cameraManager);
        break;
      case 'RUN':
        this._updateRun(dt, inputManager, cameraManager);
        break;
      case 'DODGE':
        this._updateDodge(dt);
        break;
      case 'ATTACK1':
      case 'ATTACK2':
      case 'ATTACK3':
        this._updateAttack(dt);
        break;
      case 'HEAVY_ATTACK':
        this._updateHeavyAttack(dt);
        break;
      case 'HURT':
        this._updateHurt(dt);
        break;
    }

    // Smoothly turn character toward target facing angle
    this._updateRotation(dt);

    // Secondary cloth physics for cape
    this._updateCape(dt);

    // Update sword tip in world coords for hit detection
    if (this.sword && this.sword.bladeTip) {
      this.sword.bladeTip.getWorldPosition(this.swordWorldTip);
    }
  }

  _handleInputs(inputManager, cameraManager) {
    // Hotkeys for elements
    if (inputManager.consumeAction('switchFire')) this.setElement('FIRE');
    if (inputManager.consumeAction('switchIce')) this.setElement('ICE');
    if (inputManager.consumeAction('switchStorm')) this.setElement('STORM');

    // Dodge Roll
    if (inputManager.consumeAction('dodge')) {
      if (this.state !== 'DODGE' && this.state !== 'HURT' && this.energy >= 15) {
        this.energy -= 15;
        this._startDodge(inputManager, cameraManager);
        return;
      }
    }

    // Light Attack combo
    if (inputManager.consumeAction('lightAttack')) {
      if (this.state === 'IDLE' || this.state === 'RUN') {
        this._startAttackCombo();
      } else if (this.state.startsWith('ATTACK') && this.canQueueNextCombo) {
        this.hasPendingCombo = true;
      }
    }

    // Heavy Attack
    if (inputManager.consumeAction('heavyAttack')) {
      if ((this.state === 'IDLE' || this.state === 'RUN') && this.energy >= 20) {
        this.energy -= 20;
        this._startHeavyAttack();
      }
    }
  }

  _updateIdle(dt, inputManager, cameraManager) {
    const move = inputManager.getMovementVector();
    if (move.isMoving) {
      this.state = 'RUN';
      this.stateTime = 0;
      return;
    }

    // Breathing procedural idle
    const breath = Math.sin(this.stateTime * 2.2);
    this.joints.spine.position.y = 0.15 + breath * 0.015;
    this.joints.spine.rotation.x = breath * 0.02;
    this.joints.head.rotation.x = -breath * 0.02;

    // Reset arm stances
    this.joints.shoulderL.rotation.set(0.1, 0, 0.15);
    this.joints.shoulderR.rotation.set(-0.2 + breath * 0.02, 0, -0.15);
    this.joints.hipL.rotation.set(0, 0, 0);
    this.joints.hipR.rotation.set(0, 0, 0);
    this.joints.kneeL.rotation.set(0, 0, 0);
    this.joints.kneeR.rotation.set(0, 0, 0);
  }

  _updateRun(dt, inputManager, cameraManager) {
    const move = inputManager.getMovementVector();
    if (!move.isMoving) {
      this.state = 'IDLE';
      this.stateTime = 0;
      return;
    }

    // Calculate move direction relative to camera
    const fwd = cameraManager.getForwardDirection();
    const right = cameraManager.getRightDirection();

    const moveDir = new THREE.Vector3()
      .addScaledVector(fwd, -move.z)
      .addScaledVector(right, move.x)
      .normalize();

    this.velocity.copy(moveDir).multiplyScalar(this.moveSpeed);
    this.position.addScaledVector(this.velocity, dt);
    this.mesh.position.copy(this.position);

    // Align facing angle
    this.targetFacingAngle = Math.atan2(moveDir.x, moveDir.z);

    // Procedural run cycle
    const prevLegSwing = Math.sin(this.walkCycle);
    this.walkCycle += dt * 11.0;
    const legSwing = Math.sin(this.walkCycle);

    if ((prevLegSwing <= 0 && legSwing > 0) || (prevLegSwing >= 0 && legSwing < 0)) {
      soundManager.playFootstep();
    }

    this.joints.hipL.rotation.x = legSwing * 0.65;
    this.joints.hipR.rotation.x = -legSwing * 0.65;
    this.joints.kneeL.rotation.x = Math.max(0, -legSwing * 0.8);
    this.joints.kneeR.rotation.x = Math.max(0, legSwing * 0.8);

    // Upper body counter-sway
    this.joints.spine.rotation.y = legSwing * 0.15;
    this.joints.spine.rotation.z = Math.cos(this.walkCycle) * 0.04;
    this.joints.spine.position.y = 0.15 + Math.abs(Math.sin(this.walkCycle)) * 0.05;

    this.joints.shoulderL.rotation.x = -legSwing * 0.5;
    this.joints.shoulderR.rotation.x = legSwing * 0.4 - 0.2;
  }

  _startDodge(inputManager, cameraManager) {
    this.state = 'DODGE';
    this.stateTime = 0;
    this.isInvincible = true;
    this.invincibilityTimer = 0.42; // i-frames
    soundManager.playDodge();

    const move = inputManager.getMovementVector();
    if (move.isMoving) {
      const fwd = cameraManager.getForwardDirection();
      const right = cameraManager.getRightDirection();
      this.velocity.copy(fwd).multiplyScalar(-move.z).addScaledVector(right, move.x).normalize();
      this.targetFacingAngle = Math.atan2(this.velocity.x, this.velocity.z);
    } else {
      // Dodge forward
      this.velocity.set(Math.sin(this.facingAngle), 0, Math.cos(this.facingAngle));
    }
  }

  _updateDodge(dt) {
    const duration = 0.45;
    const t = this.stateTime / duration;

    if (t >= 1.0) {
      this.state = 'IDLE';
      this.stateTime = 0;
      this.joints.hips.rotation.x = 0;
      this.joints.hips.position.y = 0.95;
      return;
    }

    // High velocity slide/roll
    const speed = this.dodgeSpeed * (1.0 - t * 0.45);
    this.position.addScaledVector(this.velocity, speed * dt);
    this.mesh.position.copy(this.position);

    // Roll animation (full 360 degree pitch rotation)
    this.joints.hips.rotation.x = t * Math.PI * 2;
    this.joints.hips.position.y = 0.95 - Math.sin(t * Math.PI) * 0.4;
  }

  // --- ATTACK COMBO CHAIN ---
  _startAttackCombo() {
    this.comboHit = (this.comboHit % 3) + 1;
    this.state = `ATTACK${this.comboHit}`;
    this.stateTime = 0;
    this.canQueueNextCombo = false;
    this.hasPendingCombo = false;
    this.isWeaponActive = true;

    soundManager.playSlash('light');

    // Slight forward step on attack
    const stepDir = new THREE.Vector3(Math.sin(this.facingAngle), 0, Math.cos(this.facingAngle));
    this.position.addScaledVector(stepDir, 0.4);
    this.mesh.position.copy(this.position);
  }

  _updateAttack(dt) {
    const attackDuration = 0.38;
    const t = this.stateTime / attackDuration;

    // Window where player can buffer next hit in combo
    if (t > 0.45) {
      this.canQueueNextCombo = true;
    }
    if (t > 0.75) {
      this.isWeaponActive = false;
    }

    if (t >= 1.0) {
      this.isWeaponActive = false;
      if (this.hasPendingCombo && this.comboHit < 3) {
        this._startAttackCombo();
      } else {
        this.state = 'IDLE';
        this.stateTime = 0;
        this.comboResetTimer = 0.8; // Time before combo returns to hit 1
      }
      return;
    }

    // Animate according to combo hit
    if (this.state === 'ATTACK1') {
      // Horizontal right-to-left sweep
      const p = Math.sin(t * Math.PI);
      this.joints.spine.rotation.y = (t - 0.5) * -1.8;
      this.joints.shoulderR.rotation.set(-0.3, (t - 0.5) * -2.4, -0.6);
      this.joints.shoulderL.rotation.set(0.2, 0.5, 0.4);
    } else if (this.state === 'ATTACK2') {
      // Diagonal upward backslash
      const p = Math.sin(t * Math.PI);
      this.joints.spine.rotation.y = (0.5 - t) * -1.6;
      this.joints.shoulderR.rotation.set(-1.2 + t * 1.8, 0.6, 0.5);
    } else if (this.state === 'ATTACK3') {
      // Final overhead jumping downward cleave!
      const p = Math.sin(t * Math.PI);
      this.joints.spine.position.y = 0.15 + (t < 0.4 ? t * 0.8 : (1 - t) * 0.4);
      this.joints.spine.rotation.x = t < 0.4 ? -0.4 : 0.6;
      this.joints.shoulderR.rotation.set(t < 0.4 ? -2.2 : 0.8, 0, 0);
    }
  }

  _startHeavyAttack() {
    this.state = 'HEAVY_ATTACK';
    this.stateTime = 0;
    this.isWeaponActive = false; // Activates at slam
    soundManager.playSlash('heavy');
  }

  _updateHeavyAttack(dt) {
    const totalDuration = 0.75;
    const t = this.stateTime / totalDuration;

    if (t >= 0.45 && t <= 0.7) {
      this.isWeaponActive = true;
    } else {
      this.isWeaponActive = false;
    }

    if (t >= 1.0) {
      this.state = 'IDLE';
      this.stateTime = 0;
      return;
    }

    if (t < 0.45) {
      // Windup: raise greatsword high with both hands
      const prog = t / 0.45;
      this.joints.spine.position.y = 0.15 + prog * 0.1;
      this.joints.spine.rotation.x = -prog * 0.35;
      this.joints.shoulderR.rotation.set(-prog * 2.8, 0, 0);
      this.joints.shoulderL.rotation.set(-prog * 2.8, 0, 0);
    } else {
      // Devastating downward smash
      const prog = (t - 0.45) / 0.55;
      this.joints.spine.rotation.x = 0.8 * (1.0 - prog);
      this.joints.shoulderR.rotation.set(0.6 * (1.0 - prog), 0, 0);
      this.joints.shoulderL.rotation.set(0.6 * (1.0 - prog), 0, 0);
    }
  }

  takeDamage(amount) {
    if (!this.isAlive || this.isInvincible) return false;

    this.health = Math.max(0, this.health - amount);
    soundManager.playHit('none');

    // Visual damage flash
    this.damageFlashTimer = 0.2;
    this._setFlashMaterials(0xff1122);

    if (this.health <= 0) {
      this.isAlive = false;
      this.state = 'DEAD';
      this.stateTime = 0;
      soundManager.playGameOver();
      return true;
    }

    // Stagger hit reaction if not in heavy attack
    if (this.state !== 'HEAVY_ATTACK') {
      this.state = 'HURT';
      this.stateTime = 0;
      this.isWeaponActive = false;
    }
    return true;
  }

  _updateHurt(dt) {
    const hurtDuration = 0.28;
    if (this.stateTime >= hurtDuration) {
      this.state = 'IDLE';
      this.stateTime = 0;
      return;
    }
    const t = this.stateTime / hurtDuration;
    this.joints.spine.rotation.x = -Math.sin(t * Math.PI) * 0.4;
    this.joints.head.rotation.x = Math.sin(t * Math.PI) * 0.5;
  }

  _animateDeath(dt) {
    this.stateTime += dt;
    if (this.stateTime < 1.2) {
      // Collapse to knees and fall forward
      const t = this.stateTime / 1.2;
      this.joints.hips.position.y = 0.95 - t * 0.7;
      this.joints.spine.rotation.x = t * 1.4;
      this.joints.kneeL.rotation.x = t * 1.5;
      this.joints.kneeR.rotation.x = t * 1.5;
      this.joints.shoulderR.rotation.x = t * 0.8;
    }
  }

  _updateRotation(dt) {
    let diff = this.targetFacingAngle - this.facingAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    this.facingAngle += diff * Math.min(1.0, dt * 14.0);
    this.mesh.rotation.y = this.facingAngle;
  }

  _updateCape(dt) {
    if (!this.cape) return;
    this.capeSway += dt * 4.0;
    const speed = this.velocity.length();
    const wind = Math.sin(this.capeSway) * 0.15;
    this.cape.rotation.x = 0.12 + (speed / this.moveSpeed) * 0.65 + wind;
  }

  _setFlashMaterials(color) {
    if (this.sword && this.sword.bladeMesh) {
      this.sword.bladeMesh.material.color.setHex(color);
    }
  }

  _resetMaterials() {
    if (this.sword && this.sword.bladeMesh) {
      this.sword.bladeMesh.material.color.setHex(0x222a35);
    }
  }

  getPosition() {
    return this.position;
  }

  getForward() {
    return new THREE.Vector3(Math.sin(this.facingAngle), 0, Math.cos(this.facingAngle));
  }
}
