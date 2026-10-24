/**
 * LevelManager.js - Level 4 Multi-Level Campaign Architecture
 * Orchestrates the 5 distinct playable levels:
 * Level 1: The Forgotten Village (Tutorial, Fire Braziers, Elder's Journal, Thorn Gate)
 * Level 2: The Whispering Forest (Dead Oaks, Ice Canal Freeze, Scholar's Parchment, Frostfire Relic)
 * Level 3: The Sunken Shrine (Flooded Temple, Storm Conduit Dynamo, Sentinel Mini-Boss, Warden's Inscription)
 * Level 4: The Hollow Fortress (Stone Towers, Dual Winch Lock, Fortress Warmaster, Aegis Relic)
 * Level 5: The Heart of the Curse (Abyssal Obsidian Sanctum, The Hollow Guardian Epic 3-Phase Finale)
 */

import * as THREE from 'three';
import { EnvironmentProps } from './EnvironmentProps.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { soundManager } from '../core/SoundManager.js';
import { SaveManager } from '../systems/SaveManager.js';

export const LEVEL_METADATA = [
  {
    id: 1,
    title: 'THE FORGOTTEN VILLAGE',
    chapter: 'CHAPTER I',
    subtitle: 'THE GATHERING MIST',
    description: 'Investigate the abandoned medieval village, discover the Elder’s Journal, and master Fire magic to incinerate the cursed thorn barrier.',
    previewColor: '#ff5500',
    badgeIcon: '🔥',
    rewardText: 'Talisman of Vitality (+25 Max Health)'
  },
  {
    id: 2,
    title: 'THE WHISPERING FOREST',
    chapter: 'CHAPTER II',
    subtitle: 'THE POISONED MARSH',
    description: 'Explore the gnarled dead oak forest, use Echo Vision to uncover the hidden Frostfire Relic, and flash-freeze the corrosive canal with Ice magic.',
    previewColor: '#00e1ff',
    badgeIcon: '❄️',
    rewardText: 'Glacial Focus (-1.0s Skill Cooldown)'
  },
  {
    id: 3,
    title: 'THE SUNKEN SHRINE',
    chapter: 'CHAPTER III',
    subtitle: 'ANCIENT DYNAMOS',
    description: 'Descend into the flooded gothic ruins, overload the copper magnetic conduit with Storm electricity, and defeat the Corrupted Sentinel.',
    previewColor: '#3a86ff',
    badgeIcon: '⚡',
    rewardText: 'Storm Conduit Mastery (+15% Critical Proc Rate)'
  },
  {
    id: 4,
    title: 'THE HOLLOW FORTRESS',
    chapter: 'CHAPTER IV',
    subtitle: 'THE WARMASTER’S KEEP',
    description: 'Storm the stormy fortress ramparts, disengage the dual elemental winch safety clamps, and vanquish the armored Fortress Warmaster.',
    previewColor: '#d4af37',
    badgeIcon: '🛡️',
    rewardText: 'Warrior’s Resolve (+25 Max Energy)'
  },
  {
    id: 5,
    title: 'THE HEART OF THE CURSE',
    chapter: 'CHAPTER V',
    subtitle: 'THE ABYSSAL SANCTUM',
    description: 'Confront The Hollow Guardian upon the floating obsidian dais. Exploit its exposed soul core with Echo Vision across 3 apocalyptic boss phases.',
    previewColor: '#9933ff',
    badgeIcon: '👑',
    rewardText: 'Realm Cleansed (Campaign Victory)'
  }
];

export class LevelManager {
  constructor(engine) {
    this.engine = engine;
    this.scene = engine.scene;
    this.currentLevelIndex = 1;

    // Level-specific container groups
    this.levelWorldGroup = new THREE.Group();
    this.levelWorldGroup.name = 'CurrentLevelWorld';
    this.scene.add(this.levelWorldGroup);

    // Active entities in level
    this.enemies = [];
    this.boss = null;
    this.exitGateway = null;
    this.relicChests = [];
    this.cluePedestals = [];

    // State flags
    this.isLevelObjectiveComplete = false;
    this.levelStartTime = 0;
    this.totalKillsThisLevel = 0;
  }

