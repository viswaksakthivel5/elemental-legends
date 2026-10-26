# ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM
### Level 5 Final Master Release — Version 1.0.0

![Elemental Legends Gameplay Banner](screenshots/gameplay_banner.jpg)

**Elemental Legends: The Curse of the Hollow Realm** is a complete, polished 3D dark-fantasy action-adventure campaign developed for desktop web browsers using **Three.js (WebGL)**, modular **JavaScript (ES Modules)**, **Vite**, and the **Web Audio API**.

The player controls a battle-hardened medieval human warrior investigating why primordial elemental magic is corrupting an ancient kingdom. Wielding Fire, Ice, and Storm affinities, the warrior navigates five distinct chapters, solves environmental puzzles, discovers ancient lore clues, unlocks secret relics with **Echo Vision**, and confronts **The Hollow Guardian** inside the corrupted abyssal sanctum.

---

## 🌟 Key Highlights & Campaign Features

### 1. True Five-Chapter Campaign Architecture
The game features a complete multi-level campaign where each chapter possesses distinct environmental geometry, lighting, fog palettes, enemy rosters, and puzzle mechanics:
- **Chapter I — The Forgotten Village**: Morning cold mist (`#6e7f91`), timber-and-stone cottages, stone well, patrolling Cursed Villagers, *The Elder's Journal*, and the **Sacred Triad of Braziers** puzzle.
- **Chapter II — The Whispering Forest**: Toxic dark-teal marsh fog (`#182824`), ancient twisted dead oaks, patrolling Forest Stalkers and ranged Void Wraiths, *Scholar's Frost Parchment*, hidden *Frostfire Relic Chest*, and the **Boiling Acid Canal Freeze** puzzle.
- **Chapter III — The Sunken Shrine**: Subterranean deep oceanic indigo haze (`#101726`), submerged flagstones, water reflections, runic obelisks, *Warden's Inscription*, Corrupted Knights, and the **Storm Dynamo Conduit** puzzle.
- **Chapter IV — The Hollow Fortress**: High-altitude stormy ash-slate sky (`#282c34`), gothic parapet towers, battlements, *Commander's Decree*, the elite *Fortress Warmaster* mini-boss, hidden *Aegis Relic*, and the **Dual Winch Elemental Lock** (Fire left, Ice right).
- **Chapter V — The Heart of the Curse**: Abyssal floating dais suspended over a cosmic starfield void (`#160c22`), surrounded by hovering dark crystals and the climactic 3-phase battle against **The Hollow Guardian**.

### 2. Signature Mechanic: Echo Vision (`[V]` or `[C]`)
- **Visual Feedback**: Dynamic pulsating cyan vignette (`#echo-vignette`), ethereal runic scanlines, and audio resonance hum.
- **Spectral Guiding Footprints**: Celestial glowing markers illuminate a path leading directly to active chapter objectives and exit portals.
- **Hidden Secrets**: Detects concealed Runic Pillars and buried secret Relic Chests invisible to normal vision.
- **Exposed Soul Core Weak Points**: During combat against bosses and elite enemies, reveals radiant weak-point glyphs that deliver **2x critical strike damage** on precision hits.

### 3. Persistent Campaign & Save System (`SaveManager`)
- **Browser LocalStorage Persistence**: Keyed under `elemental_legends_level4_save_v1` with in-memory fallback.
- **Campaign Tracking**: Unlocked chapters (1–5), completed chapters, best level clear times, highest combat combo, total kills, discovered clues, and collected relics.
- **Permanent Character Upgrades**:
  - Chapter I: **Talisman of Vitality** (+25 Max HP)
  - Chapter II: **Glacial Focus** (-1.0s Skill Cooldown)
  - Chapter III: **Storm Conduit Mastery** (+15% Damage Multiplier)
  - Chapter IV: **Warrior's Resolve** (+25 Max Energy)
  - Secret Relics: **Frostfire Relic** (+5% Elemental Damage), **Aegis of the Fallen King** (+20 Max HP)
- Replaying previously beaten chapters never resets or corrupts overall campaign progression.
- Safe **New Game** confirmation dialog prevents accidental loss of progress.

### 4. Interactive Level Selection Map
- Accessed from the title screen, pause menu, level clear screen, or victory screen.
- Renders dynamic cards for all 5 chapters displaying chapter number, title, description, thumbnail visual, status tags (**COMPLETED**, **AVAILABLE**, **LOCKED**), and personal best completion time.
- Direct entry into any unlocked chapter.

### 5. Multi-Phase Boss Finale: The Hollow Guardian
- 3 distinct combat phases atop the floating Abyssal Dais:
  - **Phase 1**: Telegraphed ground shockwave slams and heavy counter-attacks.
  - **Phase 2**: Evasive teleportation and dark homing void barrages; exposing the glowing Soul Core via Echo Vision.
  - **Phase 3 (Enraged Calamity)**: Apocalyptic meteor showers, void storms, and high-aggression flurry attacks.
- Cinematic victory summary, campaign completion splash, and replay options.

---

