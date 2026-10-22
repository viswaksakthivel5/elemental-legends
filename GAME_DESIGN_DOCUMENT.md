# GAME DESIGN DOCUMENT (GDD)
## ELEMENTAL LEGENDS: RISE OF THE FALLEN KING
### Level 2 Internship Submission Document

---

## 1. Game Overview
- **Game Title**: Elemental Legends: Rise of the Fallen King
- **Genre**: 3D Third-Person Dark-Fantasy Action Game
- **Platform**: Desktop Web Browser (WebGL / HTML5)
- **Target Audience**: Action game enthusiasts, fans of fast-paced real-time combat games (e.g., *Devil May Cry*, *Dark Souls*, *Elden Ring*).
- **Core Concept**: A responsive, real-time 3D action combat prototype where an ancient warrior wields three primordial stances (Fire, Ice, and Storm) to battle through waves of corrupted adversaries and conquer a multi-phase boss in an explorable gothic ruined fortress.

---

## 2. Core Gameplay Loop & Objectives

### 2.1 The Gameplay Loop
```
[Select Elemental Stance] ➔ [Assess Enemy Wave] ➔ [Execute Combos, Skills & Dodges]
       ▲                                                           │
       │                                                           ▼
[Recover Energy & Proceed] ◄── [Defeat Adversaries & Break Boss Shields]
```

1. **Stance Selection & Synergy**: The player identifies enemy threats and switches elemental stances (Fire for burn DPS, Ice for crowd-control slows/freezes, Storm for chain lightning and high-speed gap closing).
2. **Read-and-React Combat**: Observe enemy telegraphs, utilize invulnerability frames (i-frames) on dodge rolls, and chain light/heavy attack combos during recovery windows.
3. **Wave Progression**: Clear Wave 1 (Vanguard), Wave 2 (Elites & Ranged), and conclude with the 3-Phase Fallen King Boss Encounter.

### 2.2 Main Objectives
- **Wave 1**: Defeat 4 Corrupted Fallen Soldiers to master basic melee timing and combos.
- **Wave 2**: Eliminate 2 Corrupted Elite Knights and 2 Void Cultists by managing distance and utilizing stance counters.
- **Wave 3 (Final Encounter)**: Vanquish The Fallen King through all 3 escalating combat phases.

---

## 3. Player Character & Mechanics

### 3.1 Character Attributes (Implemented)
- **Health (100 Max)**: Non-regenerating in combat; requires deliberate defensive positioning and evasive dodges.
- **Energy (100 Max)**: Powers tactical evasion and abilities (Dodge: 15, Heavy Attack: 20, Skill: 25, Ultimate: 50). Regenerates passively at 8/sec and refills upon landing successful melee attacks.
- **Dynamic Cape & Armor**: Procedural multi-joint character model featuring layered dark steel plates, glowing runic inlays, and physics-driven cloth cape flutter.

### 3.2 Implemented Combat Mechanics
- **3-Hit Light Attack Combo**:
  - *Hit 1*: Right-to-left horizontal slash (18 dmg).
  - *Hit 2*: Upward diagonal return slash (24 dmg).
  - *Hit 3*: Downward overhead cleave with lunge and knockback (34 dmg).
  - *Combo Buffer Window*: Input buffering between 45%–100% of the swing animation allows seamless combo chaining.
- **Heavy Attack (Overhead Ground Smash)**:
  - High-impact two-handed downward strike dealing 56+ base damage with high stagger chance to disrupt elite enemies.
- **Evasive Dodge Roll**:
  - High-speed roll granting **0.42 seconds of true invulnerability frames (i-frames)** to safely pass through enemy shockwaves, cleaves, and projectiles.
- **Target Lock-On**:
  - Camera soft-lock tracking (`Tab` or `Middle Click`) that centers framing on the nearest opponent or boss.

---

## 4. The Three Elemental Stances (Implemented)

