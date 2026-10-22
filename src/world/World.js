/**
 * World.js
 * Builds the explorable dark-fantasy battlefield: gothic cathedral ruins,
 * central runic arena floor, lava chasms, atmospheric fog, dynamic lighting, and sky dome.
 */

import * as THREE from 'three';
import { EnvironmentProps } from './EnvironmentProps.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.braziers = [];
    this.flickerTimer = 0;

    this.init();
  }

  init() {
    // 1. Atmospheric Fog
    this.scene.fog = new THREE.FogExp2(0x0e1218, 0.022);

    // 2. Lighting Setup
    this._setupLighting();

    // 3. Terrain & Arena Ground
    this._createTerrain();

    // 4. Central Runic Circle
    this._createRunicCircle();

    // 5. Ruined Fortress Architecture & Props
    this._createRuins();

    // 6. Sky Dome
    this._createSkyDome();
  }

  _setupLighting() {
    // Ambient Light: cool abyssal fill
    const ambient = new THREE.AmbientLight(0x1a2230, 0.85);
    this.scene.add(ambient);

    // Main Directional Light (Moonlight / Eclipse Sun)
    const dirLight = new THREE.DirectionalLight(0xa5c4e8, 1.4);
    dirLight.position.set(25, 45, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;

    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0008;

    this.scene.add(dirLight);

    // Volcanic Underlight
    const lavaUnderLight = new THREE.DirectionalLight(0xff3300, 0.6);
    lavaUnderLight.position.set(-30, -10, -30);
    this.scene.add(lavaUnderLight);
  }

  _createTerrain() {
    // Central Fortress Floor: Cobblestone / dark flagstone texture generated on canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#181b22';
    ctx.fillRect(0, 0, 512, 512);

    // Stone tile grid lines
    ctx.strokeStyle = '#0e1014';
    ctx.lineWidth = 4;
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        // Tile variation
        const shade = Math.floor(Math.random() * 25);
        ctx.fillStyle = `rgb(${22 + shade}, ${26 + shade}, ${32 + shade})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(12, 12);

    const groundGeom = new THREE.PlaneGeometry(75, 75);
    groundGeom.rotateX(-Math.PI / 2);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.8,
      metalness: 0.2
    });

    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Outer Volcanic Lava Trenches
    const lavaGeom = new THREE.PlaneGeometry(160, 160);
    lavaGeom.rotateX(-Math.PI / 2);
    lavaGeom.translate(0, -1.8, 0);

    const lavaMat = new THREE.MeshBasicMaterial({
      color: 0xff3300
    });
    const lava = new THREE.Mesh(lavaGeom, lavaMat);
    this.scene.add(lava);
  }

  _createRunicCircle() {
    // Glowing runic circle decal in center of arena
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);
    ctx.strokeStyle = '#ff5500';
    ctx.lineWidth = 6;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff3300';

    // Outer circles
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.arc(256, 256, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Pentagram / Octagram lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = 256 + Math.cos(angle) * 180;
      const y1 = 256 + Math.sin(angle) * 180;
      const x2 = 256 + Math.cos(angle + Math.PI * 0.75) * 180;
      const y2 = 256 + Math.sin(angle + Math.PI * 0.75) * 180;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const runicTex = new THREE.CanvasTexture(canvas);
    const runicGeom = new THREE.PlaneGeometry(18, 18);
    runicGeom.rotateX(-Math.PI / 2);

    const runicMat = new THREE.MeshBasicMaterial({
      map: runicTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.runicMesh = new THREE.Mesh(runicGeom, runicMat);
    this.runicMesh.position.y = 0.02;
    this.scene.add(this.runicMesh);
  }

  _createRuins() {
    // 1. Grand Entrance Arch at North (Boss Gate)
    const bossArch = EnvironmentProps.createArch(16.0, 11.0);
    bossArch.position.set(0, 0, -32);
    this.scene.add(bossArch);

    // 2. Colonnade of Gothic Pillars enclosing the arena
    const pillarPositions = [
      [-18, -24], [18, -24],
      [-22, -14], [22, -14],
      [-24, -2],  [24, -2],
      [-24, 10],  [24, 10],
      [-20, 22],  [20, 22],
      [-10, 28],  [10, 28]
    ];

    pillarPositions.forEach(([x, z], idx) => {
      const isBroken = idx % 2 === 1;
      const pillar = EnvironmentProps.createPillar(isBroken ? 7.0 : 8.5, 0.75, isBroken);
      pillar.position.set(x, 0, z);
      this.scene.add(pillar);
    });

    // 3. Burning Braziers along perimeter
    const brazierPositions = [
      new THREE.Vector3(-14, 0, -22),
      new THREE.Vector3(14, 0, -22),
      new THREE.Vector3(-16, 0, 4),
      new THREE.Vector3(16, 0, 4),
      new THREE.Vector3(-10, 0, 20),
      new THREE.Vector3(10, 0, 20)
    ];

    brazierPositions.forEach(pos => {
      const brazier = EnvironmentProps.createBrazier(pos);
      this.braziers.push(brazier);
      this.scene.add(brazier);
    });

    // 4. Arcane Crystals
    const crystalPositions = [
      { pos: new THREE.Vector3(-21, 0, -8), color: 0x00d9ff },
      { pos: new THREE.Vector3(21, 0, -8), color: 0x9922ff },
      { pos: new THREE.Vector3(-15, 0, 16), color: 0x3388ff },
      { pos: new THREE.Vector3(15, 0, 16), color: 0xff4400 }
    ];

    crystalPositions.forEach(c => {
      const cluster = EnvironmentProps.createCrystalCluster(c.pos, c.color);
      this.scene.add(cluster);
    });
  }

  _createSkyDome() {
    const skyGeom = new THREE.SphereGeometry(140, 32, 24);
    skyGeom.scale(-1, 1, 1);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#04060a');
    grad.addColorStop(0.5, '#0e121a');
    grad.addColorStop(0.85, '#1e1422');
    grad.addColorStop(1, '#33120d');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      fog: false
    });

    const sky = new THREE.Mesh(skyGeom, skyMat);
    this.scene.add(sky);
  }

  update(dt, playerElement = 'FIRE') {
    // Dynamic brazier light flicker
    this.flickerTimer += dt * 14.0;
    this.braziers.forEach((b, i) => {
      if (b.flickerLight) {
        b.flickerLight.intensity = 16.0 + Math.sin(this.flickerTimer + i * 1.5) * 4.0;
      }
    });

    // Slow rotation of central runic circle
    if (this.runicMesh) {
      this.runicMesh.rotation.y += dt * 0.08;
    }
  }
}
