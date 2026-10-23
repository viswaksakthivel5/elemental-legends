/**
 * World.js - Level 3 Dark Fantasy Overhaul
 * Constructs the 4 connected zones:
 * 1. The Forgotten Village (Medieval houses, wells, 3 braziers, Clue 1, thorn gate)
 * 2. The Haunted Forest (Dead trees, eerie fog, Clue 2, corrupted canal & ice bridge)
 * 3. The Ancient Elemental Shrine (Gothic pillars, obelisks, Clue 3, lightning conduit)
 * 4. The Ruined Fortress (Iron portcullis, fortress walls, The Hollow Guardian boss sanctum)
 */

import * as THREE from 'three';
import { EnvironmentProps } from './EnvironmentProps.js';

export class World {
  constructor(scene, puzzleManager) {
    this.scene = scene;
    this.puzzleManager = puzzleManager;

    this.brazierEntities = [];
    this.lightningTimer = 0;
    this.skyDome = null;
    this.dirLight = null;

    this.init();
  }

  init() {
    // 1. Atmospheric Mountain Mist (Matching Reference Photo - Soft Cold Fog with High Near-Field Visibility)
    const fogColor = 0x6e7f91;
    this.scene.background = new THREE.Color(fogColor);
    this.scene.fog = new THREE.Fog(fogColor, 18, 95);

    // 2. Cinematic Overcast Daylight Lighting (Prevents any pitch-black dark surroundings)
    this._setupLighting();

    // 3. Terrain & Muddy Cobblestone Road
    this._createTerrain();

    // 4. Build Zone 1: The Forgotten Village (Z: 28 to 5)
    this._buildForgottenVillage();

    // 5. Build Zone 2: The Haunted Forest & Canal (Z: 5 to -14)
    this._buildHauntedForest();

    // 6. Build Zone 3: The Ancient Shrine & Conduit (Z: -14 to -25)
    this._buildAncientShrine();

    // 7. Build Zone 4: The Ruined Fortress (Z: -25 to -50)
    this._buildRuinedFortress();

    // 8. Stormy Mist Sky Dome
    this._createSkyDome();
  }

  _setupLighting() {
    // 1. Soft, high-visibility overcast ambient skylight
    const ambient = new THREE.AmbientLight(0xabc0d4, 1.85);
    this.scene.add(ambient);

    // 2. Primary directional sunlight penetrating through mist
    this.dirLight = new THREE.DirectionalLight(0xf2f7fc, 2.2);
    this.dirLight.position.set(25, 45, 15);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 140;

    const d = 45;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0006;
    this.scene.add(this.dirLight);

    // 3. Secondary Rim / Back light for crisp character & tree silhouettes
    const rimLight = new THREE.DirectionalLight(0x8ba2b8, 1.3);
    rimLight.position.set(-25, 30, -25);
    this.scene.add(rimLight);

    // 4. Front fill light so character face, fur collar, and chest gambeson are crystal clear
    const frontFill = new THREE.DirectionalLight(0xdde6f0, 0.85);
    frontFill.position.set(0, 15, 35);
    this.scene.add(frontFill);
  }

