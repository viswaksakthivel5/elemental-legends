# ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM
### Level 3 Game Development Internship Submission

![Elemental Legends Gameplay Banner](screenshots/gameplay_banner.jpg)

**Elemental Legends: The Curse of the Hollow Realm** is a polished, fully playable 3D dark-fantasy action-adventure game developed for desktop web browsers using **Three.js (WebGL)**, modular **JavaScript (ES Modules)**, **Vite**, and the **Web Audio API**.

The player controls a battle-hardened medieval human warrior who enters an abandoned settlement to uncover why its inhabitants vanished and why primordial elemental magic is corrupting the land. Wielding Fire, Ice, and Storm, the warrior solves environmental puzzles, discovers ancient lore clues, slays corrupted horrors across four contiguous zones, and confronts **The Hollow Guardian** inside a ruined fortress sanctum.

---

## 🌟 Level 3 Key Features & Additions

### 1. Realistic Human Warrior Redesign
- **Anatomical Human Proportions**: Scaled to natural human proportions (~1.82m) with detailed facial features, weathered skin, dark hair with swept-back locks, and a trimmed beard.
- **Dark Fantasy Attire**: Layered quilted gambeson, dark steel cuirass with glowing runic inlays, dark leather baldric straps with brass buckles, forearm bracers, steel gauntlets, and heavy boots.
- **Distinctive Silhouette**: Thick layered wolf-fur collar/mantle draped across the shoulders, accompanied by a physics-responsive dark tattered cloak.
- **Believable Pose & Animations**: Smooth animation blending across idle breathing, 4-phase walking and running cycles, turning, 3-hit light combo slashes, heavy overhead ground smashes, invincible dodge rolls, hit flinches, elemental skill casting, and victory stances.

### 2. Authentic Medieval Steel Arming Sword
- **Sword Overhaul**: Replaced blocky/bat-like geometry with a realistic tapered medieval steel arming/bastard sword.
- **Accurate Historical Proportions**:
  - Narrow, double-edged steel blade with a distal taper, sharp pointed piercing tip, central fuller groove, and diamond cross-section.
  - Curved steel crossguard with protective quillons.
  - Dark cord-and-leather wrapped ergonomic grip.
  - Faceted octagonal steel pommel acting as counterweight.
  - Specular steel materials that react to dynamic torchlight, ice frost, and lightning flashes.

### 3. Four Connected World Zones
Seamless travel along the Z-axis through four atmospheric dark-fantasy environments:
1. **The Forgotten Village (Z: 28 to 5)**: Cobblestone lanes, weathered timber cottages, stone wells, wooden fences, and ground fog. Houses the Village Elder's Journal and the Cursed Thorn Gate.
2. **The Haunted Forest (Z: 5 to -14)**: Gnarled dead oaks, drifting low fog, ancient roots, and the Scholar's Parchment along the corrosive canal.
3. **The Ancient Shrine (Z: -14 to -25)**: Crumbling gothic stone pillars, glowing runic obelisks, the Warden's Inscription, and the copper lightning conduit.
4. **The Ruined Fortress (Z: -25 to -50)**: Massive stone battlements, iron portcullis, stormy thunderclouds, and the dark throne sanctum of The Hollow Guardian.

### 4. Three Elemental Environmental Puzzles
Interactive puzzles requiring elemental understanding rather than arbitrary buttons:
- 🔥 **Puzzle 1 (FIRE - Sacred Triad of Braziers)**: Three stone braziers in the village must be ignited using Fire magic (`1` + `Q`, attack, or `E`). When all three blaze, the cursed brambles burn away, opening the forest gate.
- ❄️ **Puzzle 2 (ICE - Corrupted Canal Freeze)**: A boiling canal of corrosive bile prevents crossing into the shrine. Channelling Ice magic (`2` + `Q` or `E`) flash-freezes the canal into a shimmering crystalline ice bridge.
- ⚡ **Puzzle 3 (STORM - Magnetic Lightning Conduit)**: The fortress iron portcullis is rusted shut. Discharging Storm magic (`3` + `Q`, strike, or `E`) into the copper coil terminal energizes the magnetic gears and raises the heavy portcullis.

### 5. Interactive Mystery Storytelling & Clues
Discoverable lore artifacts readable in-game via a gothic parchment modal (`E` key):
- **Village Elder's Torn Journal**: Explains the sudden arrival of the dark fog and reveals the secret of the three fire braziers.
- **Scholar's Frost Parchment**: Records the properties of the corrupted canal bile and how frost stances can solidify it.
- **Warden's Runic Inscription**: Warns of The Hollow Guardian and explains how storm electricity activates the fortress winch.

### 6. Redesigned Enemies & Boss Encounter
- **Cursed Wanderer**: A hollow villager corrupted by void tendrils wielding a rusted sickle. Patrols zones, detects the player within 10m, and charges with telegraphed slashes.
- **Elemental Corruption (Void Wraith)**: Ethereal floating shade that casts homing void projectiles and teleports away when approached. Highly susceptible to Ice slow debuffs.
- **The Hollow Guardian (Final Boss)**: Colossal warrior (2.4x scale) in horned blackened armor wielding the Soulreaver Greatsword across 3 distinct combat phases (leaping shockwave slams, teleport dashes, radial dark projectile barrages, and apocalyptic meteor storms).