## 🎮 Controls & Keybindings

| Key / Input | Action | In-Game Mechanics |
| :--- | :--- | :--- |
| **W, A, S, D** | Movement | Moves warrior relative to camera viewpoint (Walk / Run) |
| **Mouse Move** | Camera Orbit | Third-person camera control (Click canvas to capture pointer lock) |
| **V** or **C** | **Echo Vision** | **Signature Mystic Sense**: Reveals hidden runes, secret relic chests, spectral guiding footprints, and exposed soul core weak points (2x crit damage) |
| **E** | **Interact** | Inspect clues, activate mechanisms, light braziers, freeze canal, power dynamo, open relic chests, and enter exit portals |
| **Left Click** | Light Attack Combo | 3-hit chained combo with buffering and hit-stop (18 / 24 / 34 dmg) |
| **Right Click** | Heavy Attack | Two-handed overhead ground breaker (56 dmg, staggers elites, triggers puzzles) |
| **Space** / **Shift** | Dodge Roll | Fast evasive roll with 0.42s invulnerability frames (i-frames). Costs 15 Energy |
| **Q** / **F** | Elemental Skill | Stance skill (Flame Wave / Glacial Spikes / Thunder Dash). Costs 25 Energy |
| **R** | Elemental Ultimate | Screen-wide ultimate (Cataclysm / Absolute Zero / Judgment). Costs 50 Energy |
| **1** | Fire Stance | Equips Infernal Blade (Burn damage, ignites village braziers and left fortress winch) |
| **2** | Ice Stance | Equips Frost Reaper (Slows & freezes enemies, solidifies canal, cools right fortress winch) |
| **3** | Storm Stance | Equips Thunder Warden (Chain lightning, charges electrical dynamo conduits) |
| **Mouse Wheel** | Cycle Elements | Cycles through Fire ➔ Ice ➔ Storm clockwise or counter-clockwise |
| **Tab** / **Middle Click** | Target Lock-On | Locks camera orientation onto nearest enemy or boss |
| **Escape** | Pause Menu | Opens pause menu, halting gameplay and freeing mouse cursor |

---

## 🛠️ Technology Stack & Requirements

- **3D Graphics Engine**: Three.js (WebGL 2.0 / WebGL 1.0 fallback)
- **Language**: Modern JavaScript (ES6+ Modules)
- **Build Tool / Dev Server**: Vite (v5.1.6) with Rollup vendor chunking
- **Styling & UI**: Vanilla CSS & HTML5 with dark-fantasy gothic glassmorphism
- **Audio Engine**: Web Audio API (procedural synthesis, zero external dependencies)
- **Node Environment**: Node.js v18.0.0 or higher
- **Browser Compatibility**: Any modern desktop browser (Chrome, Edge, Firefox, Brave, Safari)

---

## 🚀 Exact Commands to Run the Game

### 1. Clone or Open the Repository
```bash
git clone https://github.com/viswaksakthivel5/elemental-legends.git
cd elemental-legends
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Local Development Server
```bash
npm run dev
```

### 4. Play the Game
Open your web browser and navigate to:
```
http://localhost:5173/
```
- Click **NEW GAME** to embark on Chapter 1: The Forgotten Village.
- Click **LEVEL SELECT** to view all chapters.
- Press **[V]** anytime in gameplay to activate **Echo Vision**!

### 5. Run Automated Test Suite
```bash
npm test
```
Executes the comprehensive automated campaign test suite (8/8 test suites pass).

### 6. Build for Production Bundle
```bash
npm run build
```
Generates an optimized bundle inside `dist/`.

---

## 📦 Distribution & Packaging

- **Standalone HTML5 Release ZIP**: Located at `release/elemental-legends-v1.0.0-html5.zip` (1.09 MB). Formatted per the official [itch.io HTML5 Game Specification](https://itch.io/docs/creators/html5).
- **itch.io Deployment Guide**: See [RELEASE_INFO.md](RELEASE_INFO.md) for step-by-step publishing instructions.
- **GitHub Pages Deployment**: See [RELEASE_INFO.md](RELEASE_INFO.md) for 1-click GitHub Pages hosting.

---

## 📚 Complete Project Documentation

- [GAME_DESIGN_DOCUMENT.md](GAME_DESIGN_DOCUMENT.md) — Comprehensive game design document and lore.
- [CONTROLS.md](CONTROLS.md) — Full keybindings, combat guide, and 5-chapter walkthrough.
- [TEST_REPORT.md](TEST_REPORT.md) — Quality assurance test matrix and verification results.
- [POSTMORTEM.md](POSTMORTEM.md) — Development retrospective, technical challenges, and lessons learned.
- [ASSET_CREDITS.md](ASSET_CREDITS.md) — Provenance, software licenses, and typography attribution.
- [RELEASE_INFO.md](RELEASE_INFO.md) — Release metadata, publishing steps, and system requirements.
- [CHANGELOG.md](CHANGELOG.md) — Version history across Levels 1–5.
- [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) — Evaluation checklist and proof links for internship reviewers.