  _createTerrain() {
    // Muddy gravel and stone road texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3a434d';
    ctx.fillRect(0, 0, 512, 512);

    // Gravel, stone, and earth speckling
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const c = Math.floor(Math.random() * 45);
      ctx.fillStyle = `rgb(${48 + c}, ${56 + c}, ${64 + c})`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Puddle wet patches
    for (let i = 0; i < 18; i++) {
      const px = Math.random() * 480;
      const py = Math.random() * 480;
      const rad = 15 + Math.random() * 30;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(28, 34, 40, 0.55)';
      ctx.fill();
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(16, 24);

    const groundGeom = new THREE.PlaneGeometry(80, 120);
    groundGeom.rotateX(-Math.PI / 2);
    groundGeom.translate(0, 0, -10);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.72,
      metalness: 0.12
    });

    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  // --- ZONE 1: THE FORGOTTEN VILLAGE ---
  _buildForgottenVillage() {
    // Medieval Houses lining the village road
    const housePositions = [
      { x: -11, z: 22, rot: 0.2 },
      { x: 11, z: 22, rot: -0.2 },
      { x: -12, z: 12, rot: 0.1 },
      { x: 12, z: 12, rot: -0.15 }
    ];

    housePositions.forEach(p => {
      const house = EnvironmentProps.createMedievalHouse(6.5, 5.2, 7.5);
      house.position.set(p.x, 0, p.z);
      house.rotation.y = p.rot;
      this.scene.add(house);
    });

    // Village Well at center-left
    const wellGeom = new THREE.CylinderGeometry(1.1, 1.2, 0.9, 8);
    wellGeom.translate(-4, 0.45, 18);
    const well = new THREE.Mesh(wellGeom, new THREE.MeshStandardMaterial({ color: 0x333840, roughness: 0.9 }));
    well.castShadow = true;
    this.scene.add(well);

    // Clue 1 Pedestal: Village Elder's Journal
    const clue1 = EnvironmentProps.createCluePedestal(new THREE.Vector3(-6, 0, 14));
    this.scene.add(clue1);

    // Puzzle 1: 3 Ancient Stone Braziers
    const brazierPositions = [
      new THREE.Vector3(-4.5, 0, 7.5),
      new THREE.Vector3(4.5, 0, 7.5),
      new THREE.Vector3(0, 0, 5.5)
    ];

    brazierPositions.forEach((pos, idx) => {
      const brazier = EnvironmentProps.createAncientBrazier(pos);
      this.scene.add(brazier);
      this.brazierEntities.push(brazier);
      if (this.puzzleManager) {
        this.puzzleManager.registerBrazier(brazier, brazier.fireLight, idx);
      }
    });

    // Cursed Thorn Vines blocking Forest Gate
    const vines = EnvironmentProps.createCursedVines(8.0, 4.5);
    vines.position.set(0, 0, 4.5);
    this.scene.add(vines);

    // Stone Archway at Village Boundary
    const gateArch = this._createStoneGateArch(8.0, 6.0);
    gateArch.position.set(0, 0, 4.8);
    this.scene.add(gateArch);

    if (this.puzzleManager) {
      this.puzzleManager.registerVillageGate(gateArch, vines);
    }
  }

  // --- ZONE 2: THE HAUNTED FOREST & CORRUPTED CANAL ---
  _buildHauntedForest() {
    // Gnarled dead oak trees scattered through forest
    const treePositions = [
      [-9, 2], [9, 1], [-12, -2], [11, -3],
      [-7, -7], [8, -8], [-14, -13], [13, -12],
      [-5, 0], [6, -1]
    ];

    treePositions.forEach(([x, z]) => {
      const tree = EnvironmentProps.createDeadTree(6.5 + Math.random() * 2.5);
      tree.position.set(x, 0, z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(tree);
    });

    // Clue 2 Pedestal: Scholar's Frost Parchment
    const clue2 = EnvironmentProps.createCluePedestal(new THREE.Vector3(8, 0, -4));
    this.scene.add(clue2);

    // Puzzle 2: Corrupted Canal and Crystalline Ice Bridge
    const canal = EnvironmentProps.createCorruptedCanal(34.0, 8.0);
    canal.position.set(0, 0, -9);
    this.scene.add(canal);

    if (this.puzzleManager) {
      this.puzzleManager.registerCanal(canal.waterMesh, canal.iceBridge);
    }
  }

  // --- ZONE 3: THE ANCIENT SHRINE & CONDUIT ---
  _buildAncientShrine() {
    // Ancient stone pillars flanking the shrine pathway
    const pillarPositions = [
      [-7, -15], [7, -15],
      [-8, -19], [8, -19],
      [-6, -23], [6, -23]
    ];

    pillarPositions.forEach(([x, z], idx) => {
      const pillarGeom = new THREE.CylinderGeometry(0.55, 0.65, 6.5, 8);
      pillarGeom.translate(0, 3.25, 0);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3a4049, roughness: 0.85 });
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(x, 0, z);
      pillar.castShadow = true;
      this.scene.add(pillar);
    });

    // Clue 3 Pedestal: Warden's Runic Inscription
    const clue3 = EnvironmentProps.createCluePedestal(new THREE.Vector3(-7, 0, -22));
    this.scene.add(clue3);