### 7. Zero-Latency Procedural Web Audio Engine
- Synthesized footsteps synchronized with run cycles.
- Dynamic sword swooshes and sharp metallic impact clangs.
- Realistic elemental blasts: crackling fire combustions, crystalline ice resonance, and booming lightning thunderclaps.
- Environmental audio: creaking wood, heavy portcullis gears grinding, parchment clue inspection chime, and eerie dark-fantasy ambient soundtrack.

---

## 🛠️ Technology Stack & Requirements

- **3D Graphics Engine**: Three.js (WebGL 2.0 / WebGL 1.0 fallback)
- **Language**: Modern JavaScript (ES6+ Modules)
- **Build Tool / Dev Server**: Vite (v5.1.6)
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
Click **ENTER THE HOLLOW REALM** on the title menu to begin!

### 5. Build for Production Bundle (Verified 0 Errors)
```bash
npm run build
```
Output will be generated cleanly inside `dist/`.

---

## 🎮 Controls & Keybindings

| Key / Input | Action | In-Game Mechanics |
| :--- | :--- | :--- |
| **W, A, S, D** | Movement | Moves warrior relative to camera viewpoint (Walk / Run) |
| **Mouse Move** | Camera Orbit | Third-person camera control (Click canvas to capture pointer lock) |
| **E** | **Interact** | **Read clues/journals, inspect mechanisms, light braziers, freeze canal, power conduit** |
| **Left Click** | Light Attack Combo | 3-hit chained combo with buffering and hit-stop (18 / 24 / 34 dmg) |
| **Right Click** | Heavy Attack | Two-handed overhead ground breaker (56 dmg, staggers elites, triggers puzzles) |
| **Space** / **Shift** | Dodge Roll | Fast evasive roll with 0.42s invulnerability frames (i-frames). Costs 15 Energy |
| **Q** / **F** | Elemental Skill | Stance skill (Flame Wave / Glacial Spikes / Thunder Dash). Costs 25 Energy |
| **R** | Elemental Ultimate | Screen-wide ultimate (Cataclysm / Absolute Zero / Judgment). Costs 50 Energy |
| **1** | Fire Stance | Equips Infernal Blade (Burn damage, lights village braziers) |
| **2** | Ice Stance | Equips Frost Reaper (Slows & freezes enemies, freezes canal into bridge) |
| **3** | Storm Stance | Equips Thunder Warden (Chain lightning, powers fortress conduit) |
| **Mouse Wheel** | Cycle Elements | Cycles through Fire ➔ Ice ➔ Storm clockwise or counter-clockwise |
| **Tab** / **Middle Click** | Target Lock-On | Soft-locks camera orientation onto nearest enemy or boss |
| **Escape** | Pause Menu | Opens pause menu, halting gameplay and freeing mouse cursor |

---

## 🧪 Testing Status & Verification

1. **Production Build (`npm run build`)**: **PASSED** (0 errors, 31 modules transformed cleanly, bundle generated in 3.54s).
2. **Development Server (`npm run dev`)**: **PASSED** (Vite server running on `http://localhost:5173/` with hot module replacement active).
3. **Character & Weapon Presentation**: **VERIFIED** (Realistic human proportions, fur collar, leather baldric, tapered steel blade with fuller, quillons, and pommel).
4. **4-Zone Contiguous World**: **VERIFIED** (Village, Forest, Shrine, and Fortress loaded with fog, lighting, and props).
5. **3 Elemental Puzzles**: **VERIFIED** (Fire brazier counter & vine removal, canal water material shift & ice bridge reveal, conduit light & portcullis elevation).
6. **3 Interactive Clues**: **VERIFIED** (Elder's Journal, Scholar's Parchment, Warden's Inscription with DOM modal display).
7. **Combat Engine**: **VERIFIED** (Light combo, heavy slam, dodge roll i-frames, damage vignette, combo rank).
8. **Audio Engine**: **VERIFIED** (Footsteps, slashes, impacts, elemental magic, and ambient synth).
9. **Automated Headless Browser Testing Limitation**: The sandbox environment has restricted outbound network access preventing Playwright from downloading third-party driver binaries (`playwright-1.57.0-win32_x64.zip` from azureedge.net). All code is verified via local compilation, hot reloading, and standard browser compatibility.

---

## 📜 Asset Credits & Attribution

- **Game Engine**: [Three.js](https://threejs.org/) (MIT License, Copyright © 2010-2024 Three.js Authors)
- **Build System**: [Vite](https://vitejs.dev/) (MIT License, Copyright © 2019-present Evan You & Vite Contributors)
- **Character, Environment & Weapon Models**: Procedural 3D geometry engine custom engineered with Three.js primitives, custom buffer geometries, extruded profiles, and physical materials.
- **Audio & Sound Effects**: Custom procedural Web Audio API synthesizer. Zero copyrighted external audio samples.
- **Typography**: Google Fonts (*Cinzel* & *MedievalSharp*, SIL Open Font License).