  loadLevel(levelIndex) {
    this.currentLevelIndex = Math.max(1, Math.min(5, levelIndex));
    this.isLevelObjectiveComplete = false;
    this.levelStartTime = performance.now();
    this.totalKillsThisLevel = 0;

    // 1. Tear down previous level
    this._cleanPreviousLevel();

    // 2. Setup Level Environment & Lighting
    const meta = LEVEL_METADATA[this.currentLevelIndex - 1];
    console.log(`[LevelManager] Loading ${meta.chapter}: ${meta.title}...`);

    switch (this.currentLevelIndex) {
      case 1:
        this._buildLevel1_Village();
        break;
      case 2:
        this._buildLevel2_Forest();
        break;
      case 3:
        this._buildLevel3_Shrine();
        break;
      case 4:
        this._buildLevel4_Fortress();
        break;
      case 5:
        this._buildLevel5_Heart();
        break;
    }

    // 3. Apply Player Upgrades & Spawn Position
    this._setupPlayerForLevel();

    // 4. Update HUD Objective & Chapter Banner
    this.engine.uiManager.showChapterTitle(meta.chapter, meta.title, meta.subtitle);
    this._updateLevelObjectiveHUD();

    // 5. Start Level BGM
    soundManager.startBGM();
    soundManager.setCombatIntensity(this.currentLevelIndex === 5 ? 3 : 1);
  }