    // Puzzle 3: Lightning Conduit Generator
    const conduit = EnvironmentProps.createLightningConduit(new THREE.Vector3(6, 0, -22));
    this.scene.add(conduit);

    // Heavy Fortress Gatehouse with Portcullis
    const fortressGateArch = this._createStoneGateArch(9.0, 7.5);
    fortressGateArch.position.set(0, 0, -25.5);
    this.scene.add(fortressGateArch);

    const portcullis = EnvironmentProps.createPortcullis(6.2, 6.5);
    portcullis.position.set(0, 0, -25.5);
    this.scene.add(portcullis);

    if (this.puzzleManager) {
      this.puzzleManager.registerConduit(conduit, conduit.light, portcullis);
    }
  }

  // --- ZONE 4: THE RUINED FORTRESS KEEP & BOSS SANCTUM ---
  _buildRuinedFortress() {
    // Fortress Arena perimeter walls (Z: -26 to -48)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x22262d,
      roughness: 0.9,
      metalness: 0.2
    });

    // Left wall
    const wallLGeom = new THREE.BoxGeometry(1.6, 9.0, 24.0);
    wallLGeom.translate(-16, 4.5, -37);
    const wallL = new THREE.Mesh(wallLGeom, wallMat);
    wallL.castShadow = true;
    this.scene.add(wallL);

    // Right wall
    const wallRGeom = new THREE.BoxGeometry(1.6, 9.0, 24.0);
    wallRGeom.translate(16, 4.5, -37);
    const wallR = new THREE.Mesh(wallRGeom, wallMat);
    wallR.castShadow = true;
    this.scene.add(wallR);

    // Back Keep Wall
    const wallBackGeom = new THREE.BoxGeometry(32.0, 12.0, 2.0);
    wallBackGeom.translate(0, 6.0, -49);
    const wallBack = new THREE.Mesh(wallBackGeom, wallMat);
    wallBack.castShadow = true;
    this.scene.add(wallBack);

    // Boss Dais Runic Floor
    const daisGeom = new THREE.CylinderGeometry(8.5, 9.0, 0.4, 16);
    daisGeom.translate(0, 0.2, -37);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.85
    });
    const dais = new THREE.Mesh(daisGeom, daisMat);
    dais.receiveShadow = true;
    this.scene.add(dais);
  }

  _createStoneGateArch(width = 8.0, height = 6.0) {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2b313a, roughness: 0.9 });

    // Left Post
    const postGeom = new THREE.BoxGeometry(1.2, height, 1.2);
    postGeom.translate(-width / 2, height / 2, 0);
    group.add(new THREE.Mesh(postGeom, stoneMat));

    // Right Post
    const postR = new THREE.Mesh(postGeom, stoneMat);
    postR.position.x = width;
    group.add(postR);

    // Lintel Arch
    const lintelGeom = new THREE.BoxGeometry(width + 2.0, 1.2, 1.4);
    lintelGeom.translate(0, height + 0.6, 0);
    group.add(new THREE.Mesh(lintelGeom, stoneMat));

    return group;
  }

  _createSkyDome() {
    const skyGeom = new THREE.SphereGeometry(150, 32, 24);
    skyGeom.scale(-1, 1, 1);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Misty mountain overcast gradient (Matching Reference Photo)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#2e3a47');   // Dark slate overcast zenith
    grad.addColorStop(0.35, '#4a5b6c'); // Cool atmospheric cloud layer
    grad.addColorStop(0.7, '#6b7d8f');  // Misty mountain haze
    grad.addColorStop(1, '#8e9fac');   // Pale cold horizon mist

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      fog: false
    });

    this.skyDome = new THREE.Mesh(skyGeom, skyMat);
    this.scene.add(this.skyDome);
  }

  update(dt, playerElement = 'FIRE') {
    // Distant storm lightning flashes on horizon
    this.lightningTimer += dt;
    if (this.lightningTimer > 9.0 + Math.random() * 6.0) {
      this.lightningTimer = 0;
      if (this.dirLight) {
        this.dirLight.intensity = 3.5;
        setTimeout(() => {
          if (this.dirLight) this.dirLight.intensity = 1.25;
        }, 120);
      }
    }
  }
}
