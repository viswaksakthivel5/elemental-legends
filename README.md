# ELEMENTAL LEGENDS: RISE OF THE FALLEN KING
### Level 2 Game Development Internship Submission

![Elemental Legends Gameplay Banner](screenshots/gameplay_banner.jpg)

**Elemental Legends: Rise of the Fallen King** is an original, fully playable real-time 3D dark-fantasy action prototype developed for desktop web browsers using **Three.js (WebGL)**, modular **JavaScript (ES Modules)**, **Vite**, and the **Web Audio API**.

The player assumes the role of an ancient elemental warrior wielding the power of Fire, Ice, and Storm, battling through escalating enemy waves to overthrow **The Fallen King**—a colossal tyrant corrupted by forbidden abyss magic.

---

## 🌟 Key Features (Implemented)

- **Authentic 3D Articulated Character**:
  - Procedural hierarchical 3D hero with layered dark-metal armor, glowing runes, cloth cape physics, and a massive runed greatsword.
  - Multi-state procedural animation system with smooth blending: Idle breathing, 4-phase walking/running cycles, directional turning, 3-hit light combo chains, heavy ground-cracking slams, invincible dodge rolls (i-frames), damage flinches, and death collapse.
- **Three Dynamic Elemental Powers**:
  - 🔥 **FIRE (Infernal Blade)**: Burning damage over time, *Flame Wave* crescent projectile (Skill: `Q`), and *Magma Cataclysm* AoE eruption (Ultimate: `R`).
  - ❄️ **ICE (Frost Reaper)**: Freezing and movement/attack slow debuffs, *Glacial Spikes* triple piercing shard launch (Skill: `Q`), and *Absolute Zero Frost Nova* arena freeze (Ultimate: `R`).
  - ⚡ **STORM (Thunder Warden)**: High-voltage electric arcs chaining to adjacent enemies, *Thunder Dash* teleport shock (Skill: `Q`), and *Judgment of the Storm* skyward lightning barrage (Ultimate: `R`).
  - Instant in-combat stance switching (`1`, `2`, `3`, or Mouse Wheel) with real-time sword aura, emissive rune shifts, and sound chimes.
- **Responsive Action Combat Engine**:
  - Smooth third-person orbital camera with mouse look, distance damping, target lock-on (`Tab` / Middle Click), and collision avoidance.
  - 3-hit chained light attack combo with combo buffering and combo resets.
  - Heavy attack with windup and devastating ground impact.
  - Dodge roll with true invulnerability frames (0.42s i-frames).
  - Dynamic combo counter with performance ranking (Rank D up to Rank S).
  - Floating 3D/DOM combat damage numbers with critical hits and elemental color coding.
  - Screen shake and damage vignette.
- **Explorable Gothic Cathedral Battlefield**:
  - Massive gothic stone architecture: ruined arches, broken fluted pillars, burning braziers with dynamic flickering point lights and shadows.
  - Central runic arena ring reacting to elemental magic, surrounded by deep volcanic lava trenches.
  - Atmospheric dark-fantasy fog, drifting fiery embers, floating dust motes, and stormy sky dome.
- **Epic Multi-Phase Boss Battle**:
  - **The Fallen King** (2.4x scale) with obsidian spiked crown, demon-skull pauldrons, glowing abyssal soul channel, and the colossal Soulreaver Greatsword.
  - **Phase 1**: Melee cleaves and telegraphed leaping ground slams with expanding fiery shockwaves.
  - **Phase 2**: Teleport dash, abyssal roars, and radial barrages of void projectiles.
  - **Phase 3 (Enraged Calamity)**: Eyes and blade blaze with crimson inferno, heightened attack velocity, and apocalyptic meteor storms.
  - Cinematic slow-motion finishing sequence on defeat.
- **Zero-Latency Web Audio Procedural Synthesizer**:
  - Dynamic procedural SFX engine: sword swings, metallic clangs, elemental explosions, ice cracks, lightning thunderclaps, boss roars, and ambient dark-fantasy chord progressions. Zero external audio download dependencies, 100% reliable across browsers.

---

## 🛠️ Technology Stack & Requirements

- **3D Graphics Engine**: Three.js (v0.162.0)
- **Language**: JavaScript (ES6+ Modules)
- **Styling & HUD**: Vanilla CSS & HTML5 with custom dark-fantasy glassmorphic interface
- **Audio**: Web Audio API (procedural synthesis for SFX & BGM)
- **Build Tool / Bundler**: Vite (v5.1.6)
- **System Requirements**: Any modern desktop browser with WebGL support (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).
- **Node Environment**: Node.js v18.0.0 or higher.

---

## 🚀 Quick Launch Instructions

### 1. Clone or Open the Repository
```bash
git clone <repository-url>
cd GAME
```