  _cleanPreviousLevel() {
    // Remove all meshes from levelWorldGroup
    while (this.levelWorldGroup.children.length > 0) {
      const child = this.levelWorldGroup.children[0];
      this.levelWorldGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    // Remove active enemies
    this.enemies.forEach(e => {
      if (e.mesh && e.mesh.parent) e.mesh.parent.remove(e.mesh);
    });
    this.enemies = [];

    // Remove boss if present
    if (this.boss && this.boss.mesh && this.boss.mesh.parent) {
      this.boss.mesh.parent.remove(this.boss.mesh);
      this.boss = null;
    }

    // Clear puzzle manager & echo vision revealables
    if (this.engine.puzzleManager) {
      this.engine.puzzleManager.reset();
    }
    if (this.engine.echoVisionManager) {
      this.engine.echoVisionManager.clearRevealables();
    }

    this.exitGateway = null;
    this.relicChests = [];
    this.cluePedestals = [];
  }

  _setupPlayerForLevel() {
    // Reposition player to level spawn
    let spawnZ = 18;
    if (this.currentLevelIndex === 2) spawnZ = 20;
    else if (this.currentLevelIndex === 3) spawnZ = 22;
    else if (this.currentLevelIndex === 4) spawnZ = 24;
    else if (this.currentLevelIndex === 5) spawnZ = 18;

    this.engine.player.position.set(0, 0, spawnZ);
    this.engine.player.mesh.position.copy(this.engine.player.position);
    this.engine.player.facingAngle = Math.PI; // Face forward down the path
    this.engine.player.targetFacingAngle = Math.PI;
    this.engine.cameraManager.snapToTarget(this.engine.player.getPosition());

    // Apply persistent campaign upgrades from SaveManager
    const modifiers = SaveManager.getPlayerModifiers();
    this.engine.player.applyUpgrades(modifiers);
  }

  // =========================================================================
  // LEVEL 1: THE FORGOTTEN VILLAGE
  // =========================================================================
  _buildLevel1_Village() {
    // Lighting & Fog
    const fogColor = 0x6e7f91;
    this.scene.background = new THREE.Color(fogColor);
    this.scene.fog = new THREE.Fog(fogColor, 18, 85);
    this._setupDaylightMist(0xabc0d4, 0xf2f7fc);

    // Muddy road terrain
    const ground = this._createTerrainPlane(60, 60, '#3a434d');
    this.levelWorldGroup.add(ground);

    // Medieval houses
    const houses = [
      { x: -10, z: 12, rot: 0.18 },
      { x: 10, z: 12, rot: -0.18 },
      { x: -11, z: 0, rot: 0.1 },
      { x: 11, z: 0, rot: -0.12 }
    ];
    houses.forEach(h => {
      const house = EnvironmentProps.createMedievalHouse(6.5, 5.2, 7.0);
      house.position.set(h.x, 0, h.z);
      house.rotation.y = h.rot;
      this.levelWorldGroup.add(house);
    });

    // Village Well
    const well = EnvironmentProps.createMedievalWell(new THREE.Vector3(-4, 0, 10));
    this.levelWorldGroup.add(well);

    // Clue 1: Village Elder's Torn Journal
    const clue1 = EnvironmentProps.createCluePedestal(new THREE.Vector3(-5.5, 0, 6));
    this.levelWorldGroup.add(clue1);
    this.cluePedestals.push({
      mesh: clue1,
      id: 'clue_village_journal',
      title: 'VILLAGE ELDER’S JOURNAL',
      text: '“Day 14 of the Ashen Mist... The Hollow Guardian awakened beneath the fortress. To protect the children, we sealed the forest path with cursed brambles. Only the Sacred Triad of Fire Braziers can burn away the thorns and open the passage forward.”'
    });

    // Puzzle 1: 3 Fire Braziers
    const brazierPositions = [
      new THREE.Vector3(-4.5, 0, -2),
      new THREE.Vector3(4.5, 0, -2),
      new THREE.Vector3(0, 0, -6)
    ];
    brazierPositions.forEach((pos, idx) => {
      const b = EnvironmentProps.createAncientBrazier(pos);
      this.levelWorldGroup.add(b);
      this.engine.puzzleManager.registerBrazier(b, b.fireLight, idx);
    });

    // Cursed Thorn Vines blocking Exit Archway
    const vines = EnvironmentProps.createCursedVines(7.5, 5.0);
    vines.position.set(0, 0, -14);
    this.levelWorldGroup.add(vines);

    const arch = EnvironmentProps.createStoneGateArch(7.5, 6.0);
    arch.position.set(0, 0, -14.2);
    this.levelWorldGroup.add(arch);

    this.engine.puzzleManager.registerVillageGate(arch, vines);

    // Exit Gateway behind vines
    this.exitGateway = EnvironmentProps.createExitGateway(new THREE.Vector3(0, 0, -19), 2);
    this.levelWorldGroup.add(this.exitGateway);

    // Echo Vision Waypoint Trail
    const waypoints = [
      new THREE.Vector3(0, 0, 15),
      new THREE.Vector3(-4, 0, 10),
      new THREE.Vector3(-5.5, 0, 6),
      new THREE.Vector3(-4.5, 0, -2),
      new THREE.Vector3(4.5, 0, -2),
      new THREE.Vector3(0, 0, -6),
      new THREE.Vector3(0, 0, -14),
      new THREE.Vector3(0, 0, -19)
    ];
    this.engine.echoVisionManager.setWaypointPath(waypoints);

    // Echo Vision Secret Rune Pillar
    const echoPillar = EnvironmentProps.createEchoRunePillar(new THREE.Vector3(6, 0, 8));
    this.levelWorldGroup.add(echoPillar);
    this.engine.echoVisionManager.registerRevealable(echoPillar, 'RUNE');

    // Enemies: 2 Cursed Wanderers
    this._spawnEnemy('SOLDIER', new THREE.Vector3(-4, 0, 10));
    this._spawnEnemy('SOLDIER', new THREE.Vector3(4, 0, 4));
  }

  // =========================================================================
  // LEVEL 2: THE WHISPERING FOREST
  // =========================================================================
  _buildLevel2_Forest() {
    // Eerie dark teal-green fog & night canopy
    const fogColor = 0x182824;
    this.scene.background = new THREE.Color(fogColor);
    this.scene.fog = new THREE.Fog(fogColor, 12, 60);

    const ambient = new THREE.AmbientLight(0x244238, 1.4);
    this.levelWorldGroup.add(ambient);
    const moonLight = new THREE.DirectionalLight(0x88d4c0, 1.8);
    moonLight.position.set(15, 35, 10);
    moonLight.castShadow = true;
    this.levelWorldGroup.add(moonLight);

    // Swamp marsh terrain
    const ground = this._createTerrainPlane(65, 65, '#202e26');
    this.levelWorldGroup.add(ground);

    // Dead gnarled oak trees
    const treePositions = [
      [-8, 15], [8, 14], [-12, 8], [11, 7],
      [-7, 0], [9, -1], [-13, -8], [12, -9],
      [-6, -16], [7, -15], [-10, -20], [10, -21]
    ];
    treePositions.forEach(([x, z]) => {
      const tree = EnvironmentProps.createDeadTree(5.5 + Math.random() * 2);
      tree.position.set(x, 0, z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.levelWorldGroup.add(tree);
    });

    // Corrupted Boiling Canal (Z = -6) & Crystalline Ice Bridge
    const canal = EnvironmentProps.createCorruptedCanal(24.0, 5.5);
    canal.position.set(0, 0, -6);
    this.levelWorldGroup.add(canal);
    this.engine.puzzleManager.registerCanal(canal, canal.iceBridge);

    // Clue 2: Scholar's Frost Parchment
    const clue2 = EnvironmentProps.createCluePedestal(new THREE.Vector3(-7, 0, 4));
    this.levelWorldGroup.add(clue2);
    this.cluePedestals.push({
      mesh: clue2,
      id: 'clue_forest_parchment',
      title: 'SCHOLAR’S FROST PARCHMENT',
      text: '“The dark bile running through the forest canal reacts violently to cryogenic crystallization. Channeling Ice magic into the boiling waters will flash-freeze the surface, creating a stable crystalline bridge into the ancient shrine.”'
    });

    // Hidden Relic Chest (Discovered with Echo Vision)
    const relicChest = EnvironmentProps.createRelicChest(new THREE.Vector3(8.5, 0, 8), 'Frostfire Relic');
    this.levelWorldGroup.add(relicChest);
    this.relicChests.push(relicChest);
    this.engine.echoVisionManager.registerRevealable(relicChest, 'SECRET');

    // Exit Gateway at end of forest
    this.exitGateway = EnvironmentProps.createExitGateway(new THREE.Vector3(0, 0, -22), 3);
    this.levelWorldGroup.add(this.exitGateway);

    // Waypoint Path
    const waypoints = [
      new THREE.Vector3(0, 0, 16),
      new THREE.Vector3(-7, 0, 4),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -6),
      new THREE.Vector3(0, 0, -14),
      new THREE.Vector3(0, 0, -22)
    ];
    this.engine.echoVisionManager.setWaypointPath(waypoints);

    // Enemies: 2 Wanderers + 2 Void Wraiths
    this._spawnEnemy('SOLDIER', new THREE.Vector3(-5, 0, 10));
    this._spawnEnemy('SOLDIER', new THREE.Vector3(5, 0, 5));
    this._spawnEnemy('CULTIST', new THREE.Vector3(-7, 0, -12));
    this._spawnEnemy('CULTIST', new THREE.Vector3(7, 0, -13));
  }

  // =========================================================================
  // LEVEL 3: THE SUNKEN SHRINE
  // =========================================================================
  _buildLevel3_Shrine() {
    // Deep oceanic indigo atmosphere
    const fogColor = 0x101726;
    this.scene.background = new THREE.Color(fogColor);
    this.scene.fog = new THREE.Fog(fogColor, 14, 70);

    const ambient = new THREE.AmbientLight(0x1d324a, 1.6);
    this.levelWorldGroup.add(ambient);
    const shrineLight = new THREE.DirectionalLight(0x5ca0e0, 2.0);
    shrineLight.position.set(0, 40, -10);
    shrineLight.castShadow = true;
    this.levelWorldGroup.add(shrineLight);

    // Submerged stone dais & water reflection plane
    const ground = this._createTerrainPlane(60, 60, '#162230');
    this.levelWorldGroup.add(ground);
    const water = EnvironmentProps.createWaterSurface(60, 60);
    this.levelWorldGroup.add(water);

    // Carved stone pillars lining the sunken hall
    const pillars = [
      [-6, 14], [6, 14], [-6, 4], [6, 4],
      [-6, -6], [6, -6], [-6, -16], [6, -16]
    ];
    pillars.forEach(([x, z]) => {
      const p = EnvironmentProps.createEchoRunePillar(new THREE.Vector3(x, 0, z));
      this.levelWorldGroup.add(p);
      this.engine.echoVisionManager.registerRevealable(p, 'RUNE');
    });

    // Clue 3: Warden's Runic Inscription
    const clue3 = EnvironmentProps.createCluePedestal(new THREE.Vector3(0, 0, 9));
    this.levelWorldGroup.add(clue3);
    this.cluePedestals.push({
      mesh: clue3,
      id: 'clue_shrine_inscription',
      title: 'WARDEN’S RUNIC INSCRIPTION',
      text: '“The dynamos of the Sunken Shrine are powered by primordial celestial lightning. Strike the copper coil terminal with Storm magic to jumpstart the magnetic floodgate and open the path to the Hollow Fortress.”'
    });

    // Puzzle 3: Lightning Conduit Dynamo
    const conduit = EnvironmentProps.createLightningConduit(new THREE.Vector3(0, 0, -4));
    this.levelWorldGroup.add(conduit);
    this.engine.puzzleManager.registerConduit(conduit, conduit.terminal, conduit.light);

    // Floodgate Archway
    const arch = EnvironmentProps.createStoneGateArch(8.0, 7.0);
    arch.position.set(0, 0, -18);
    this.levelWorldGroup.add(arch);

    // Exit Gateway
    this.exitGateway = EnvironmentProps.createExitGateway(new THREE.Vector3(0, 0, -24), 4);
    this.levelWorldGroup.add(this.exitGateway);

    // Waypoint Path
    const waypoints = [
      new THREE.Vector3(0, 0, 18),
      new THREE.Vector3(0, 0, 9),
      new THREE.Vector3(0, 0, -4),
      new THREE.Vector3(0, 0, -18),
      new THREE.Vector3(0, 0, -24)
    ];
    this.engine.echoVisionManager.setWaypointPath(waypoints);

    // Enemies: 2 Elite Knights + Sentinel Mini-Boss (Knight with higher HP)
    this._spawnEnemy('KNIGHT', new THREE.Vector3(-5, 0, 2));
    this._spawnEnemy('KNIGHT', new THREE.Vector3(5, 0, 2));
    const sentinel = this._spawnEnemy('KNIGHT', new THREE.Vector3(0, 0, -10));
    if (sentinel) {
      sentinel.maxHealth = 220;
      sentinel.health = 220;
      sentinel.mesh.scale.set(1.45, 1.45, 1.45);
    }
  }

  // =========================================================================
  // LEVEL 4: THE HOLLOW FORTRESS
  // =========================================================================
  _buildLevel4_Fortress() {
    // Stormy high-altitude ash-slate mist & thunderclouds
    const fogColor = 0x282c34;
    this.scene.background = new THREE.Color(fogColor);
    this.scene.fog = new THREE.Fog(fogColor, 15, 75);

    const ambient = new THREE.AmbientLight(0x3e4552, 1.5);
    this.levelWorldGroup.add(ambient);
    const stormLight = new THREE.DirectionalLight(0xdde5f0, 2.2);
    stormLight.position.set(20, 45, 15);
    stormLight.castShadow = true;
    this.levelWorldGroup.add(stormLight);

    // Stone flagstone courtyard terrain
    const ground = this._createTerrainPlane(70, 70, '#2e333d');
    this.levelWorldGroup.add(ground);

    // Fortress Towers on perimeter
    const towerCoords = [
      [-14, 18], [14, 18],
      [-15, 0], [15, 0],
      [-14, -18], [14, -18]
    ];
    towerCoords.forEach(([x, z]) => {
      const tower = EnvironmentProps.createFortressTower(13, 2.8);
      tower.position.set(x, 0, z);
      this.levelWorldGroup.add(tower);
    });

    // Massive Iron Portcullis Gate
    const portcullis = EnvironmentProps.createPortcullis(7.5, 7.5);
    portcullis.position.set(0, 0, -12);
    this.levelWorldGroup.add(portcullis);

    const gateArch = EnvironmentProps.createStoneGateArch(8.5, 7.8);
    gateArch.position.set(0, 0, -12.2);
    this.levelWorldGroup.add(gateArch);

    this.engine.puzzleManager.registerPortcullis(portcullis);

    // Dual Winch Mechanisms (Fire on left, Ice on right to raise portcullis)
    const winchL = EnvironmentProps.createAncientBrazier(new THREE.Vector3(-5.5, 0, -10));
    const winchR = EnvironmentProps.createAncientBrazier(new THREE.Vector3(5.5, 0, -10));
    this.levelWorldGroup.add(winchL);
    this.levelWorldGroup.add(winchR);
    this.engine.puzzleManager.registerDualWinch(winchL, winchR);

    // Clue 4: Commander's Final Decree
    const clue4 = EnvironmentProps.createCluePedestal(new THREE.Vector3(-7, 0, 10));
    this.levelWorldGroup.add(clue4);
    this.cluePedestals.push({
      mesh: clue4,
      id: 'clue_fortress_decree',
      title: 'COMMANDER’S FINAL DECREE',
      text: '“The Warmaster has fallen to the corruption. He sealed the Sanctum gates with thermal-counterweight winches: the Western gear requires Fire to melt the locking pin, and the Eastern gear requires Frost to freeze the counter-ratchet. Only then will the portcullis yield.”'
    });

    // Hidden Relic: Aegis of the Fallen King
    const aegisRelic = EnvironmentProps.createRelicChest(new THREE.Vector3(7.5, 0, 12), 'Aegis of the Fallen King');
    this.levelWorldGroup.add(aegisRelic);
    this.relicChests.push(aegisRelic);
    this.engine.echoVisionManager.registerRevealable(aegisRelic, 'SECRET');

    // Exit Gateway leading to Level 5 Sanctum
    this.exitGateway = EnvironmentProps.createExitGateway(new THREE.Vector3(0, 0, -25), 5);
    this.levelWorldGroup.add(this.exitGateway);

    // Waypoint Path
    const waypoints = [
      new THREE.Vector3(0, 0, 18),
      new THREE.Vector3(-7, 0, 10),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-5.5, 0, -10),
      new THREE.Vector3(5.5, 0, -10),
      new THREE.Vector3(0, 0, -12),
      new THREE.Vector3(0, 0, -25)
    ];
    this.engine.echoVisionManager.setWaypointPath(waypoints);

    // Enemies: 2 Wanderers + 2 Void Wraiths + 1 Elite Knight + Fortress Warmaster Champion
    this._spawnEnemy('SOLDIER', new THREE.Vector3(-5, 0, 12));
    this._spawnEnemy('SOLDIER', new THREE.Vector3(5, 0, 12));
    this._spawnEnemy('CULTIST', new THREE.Vector3(-8, 0, 0));
    this._spawnEnemy('CULTIST', new THREE.Vector3(8, 0, 0));
    this._spawnEnemy('KNIGHT', new THREE.Vector3(0, 0, 2));

    const warmaster = this._spawnEnemy('KNIGHT', new THREE.Vector3(0, 0, -6));
    if (warmaster) {
      warmaster.maxHealth = 260;
      warmaster.health = 260;
      warmaster.mesh.scale.set(1.5, 1.5, 1.5);
    }
  }

