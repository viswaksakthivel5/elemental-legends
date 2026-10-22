/**
 * UIManager.js
 * Controls HUD elements (HP, Energy, Boss bar, Cooldowns, Element Badges, Combo Counter)
 * and UI screen modals (Title, Settings, Controls, Pause, Victory, Defeat).
 */

import { soundManager } from '../core/SoundManager.js';

export class UIManager {
  constructor(engine) {
    this.engine = engine;

    // Cache DOM elements
    this.hudOverlay = document.getElementById('hud-overlay');
    this.titleScreen = document.getElementById('title-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.settingsModal = document.getElementById('settings-modal');
    this.controlsModal = document.getElementById('controls-modal');
    this.victoryScreen = document.getElementById('victory-screen');
    this.defeatScreen = document.getElementById('defeat-screen');

    // HUD Elements
    this.playerHpFill = document.getElementById('player-hp-fill');
    this.playerHpText = document.getElementById('player-hp-text');
    this.playerEnergyFill = document.getElementById('player-energy-fill');
    this.playerEnergyText = document.getElementById('player-energy-text');

    this.bossHud = document.getElementById('boss-hud');
    this.bossHpFill = document.getElementById('boss-hp-fill');
    this.bossPhaseText = document.getElementById('boss-phase-text');

    this.objTitle = document.getElementById('objective-title');
    this.objDesc = document.getElementById('objective-desc');

    this.badgeFire = document.getElementById('elem-badge-fire');
    this.badgeIce = document.getElementById('elem-badge-ice');
    this.badgeStorm = document.getElementById('elem-badge-storm');

    this.skillCdOverlay = document.getElementById('skill-cd-overlay');
    this.ultCdOverlay = document.getElementById('ult-cd-overlay');

    this.comboDisplay = document.getElementById('combo-display');
    this.comboCountText = document.getElementById('combo-count-text');
    this.comboRankText = document.getElementById('combo-rank-text');

    this.damageVignette = document.getElementById('damage-vignette');

    this.lastModalSource = 'title'; // 'title' or 'pause'

    this._bindEvents();
  }

  _bindEvents() {
    // Title Buttons
    document.getElementById('btn-start-game').onclick = () => {
      soundManager.resume();
      this.titleScreen.style.display = 'none';
      this.hudOverlay.style.display = 'flex';
      this.engine.startNewGame();
    };

    document.getElementById('btn-open-settings').onclick = () => {
      this.lastModalSource = 'title';
      this.settingsModal.style.display = 'flex';
    };

    document.getElementById('btn-open-controls').onclick = () => {
      this.lastModalSource = 'title';
      this.controlsModal.style.display = 'flex';
    };

    // Close Modals
    document.getElementById('btn-close-settings').onclick = () => {
      this.settingsModal.style.display = 'none';
    };
    document.getElementById('btn-close-controls').onclick = () => {
      this.controlsModal.style.display = 'none';
    };

    // Pause Screen Buttons
    document.getElementById('btn-resume-game').onclick = () => {
      this.engine.resumeGame();
    };
    document.getElementById('btn-pause-settings').onclick = () => {
      this.lastModalSource = 'pause';
      this.settingsModal.style.display = 'flex';
    };
    document.getElementById('btn-pause-controls').onclick = () => {
      this.lastModalSource = 'pause';
      this.controlsModal.style.display = 'flex';
    };
    document.getElementById('btn-restart-game').onclick = () => {
      this.pauseScreen.style.display = 'none';
      this.engine.startNewGame();
    };
    document.getElementById('btn-quit-to-title').onclick = () => {
      this.pauseScreen.style.display = 'none';
      this.hudOverlay.style.display = 'none';
      this.titleScreen.style.display = 'flex';
      this.engine.returnToTitle();
    };

    // Victory Buttons
    document.getElementById('btn-victory-restart').onclick = () => {
      this.victoryScreen.style.display = 'none';
      this.engine.startNewGame();
    };
    document.getElementById('btn-victory-title').onclick = () => {
      this.victoryScreen.style.display = 'none';
      this.hudOverlay.style.display = 'none';
      this.titleScreen.style.display = 'flex';
      this.engine.returnToTitle();
    };

    // Defeat Buttons
    document.getElementById('btn-defeat-retry').onclick = () => {
      this.defeatScreen.style.display = 'none';
      this.engine.startNewGame();
    };
    document.getElementById('btn-defeat-title').onclick = () => {
      this.defeatScreen.style.display = 'none';
      this.hudOverlay.style.display = 'none';
      this.titleScreen.style.display = 'flex';
      this.engine.returnToTitle();
    };

    // Audio Sliders
    const sMaster = document.getElementById('slider-master-vol');
    sMaster.oninput = (e) => soundManager.setMasterVolume(parseFloat(e.target.value));

    const sSfx = document.getElementById('slider-sfx-vol');
    sSfx.oninput = (e) => soundManager.setSFXVolume(parseFloat(e.target.value));

    const sBgm = document.getElementById('slider-bgm-vol');
    sBgm.oninput = (e) => soundManager.setBGMVolume(parseFloat(e.target.value));

    // Graphics Preset
    const selectGfx = document.getElementById('select-graphics');
    selectGfx.onchange = (e) => this.engine.renderer.setQuality(e.target.value);

    // Camera Sensitivity
    const sCamSens = document.getElementById('slider-cam-sens');
    sCamSens.oninput = (e) => {
      this.engine.inputManager.mouseSensitivity = parseFloat(e.target.value);
    };
  }

  showPauseMenu() {
    this.pauseScreen.style.display = 'flex';
  }

  hidePauseMenu() {
    this.pauseScreen.style.display = 'none';
    this.settingsModal.style.display = 'none';
    this.controlsModal.style.display = 'none';
  }

  showVictory(stats) {
    this.hudOverlay.style.display = 'none';
    document.getElementById('vic-stat-time').innerText = stats.time;
    document.getElementById('vic-stat-combo').innerText = `${stats.maxCombo} HITS`;
    document.getElementById('vic-stat-dmg').innerText = stats.totalDamage;
    this.victoryScreen.style.display = 'flex';
  }

  showDefeat(stats) {
    this.hudOverlay.style.display = 'none';
    document.getElementById('def-stat-wave').innerText = `Wave ${stats.wave}`;
    document.getElementById('def-stat-combo').innerText = `${stats.maxCombo} HITS`;
    document.getElementById('def-stat-dmg').innerText = stats.totalDamage;
    document.getElementById('def-stat-kills').innerText = stats.kills;
    this.defeatScreen.style.display = 'flex';
  }

  triggerDamageVignette() {
    if (!this.damageVignette) return;
    this.damageVignette.classList.add('hit');
    setTimeout(() => {
      this.damageVignette.classList.remove('hit');
    }, 220);
  }

  updateHUD(player, waveManager, combatSystem) {
    if (!player) return;

    // 1. Player HP
    const hpPct = Math.max(0, (player.health / player.maxHealth) * 100);
    this.playerHpFill.style.width = `${hpPct}%`;
    this.playerHpText.innerText = `${Math.ceil(player.health)} / ${player.maxHealth}`;

    // 2. Player Energy
    const nrgPct = Math.max(0, (player.energy / player.maxEnergy) * 100);
    this.playerEnergyFill.style.width = `${nrgPct}%`;
    this.playerEnergyText.innerText = `${Math.ceil(player.energy)} / ${player.maxEnergy}`;

    // 3. Active Element Badge
    this.badgeFire.classList.toggle('active', player.element === 'FIRE');
    this.badgeIce.classList.toggle('active', player.element === 'ICE');
    this.badgeStorm.classList.toggle('active', player.element === 'STORM');

    // 4. Ability Cooldowns
    if (player.skillCooldown > 0) {
      this.skillCdOverlay.style.display = 'flex';
      this.skillCdOverlay.innerText = player.skillCooldown.toFixed(1);
    } else {
      this.skillCdOverlay.style.display = 'none';
    }

    if (player.ultimateCooldown > 0) {
      this.ultCdOverlay.style.display = 'flex';
      this.ultCdOverlay.innerText = player.ultimateCooldown.toFixed(1);
    } else {
      this.ultCdOverlay.style.display = 'none';
    }

    // 5. Boss HP Bar
    const boss = waveManager.getBoss();
    if (boss && boss.isAlive) {
      this.bossHud.style.display = 'flex';
      const bossHpPct = Math.max(0, (boss.health / boss.maxHealth) * 100);
      this.bossHpFill.style.width = `${bossHpPct}%`;
      this.bossPhaseText.innerText = `PHASE ${boss.phase} - ${boss.phase === 3 ? 'ENRAGED CALAMITY' : (boss.phase === 2 ? 'ABYSSAL CORRUPTION' : 'AWAKENED')}`;
    } else {
      this.bossHud.style.display = 'none';
    }

    // 6. Combo Display
    if (combatSystem.currentComboCount > 1) {
      this.comboDisplay.style.display = 'flex';
      this.comboCountText.innerText = `${combatSystem.currentComboCount} HITS`;
      let rank = 'D';
      if (combatSystem.currentComboCount >= 20) rank = 'RANK S';
      else if (combatSystem.currentComboCount >= 14) rank = 'RANK A';
      else if (combatSystem.currentComboCount >= 8) rank = 'RANK B';
      else if (combatSystem.currentComboCount >= 4) rank = 'RANK C';
      this.comboRankText.innerText = rank;
    } else {
      this.comboDisplay.style.display = 'none';
    }
  }

  setObjective(title, desc) {
    this.objTitle.innerText = title;
    this.objDesc.innerText = desc;
  }
}
