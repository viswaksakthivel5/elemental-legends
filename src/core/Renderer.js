/**
 * Renderer.js
 * Configures Three.js WebGLRenderer, shadow maps, tonemapping, and optional Bloom post-processing.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class GameRenderer {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.renderer = null;
    this.composer = null;
    this.bloomPass = null;
    this.renderPass = null;
    this.isBloomEnabled = true;

    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      stencil: false,
      depth: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = 'game-canvas';
  }

  setupPostProcessing(scene, camera) {
    try {
      this.composer = new EffectComposer(this.renderer);
      this.renderPass = new RenderPass(scene, camera);
      this.composer.addPass(this.renderPass);

      // Dark-fantasy bloom: subtle glow on magic runes, fire trails, ice crystals
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.75, // strength
        0.35, // radius
        0.7   // threshold
      );
      this.composer.addPass(this.bloomPass);
      this.isBloomEnabled = true;
    } catch (e) {
      console.warn('Post-processing setup failed, using standard rendering:', e);
      this.composer = null;
      this.isBloomEnabled = false;
    }
  }

  setQuality(preset) {
    if (preset === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
      this.isBloomEnabled = false;
    } else if (preset === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
      this.renderer.setPixelRatio(1.0);
      this.isBloomEnabled = false;
    } else { // High
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      this.isBloomEnabled = true;
    }
  }

  render(scene, camera) {
    if (this.isBloomEnabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(scene, camera);
    }
  }

  onResize(camera) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  getDomElement() {
    return this.renderer.domElement;
  }
}
