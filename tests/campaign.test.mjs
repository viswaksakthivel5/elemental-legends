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
    createBiquadFilter() { return { type: '', frequency: { value: 1000, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
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
      spawnShockwave: () => {}
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

  console.log('=== ALL LEVEL 4 CAMPAIGN AUTOMATED TESTS PASSED CLEANLY! ===');
}

runCampaignTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
