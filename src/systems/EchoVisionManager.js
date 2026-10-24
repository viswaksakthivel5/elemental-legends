/**
 * EchoVisionManager.js
 * Signature Level 4 exploration mechanic: ECHO VISION.
 * Allows the warrior to peer into the residual memories and primordial elemental traces
 * of the cursed realm, revealing:
 * 1. Celestial waypoint footprints leading toward active objectives.
 * 2. Hidden ancient runes etched into monoliths, ruins, and stone mechanisms.
 * 3. Secret relic caches and optional lore inscriptions.
 * 4. Highlighting vulnerable enemy cores and boss weak points for 2x critical strikes.
 */

import * as THREE from 'three';
import { soundManager } from '../core/SoundManager.js';

export class EchoVisionManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.isActive = false;

    // Callbacks
    this.onToggle = null; // (isActive) => {}

    // 3D Visual Objects group for Echo Vision
    this.echoGroup = new THREE.Group();
    this.echoGroup.name = 'EchoVisionGroup';
    this.echoGroup.visible = false;
    this.scene.add(this.echoGroup);

    // Dynamic Waypoint Footprints / Celestial Trail
    this.trailPoints = [];
    this.trailMesh = null;
    this._initTrail();

    // Registered spectral revealable objects (Runes, Secrets, Clues)
    this.registeredReveals = [];

    // Ambient floating spectral particles
    this.spectralDust = this._createSpectralDust();
    this.echoGroup.add(this.spectralDust);

    // Audio hum oscillator reference
    this._humOsc = null;
    this._humGain = null;
  }

  _initTrail() {
    const maxSteps = 45;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(maxSteps * 3);
    const alphas = new Float32Array(maxSteps);

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const mat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.trailMesh = new THREE.Points(geom, mat);
    this.echoGroup.add(this.trailMesh);
  }

  _createSpectralDust() {
    const count = 200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.22,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    return new THREE.Points(geom, mat);
  }

  setWaypointPath(waypoints) {
    this.trailPoints = waypoints || [];
    this._updateTrailMesh();
  }

  _updateTrailMesh() {
    if (!this.trailMesh) return;
    const positions = this.trailMesh.geometry.attributes.position.array;

    for (let i = 0; i < 45; i++) {
      if (i < this.trailPoints.length) {
        const p = this.trailPoints[i];
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y + 0.15; // slightly above ground
        positions[i * 3 + 2] = p.z;
      } else {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -100; // hide unused
        positions[i * 3 + 2] = 0;
      }
    }
    this.trailMesh.geometry.attributes.position.needsUpdate = true;
  }

  registerRevealable(object3D, type = 'RUNE') {
    // type: 'RUNE', 'SECRET', 'WEAKPOINT', 'CLUE'
    this.registeredReveals.push({ object: object3D, type });
    // Initially hide if not active
    this._applyObjectVisibility(object3D, this.isActive);
  }

  clearRevealables() {
    this.registeredReveals = [];
    this.trailPoints = [];
    this._updateTrailMesh();
  }

  _applyObjectVisibility(object3D, isVisible) {
    if (!object3D) return;
    object3D.visible = isVisible;
    object3D.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => {
            if (m.userData && m.userData.isEchoMaterial) {
              m.opacity = isVisible ? 0.95 : 0.0;
            }
          });
        } else if (child.material.userData && child.material.userData.isEchoMaterial) {
          child.material.opacity = isVisible ? 0.95 : 0.0;
        }
      }
    });
  }

  toggle() {
    this.isActive = !this.isActive;
    this._onStateChange();
    return this.isActive;
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;
    this._onStateChange();
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;
    this._onStateChange();
  }

  _onStateChange() {
    this.echoGroup.visible = this.isActive;

    // Apply visibility to all registered objects
    this.registeredReveals.forEach(r => {
      this._applyObjectVisibility(r.object, this.isActive);
    });

    // Sound effect
    if (this.isActive) {
      soundManager.playEchoVisionActive();
    } else {
      soundManager.playEchoVisionDeactive();
    }

    // Toggle screen vignette in DOM
    const vignette = document.getElementById('echo-vignette');
    if (vignette) {
      if (this.isActive) {
        vignette.classList.add('active');
      } else {
        vignette.classList.remove('active');
      }
    }

    if (this.onToggle) {
      this.onToggle(this.isActive);
    }
  }

  update(dt, playerPosition) {
    if (!this.isActive) return;

    // Center spectral dust around player
    if (this.spectralDust && playerPosition) {
      this.spectralDust.position.set(playerPosition.x, 0, playerPosition.z);
    }

    // Pulse registered revealable runes
    const time = performance.now() * 0.003;
    const pulseFactor = 0.75 + Math.sin(time) * 0.25;

    this.registeredReveals.forEach(r => {
      if (r.object && r.object.visible) {
        r.object.traverse(child => {
          if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = pulseFactor * 2.5;
          }
        });
      }
    });
  }
}
