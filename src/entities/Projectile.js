/**
 * Projectile.js
 * Handles magical projectiles: Player Fire Waves, Ice Spikes, Lightning Bolts, and Enemy Void Orbs.
 */

import * as THREE from 'three';

export class Projectile {
  constructor(scene, options) {
    this.scene = scene;
    this.type = options.type; // 'FIRE_WAVE', 'ICE_SPIKE', 'STORM_BOLT', 'VOID', 'VOID_BOSS'
    this.origin = options.origin.clone();
    this.target = options.target.clone();
    this.speed = options.speed || 18.0;
    this.damage = options.damage || 20;
    this.isFromPlayer = options.isFromPlayer || false;
    this.element = options.element || 'FIRE';

    this.position = this.origin.clone();
    this.direction = new THREE.Vector3().subVectors(this.target, this.origin).normalize();
    if (this.direction.lengthSq() < 0.001) this.direction.set(0, 0, 1);

    this.lifeTime = options.lifeTime || 3.0;
    this.elapsed = 0;
    this.isDead = false;

    // Create 3D projectile mesh based on type
    this.mesh = this._createMesh();
    this.mesh.position.copy(this.position);
    this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.direction);
    this.scene.add(this.mesh);
  }

  _createMesh() {
    const group = new THREE.Group();

    if (this.type === 'FIRE_WAVE') {
      // Curved flaming crescent wave
      const geom = new THREE.TorusGeometry(0.8, 0.15, 8, 24, Math.PI * 0.9);
      geom.rotateX(Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.85
      });
      const wave = new THREE.Mesh(geom, mat);
      group.add(wave);

      const coreGeom = new THREE.SphereGeometry(0.2, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
      group.add(new THREE.Mesh(coreGeom, coreMat));
    } else if (this.type === 'ICE_SPIKE') {
      // Razor crystalline ice spike
      const geom = new THREE.ConeGeometry(0.18, 1.2, 6);
      geom.rotateX(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x99eeff,
        emissive: 0x00c3ff,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.2
      });
      group.add(new THREE.Mesh(geom, mat));
    } else if (this.type === 'STORM_BOLT') {
      // Jagged electric bolt
      const geom = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 4);
      geom.rotateX(Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0x66ccff });
      group.add(new THREE.Mesh(geom, mat));
    } else { // VOID / VOID_BOSS
      // Pulsing dark abyssal orb
      const geom = new THREE.SphereGeometry(this.type === 'VOID_BOSS' ? 0.45 : 0.25, 8, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x110022,
        emissive: 0x9900ff,
        emissiveIntensity: 2.0,
        roughness: 0.2
      });
      group.add(new THREE.Mesh(geom, mat));
    }

    return group;
  }

  update(dt, player, enemies, boss, onHitCallback) {
    if (this.isDead) return;

    this.elapsed += dt;
    if (this.elapsed >= this.lifeTime) {
      this.destroy();
      return;
    }

    // Move projectile
    this.position.addScaledVector(this.direction, this.speed * dt);
    this.mesh.position.copy(this.position);

    // Collision check
    if (this.isFromPlayer) {
      // Check collision with normal enemies
      for (let enemy of enemies) {
        if (enemy.isAlive && this.position.distanceTo(enemy.getPosition()) < 1.6) {
          enemy.takeDamage(this.damage, this.element, true);
          if (onHitCallback) onHitCallback(this.position.clone(), this.element);
          this.destroy();
          return;
        }
      }

      // Check collision with Boss
      if (boss && boss.isAlive && this.position.distanceTo(boss.getPosition()) < 3.2) {
        boss.takeDamage(this.damage, this.element);
        if (onHitCallback) onHitCallback(this.position.clone(), this.element);
        this.destroy();
        return;
      }
    } else {
      // Check collision with Player
      if (player && player.isAlive && this.position.distanceTo(player.getPosition()) < 1.5) {
        player.takeDamage(this.damage);
        if (onHitCallback) onHitCallback(this.position.clone(), 'VOID');
        this.destroy();
        return;
      }
    }
  }

  destroy() {
    this.isDead = true;
    this.scene.remove(this.mesh);
  }
}