### 2. Install Dependencies
Dependencies are managed via npm. Run:
```bash
npm install
```

### 3. Launch the Local Development Server
```bash
npm run dev
```

### 4. Play the Game
Open your web browser and navigate to:
```
http://localhost:5173/
```
Click **START GAME** on the title menu to begin!

### 5. Build for Production (Optional)
To create an optimized production build:
```bash
npm run build
```
The output will be generated inside the `dist/` directory.

---

## 🎮 Controls & Keybindings

| Key / Input | Action | In-Game Mechanics |
| :--- | :--- | :--- |
| **W, A, S, D** | Movement | Moves character relative to camera viewpoint |
| **Mouse Move** | Camera Orbit | Third-person camera control (Pointer lock engages on canvas click) |
| **Left Click** | Light Attack Combo | 3-hit chained combo with combo buffering |
| **Right Click** or **E** | Heavy Attack | Overhead downward slam dealing massive damage and staggering enemies |
| **Space** or **Shift** | Dodge Roll | High-speed evasive dash with 0.42s invulnerability frames (i-frames) |
| **Q** or **F** | Elemental Skill | Flame Wave / Glacial Spikes / Thunder Dash |
| **R** | Elemental Ultimate | Magma Cataclysm / Frost Nova / Storm Judgment |
| **1 / 2 / 3** | Switch Elements | Instant swap between Fire, Ice, and Storm |
| **Mouse Wheel** | Cycle Elements | Cycle through elements clockwise or counter-clockwise |
| **Tab** or **Middle Click** | Target Lock | Locks camera framing onto nearest enemy or boss |
| **ESC** | Pause Menu | Opens pause menu and audio/graphics settings |

---

## 📂 Project Architecture

```
GAME/
├── .gitignore                   # Ignores node_modules, dist, caches, logs
├── package.json                 # Project configuration and scripts
├── package-lock.json            # Deterministic dependency tree
├── README.md                    # Project overview, installation, and launch guide
├── GAME_DESIGN_DOCUMENT.md      # Detailed Level 2 Game Design Document
├── CONTROLS.md                  # Comprehensive combat mechanics and stance guide
├── ARCHITECTURE.md              # Technical architecture and rendering pipeline
├── screenshots/                 # Gameplay visuals and artwork
│   └── gameplay_banner.jpg      # Showcase banner
├── public/                      # Static assets
└── src/
    ├── main.js                  # Application entry point
    ├── core/
    │   ├── Engine.js            # Main loop, game state machine, system coordinator
    │   ├── Renderer.js          # WebGLRenderer, PCF shadows, ACESFilmic tone mapping, Bloom
    │   ├── CameraManager.js     # Third-person spring camera, lock-on, screen shake
    │   ├── InputManager.js      # Pointer lock, keyboard listeners, mouse look
    │   └── SoundManager.js      # Procedural Web Audio API sound synthesizer & BGM
    ├── entities/
    │   ├── CharacterModelBuilder.js # Procedural 3D models with materials & skeletal joints
    │   ├── Player.js            # Hero controller, combo states, dodge i-frames
    │   ├── Enemy.js             # AI for Soldiers, Void Cultists, and Elite Knights
    │   ├── Boss.js              # The Fallen King (3 phases, ground slams, meteors)
    │   └── Projectile.js        # Fire waves, ice spikes, void orbs with collision
    ├── systems/
    │   ├── CombatSystem.js      # Melee hit detection, damage calc, knockback, combo ranks
    │   ├── ElementalSystem.js   # Skills (Q), Ultimates (R), passives, elemental VFX
    │   ├── WaveManager.js       # Wave 1 (Vanguard), Wave 2 (Elites), Wave 3 (Boss)
    │   └── VFXManager.js        # Particles, embers, shockwaves, telegraph decals, damage numbers
    └── ui/
        ├── UIManager.js         # HUD updates, health bars, modals, settings
        └── style.css            # Dark-fantasy styling, typography, animations
```

---

## 📋 Current Known Limitations

- **Single Arena Bounds**: The prototype takes place in a large gothic cathedral caldera arena rather than multiple streaming world zones.
- **Forward Kinematics**: Character movement uses hierarchical scene graph rotation nodes rather than complex skinned bone weights, prioritizing 60 FPS performance and zero download overhead.
- **Synthesized Audio**: Sound effects and music are generated live in-browser via the Web Audio API to prevent external file dependencies; pre-recorded voice acting is not currently included.

---

## 📜 Credits & Attributions

- **Game Design & Development**: Viswak K S (Level 2 Game Development Internship)
- **Core 3D Engine**: [Three.js](https://threejs.org/) (MIT License)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) (MIT License)
- **Typography**: [Google Fonts](https://fonts.google.com/) (Cinzel, Cinzel Decorative, Outfit - Open Font License)
