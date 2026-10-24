/**
 * EnvironmentProps.js - Level 3 Dark Fantasy Overhaul
 * Generates modular atmospheric environment props:
 * - Medieval Timber & Stone Houses
 * - Abandoned Village Wells, Fences, Barrels
 * - Gnarled Dead Forest Trees & Cursed Briar Vines
 * - Corrupted Water Canal & Crystalline Ice Bridge
 * - Ancient Stone Shrine Obelisks & Lightning Conduit Generator
 * - Iron Portcullis & Gothic Fortress Battlements
 * - Interactive Lore Lecterns / Clue pedestals
 */

import * as THREE from 'three';

export class EnvironmentProps {
  static stoneMat = null;
  static woodMat = null;
  static roofMat = null;
  static wattleMat = null;
  static darkIronMat = null;
  static copperMat = null;
  static parchmentMat = null;

  static initMaterials() {
    if (this.stoneMat) return;

    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x343a42,
      roughness: 0.88,
      metalness: 0.12
    });

    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x2e2017,
      roughness: 0.82,
      metalness: 0.08
    });

    this.roofMat = new THREE.MeshStandardMaterial({
      color: 0x1f1816,
      roughness: 0.9,
      metalness: 0.05
    });

    this.wattleMat = new THREE.MeshStandardMaterial({
      color: 0x6e6858,
      roughness: 0.95,
      metalness: 0.02
    });

    this.darkIronMat = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      roughness: 0.45,
      metalness: 0.9
    });

    this.copperMat = new THREE.MeshStandardMaterial({
      color: 0x945b37,
      roughness: 0.35,
      metalness: 0.88
    });

    this.parchmentMat = new THREE.MeshStandardMaterial({
      color: 0xd9cbb2,
      emissive: 0x332811,
      roughness: 0.8
    });
  }

  // --- MEDIEVAL TIMBER & STONE HOUSE ---
  static createMedievalHouse(width = 6.0, height = 5.0, depth = 7.0) {
    this.initMaterials();
    const group = new THREE.Group();

    // 1. Stone Foundation
    const foundationGeom = new THREE.BoxGeometry(width, 1.2, depth);
    foundationGeom.translate(0, 0.6, 0);
    const foundation = new THREE.Mesh(foundationGeom, this.stoneMat);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    group.add(foundation);

    // 2. Wattle-and-Daub Walls
    const wallHeight = height - 1.2;
    const wallGeom = new THREE.BoxGeometry(width - 0.2, wallHeight, depth - 0.2);
    wallGeom.translate(0, 1.2 + wallHeight / 2, 0);
    const walls = new THREE.Mesh(wallGeom, this.wattleMat);
    walls.castShadow = true;
    group.add(walls);

    // 3. Timber Corner Posts
    const postGeom = new THREE.BoxGeometry(0.35, wallHeight + 1.2, 0.35);
    const corners = [
      [-width / 2 + 0.17, -depth / 2 + 0.17],
      [width / 2 - 0.17, -depth / 2 + 0.17],
      [-width / 2 + 0.17, depth / 2 - 0.17],
      [width / 2 - 0.17, depth / 2 - 0.17]
    ];
    corners.forEach(([x, z]) => {
      const post = new THREE.Mesh(postGeom, this.woodMat);
      post.position.set(x, (wallHeight + 1.2) / 2, z);
      post.castShadow = true;
      group.add(post);
    });

    // 4. Sloped Shingle Roof
    const roofGeom = new THREE.ConeGeometry(Math.max(width, depth) * 0.75, 2.5, 4);
    roofGeom.rotateY(Math.PI / 4);
    roofGeom.scale(width / Math.max(width, depth), 1, depth / Math.max(width, depth));
    roofGeom.translate(0, height + 1.25, 0);
    const roof = new THREE.Mesh(roofGeom, this.roofMat);
    roof.castShadow = true;
    group.add(roof);

    // 5. Wooden Door
    const doorGeom = new THREE.BoxGeometry(1.2, 2.1, 0.1);
    const door = new THREE.Mesh(doorGeom, this.woodMat);
    door.position.set(0, 1.05, depth / 2 + 0.05);
    group.add(door);

    return group;
  }

  // --- GNARLED DEAD FOREST TREE ---
  static createDeadTree(height = 7.5) {
    this.initMaterials();
    const group = new THREE.Group();

    // Twisted trunk
    const trunkGeom = new THREE.CylinderGeometry(0.25, 0.55, height, 7);
    trunkGeom.translate(0, height / 2, 0);
    const trunk = new THREE.Mesh(trunkGeom, this.woodMat);
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    group.add(trunk);

    // Twisted bare branches
    for (let b = 0; b < 5; b++) {
      const angle = (b / 5) * Math.PI * 2;
      const bHeight = height * (0.6 + (b % 3) * 0.15);
      const branchGeom = new THREE.ConeGeometry(0.12, 2.6, 5);
      branchGeom.rotateZ(0.9);
      branchGeom.translate(1.1, bHeight, 0);

      const branch = new THREE.Mesh(branchGeom, this.woodMat);
      branch.rotation.y = angle;
      branch.castShadow = true;
      group.add(branch);
    }

    return group;
  }

  // --- CURSED BRIAR THORN VINES (PUZZLE 1 OBSTACLE) ---
  static createCursedVines(width = 6.0, height = 4.0) {
    this.initMaterials();
    const group = new THREE.Group();

    const vineMat = new THREE.MeshStandardMaterial({
      color: 0x1f1412,
      emissive: 0x440a08,
      emissiveIntensity: 0.6,
      roughness: 0.9
    });

    for (let i = 0; i < 9; i++) {
      const curve = new THREE.CylinderGeometry(0.08, 0.06, height + 0.5, 6);
      curve.rotateZ((Math.random() - 0.5) * 0.6);
      const vine = new THREE.Mesh(curve, vineMat);
      vine.position.set((i - 4) * (width / 9), height / 2, (Math.random() - 0.5) * 0.4);
      vine.castShadow = true;
      group.add(vine);
    }

    return group;
  }

  // --- ANCIENT STONE BRAZIER (PUZZLE 1 ELEMENT) ---
  static createAncientBrazier(position = new THREE.Vector3()) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    // Carved stone plinth
    const plinthGeom = new THREE.CylinderGeometry(0.5, 0.65, 1.2, 8);
    plinthGeom.translate(0, 0.6, 0);
    const plinth = new THREE.Mesh(plinthGeom, this.stoneMat);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Iron Fire Basin
    const basinGeom = new THREE.CylinderGeometry(0.7, 0.35, 0.4, 8);
    basinGeom.translate(0, 1.35, 0);
    const basin = new THREE.Mesh(basinGeom, this.darkIronMat);
    basin.castShadow = true;
    group.add(basin);

    // Unlit coals (dark grey by default, turns blazing orange when lit)
    const coalsGeom = new THREE.SphereGeometry(0.48, 8, 6);
    coalsGeom.scale(1, 0.4, 1);
    coalsGeom.translate(0, 1.45, 0);
    const coalsMat = new THREE.MeshStandardMaterial({
      color: 0x221a15,
      roughness: 0.95
    });
    const coals = new THREE.Mesh(coalsGeom, coalsMat);
    group.add(coals);

    // Point Light (starts very dim/off, blazes when ignited)
    const fireLight = new THREE.PointLight(0xff4400, 0, 18.0);
    fireLight.position.set(0, 2.0, 0);
    fireLight.castShadow = true;
    group.add(fireLight);

    group.coalsMesh = coals;
    group.fireLight = fireLight;
    return group;
  }

  // --- CORRUPTED CANAL & CRYSTALLINE ICE BRIDGE (PUZZLE 2) ---
  static createCorruptedCanal(width = 30.0, depth = 8.0) {
    this.initMaterials();
    const group = new THREE.Group();

    // Dark bubbling toxic water
    const canalGeom = new THREE.PlaneGeometry(width, depth);
    canalGeom.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x091410,
      emissive: 0x041a0d,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.95
    });
    const water = new THREE.Mesh(canalGeom, waterMat);
    water.position.y = -0.4;
    group.add(water);

    // Stone embankment borders
    const bankGeom = new THREE.BoxGeometry(width, 0.8, 0.8);
    const bankNorth = new THREE.Mesh(bankGeom, this.stoneMat);
    bankNorth.position.set(0, 0, -depth / 2);
    group.add(bankNorth);

    const bankSouth = new THREE.Mesh(bankGeom, this.stoneMat);
    bankSouth.position.set(0, 0, depth / 2);
    group.add(bankSouth);

    // Crystalline Ice Bridge (hidden until frozen)
    const bridgeGeom = new THREE.BoxGeometry(4.5, 0.35, depth + 1.2);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0x88eeff,
      emissive: 0x00c3ff,
      emissiveIntensity: 1.2,
      roughness: 0.12,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88
    });
    const iceBridge = new THREE.Mesh(bridgeGeom, iceMat);
    iceBridge.position.set(0, 0.05, 0);
    iceBridge.castShadow = true;
    iceBridge.receiveShadow = true;
    group.add(iceBridge);

    group.waterMesh = water;
    group.iceBridge = iceBridge;
    return group;
  }

  // --- LIGHTNING CONDUIT GENERATOR (PUZZLE 3) ---
  static createLightningConduit(position = new THREE.Vector3()) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    // Stone Pedestal
    const baseGeom = new THREE.BoxGeometry(1.6, 1.4, 1.6);
    baseGeom.translate(0, 0.7, 0);
    const base = new THREE.Mesh(baseGeom, this.stoneMat);
    group.add(base);

    // Copper Induction Coils
    for (let c = 0; c < 3; c++) {
      const coilGeom = new THREE.TorusGeometry(0.5, 0.08, 8, 16);
      coilGeom.rotateX(Math.PI / 2);
      const coil = new THREE.Mesh(coilGeom, this.copperMat);
      coil.position.y = 1.6 + c * 0.32;
      group.add(coil);
    }

    // Lightning Terminal Sphere on top
    const sphereGeom = new THREE.SphereGeometry(0.24, 12, 12);
    const termMat = new THREE.MeshStandardMaterial({
      color: 0x4488ff,
      emissive: 0x2266ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.95
    });
    const terminal = new THREE.Mesh(sphereGeom, termMat);
    terminal.position.y = 2.65;
    group.add(terminal);

    const light = new THREE.PointLight(0x3388ff, 0, 16.0);
    light.position.set(0, 2.8, 0);
    group.add(light);

    group.terminal = terminal;
    group.light = light;
    return group;
  }

  // --- HEAVY IRON PORTCULLIS (PUZZLE 3 GATE) ---
  static createPortcullis(width = 6.0, height = 7.0) {
    this.initMaterials();
    const group = new THREE.Group();

    // Vertical Iron Bars
    const barCount = 10;
    const barGeom = new THREE.CylinderGeometry(0.045, 0.045, height, 6);
    for (let i = 0; i < barCount; i++) {
      const bar = new THREE.Mesh(barGeom, this.darkIronMat);
      bar.position.set((i - (barCount - 1) / 2) * (width / barCount), height / 2, 0);
      bar.castShadow = true;
      group.add(bar);
    }

    // Horizontal crossbars
    for (let h = 0; h < 4; h++) {
      const crossGeom = new THREE.BoxGeometry(width, 0.09, 0.1);
      const cross = new THREE.Mesh(crossGeom, this.darkIronMat);
      cross.position.set(0, 1.2 + h * 1.6, 0);
      group.add(cross);
    }

    return group;
  }

  // --- INTERACTIVE STORY CLUE PEDESTAL ---
  static createCluePedestal(position = new THREE.Vector3()) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    // Carved stone lectern
    const baseGeom = new THREE.CylinderGeometry(0.3, 0.45, 0.9, 8);
    baseGeom.translate(0, 0.45, 0);
    const base = new THREE.Mesh(baseGeom, this.stoneMat);
    group.add(base);

    // Slanted top shelf
    const shelfGeom = new THREE.BoxGeometry(0.65, 0.1, 0.5);
    shelfGeom.rotateX(-0.4);
    shelfGeom.translate(0, 0.98, 0);
    const shelf = new THREE.Mesh(shelfGeom, this.stoneMat);
    group.add(shelf);

    // Glowing ancient parchment scroll
    const parchmentGeom = new THREE.PlaneGeometry(0.42, 0.32);
    parchmentGeom.rotateX(-0.4 - Math.PI / 2);
    parchmentGeom.translate(0, 1.05, 0.02);
    const parchment = new THREE.Mesh(parchmentGeom, this.parchmentMat);
    group.add(parchment);

    // Subtle mystical beacon light
    const beacon = new THREE.PointLight(0xffea99, 4.0, 5.0);
    beacon.position.set(0, 1.4, 0);
    group.add(beacon);

    return group;
  }

  // --- EXIT GATEWAY / MIGRATION PORTAL ---
  static createExitGateway(position = new THREE.Vector3(), targetLevelNum = 2) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    // Stone Archway Pillars
    const pillarGeom = new THREE.BoxGeometry(1.0, 5.5, 1.0);
    const pillarL = new THREE.Mesh(pillarGeom, this.stoneMat);
    pillarL.position.set(-2.5, 2.75, 0);
    pillarL.castShadow = true;
    group.add(pillarL);

    const pillarR = new THREE.Mesh(pillarGeom, this.stoneMat);
    pillarR.position.set(2.5, 2.75, 0);
    pillarR.castShadow = true;
    group.add(pillarR);

    // Lintel Header
    const lintelGeom = new THREE.BoxGeometry(6.6, 1.0, 1.2);
    const lintel = new THREE.Mesh(lintelGeom, this.stoneMat);
    lintel.position.set(0, 5.5, 0);
    group.add(lintel);

    // Shimmering Golden/Cyan Vortex Veil
    const veilGeom = new THREE.PlaneGeometry(4.2, 5.0);
    const veilMat = new THREE.MeshBasicMaterial({
      color: 0x00e1ff,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const veil = new THREE.Mesh(veilGeom, veilMat);
    veil.position.set(0, 2.5, 0);
    group.add(veil);

    // Portal Light
    const portalLight = new THREE.PointLight(0x00ffff, 3.5, 12);
    portalLight.position.set(0, 2.8, 0);
    group.add(portalLight);

    group.veil = veil;
    group.portalLight = portalLight;
    group.targetLevel = targetLevelNum;
    return group;
  }

  // --- HIDDEN RELIC CHEST (ECHO VISION DISCOVERY) ---
  static createRelicChest(position = new THREE.Vector3(), relicName = 'Ancient Relic') {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    const chestMat = new THREE.MeshStandardMaterial({
      color: 0x221811,
      roughness: 0.6,
      metalness: 0.4
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.9,
      emissive: 0x886611,
      emissiveIntensity: 0.5
    });

    // Base body
    const baseGeom = new THREE.BoxGeometry(0.9, 0.5, 0.6);
    baseGeom.translate(0, 0.25, 0);
    const base = new THREE.Mesh(baseGeom, chestMat);
    group.add(base);

    // Curved Lid
    const lidGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12, 1, false, 0, Math.PI);
    lidGeom.rotateZ(Math.PI / 2);
    lidGeom.translate(0, 0.5, 0);
    const lid = new THREE.Mesh(lidGeom, goldTrimMat);
    group.add(lid);

    // Spectral Echo Rune Beacon (Pulsing, visible in Echo Vision)
    const echoRuneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0, // Hidden until Echo Vision activates
      blending: THREE.AdditiveBlending
    });
    echoRuneMat.userData = { isEchoMaterial: true };

    const beaconGeom = new THREE.OctahedronGeometry(0.25);
    const beacon = new THREE.Mesh(beaconGeom, echoRuneMat);
    beacon.position.set(0, 1.2, 0);
    group.add(beacon);

    group.beacon = beacon;
    group.relicName = relicName;
    group.isOpened = false;
    return group;
  }

  // --- ANCIENT RUNIC ECHO PILLAR ---
  static createEchoRunePillar(position = new THREE.Vector3()) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    const pillarGeom = new THREE.CylinderGeometry(0.55, 0.65, 5.5, 8);
    pillarGeom.translate(0, 2.75, 0);
    const pillar = new THREE.Mesh(pillarGeom, this.stoneMat);
    pillar.castShadow = true;
    group.add(pillar);

    // Glowing Spectral Inscription Ribbon
    const runeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    runeMat.userData = { isEchoMaterial: true };

    const ringGeom = new THREE.CylinderGeometry(0.58, 0.68, 1.8, 8, 1, true);
    ringGeom.translate(0, 2.8, 0);
    const ring = new THREE.Mesh(ringGeom, runeMat);
    group.add(ring);

    group.runeMesh = ring;
    return group;
  }

  // --- SUBMERGED WATER SURFACE (LEVEL 3 SUNKEN SHRINE) ---
  static createWaterSurface(width = 60, depth = 60) {
    const geom = new THREE.PlaneGeometry(width, depth, 16, 16);
    geom.rotateX(-Math.PI / 2);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x081c2c,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.72
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = 0.05; // Resting just above stone floor
    return mesh;
  }

  // --- GOTHIC FORTRESS BATTLEMENT TOWER (LEVEL 4) ---
  static createFortressTower(height = 12, radius = 2.4) {
    this.initMaterials();
    const group = new THREE.Group();

    // Tower Body
    const bodyGeom = new THREE.CylinderGeometry(radius * 0.9, radius, height, 10);
    bodyGeom.translate(0, height / 2, 0);
    const body = new THREE.Mesh(bodyGeom, this.stoneMat);
    body.castShadow = true;
    group.add(body);

    // Parapet Platform
    const platformGeom = new THREE.CylinderGeometry(radius * 1.15, radius * 0.95, 1.2, 10);
    platformGeom.translate(0, height + 0.6, 0);
    const platform = new THREE.Mesh(platformGeom, this.stoneMat);
    group.add(platform);

    // Crenellations
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const merlonGeom = new THREE.BoxGeometry(0.7, 0.9, 0.35);
      const merlon = new THREE.Mesh(merlonGeom, this.stoneMat);
      merlon.position.set(
        Math.cos(angle) * radius * 1.05,
        height + 1.45,
        Math.sin(angle) * radius * 1.05
      );
      merlon.rotation.y = -angle;
      group.add(merlon);
    }

    return group;
  }

  // --- ABYSSAL OBSIDIAN CRYSTAL (LEVEL 5 HEART OF THE CURSE) ---
  static createAbyssalCrystal(scale = 1.0) {
    const group = new THREE.Group();
    group.scale.set(scale, scale, scale);

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x180a24,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x7700cc,
      emissiveIntensity: 1.4
    });

    const geom = new THREE.ConeGeometry(0.6, 3.2, 5);
    const crystal = new THREE.Mesh(geom, crystalMat);
    crystal.position.y = 1.6;
    crystal.castShadow = true;
    group.add(crystal);

    const light = new THREE.PointLight(0x9922ff, 1.8, 8.0);
    light.position.y = 1.8;
    group.add(light);

    return group;
  }

  // --- MEDIEVAL VILLAGE WELL ---
  static createMedievalWell(position = new THREE.Vector3()) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    // Stone rim
    const rimGeom = new THREE.CylinderGeometry(1.2, 1.3, 0.9, 12, 1, true);
    rimGeom.translate(0, 0.45, 0);
    const rim = new THREE.Mesh(rimGeom, this.stoneMat);
    rim.castShadow = true;
    group.add(rim);

    // Well inner dark water
    const waterGeom = new THREE.CircleGeometry(1.15, 12);
    waterGeom.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x071118, roughness: 0.1, metalness: 0.8 });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.position.y = 0.2;
    group.add(water);

    // Support wooden posts
    const postGeom = new THREE.BoxGeometry(0.2, 2.4, 0.2);
    const postL = new THREE.Mesh(postGeom, this.woodMat);
    postL.position.set(-1.1, 1.2, 0);
    postL.castShadow = true;
    const postR = new THREE.Mesh(postGeom, this.woodMat);
    postR.position.set(1.1, 1.2, 0);
    postR.castShadow = true;
    group.add(postL, postR);

    // Wooden cross beam
    const beamGeom = new THREE.BoxGeometry(2.4, 0.2, 0.2);
    const beam = new THREE.Mesh(beamGeom, this.woodMat);
    beam.position.set(0, 2.3, 0);
    group.add(beam);

    // Small pitched roof
    const roofGeom = new THREE.ConeGeometry(1.6, 0.9, 4);
    roofGeom.rotateY(Math.PI / 4);
    roofGeom.translate(0, 2.85, 0);
    const roof = new THREE.Mesh(roofGeom, this.roofMat);
    roof.castShadow = true;
    group.add(roof);

    return group;
  }

  // --- STONE GATE ARCH ---
  static createStoneGateArch(width = 7.5, height = 6.0) {
    this.initMaterials();
    const group = new THREE.Group();

    const pillarRadius = 0.6;
    const pillarGeom = new THREE.CylinderGeometry(pillarRadius, pillarRadius * 1.1, height, 8);
    pillarGeom.translate(0, height / 2, 0);

    const pillarL = new THREE.Mesh(pillarGeom, this.stoneMat);
    pillarL.position.x = -width / 2;
    pillarL.castShadow = true;
    pillarL.receiveShadow = true;

    const pillarR = new THREE.Mesh(pillarGeom, this.stoneMat);
    pillarR.position.x = width / 2;
    pillarR.castShadow = true;
    pillarR.receiveShadow = true;

    // Header / arch lintel
    const lintelGeom = new THREE.BoxGeometry(width + 1.2, 0.8, 1.4);
    lintelGeom.translate(0, height + 0.4, 0);
    const lintel = new THREE.Mesh(lintelGeom, this.stoneMat);
    lintel.castShadow = true;

    group.add(pillarL, pillarR, lintel);
    return group;
  }
}