| Stance | Aesthetic | Passive Proc | Active Skill (`Q` / `F`) | Ultimate Ability (`R`) |
| :--- | :--- | :--- | :--- | :--- |
| **FIRE** | Molten blade, fiery ember trail | Attacks inflict burning Damage-Over-Time | **Flame Wave**: Piercing crescent flame projectile dealing 42 damage | **Magma Cataclysm**: Massive 9m radius volcanic detonation dealing 75–85 AoE damage |
| **ICE** | Crystalline blade, frost glitter | Attacks slow enemy attack & movement speeds by 50% | **Glacial Spikes**: Triple fan of piercing ice shards dealing 32 damage | **Absolute Zero Nova**: Exploding frost dome freezing all enemies within 10m for 3.5 seconds |
| **STORM** | Electric arcs, spark burst | Attacks chain lightning to nearby adjacent targets | **Thunder Dash**: Lightning-fast dash teleporting through enemies for 38–45 damage | **Judgment of the Storm**: Arena-wide lightning strikes calling thunderbolts onto all active targets |

---

## 5. Enemies & Boss Design (Implemented)

### 5.1 Corrupted Fallen Soldier
- **Role**: Swarm melee infantry.
- **Behavior**: Chases player, raises cleaver in a red telegraph, and swings. Staggers on hit.
- **Stats**: 50 HP | 12 Damage.

### 5.2 Void Cultist
- **Role**: Ranged artillery and zone control.
- **Behavior**: Hovers above ground, maintains 9–12m distance, and charges homing void projectiles. Teleports away if player approaches within 5m.
- **Stats**: 40 HP | 16 Damage.

### 5.3 Corrupted Elite Knight
- **Role**: Armored front-line tank.
- **Behavior**: Equipped with spiked warhammer and tower shield; features hyper-armor (ignores light attack staggers) and executes heavy ground-pound shockwaves.
- **Stats**: 120 HP | 26 Damage.

### 5.4 THE FALLEN KING (Colossal Boss)
- **Scale**: 2.4x player scale with obsidian crown, demon-skull pauldrons, and the giant Soulreaver Greatsword.
- **Stats**: 600 HP.
- **Phase Breakdown**:
  - **Phase 1 (100%–66% HP)**: Heavy greatsword swings; jumping ground slams generating expanding shockwave rings (telegraphed by pulsing red decals).
  - **Phase 2 (66%–33% HP)**: Phase transition roar; teleport dashes; 5-way radial projectile barrages.
  - **Phase 3 (33%–0% HP - Enraged Calamity)**: Eyes and sword blaze crimson; movement speed increases by 35%; calls down apocalyptic dark meteor storms with ground telegraph decals.
  - **Defeat State**: Cinematic slow-motion collapse to knees with fading energy as victory triggers.

---

## 6. Win and Lose Conditions (Implemented)

- **Victory Condition**: Successfully vanquish The Fallen King in Wave 3. Triggers the victory fanfare and displays the Victory Screen with battle metrics (Clear Time, Max Combo Streak, Total Damage Dealt, Elemental Mastery Rank).
- **Lose Condition**: Player health reaches 0. Triggers game-over audio and displays the Defeat Screen with statistics (Wave Reached, Max Combo, Total Kills) along with an instant "Try Again" option.

---

## 7. Current Prototype Limitations vs. Future Improvements

### 7.1 Current Limitations (Level 2 Prototype)
1. **Single Arena Battlefield**: The gameplay is currently contained within a single enclosed cathedral ruins arena rather than an interconnected multi-level world.
2. **Procedural Rigging vs. Skeletal Mesh Skinning**: Character animations use hierarchical joint groups and procedural forward kinematics rather than skinning weights (`SkinnedMesh`). While this ensures 60+ FPS on any hardware, complex cloth deformation is simplified.
3. **Audio Synthesis**: Audio is fully generated via Web Audio API oscillators and filters to guarantee zero 404s and 0ms latency; recorded voice acting and live orchestra samples are not yet implemented.

### 7.2 Planned Future Improvements (For Subsequent Internship Levels)
- **Expanded Level Traversal**: Adding ruined castle courtyards, subterranean crypts, and vertical climbing/grappling mechanics.
- **Inventory & Weapon Crafting**: Lootable boss souls to forge specialized elemental weapons with distinct movesets.
- **External GLTF/GLB Asset Pipeline**: Integration of custom 3D character rigs with blend shapes and mocap animation clips.
- **Advanced Shader Effects**: Volumetric raymarching for real-time smoke plumes and dynamic screen-space reflections (SSR).
