/**
 * UIManager.js - Level 4 Campaign UI Overhaul
 * Controls HUD elements (HP, Energy, Boss bar, Cooldowns, Element Badges, Combo Counter, Echo Vision indicator)
 * and UI screen modals:
 * - Title Screen (New Game, Continue, Level Select, Settings, Controls)
 * - Level Selection Modal (5 atmospheric cards with status, best time, and launch buttons)
 * - Level Clear Modal (Completion stats, reward text, next chapter unlock)
 * - Campaign Victory Modal (Final ending, total campaign stats, resolution lore)
 * - Pause Screen, Settings, Controls, and Confirm New Game modals.
 */

import { soundManager } from '../core/SoundManager.js';
import { SaveManager } from '../systems/SaveManager.js';
import { LEVEL_METADATA } from '../world/LevelManager.js';

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

    // Level 4 Modals
    this.levelSelectModal = document.getElementById('level-select-modal');
    this.levelCardsContainer = document.getElementById('level-cards-container');
    this.levelClearModal = document.getElementById('level-clear-modal');
    this.confirmResetModal = document.getElementById('confirm-reset-modal');
    this.chapterOverlay = document.getElementById('chapter-overlay');
    this.chNumber = document.getElementById('ch-number');
    this.chTitle = document.getElementById('ch-title');
    this.chSub = document.getElementById('ch-sub');

    // Title buttons
    this.btnStart = document.getElementById('btn-start-game');
    this.btnContinue = document.getElementById('btn-continue-game');

    // Clue & Interaction Elements
    this.interactionPrompt = document.getElementById('interaction-prompt');
    this.clueModal = document.getElementById('clue-modal');
    this.clueTitleText = document.getElementById('clue-title-text');
    this.clueContentText = document.getElementById('clue-content-text');

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
    this.echoStatusDot = document.getElementById('echo-status-dot');

    this.comboDisplay = document.getElementById('combo-display');
    this.comboCountText = document.getElementById('combo-count-text');
    this.comboRankText = document.getElementById('combo-rank-text');

    this.damageVignette = document.getElementById('damage-vignette');
    this.echoVignette = document.getElementById('echo-vignette');

    this.lastModalSource = 'title'; // 'title' or 'pause'
    this.pendingLevelClearData = null;

    this._bindEvents();
    this.updateTitleScreenButtons();
  }

  updateTitleScreenButtons() {
    const hasProgress = SaveManager.hasExistingProgress();
    if (this.btnContinue) {
      this.btnContinue.style.display = hasProgress ? 'block' : 'none';
    }
  }

  _bindEvents() {
    // Clue Modal Close Button
    const btnCloseClue = document.getElementById('btn-close-clue');
    if (btnCloseClue) {
      btnCloseClue.onclick = () => this.hideClue();
    }

    // New Game Button
    if (this.btnStart) {
      this.btnStart.onclick = (e) => {
        if (e) e.stopPropagation();
        if (SaveManager.hasExistingProgress()) {
          this.confirmResetModal.style.display = 'flex';
        } else {
          this._startNewCampaign();
        }
      };
    }

    // Continue Game Button
    if (this.btnContinue) {
      this.btnContinue.onclick = (e) => {
        if (e) e.stopPropagation();
        const currentLvl = SaveManager.getData().currentLevel || 1;
        this._launchLevel(currentLvl);
      };
    }

    // Confirm Reset Modal Buttons
    const btnResetYes = document.getElementById('btn-confirm-reset-yes');
    if (btnResetYes) {
      btnResetYes.onclick = () => {
        this.confirmResetModal.style.display = 'none';
        SaveManager.resetProgress();
        this._startNewCampaign();
      };
    }

    const btnResetNo = document.getElementById('btn-confirm-reset-no');
    if (btnResetNo) {
      btnResetNo.onclick = () => {
        this.confirmResetModal.style.display = 'none';
      };
    }

    // Level Select Open/Close
    const btnOpenLvlSelect = document.getElementById('btn-open-level-select');
    if (btnOpenLvlSelect) {
      btnOpenLvlSelect.onclick = () => {
        this.lastModalSource = 'title';
        this.showLevelSelect();
      };
    }

    const btnPauseLvlSelect = document.getElementById('btn-pause-level-select');
    if (btnPauseLvlSelect) {
      btnPauseLvlSelect.onclick = () => {
        this.lastModalSource = 'pause';
        this.pauseScreen.style.display = 'none';
        this.showLevelSelect();
      };
    }

    const btnCloseLvlSelect = document.getElementById('btn-close-level-select');
    if (btnCloseLvlSelect) {
      btnCloseLvlSelect.onclick = () => this.hideLevelSelect();
    }

    // Settings Modal
    document.getElementById('btn-open-settings').onclick = () => {
      this.lastModalSource = 'title';
      this.settingsModal.style.display = 'flex';
    };
    document.getElementById('btn-pause-settings').onclick = () => {
      this.lastModalSource = 'pause';
      this.settingsModal.style.display = 'flex';
    };
    document.getElementById('btn-close-settings').onclick = () => {
      this.settingsModal.style.display = 'none';
    };

    // Controls Modal
    document.getElementById('btn-open-controls').onclick = () => {
      this.lastModalSource = 'title';
      this.controlsModal.style.display = 'flex';
    };
    document.getElementById('btn-pause-controls').onclick = () => {
      this.lastModalSource = 'pause';
      this.controlsModal.style.display = 'flex';
    };
    document.getElementById('btn-close-controls').onclick = () => {
      this.controlsModal.style.display = 'none';
    };

    // Pause Screen Buttons
    document.getElementById('btn-resume-game').onclick = () => {
      this.engine.resumeGame();
    };
    document.getElementById('btn-restart-game').onclick = () => {
      this.pauseScreen.style.display = 'none';
      this.engine.levelManager.loadLevel(this.engine.levelManager.currentLevelIndex);
      this.engine.resumeGame();
    };
    document.getElementById('btn-quit-to-title').onclick = () => {
      this.pauseScreen.style.display = 'none';
      this.hudOverlay.style.display = 'none';
      this.titleScreen.style.display = 'flex';
      this.updateTitleScreenButtons();
      this.engine.returnToTitle();
    };

    // Level Clear Modal Buttons
    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
      btnNextLevel.onclick = () => {
        this.levelClearModal.style.display = 'none';
        if (this.pendingLevelClearData && this.pendingLevelClearData.nextLevelNum) {
          this._launchLevel(this.pendingLevelClearData.nextLevelNum);
        } else {
          this.showLevelSelect();
        }
      };
    }

    const btnReplayLevel = document.getElementById('btn-replay-level');
    if (btnReplayLevel) {
      btnReplayLevel.onclick = () => {
        this.levelClearModal.style.display = 'none';
        this._launchLevel(this.engine.levelManager.currentLevelIndex);
      };
    }

    const btnClearLvlSelect = document.getElementById('btn-clear-level-select');
    if (btnClearLvlSelect) {
      btnClearLvlSelect.onclick = () => {
        this.levelClearModal.style.display = 'none';
        this.showLevelSelect();
      };
    }

    const btnClearMainMenu = document.getElementById('btn-clear-main-menu');
    if (btnClearMainMenu) {
      btnClearMainMenu.onclick = () => {
        this.levelClearModal.style.display = 'none';
        this.hudOverlay.style.display = 'none';
        this.titleScreen.style.display = 'flex';
        this.updateTitleScreenButtons();
        this.engine.returnToTitle();
      };
    }

    // Victory Screen Buttons
    const btnVicLvl = document.getElementById('btn-victory-level-select');
    if (btnVicLvl) {
      btnVicLvl.onclick = () => {
        this.victoryScreen.style.display = 'none';
        this.hudOverlay.style.display = 'none';
        this.showLevelSelect();
      };
    }
    document.getElementById('btn-victory-restart').onclick = () => {
      this.victoryScreen.style.display = 'none';
      this._launchLevel(1);
    };
    document.getElementById('btn-victory-title').onclick = () => {
      this.victoryScreen.style.display = 'none';
      this.hudOverlay.style.display = 'none';
      this.titleScreen.style.display = 'flex';
      this.updateTitleScreenButtons();
      this.engine.returnToTitle();
    };

    // Defeat Screen Buttons
    const btnDefLvl = document.getElementById('btn-defeat-level-select');
    if (btnDefLvl) {
      btnDefLvl.onclick = () => {
        this.defeatScreen.style.display = 'none';
        this.hudOverlay.style.display = 'none';
        this.showLevelSelect();
      };
    }
    document.getElementById('btn-defeat-retry').onclick = () => {
      this.defeatScreen.style.display = 'none';
      this._launchLevel(this.engine.levelManager.currentLevelIndex);
    };
    document.getElementById('btn-defeat-title').onclick = () => {
      this.defeatScreen.style.display = 'none';
      this.hudOverlay.style.display = 'none';
      this.titleScreen.style.display = 'flex';
      this.updateTitleScreenButtons();
      this.engine.returnToTitle();
    };

    // Fullscreen and Mute Audio Buttons in Settings
    const btnFullscreen = document.getElementById('btn-toggle-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen request denied:', err);
          });
        } else {
          document.exitFullscreen();
        }
      };
    }

    const btnMute = document.getElementById('btn-toggle-mute');
    if (btnMute) {
      btnMute.onclick = () => {
        const isMuted = soundManager.toggleMute();
        btnMute.innerText = isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO';
        btnMute.style.color = isMuted ? '#ff3b30' : '#e2e8f0';
      };
    }

    // Echo Vision HUD button click
    const slotEcho = document.getElementById('slot-echo-vision');
    if (slotEcho) {
      slotEcho.onclick = () => {
        if (this.engine.echoVisionManager) {
          this.engine.echoVisionManager.toggle();
        }
      };
    }

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

  _startNewCampaign() {
    this._launchLevel(1);
  }

  _launchLevel(levelNum) {
    try {
      soundManager.resume();
      this.titleScreen.style.display = 'none';
      this.pauseScreen.style.display = 'none';
      this.levelSelectModal.style.display = 'none';
      this.levelClearModal.style.display = 'none';
      this.victoryScreen.style.display = 'none';
      this.defeatScreen.style.display = 'none';
      this.hudOverlay.style.display = 'flex';

      this.engine.startLevel(levelNum);
    } catch (err) {
      console.error('[UIManager] Error launching level:', err);
    }
  }

  showLevelSelect() {
    this.renderLevelCards();
    this.levelSelectModal.style.display = 'flex';
  }

  hideLevelSelect() {
    this.levelSelectModal.style.display = 'none';
    if (this.lastModalSource === 'pause') {
      this.pauseScreen.style.display = 'flex';
    } else {
      this.titleScreen.style.display = 'flex';
      this.updateTitleScreenButtons();
    }
  }

  renderLevelCards() {
    if (!this.levelCardsContainer) return;
    this.levelCardsContainer.innerHTML = '';

    const saveData = SaveManager.getData();

    LEVEL_METADATA.forEach(meta => {
      const isUnlocked = saveData.unlockedLevels.includes(meta.id);
      const isCompleted = saveData.completedLevels.includes(meta.id);
      const bestTimeSec = saveData.stats.bestTimes[meta.id];

      let timeStr = 'None';
      if (bestTimeSec !== null && bestTimeSec !== undefined) {
        const m = Math.floor(bestTimeSec / 60);
        const s = Math.floor(bestTimeSec % 60);
        timeStr = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }

      const card = document.createElement('div');
      card.className = `level-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;

      let statusHtml = '';
      if (isCompleted) {
        statusHtml = `<div class="level-status-tag status-completed">COMPLETED ★</div>`;
      } else if (isUnlocked) {
        statusHtml = `<div class="level-status-tag status-unlocked">UNLOCKED</div>`;
      } else {
        statusHtml = `<div class="level-status-tag status-locked">LOCKED 🔒</div>`;
      }

      card.innerHTML = `
        <div class="level-badge-icon">${meta.badgeIcon}</div>
        <div class="level-card-chapter">${meta.chapter}</div>
        <div class="level-card-title">${meta.title}</div>
        <div class="level-card-desc">${meta.description}</div>
        ${statusHtml}
        <div class="level-best-time">Best: ${timeStr}</div>
        <button class="btn-fantasy btn-primary btn-play-level" ${!isUnlocked ? 'disabled' : ''}>
          ${isUnlocked ? 'PLAY CHAPTER' : 'LOCKED'}
        </button>
      `;

      if (isUnlocked) {
        const btn = card.querySelector('.btn-play-level');
        btn.onclick = () => this._launchLevel(meta.id);
      }

      this.levelCardsContainer.appendChild(card);
    });
  }

  showChapterTitle(chapter, title, sub) {
    if (!this.chapterOverlay) return;
    if (this.chNumber) this.chNumber.innerText = chapter;
    if (this.chTitle) this.chTitle.innerText = title;
    if (this.chSub) this.chSub.innerText = sub;

    this.chapterOverlay.style.display = 'block';
    // Re-trigger animation
    this.chapterOverlay.classList.remove('chapter-banner');
    void this.chapterOverlay.offsetWidth;
    this.chapterOverlay.classList.add('chapter-banner');

    setTimeout(() => {
      if (this.chapterOverlay) this.chapterOverlay.style.display = 'none';
    }, 3900);
  }

  showLevelClearModal(data) {
    this.pendingLevelClearData = data;
    this.hudOverlay.style.display = 'none';

    document.getElementById('clear-level-title').innerText = `${data.levelTitle} CLEARED`;
    document.getElementById('clear-stat-time').innerText = data.time;
    document.getElementById('clear-reward-text').innerText = data.rewardText;

    const btnNext = document.getElementById('btn-next-level');
    if (btnNext) {
      if (data.nextLevelNum) {
        btnNext.style.display = 'inline-block';
        btnNext.innerText = `PROCEED TO LEVEL ${data.nextLevelNum}`;
      } else {
        btnNext.style.display = 'none';
      }
    }

    this.levelClearModal.style.display = 'flex';
  }

  showCampaignVictory(stats) {
    this.hudOverlay.style.display = 'none';
    document.getElementById('vic-stat-time').innerText = stats.time;
    document.getElementById('vic-stat-combo').innerText = `${stats.maxCombo} HITS`;
    document.getElementById('vic-stat-dmg').innerText = stats.totalDamage;
    this.victoryScreen.style.display = 'flex';
  }

  showDefeat(stats) {
    this.hudOverlay.style.display = 'none';
    const lvlIdx = this.engine.levelManager ? this.engine.levelManager.currentLevelIndex : 1;
    const meta = LEVEL_METADATA[lvlIdx - 1];
    const chapterName = meta ? `${meta.chapter}` : `Level ${lvlIdx}`;
    const defElem = document.getElementById('def-stat-wave');
    if (defElem) defElem.innerText = chapterName;
    document.getElementById('def-stat-combo').innerText = `${stats.maxCombo} HITS`;
    document.getElementById('def-stat-dmg').innerText = stats.totalDamage;
    document.getElementById('def-stat-kills').innerText = stats.kills;
    this.defeatScreen.style.display = 'flex';
  }

  setEchoVisionStatus(isActive) {
    if (this.echoStatusDot) {
      this.echoStatusDot.classList.toggle('active', isActive);
    }
  }

  showPauseMenu() {
    this.pauseScreen.style.display = 'flex';
  }

  hidePauseMenu() {
    this.pauseScreen.style.display = 'none';
    this.settingsModal.style.display = 'none';
    this.controlsModal.style.display = 'none';
    this.levelSelectModal.style.display = 'none';
  }

  triggerDamageVignette() {
    if (!this.damageVignette) return;
    this.damageVignette.classList.add('hit');
    setTimeout(() => {
      this.damageVignette.classList.remove('hit');
    }, 220);
  }

  updateHUD(player, combatSystem) {
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

    // 5. Boss HP Bar (if Boss active in level)
    const boss = this.engine.levelManager.getBoss();
    if (boss && boss.isAlive) {
      this.bossHud.style.display = 'flex';
      const bossHpPct = Math.max(0, (boss.health / boss.maxHealth) * 100);
      this.bossHpFill.style.width = `${bossHpPct}%`;
      this.bossPhaseText.innerText = `PHASE ${boss.phase} - ${boss.phase === 3 ? 'APOCALYPTIC CALAMITY' : (boss.phase === 2 ? 'ENRAGED CORRUPTION' : 'AWAKENED')}`;
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
    if (this.objTitle) this.objTitle.innerText = title;
    if (this.objDesc) this.objDesc.innerText = desc;
  }

  setInteractionPrompt(text) {
    if (!this.interactionPrompt) return;
    if (text) {
      this.interactionPrompt.innerText = text;
      this.interactionPrompt.style.display = 'block';
    } else {
      this.interactionPrompt.style.display = 'none';
    }
  }

  showClue(title, content) {
    if (!this.clueModal) return;
    if (this.clueTitleText) this.clueTitleText.innerText = title;
    if (this.clueContentText) this.clueContentText.innerText = content;
    this.clueModal.style.display = 'flex';
  }

  hideClue() {
    if (!this.clueModal) return;
    this.clueModal.style.display = 'none';
  }

  isClueOpen() {
    return this.clueModal && this.clueModal.style.display === 'flex';
  }
}
