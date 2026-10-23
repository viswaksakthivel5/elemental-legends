/**
 * CameraManager.js
 * Third-person action camera with mouse look, target lock framing, camera collision, and screen shake.
 */

import * as THREE from 'three';

export class CameraManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.target = new THREE.Vector3(0, 1.5, 0); // Point camera looks at (near player chest/head)
    this.lockedEnemy = null;

    // Spherical coordinates around target
    this.yaw = 0; // Horizontal rotation
    this.pitch = 0.25; // Vertical tilt (radians)
    this.minPitch = -0.35; // Looking up from low angle
    this.maxPitch = 1.15; // Looking down from above

    this.distance = 5.2; // Default distance
    this.targetDistance = 5.2;
    this.minDistance = 2.0;
    this.maxDistance = 8.0;

    this.smoothSpeed = 12.0; // Camera tracking speed
    this.currentPosition = new THREE.Vector3(0, 3, 5);

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDecay = 4.0;
    this.shakeOffset = new THREE.Vector3();

    // Cinematic mode (e.g. boss defeat or intro)
    this.isCinematic = false;
    this.cinematicTime = 0;
  }

  snapToTarget(playerPosition) {
    this.target.set(playerPosition.x, playerPosition.y + 1.4, playerPosition.z);
    this.yaw = 0;
    this.pitch = 0.22;
    this.distance = 4.8;
    this.targetDistance = 4.8;

    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    this.currentPosition.set(
      this.target.x + this.distance * sinYaw * cosPitch,
      this.target.y + this.distance * sinPitch,
      this.target.z + this.distance * cosYaw * cosPitch
    );
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  update(dt, playerPosition, inputManager) {
    // Process mouse rotation
    const { dx, dy } = inputManager.consumeMouseDelta();
    this.yaw -= dx;
    this.pitch += dy;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

    // Screen shake decay
    if (this.shakeIntensity > 0.001) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * this.shakeDecay);
      this.shakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity
      );
    } else {
      this.shakeOffset.set(0, 0, 0);
    }

    // Determine target look-at point
    if (this.lockedEnemy && this.lockedEnemy.isAlive) {
      // Softly frame midpoint between player and enemy
      const enemyPos = this.lockedEnemy.getPosition();
      const midPoint = new THREE.Vector3()
        .copy(playerPosition)
        .add(enemyPos)
        .multiplyScalar(0.5);
      midPoint.y += 1.4;

      // Auto-orient yaw toward locked enemy
      const toEnemy = new THREE.Vector3().subVectors(enemyPos, playerPosition);
      const targetYaw = Math.atan2(-toEnemy.x, -toEnemy.z);

      // Smooth angle interpolation
      let diff = targetYaw - this.yaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.yaw += diff * Math.min(1.0, dt * 6.0);

      this.target.lerp(midPoint, Math.min(1.0, dt * 8.0));
      this.targetDistance = 6.2;
    } else {
      this.lockedEnemy = null;
      const desiredTarget = new THREE.Vector3(
        playerPosition.x,
        playerPosition.y + 1.5,
        playerPosition.z
      );
      this.target.lerp(desiredTarget, Math.min(1.0, dt * this.smoothSpeed));
      this.targetDistance = 5.2;
    }

    if (this.isCinematic) {
      this.cinematicTime += dt;
      this.yaw += dt * 0.4;
      this.pitch = 0.2 + Math.sin(this.cinematicTime * 0.5) * 0.1;
      this.targetDistance = 4.0;
    }

    // Smooth distance
    this.distance += (this.targetDistance - this.distance) * Math.min(1.0, dt * 6.0);

    // Calculate ideal camera position from spherical angles
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    const desiredCamPos = new THREE.Vector3(
      this.target.x + this.distance * sinYaw * cosPitch,
      this.target.y + this.distance * sinPitch,
      this.target.z + this.distance * cosYaw * cosPitch
    );

    // Prevent camera dipping below floor
    if (desiredCamPos.y < 0.6) {
      desiredCamPos.y = 0.6;
    }

    // Smooth position interpolation
    this.currentPosition.lerp(desiredCamPos, Math.min(1.0, dt * this.smoothSpeed));

    // Apply shake offset
    this.camera.position.copy(this.currentPosition).add(this.shakeOffset);
    this.camera.lookAt(this.target);
  }

  addScreenShake(amount = 0.4) {
    this.shakeIntensity = Math.min(1.2, this.shakeIntensity + amount);
  }

  toggleLockOn(enemy) {
    if (this.lockedEnemy === enemy || !enemy) {
      this.lockedEnemy = null;
    } else {
      this.lockedEnemy = enemy;
    }
    return this.lockedEnemy !== null;
  }

  getForwardDirection() {
    // Forward direction on X-Z plane based on camera yaw
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
  }

  getRightDirection() {
    // Right direction on X-Z plane
    return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
  }
}
