# CHANGELOG
## ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM

All notable changes across the five internship development levels are documented in this file.

---

## [1.0.0] - Level 5: Final Master Release (Current)

### Added
- **Production Bundler & Optimization**: Added `vite.config.js` with relative base path (`./`), Rollup manual vendor chunking for `three`, and chunk size warning limit configuration, reducing app bundle size by 78%.
- **Standalone HTML5 Release Archive**: Packaged complete production build into `release/elemental-legends-v1.0.0-html5.zip` formatted per itch.io HTML5 specification.
- **Display & Audio Controls**: Added "TOGGLE FULLSCREEN" and "MUTE AUDIO" buttons in the Settings menu with real-time UI status updates.
- **Post-Battle Navigation**: Added direct "LEVEL SELECT" navigation buttons to both the Victory Screen and Defeat Screen.
- **Comprehensive Master Test Suite**: Expanded `tests/campaign.test.mjs` to test 8 distinct modules: SaveManager, EchoVisionManager, LevelManager (5 levels), Level Select UI, Boss 3-phase combat, Elemental Puzzles, SoundManager controls, and Recursive Memory Disposal.
- **Final Release Documentation**: Created `ASSET_CREDITS.md`, `TEST_REPORT.md`, `RELEASE_INFO.md`, `POSTMORTEM.md`, `CHANGELOG.md`, and `SUBMISSION_CHECKLIST.md`.

### Changed
- **Defeat Screen Nomenclature**: Replaced legacy "Wave Reached" text with dynamic chapter title (e.g. "Chapter I: The Forgotten Village").
- **Defensive Boss Phase Transitions**: Integrated immediate phase transition triggers within `Boss.takeDamage()` in addition to frame update loops.

### Fixed
- **GPU VRAM Memory Accumulation**: Overhauled `LevelManager._cleanPreviousLevel()` with recursive `.traverse()` to dispose all geometry buffers, textures, and materials when changing or replaying levels.
- **PuzzleManager Conduit & Winch API**: Added `registerConduit()`, `lightBrazier()`, and `triggerWinch()` helper methods to prevent unhandled type errors during puzzle interactions.

---

## [0.4.0] - Level 4: Multi-Level Campaign & Progression

### Added
- **5-Chapter Campaign Architecture**: Implemented `LevelManager.js` with 5 distinct playable levels:
  - Chapter I: The Forgotten Village (Fire braziers puzzle, elder's journal, cold morning mist).
  - Chapter II: The Whispering Forest (Acid canal freeze puzzle, scholar's parchment, marsh fog).
  - Chapter III: The Sunken Shrine (Storm dynamo conduit puzzle, warden's inscription, submerged ruins).
  - Chapter IV: The Hollow Fortress (Dual winch elemental lock puzzle, fortress warmaster mini-boss).
  - Chapter V: The Heart of the Curse (Floating abyssal dais, 3-phase Hollow Guardian final boss).
- **Signature Mechanic: Echo Vision (`[V]` / `[C]`)**: Built `EchoVisionManager.js` featuring pulsating cyan vignette overlay, audio resonance, spectral guiding footprints, hidden rune detection, secret relic chests, and exposed soul core weak-point targeting (2x critical strikes).
- **Campaign Save System**: Built `SaveManager.js` with browser `localStorage` persistence, tracking unlocked chapters, best completion times, combat combos, total kills, and permanent stat upgrades (+HP, +Energy, -Cooldown, +Damage).
- **Level Select Screen**: Created interactive Campaign Map UI modal displaying 5 chapter cards with thumbnails, descriptions, status tags (**COMPLETED**, **AVAILABLE**, **LOCKED**), and best completion times.
- **Level Clear Modal & Chapter Banners**: In-game transition banner and clear summary with "Next Chapter" progression button.

---

## [0.3.0] - Level 3: Character, Weapon & Audio Overhaul

### Added
- **Realistic Human Warrior Model**: Scaled to natural proportions (~1.82m) with sculpted face, dark swept-back hair, trimmed beard, quilted gambeson, dark steel plate cuirass, wolf-fur mantle, and physics-responsive dark cloak.
- **Authentic Medieval Arming Sword**: Replaced blocky cuboids with tapered steel blade, central fuller groove, diamond cross-section, curved crossguard, cord-wrapped grip, and faceted counterweight pommel.
- **Procedural Web Audio Engine**: Synthesized footsteps, swooshes, metallic impact clangs, elemental magic explosions, and ambient music without external audio dependencies.
- **Interactive Lore Modals**: Added parchment clue modal (`[E]`) displaying narrative journals.

---

## [0.2.0] - Level 2: Combat Systems & Visual Polish

### Added
- **Elemental Stances (Fire, Ice, Storm)**: Switchable elemental affinities modifying blade auras, damage properties, and status effects.
- **Combo System & Dodge Roll**: Chained 3-hit light combo, overhead heavy smash, and dodge roll with 0.42s invulnerability frames (i-frames).
- **Post-Processing Pipeline**: Integrated ACESFilmic tone mapping and UnrealBloomPass for glowing magic runes.

---

## [0.1.0] - Level 1: Prototype Inception

### Added
- Basic 3D arena prototype with Three.js WebGLRenderer.
- Primitive warrior model and enemy wave spawning.
- Basic keyboard movement (WASD) and orbit mouse look.
