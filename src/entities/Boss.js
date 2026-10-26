/**
 * Boss.js
 * The Fallen King - Colossal 3D Boss with 3 dynamic combat phases, telegraphed ground slams,
 * void projectile barrages, meteor showers, and cinematic defeat state.
 */

import * as THREE from 'three';
import { CharacterModelBuilder } from './CharacterModelBuilder.js';
import { soundManager } from '../core/SoundManager.js';

export class Boss {
  constructor(scene, spawnPos = new THREE.Vector3(0, 0, -22)) {
    this.scene = scene;
    const modelData = CharacterModelBuilder.buildBoss();

    this.mesh = modelData.root;
    this.joints = modelData.joints;
    this.sword = modelData.sword;
    this.blade = modelData.bossBlade;
    this.heartRune = modelData.heartRune;
    this.abyssalMaterials = modelData.abyssalMaterials;

    this.name = 'The Hollow Guardian';
    this.maxHealth = 600;
    this.health = 600;
    this.isAlive = true;

    this.position = new THREE.Vector3().copy(spawnPos);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    // Boss Phase (1, 2, 3)
    this.phase = 1;

    // Movement & AI
    this.moveSpeed = 3.6;
    this.facingAngle = 0;
    this.state = 'INTRO'; // 'INTRO', 'IDLE', 'CHASE', 'TELEGRAPH_SLAM', 'SLAM', 'BARRAGE', 'METEOR_STORM', 'STAGGER', 'DEFEATED'
    this.stateTime = 0;
    this.attackCooldown = 2.0;

    // Danger zone & VFX callbacks
    this.onSpawnTelegraph = null; // (pos, radius, duration)
    this.onSpawnShockwave = null; // (pos, radius)
    this.onSpawnProjectile = null; // (origin, target, type)
    this.onPhaseChange = null; // (newPhase)
    this.onDefeat = null;

    // Phase transition flag
    this.hasRoaredPhase2 = false;
    this.hasRoaredPhase3 = false;

    // Visual timers
    this.bladeAuraPulse = 0;
  }

  update(dt, playerPosition, onDamagePlayer, cameraManager) {
    if (!this.isAlive) {
      this._updateDefeat(dt);
      return;
    }

    this.stateTime += dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.bladeAuraPulse += dt * 4.0;

    // Pulse heart rune & blade emissive
    if (this.heartRune) {
      const pulse = 1.8 + Math.sin(this.bladeAuraPulse) * 0.8;
      this.abyssalMaterials.forEach(m => m.emissiveIntensity = pulse);
    }

    // Check phase transitions based on health
    const hpRatio = this.health / this.maxHealth;
    if (hpRatio <= 0.33 && this.phase < 3) {
      this._enterPhase3(cameraManager);
    } else if (hpRatio <= 0.66 && this.phase < 2) {
      this._enterPhase2(cameraManager);
    }

    const distToPlayer = this.position.distanceTo(playerPosition);
    const toPlayer = new THREE.Vector3().subVectors(playerPosition, this.position);
    toPlayer.y = 0;
    const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);

    // Smooth rotation toward player (slower turn due to enormous mass)
    let diff = targetAngle - this.facingAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.facingAngle += diff * Math.min(1.0, dt * (this.phase === 3 ? 5.5 : 3.8));
    this.mesh.rotation.y = this.facingAngle;

    // State machine
    switch (this.state) {
      case 'INTRO':
        this._updateIntro(dt, cameraManager);
        break;
      case 'CHASE':
        this._updateChase(dt, playerPosition, distToPlayer, toPlayer);
        break;
      case 'TELEGRAPH_SLAM':
        this._updateTelegraphSlam(dt, playerPosition, onDamagePlayer, cameraManager);
        break;
      case 'BARRAGE':
        this._updateBarrage(dt, playerPosition);
        break;
      case 'METEOR_STORM':
        this._updateMeteorStorm(dt, playerPosition, onDamagePlayer, cameraManager);
        break;
      case 'STAGGER':
        this._updateStagger(dt);
        break;
    }

