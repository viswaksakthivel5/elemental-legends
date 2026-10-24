/**
 * SaveManager.js
 * Persistent campaign progression and save system for ELEMENTAL LEGENDS.
 * Uses browser localStorage with memory fallback.
 * Tracks unlocked levels, completed levels, best times, combos, collected clues,
 * acquired relics, and character upgrades.
 */

const STORAGE_KEY = 'elemental_legends_level4_save_v1';

export class SaveManager {
  static _data = null;

  static getDefaultData() {
    return {
      version: 4,
      unlockedLevels: [1], // Level 1 is always unlocked
      completedLevels: [],
      currentLevel: 1,
      stats: {
        bestTimes: { 1: null, 2: null, 3: null, 4: null, 5: null },
        highestCombos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        totalKills: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      cluesFound: [],
      upgrades: {
        bonusHealth: 0,        // +25 HP per upgrade
        cooldownReduction: 0,  // -1.0s skill cooldown
        bonusDamageMultiplier: 1.0, // e.g. 1.15x
        bonusEnergy: 0         // +25 Max Energy
      },
      relics: [],
      campaignCompleted: false
    };
  }

  static load() {
    if (this._data) return this._data;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.version === 4 && Array.isArray(parsed.unlockedLevels)) {
            this._data = { ...this.getDefaultData(), ...parsed };
            return this._data;
          }
        }
      }
    } catch (e) {
      console.warn('[SaveManager] Failed to read localStorage, using default:', e);
    }

    this._data = this.getDefaultData();
    this.save();
    return this._data;
  }

  static save() {
    if (!this._data) this._data = this.getDefaultData();

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      }
    } catch (e) {
      console.warn('[SaveManager] Failed to write localStorage:', e);
    }
  }

  static getData() {
    if (!this._data) this.load();
    return this._data;
  }

  static isLevelUnlocked(levelNum) {
    const data = this.getData();
    return data.unlockedLevels.includes(levelNum);
  }

  static isLevelCompleted(levelNum) {
    const data = this.getData();
    return data.completedLevels.includes(levelNum);
  }

  static unlockNextLevel(completedLevelNum) {
    const data = this.getData();
    const nextLevel = completedLevelNum + 1;

    if (nextLevel <= 5 && !data.unlockedLevels.includes(nextLevel)) {
      data.unlockedLevels.push(nextLevel);
      data.unlockedLevels.sort((a, b) => a - b);
    }

    data.currentLevel = Math.min(5, nextLevel);
    this.save();
    return nextLevel <= 5 ? nextLevel : null;
  }

  static recordLevelCompletion(levelNum, stats = {}) {
    const data = this.getData();

    if (!data.completedLevels.includes(levelNum)) {
      data.completedLevels.push(levelNum);
      data.completedLevels.sort((a, b) => a - b);
    }

    // Update best time if better or null
    if (stats.timeSeconds !== undefined) {
      const prevBest = data.stats.bestTimes[levelNum];
      if (prevBest === null || stats.timeSeconds < prevBest) {
        data.stats.bestTimes[levelNum] = stats.timeSeconds;
      }
    }

    // Update highest combo
    if (stats.maxCombo !== undefined) {
      data.stats.highestCombos[levelNum] = Math.max(
        data.stats.highestCombos[levelNum] || 0,
        stats.maxCombo
      );
    }

    // Update kills
    if (stats.kills !== undefined) {
      data.stats.totalKills[levelNum] = (data.stats.totalKills[levelNum] || 0) + stats.kills;
    }

    // Apply level-specific permanent upgrade rewards
    if (levelNum === 1 && data.upgrades.bonusHealth < 25) {
      data.upgrades.bonusHealth = 25; // Talisman of Vitality (+25 HP)
    } else if (levelNum === 2 && data.upgrades.cooldownReduction < 1.0) {
      data.upgrades.cooldownReduction = 1.0; // Glacial Focus (-1s Cooldown)
    } else if (levelNum === 3 && data.upgrades.bonusDamageMultiplier < 1.15) {
      data.upgrades.bonusDamageMultiplier = 1.15; // Storm Conduit Mastery (+15% dmg)
    } else if (levelNum === 4 && data.upgrades.bonusEnergy < 25) {
      data.upgrades.bonusEnergy = 25; // Warrior's Resolve (+25 Max Energy)
    } else if (levelNum === 5) {
      data.campaignCompleted = true;
    }

    // Unlock next level
    this.unlockNextLevel(levelNum);
    this.save();
  }

  static recordClueFound(clueId) {
    const data = this.getData();
    if (!data.cluesFound.includes(clueId)) {
      data.cluesFound.push(clueId);
      this.save();
    }
  }

  static recordRelicFound(relicName) {
    const data = this.getData();
    if (!data.relics.includes(relicName)) {
      data.relics.push(relicName);
      data.upgrades.bonusDamageMultiplier += 0.05; // Each relic adds +5% elemental power
      this.save();
    }
  }

  static getPlayerModifiers() {
    const data = this.getData();
    return {
      bonusHealth: data.upgrades.bonusHealth || 0,
      bonusEnergy: data.upgrades.bonusEnergy || 0,
      cooldownReduction: data.upgrades.cooldownReduction || 0,
      bonusDamageMultiplier: data.upgrades.bonusDamageMultiplier || 1.0,
      relicCount: data.relics.length
    };
  }

  static resetProgress() {
    this._data = this.getDefaultData();
    this.save();
    return this._data;
  }

  static hasExistingProgress() {
    const data = this.getData();
    return data.completedLevels.length > 0 || data.unlockedLevels.length > 1;
  }
}