  // =========================================================================
  // LEVEL 5: THE HEART OF THE CURSE
  // =========================================================================
  _buildLevel5_Heart() {
    // Deep abyssal void violet/crimson atmosphere
    const fogColor = 0x160c22;
    this.scene.background = new THREE.Color(fogColor);
    this.scene.fog = new THREE.Fog(fogColor, 18, 95);

    const ambient = new THREE.AmbientLight(0x381848, 1.8);
    this.levelWorldGroup.add(ambient);
    const voidLight = new THREE.DirectionalLight(0xa832db, 2.5);
    voidLight.position.set(0, 45, -15);
    voidLight.castShadow = true;
    this.levelWorldGroup.add(voidLight);

    // Floating Obsidian Sanctum Dais
    const daisGeom = new THREE.CylinderGeometry(18, 20, 1.2, 16);
    daisGeom.translate(0, -0.6, 0);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x12081a,
      roughness: 0.25,
      metalness: 0.95
    });
    const dais = new THREE.Mesh(daisGeom, daisMat);
    dais.receiveShadow = true;
    this.levelWorldGroup.add(dais);

    // Floating Abyssal Crystals ringing the arena
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const crystal = EnvironmentProps.createAbyssalCrystal(1.2 + Math.random() * 0.6);
      crystal.position.set(Math.cos(angle) * 16, 0, Math.sin(angle) * 16);
      this.levelWorldGroup.add(crystal);
    }

    // Spawn Colossal Final Boss: The Hollow Guardian
    this.boss = new Boss(this.scene, new THREE.Vector3(0, 0, -8));
    this.boss.onSpawnTelegraph = (pos, radius, dur) => {
      this.engine.vfxManager.spawnTelegraph(pos, radius, dur);
    };
    this.boss.onSpawnShockwave = (pos, radius) => {
      this.engine.vfxManager.spawnShockwave(pos, radius, 0x9922ff);
    };
    this.boss.onSpawnProjectile = (orig, targ, type) => {
      this.engine.elementalSystem.spawnEnemyProjectile(orig, targ, type);
    };
    this.boss.onDefeat = () => {
      this._onFinalBossDefeated();
    };

    // Register Boss Exposed Core in Echo Vision (highlights weak point for 2x dmg)
    if (this.boss.heartRune) {
      this.engine.echoVisionManager.registerRevealable(this.boss.heartRune, 'WEAKPOINT');
    }

    // Boss Waypoint
    this.engine.echoVisionManager.setWaypointPath([
      new THREE.Vector3(0, 0, 14),
      new THREE.Vector3(0, 0, 4),
      new THREE.Vector3(0, 0, -8)
    ]);
  }

  _spawnEnemy(type, pos) {
    const enemy = new Enemy(this.scene, type, pos);
    if (type === 'CULTIST') {
      enemy.onSpawnProjectile = (orig, targ, pType) => {
        this.engine.elementalSystem.spawnEnemyProjectile(orig, targ, pType);
      };
    }
    this.enemies.push(enemy);
    this.engine.vfxManager.spawnShockwave(pos, 2.5, type === 'CULTIST' ? 0x8822ff : 0x552211);
    return enemy;
  }

  _onFinalBossDefeated() {
    this.isLevelObjectiveComplete = true;
    soundManager.playVictory();

    const elapsedSeconds = (performance.now() - this.levelStartTime) / 1000;
    SaveManager.recordLevelCompletion(5, {
      timeSeconds: elapsedSeconds,
      maxCombo: this.engine.combatSystem.maxComboAchieved,
      kills: this.totalKillsThisLevel + 1
    });

    setTimeout(() => {
      this.engine.gameState = 'VICTORY';
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = Math.floor(elapsedSeconds % 60);
      const timeStr = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      this.engine.uiManager.showCampaignVictory({
        time: timeStr,
        maxCombo: this.engine.combatSystem.maxComboAchieved,
        totalDamage: Math.round(this.engine.combatSystem.totalDamageDealt),
        kills: this.totalKillsThisLevel + 1
      });
      this.engine.inputManager.exitPointerLock();
    }, 2500);
  }

  onPlayerInteract(player) {
    const playerPos = player.getPosition();

    // 1. Check Clues
    for (const clue of this.cluePedestals) {
      const dist = playerPos.distanceTo(clue.mesh.position);
      if (dist < 2.8) {
        soundManager.playClueInspect();
        SaveManager.recordClueFound(clue.id);
        this.engine.uiManager.showClue(clue.title, clue.text);
        return;
      }
    }

    // 2. Check Relic Chests
    for (const chest of this.relicChests) {
      if (!chest.isOpened) {
        const dist = playerPos.distanceTo(chest.position);
        if (dist < 2.5) {
          chest.isOpened = true;
          chest.beacon.visible = false;
          soundManager.playRelicFound();
          SaveManager.recordRelicFound(chest.relicName);
          this.engine.uiManager.showClue(
            'ANCIENT RELIC ACQUIRED',
            `You have unearthed the ${chest.relicName}! Primordial power surges through your veins (+5% Elemental Damage Multiplier).`
          );
          // Apply upgrade immediately
          this.engine.player.applyUpgrades(SaveManager.getPlayerModifiers());
          return;
        }
      }
    }

    // 3. Check Level Puzzles
    this.engine.puzzleManager.interact(player);
  }

  update(dt, player, onDamagePlayer, cameraManager) {
    const playerPos = player.getPosition();

    // 1. Update Active Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, playerPos, onDamagePlayer);

      if (!enemy.isAlive && enemy.stateTime >= 0.9) {
        this.totalKillsThisLevel++;
        this.enemies.splice(i, 1);
      }
    }

    // 2. Update Boss
    if (this.boss && this.boss.isAlive) {
      this.boss.update(dt, playerPos, onDamagePlayer, cameraManager);
    }

    // 3. Update Exit Gateway proximity (For Levels 1 to 4)
    if (this.exitGateway && !this.isLevelObjectiveComplete) {
      // Check if exit gate is unlocked by puzzle state or enemies slain
      let canExit = false;
      if (this.currentLevelIndex === 1) {
        canExit = this.engine.puzzleManager.villageGateUnlocked;
      } else if (this.currentLevelIndex === 2) {
        canExit = this.engine.puzzleManager.canalFrozen;
      } else if (this.currentLevelIndex === 3) {
        canExit = this.engine.puzzleManager.lightningConduitActive;
      } else if (this.currentLevelIndex === 4) {
        canExit = this.engine.puzzleManager.portcullisRaised;
      }

      if (canExit) {
        const distToGateway = playerPos.distanceTo(this.exitGateway.position);
        if (distToGateway < 3.2) {
          this._onLevelCleared();
        }
      }
    }

    // Rotate exit gateway portal veil
    if (this.exitGateway && this.exitGateway.veil) {
      this.exitGateway.veil.rotation.z += dt * 0.8;
    }
  }

  _onLevelCleared() {
    this.isLevelObjectiveComplete = true;
    soundManager.playLevelComplete();

    const elapsedSeconds = (performance.now() - this.levelStartTime) / 1000;
    const meta = LEVEL_METADATA[this.currentLevelIndex - 1];

    // Record progress in SaveManager
    SaveManager.recordLevelCompletion(this.currentLevelIndex, {
      timeSeconds: elapsedSeconds,
      maxCombo: this.engine.combatSystem.maxComboAchieved,
      kills: this.totalKillsThisLevel
    });

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = Math.floor(elapsedSeconds % 60);
    const timeStr = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    this.engine.gameState = 'LEVEL_CLEAR';
    this.engine.inputManager.exitPointerLock();

    this.engine.uiManager.showLevelClearModal({
      levelNum: this.currentLevelIndex,
      levelTitle: meta.title,
      time: timeStr,
      rewardText: meta.rewardText,
      nextLevelNum: this.currentLevelIndex < 5 ? this.currentLevelIndex + 1 : null
    });
  }

  _updateLevelObjectiveHUD() {
    const meta = LEVEL_METADATA[this.currentLevelIndex - 1];
    let objectiveDesc = '';

    if (this.currentLevelIndex === 1) {
      objectiveDesc = 'Inspect the Elder’s Journal and ignite 3 Braziers with Fire to unlock the exit portal.';
    } else if (this.currentLevelIndex === 2) {
      objectiveDesc = 'Freeze the Corrupted Canal with Ice magic and find the hidden Frostfire Relic.';
    } else if (this.currentLevelIndex === 3) {
      objectiveDesc = 'Power the Lightning Conduit with Storm magic and defeat the Shrine Sentinel.';
    } else if (this.currentLevelIndex === 4) {
      objectiveDesc = 'Disengage the dual elemental winches with Fire & Ice and defeat the Warmaster.';
    } else if (this.currentLevelIndex === 5) {
      objectiveDesc = 'Vanquish The Hollow Guardian to cleanse the Hollow Realm!';
    }

    this.engine.uiManager.setObjective(meta.title, objectiveDesc);
  }

  _setupDaylightMist(ambientHex, sunHex) {
    const ambient = new THREE.AmbientLight(ambientHex, 1.85);
    this.levelWorldGroup.add(ambient);

    const dirLight = new THREE.DirectionalLight(sunHex, 2.2);
    dirLight.position.set(25, 45, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.levelWorldGroup.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x8ba2b8, 1.2);
    rimLight.position.set(-25, 30, -25);
    this.levelWorldGroup.add(rimLight);
  }

  _createTerrainPlane(width, depth, baseColor = '#3a434d') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(0, 0, 0, 0.15)`;
      ctx.fillRect(x, y, 2 + Math.random() * 2, 2 + Math.random() * 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);

    const geom = new THREE.PlaneGeometry(width, depth);
    geom.rotateX(-Math.PI / 2);

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.8,
      metalness: 0.1
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  getAliveEnemies() {
    return this.enemies.filter(e => e.isAlive);
  }

  getBoss() {
    return this.boss;
  }
}