    this.mesh.position.copy(this.position);
  }

  _enterPhase2(cameraManager = null) {
    this.phase = 2;
    this.moveSpeed = 4.4;
    soundManager.playBossRoar();
    if (cameraManager && cameraManager.addScreenShake) {
      cameraManager.addScreenShake(0.8);
    }
    if (this.onPhaseChange) this.onPhaseChange(2);
    soundManager.setCombatIntensity(2);
  }

  _enterPhase3(cameraManager = null) {
    this.phase = 3;
    this.moveSpeed = 5.2; // Enraged speed
    soundManager.playBossRoar();
    if (cameraManager && cameraManager.addScreenShake) {
      cameraManager.addScreenShake(1.2);
    }
    if (this.onPhaseChange) this.onPhaseChange(3);
    soundManager.setCombatIntensity(3);

    // Turn boss eyes & blade blazing crimson
    if (this.abyssalMaterials) {
      this.abyssalMaterials.forEach(m => {
        if (m.color) m.color.setHex(0xff1122);
        if (m.emissive) m.emissive.setHex(0xff0033);
        m.emissiveIntensity = 3.5;
      });
    }
  }

  _updateIntro(dt, cameraManager) {
    if (this.stateTime === dt) {
      soundManager.playBossRoar();
      cameraManager.addScreenShake(0.6);
    }
    if (this.stateTime >= 2.0) {
      this.state = 'CHASE';
      this.stateTime = 0;
    }
  }

  _updateChase(dt, playerPosition, dist, toPlayer) {
    // Choose attack based on distance & phase
    if (this.attackCooldown <= 0) {
      if (this.phase === 3 && Math.random() < 0.4) {
        this.state = 'METEOR_STORM';
        this.stateTime = 0;
        return;
      } else if (this.phase >= 2 && dist > 7.0 && Math.random() < 0.5) {
        this.state = 'BARRAGE';
        this.stateTime = 0;
        return;
      } else if (dist <= 5.8) {
        this.state = 'TELEGRAPH_SLAM';
        this.stateTime = 0;
        // Spawn warning circle decal on ground
        if (this.onSpawnTelegraph) {
          const slamTarget = this.position.clone().addScaledVector(
            new THREE.Vector3(Math.sin(this.facingAngle), 0, Math.cos(this.facingAngle)),
            3.0
          );
          this.onSpawnTelegraph(slamTarget, 4.5, 1.1);
        }
        return;
      }
    }

    // Walk forward
    const step = toPlayer.normalize().multiplyScalar(this.moveSpeed * dt);
    this.position.add(step);

    // Stride animation
    const stride = Math.sin(this.stateTime * 4.5);
    if (this.joints.hipL && this.joints.hipR) {
      this.joints.hipL.rotation.x = stride * 0.45;
      this.joints.hipR.rotation.x = -stride * 0.45;
    }
    if (this.joints.cape) {
      this.joints.cape.rotation.x = 0.14 + Math.abs(stride) * 0.15;
    }
  }

  _updateTelegraphSlam(dt, playerPosition, onDamagePlayer, cameraManager) {
    const telegraphTime = this.phase === 3 ? 0.8 : 1.1;

    // Raise giant sword high above head
    const t = this.stateTime / telegraphTime;
    if (this.joints.shoulderR) {
      this.joints.shoulderR.rotation.x = -t * 2.8;
      this.joints.spine.rotation.x = -t * 0.4;
    }

    if (this.stateTime >= telegraphTime) {
      // SLAM DOWN!
      soundManager.playBossSlam();
      cameraManager.addScreenShake(0.9);

      if (this.joints.shoulderR) {
        this.joints.shoulderR.rotation.x = 0.8;
      }

      const slamCenter = this.position.clone().addScaledVector(
        new THREE.Vector3(Math.sin(this.facingAngle), 0, Math.cos(this.facingAngle)),
        3.0
      );

      // Trigger shockwave ring
      if (this.onSpawnShockwave) {
        this.onSpawnShockwave(slamCenter, 5.0);
      }

      // Check damage to player
      const distToSlam = playerPosition.distanceTo(slamCenter);
      if (distToSlam <= 5.0) {
        onDamagePlayer(this.phase === 3 ? 35 : 28);
      }

      this.state = 'CHASE';
      this.stateTime = 0;
      this.attackCooldown = this.phase === 3 ? 1.6 : 2.5;
    }
  }

  _updateBarrage(dt, playerPosition) {
    const barrageDuration = 1.4;

    // Sweep sword across chest and emit 5 dark energy orbs in arc
    if (this.stateTime === dt && this.onSpawnProjectile) {
      soundManager.playSlash('heavy');
      for (let i = -2; i <= 2; i++) {
        const spreadAngle = this.facingAngle + i * 0.22;
        const targetPos = new THREE.Vector3(
          this.position.x + Math.sin(spreadAngle) * 20,
          1.2,
          this.position.z + Math.cos(spreadAngle) * 20
        );
        const spawnOrigin = this.position.clone();
        spawnOrigin.y += 2.5;
        this.onSpawnProjectile(spawnOrigin, targetPos, 'VOID_BOSS');
      }
    }

    if (this.stateTime >= barrageDuration) {
      this.state = 'CHASE';
      this.stateTime = 0;
      this.attackCooldown = 2.0;
    }
  }

  _updateMeteorStorm(dt, playerPosition, onDamagePlayer, cameraManager) {
    const stormDuration = 2.2;

    // Boss channels dark rift upwards
    if (this.joints.shoulderR && this.joints.shoulderL) {
      this.joints.shoulderR.rotation.x = -2.6;
      this.joints.shoulderL.rotation.x = -2.6;
    }

    // Call meteors at intervals
    if (this.stateTime >= 0.5 && this.stateTime - dt < 0.5) {
      soundManager.playBossRoar();
      cameraManager.addScreenShake(0.5);

      // 4 meteors around player
      for (let m = 0; m < 4; m++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          0,
          (Math.random() - 0.5) * 12
        );
        const meteorPos = playerPosition.clone().add(offset);
        meteorPos.y = 0;

        if (this.onSpawnTelegraph) {
          this.onSpawnTelegraph(meteorPos, 3.2, 1.2);
        }

        setTimeout(() => {
          if (!this.isAlive) return;
          soundManager.playBossSlam();
          cameraManager.addScreenShake(0.5);
          if (this.onSpawnShockwave) this.onSpawnShockwave(meteorPos, 3.5);
          if (playerPosition.distanceTo(meteorPos) <= 3.5) {
            onDamagePlayer(24);
          }
        }, 1200);
      }
    }

    if (this.stateTime >= stormDuration) {
      this.state = 'CHASE';
      this.stateTime = 0;
      this.attackCooldown = 3.0;
    }
  }

  _updateStagger(dt) {
    if (this.stateTime >= 1.5) {
      this.state = 'CHASE';
      this.stateTime = 0;
      return;
    }
    const t = this.stateTime / 1.5;
    if (this.joints.spine) {
      this.joints.spine.rotation.x = -Math.sin(t * Math.PI) * 0.5;
    }
  }

  takeDamage(amount, element = 'PHYSICAL') {
    if (!this.isAlive) return;

    this.health = Math.max(0, this.health - amount);
    soundManager.playHit(element);

    if (this.health <= 0) {
      this.isAlive = false;
      this.state = 'DEFEATED';
      this.stateTime = 0;
      soundManager.playBossRoar();
      if (this.onDefeat) this.onDefeat();
      return;
    }

    // Check phase transitions on damage
    const hpRatio = this.health / this.maxHealth;
    if (hpRatio <= 0.33 && this.phase < 3) {
      this._enterPhase3();
    } else if (hpRatio <= 0.66 && this.phase < 2) {
      this._enterPhase2();
    }

    // Stagger on massive elemental burst damage
    if (amount >= 50 && this.state !== 'TELEGRAPH_SLAM') {
      this.state = 'STAGGER';
      this.stateTime = 0;
    }
  }

  _updateDefeat(dt) {
    this.stateTime += dt;
    // Epic cinematic collapse to knees
    if (this.stateTime < 3.0) {
      const t = this.stateTime / 3.0;
      this.mesh.position.y = this.position.y - t * 0.9;
      if (this.joints.spine) this.joints.spine.rotation.x = t * 1.2;
      if (this.joints.shoulderR) this.joints.shoulderR.rotation.x = t * 1.6;
      if (this.joints.hipL && this.joints.hipR) {
        this.joints.hipL.rotation.x = t * 1.4;
        this.joints.hipR.rotation.x = t * 1.4;
      }
    }
  }

  getPosition() {
    return this.position;
  }
}
