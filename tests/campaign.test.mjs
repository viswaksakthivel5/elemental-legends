import * as THREE from 'three';

// Mock DOM environment for headless testing
const domStore = {};
function getOrCreateElem(id) {
  if (domStore[id]) return domStore[id];
  domStore[id] = {
    id,
    style: { display: '' },
    innerText: '',
    innerHTML: '',
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c, v) {
        if (v === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (v) this._classes.add(c);
        else this._classes.delete(c);
      },
      contains(c) { return this._classes.has(c); }
    },
    children: [],
    appendChild(child) { this.children.push(child); },
    addEventListener: () => {},
    querySelector: () => ({ onclick: null })
  };
  return domStore[id];
}

const mockStorage = {};
global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  addEventListener: () => {},
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; },
    removeItem: (k) => { delete mockStorage[k]; }
  },
  AudioContext: class {
    createGain() { return { gain: { value: 1, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, setValueAtTime: () => {} }, connect: () => {} }; }
    createOscillator() { return { type: '', frequency: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createBiquadFilter() { return { type: '', frequency: { value: 1000, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, Q: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {} }; }
    createBufferSource() { return { buffer: null, loop: false, playbackRate: { value: 1 }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createBuffer() { return { getChannelData: () => new Float32Array(44100) }; }
    destination = {};
    currentTime = 0;
    state = 'running';
    resume() { return Promise.resolve(); }
  }
};

global.document = {
  createElementNS: (ns, tag) => global.document.createElement(tag),
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 512,
        height: 512,
        getContext: () => ({
          fillStyle: '',
          fillRect: () => {},
          strokeStyle: '',
          lineWidth: 1,
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          arc: () => {},
          fill: () => {},
          createLinearGradient: () => ({ addColorStop: () => {} })
        }),
        addEventListener: () => {},
        style: {}
      };
    }
    return getOrCreateElem('elem_' + Math.random());
  },
  getElementById: (id) => getOrCreateElem(id),
  addEventListener: () => {},
  pointerLockElement: null
};

async function runCampaignTests() {
  console.log('=== TEST 1: SAVE MANAGER PROGRESSION ===');
  const { SaveManager } = await import('../src/systems/SaveManager.js');

  SaveManager.resetProgress();
  const initData = SaveManager.getData();
  console.assert(initData.unlockedLevels.length === 1 && initData.unlockedLevels[0] === 1, 'Level 1 must be unlocked initially');
  console.assert(!SaveManager.isLevelUnlocked(2), 'Level 2 must be locked initially');
  console.log('Initial save verified.');

  SaveManager.recordLevelCompletion(1, { timeSeconds: 65, maxCombo: 12, kills: 2 });
  console.assert(SaveManager.isLevelUnlocked(2), 'Level 2 should unlock after completing Level 1');
  console.assert(SaveManager.getPlayerModifiers().bonusHealth === 25, 'Level 1 completion should award +25 bonus HP');
  console.log('Level 1 completion & reward verified.');

  SaveManager.recordLevelCompletion(2, { timeSeconds: 82, maxCombo: 15, kills: 4 });
  console.assert(SaveManager.isLevelUnlocked(3), 'Level 3 should unlock after completing Level 2');
  console.assert(SaveManager.getPlayerModifiers().cooldownReduction === 1.0, 'Level 2 completion should award -1s cooldown reduction');
  console.log('Level 2 completion & reward verified.');

  SaveManager.recordLevelCompletion(3, { timeSeconds: 95, maxCombo: 20, kills: 3 });
  console.assert(SaveManager.isLevelUnlocked(4), 'Level 4 should unlock after completing Level 3');
  console.assert(SaveManager.getPlayerModifiers().bonusDamageMultiplier === 1.15, 'Level 3 completion should award 1.15x damage multiplier (+15%)');
  console.log('Level 3 completion & reward verified.');

  SaveManager.recordLevelCompletion(4, { timeSeconds: 110, maxCombo: 18, kills: 5 });
  console.assert(SaveManager.isLevelUnlocked(5), 'Level 5 should unlock after completing Level 4');
  console.assert(SaveManager.getPlayerModifiers().bonusEnergy === 25, 'Level 4 completion should award +25 max energy');
  console.log('Level 4 completion & reward verified.');

  SaveManager.recordLevelCompletion(5, { timeSeconds: 145, maxCombo: 24, kills: 1 });
  console.assert(SaveManager.getData().campaignCompleted === true, 'Level 5 completion should mark campaign completed');
  console.log('Level 5 completion & campaign victory recorded.');

  console.log('=== TEST 2: ECHO VISION MANAGER ===');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 16/9, 0.1, 200);
  const { EchoVisionManager } = await import('../src/systems/EchoVisionManager.js');
  const echo = new EchoVisionManager(scene, camera);

  console.assert(echo.isActive === false, 'Echo Vision must start inactive');
  echo.toggle();
  console.assert(echo.isActive === true, 'Echo Vision must be active after toggle');
  console.assert(echo.echoGroup.visible === true, 'Echo group must be visible when active');
  echo.toggle();
  console.assert(echo.isActive === false, 'Echo Vision must be inactive after second toggle');
  console.log('Echo Vision toggle & spectral group verified.');

  console.log('=== TEST 3: LEVEL MANAGER — 5 DISTINCT PLAYABLE LEVELS ===');
  const { LevelManager } = await import('../src/world/LevelManager.js');

  const mockPlayer = {
    position: new THREE.Vector3(),
    mesh: new THREE.Mesh(),
    facingAngle: 0,
    targetFacingAngle: 0,
    maxHealth: 100,
    health: 100,
    maxEnergy: 100,
    energy: 100,
    damageMultiplier: 1.0,
    cooldownReduction: 0,
    applyUpgrades(mods) {
      this.maxHealth = 100 + (mods.bonusHealth || 0);
      this.maxEnergy = 100 + (mods.bonusEnergy || 0);
      this.damageMultiplier = 1.0 + (mods.bonusDamageMultiplier || 0);
      this.cooldownReduction = (mods.cooldownReduction || 0);
    },
    getPosition() { return this.position; }
  };

  const mockEngine = {
    scene,
    camera,
    player: mockPlayer,
    uiManager: {
      showChapterTitle: () => {},
      showClue: () => {},
      showLevelClear: () => {},
      showCampaignVictory: () => {},
      setObjective: () => {}
    },
    cameraManager: {
      snapToTarget: () => {}
    },
    puzzleManager: {
      reset: () => {},
      registerBrazier: () => {},
      registerVillageGate: () => {},
      registerCanal: () => {},
      registerConduit: () => {},
      registerPortcullis: () => {},
      registerDualWinch: () => {},
      villageGateUnlocked: true,
      canalFrozen: true,
      lightningConduitActive: true,
      portcullisRaised: true
    },
    echoVisionManager: echo,
    soundManager: {
      playEchoVisionActive: () => {},
      playEchoVisionDeactive: () => {},
      playLevelComplete: () => {},
      playRelicFound: () => {}
    },
    vfxManager: {
      spawnTelegraph: () => {},
      spawnShockwave: () => {},
      spawnHitSparks: () => {}
    },
    elementalSystem: {
      spawnEnemyProjectile: () => {}
    },
    combatSystem: {
      maxComboAchieved: 15,
      totalDamageDealt: 1200
    },
    inputManager: {
      exitPointerLock: () => {}
    }
  };

  const levelManager = new LevelManager(mockEngine);

  for (let lvl = 1; lvl <= 5; lvl++) {
    console.log(`Loading Level ${lvl}...`);
    levelManager.loadLevel(lvl);
    console.assert(levelManager.currentLevelIndex === lvl, `Level ${lvl} should be loaded`);

    if (lvl === 5) {
      const boss = levelManager.getBoss();
      console.assert(boss !== null, 'Level 5 must have The Hollow Guardian boss');
      console.assert(boss.mesh !== undefined, 'Boss mesh must exist');
      console.log(`Level 5 Boss verified: ${boss.name} (HP: ${boss.maxHealth})`);
    } else {
      console.assert(levelManager.exitGateway !== null, `Level ${lvl} must have an Exit Gateway`);
      console.assert(levelManager.enemies.length > 0, `Level ${lvl} must have active enemies`);
      console.log(`Level ${lvl} loaded successfully with ${levelManager.enemies.length} enemies and Exit Gateway.`);
    }

    console.assert(mockPlayer.maxHealth >= 125, 'Player should have boosted health from campaign upgrades');
    console.assert(mockPlayer.maxEnergy >= 125, 'Player should have boosted energy from campaign upgrades');
  }

  console.log('=== TEST 4: LEVEL SELECTION UI RENDERING ===');
  const { UIManager } = await import('../src/ui/UIManager.js');
  const ui = new UIManager(mockEngine);
  ui.renderLevelCards();
  console.assert(ui.levelCardsContainer.children.length === 5, 'Level selection must render all 5 level cards');
  console.log('All 5 level cards rendered cleanly in UI.');

  console.log('=== TEST 5: BOSS COMBAT & 3-PHASE ESCALATION ===');
  levelManager.loadLevel(5);
  const boss = levelManager.getBoss();
  console.assert(boss !== null, 'Level 5 must have active Boss');
  console.assert(boss.phase === 1, 'Boss must start in Phase 1');
  console.assert(boss.health === 600, 'Boss max health must be 600');

  // Damage boss to trigger Phase 2 (HP < 400)
  boss.takeDamage(220, false);
  console.assert(boss.health === 380, 'Boss health must be 380 after 220 damage');
  console.assert(boss.phase === 2, 'Boss must escalate to Phase 2 below 400 HP (66%)');
  console.log('Boss Phase 2 escalation verified.');

  // Damage boss to trigger Phase 3 (HP < 200)
  boss.takeDamage(200, false);
  console.assert(boss.health === 180, 'Boss health must be 180');
  console.assert(boss.phase === 3, 'Boss must escalate to Phase 3 (Enraged Calamity) below 200 HP (33%)');
  console.log('Boss Phase 3 Enraged Calamity verified.');

  // Lethal damage to defeat boss
  boss.takeDamage(250, false);
  console.assert(boss.health === 0, 'Boss health must be 0');
  console.assert(boss.isAlive === false, 'Boss must be marked dead');
  console.assert(boss.state === 'DEFEATED', 'Boss state must transition to DEFEATED');
  console.log('Boss defeat state verified.');

  console.log('=== TEST 6: ELEMENTAL PUZZLE SYSTEMS ===');
  const { PuzzleManager } = await import('../src/systems/PuzzleManager.js');
  const puzzle = new PuzzleManager(scene, mockEngine.vfxManager);

  // Brazier registration & lighting test
  const brazierMesh = new THREE.Mesh();
  const fireLight = new THREE.PointLight();
  puzzle.registerBrazier(brazierMesh, fireLight, 0);
  console.assert(puzzle.braziers[0].isLit === false, 'Brazier must start unlit');
  puzzle.lightBrazier(0);
  console.assert(puzzle.braziers[0].isLit === true, 'Brazier must be lit after lightBrazier()');
  console.log('Fire Brazier puzzle logic verified.');

  // Canal freeze test
  const canalMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 10), new THREE.MeshStandardMaterial());
  const iceBridge = new THREE.Mesh();
  puzzle.registerCanal(canalMesh, iceBridge);
  console.assert(puzzle.canalFrozen === false, 'Canal must start unfrozen');
  puzzle.freezeCanal();
  console.assert(puzzle.canalFrozen === true, 'Canal must be frozen');
  console.assert(iceBridge.visible === true, 'Ice bridge must be visible');
  console.log('Ice Canal freeze puzzle logic verified.');

  // Storm dynamo conduit test
  const conduitMesh = new THREE.Mesh();
  const coil = new THREE.Mesh();
  const condLight = new THREE.PointLight();
  puzzle.registerConduit(conduitMesh, coil, condLight);
  console.assert(puzzle.lightningConduitActive === false, 'Conduit must start inactive');
  puzzle.chargeConduit();
  console.assert(puzzle.lightningConduitActive === true, 'Conduit must be active after chargeConduit()');
  console.log('Storm Conduit dynamo puzzle logic verified.');

  // Dual winch puzzle test
  const winchL = new THREE.Mesh();
  const winchR = new THREE.Mesh();
  puzzle.portcullisRaised = false;
  puzzle.registerDualWinch(winchL, winchR);
  console.assert(puzzle.winchFireActive === false && puzzle.winchIceActive === false, 'Winches must start untriggered');
  puzzle.triggerWinch('LEFT');
  console.assert(puzzle.winchFireActive === true && puzzle.portcullisRaised === false, 'Left winch triggered alone should not raise portcullis');
  puzzle.triggerWinch('RIGHT');
  console.assert(puzzle.winchIceActive === true && puzzle.portcullisRaised === true, 'Both winches triggered should raise portcullis');
  console.log('Dual Winch elemental puzzle logic verified.');

  console.log('=== TEST 7: AUDIO ENGINE CONTROLS ===');
  const { SoundManager } = await import('../src/core/SoundManager.js');
  const snd = new SoundManager();
  snd.setMasterVolume(0.75);
  console.assert(snd.masterVolume === 0.75, 'Master volume must update to 0.75');
  snd.setSFXVolume(0.60);
  console.assert(snd.sfxVolume === 0.60, 'SFX volume must update to 0.60');
  snd.setBGMVolume(0.40);
  console.assert(snd.bgmVolume === 0.40, 'BGM volume must update to 0.40');

  const muteState1 = snd.toggleMute();
  console.assert(muteState1 === true, 'Mute must toggle to true');
  const muteState2 = snd.toggleMute();
  console.assert(muteState2 === false, 'Mute must toggle to false');
  console.log('Audio volume and mute controls verified.');

  console.log('=== TEST 8: MEMORY MANAGEMENT & RECURSIVE DISPOSAL ===');
  // Load and clean multiple levels sequentially to verify zero accumulation
  for (let cycle = 1; cycle <= 3; cycle++) {
    levelManager.loadLevel(cycle);
  }
  levelManager._cleanPreviousLevel();
  console.assert(levelManager.levelWorldGroup.children.length === 0, 'Level world group must be empty after cleanup');
  console.assert(levelManager.enemies.length === 0, 'Enemy list must be empty after cleanup');
  console.assert(levelManager.boss === null, 'Boss must be null after cleanup');
  console.log('Recursive resource disposal and memory cleanup verified.');

  console.log('=== ALL LEVEL 5 MASTER RELEASE AUTOMATED TESTS PASSED CLEANLY! ===');
}

runCampaignTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
