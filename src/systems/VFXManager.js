/**
 * VFXManager.js
 * Particle systems for fire embers, ice crystals, lightning sparks, sword slash arcs,
 * ground shockwaves, danger telegraph decals, and floating 3D/DOM damage numbers.
 */

import * as THREE from 'three';

export class VFXManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.particles = [];
    this.shockwaves = [];
    this.telegraphs = [];
    this.slashArcs = [];

    // Ambient floating embers & ash particles
    this.ambientEmbers = this._createAmbientEmbers();

    // Damage numbers container in HTML
    this.damageContainer = document.getElementById('damage-numbers-container');
  }

  _createAmbientEmbers() {
    const count = 350;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // Fiery orange / ash gray mix
      if (Math.random() > 0.4) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.35 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.05;
      } else {
        const c = 0.4 + Math.random() * 0.3;
        colors[i * 3] = c;
        colors[i * 3 + 1] = c;
        colors[i * 3 + 2] = c;
      }
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geom, mat);
    this.scene.add(points);
    return points;
  }

  update(dt) {
    // 1. Update ambient embers
    if (this.ambientEmbers) {
      const pos = this.ambientEmbers.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += dt * 0.8; // Drift upwards
        pos[i] += Math.sin(pos[i + 1] * 0.8) * dt * 0.2;
        if (pos[i + 1] > 16) {
          pos[i + 1] = 0.1;
          pos[i] = (Math.random() - 0.5) * 80;
          pos[i + 2] = (Math.random() - 0.5) * 80;
        }
      }
      this.ambientEmbers.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update burst particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.8 * dt; // Gravity
      const scale = (p.life / p.maxLife) * p.initialScale;
      p.mesh.scale.set(scale, scale, scale);
    }

    // 3. Update expanding shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.scene.remove(sw.mesh);
        this.shockwaves.splice(i, 1);
        continue;
      }

      const t = 1.0 - (sw.life / sw.maxLife);
      const currentRadius = sw.maxRadius * t;
      sw.mesh.scale.set(currentRadius, currentRadius, 1);
      sw.mesh.material.opacity = (1.0 - t) * 0.8;
    }

    // 4. Update warning telegraph decals
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const tg = this.telegraphs[i];
      tg.elapsed += dt;
      if (tg.elapsed >= tg.duration) {
        this.scene.remove(tg.mesh);
        this.telegraphs.splice(i, 1);
        continue;
      }

      const pulse = 0.4 + Math.sin(tg.elapsed * 12.0) * 0.25;
      tg.mesh.material.opacity = pulse;
    }

    // 5. Update slash arc trails
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      const arc = this.slashArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) {
        this.scene.remove(arc.mesh);
        this.slashArcs.splice(i, 1);
        continue;
      }
      arc.mesh.material.opacity = (arc.life / arc.maxLife) * 0.7;
    }
  }

  // --- BURST PARTICLES (Impact Sparks & Explosions) ---
  spawnHitSparks(position, element = 'FIRE', count = 14) {
    let color = 0xff4400;
    if (element === 'ICE') color = 0x00c3ff;
    else if (element === 'STORM') color = 0xffe600;
    else if (element === 'VOID') color = 0xa832a8;

    for (let i = 0; i < count; i++) {
      const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.0 + Math.random() * 4.5,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.35 + Math.random() * 0.3,
        maxLife: 0.6,
        initialScale: 1.0
      });
    }
  }

  // --- EXPANDING GROUND SHOCKWAVE ---
  spawnShockwave(position, maxRadius = 4.5, color = 0xff3300) {
    const ringGeom = new THREE.RingGeometry(0.7, 1.0, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(ringGeom, ringMat);
    mesh.position.copy(position);
    mesh.position.y = 0.05;
    mesh.scale.set(0.1, 0.1, 1);

    this.scene.add(mesh);
    this.shockwaves.push({
      mesh,
      maxRadius,
      life: 0.55,
      maxLife: 0.55
    });
  }

  // --- DANGER TELEGRAPH DECAL ---
  spawnTelegraph(position, radius = 4.0, duration = 1.0) {
    const circleGeom = new THREE.CircleGeometry(radius, 32);
    circleGeom.rotateX(-Math.PI / 2);
    const circleMat = new THREE.MeshBasicMaterial({
      color: 0xff0022,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(circleGeom, circleMat);
    mesh.position.copy(position);
    mesh.position.y = 0.04;

    this.scene.add(mesh);
    this.telegraphs.push({
      mesh,
      duration,
      elapsed: 0
    });
  }

  // --- SWORD SLASH ARC TRAIL ---
  spawnSlashArc(position, facingAngle, element = 'FIRE') {
    let color = 0xff4400;
    if (element === 'ICE') color = 0x00c3ff;
    else if (element === 'STORM') color = 0x3388ff;

    const arcGeom = new THREE.RingGeometry(1.2, 1.8, 16, 1, 0, Math.PI * 0.85);
    arcGeom.rotateX(Math.PI / 2);
    arcGeom.rotateY(facingAngle + Math.PI / 4);

    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(arcGeom, mat);
    mesh.position.copy(position);
    mesh.position.y += 1.2;

    this.scene.add(mesh);
    this.slashArcs.push({
      mesh,
      life: 0.22,
      maxLife: 0.22
    });
  }

  // --- FLOATING COMBAT DAMAGE NUMBERS ---
  spawnDamageText(worldPos, damage, isCrit = false, element = 'PHYSICAL') {
    if (!this.damageContainer) return;

    const screenPos = worldPos.clone().project(this.camera);
    if (screenPos.z > 1.0) return; // Behind camera

    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.createElement('div');
    el.className = `dmg-number ${isCrit ? 'dmg-crit' : ''} dmg-${element.toLowerCase()}`;
    el.innerText = `${isCrit ? 'CRIT! ' : ''}${Math.round(damage)}`;
    el.style.left = `${x + (Math.random() - 0.5) * 40}px`;
    el.style.top = `${y + (Math.random() - 0.5) * 20}px`;

    this.damageContainer.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 850);
  }
}
