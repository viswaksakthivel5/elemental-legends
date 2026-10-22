# GAME DESIGN DOCUMENT (GDD)
# ELEMENTAL LEGENDS: RISE OF THE FALLEN KING

---

## 1. Executive Summary

- **Title**: Elemental Legends: Rise of the Fallen King
- **Genre**: 3D Dark-Fantasy Third-Person Action Combat
- **Platform**: Desktop Web Browser (WebGL / HTML5)
- **Target Audience**: Fans of challenging third-person dark fantasy action games (Dark Souls, Elden Ring, Devil May Cry)
- **Engine / Core Tech**: Three.js, Vanilla ES Modules, Vite, Web Audio API
- **Elevator Pitch**: Command an ancient warrior infused with primordial elemental energy. Seamlessly weave between Fire, Ice, and Storm to dismantle legions of corrupted warriors and vanquish The Fallen King in a gothic fortress ruins.

---

## 2. World & Narrative Context

In the age of the Shattered Crown, King Malakor unsealed the Abyssal Vault beneath his citadel, seeking eternal reign. The forbidden corruption mutated his body into a towering behemoth of obsidian and void, transforming his garrison into soulless thralls.

As the lone surviving Elemental Warden, the player awakens at the edge of the volcanic caldera. Guided by runic memories etched into their dark plate armor, the Warden must cross the ruined cathedral grounds and execute the corrupted sovereign.

---

## 3. Core Gameplay Loop

```
[Explore Arena] ➔ [Assess Threat Composition] ➔ [Select Elemental Stance]
       ▲                                                    │
       │                                                    ▼
[Clear Wave & Recover] ◄── [Execute Combos, Skills & Ultimates, Dodge Attacks]
```

1. **Moment-to-Moment Combat**:
   - High-responsiveness third-person combat with directional movement and smooth orbital mouse look.
   - Pacing relies on read-and-react mechanics: observing enemy telegraphs, executing well-timed dodge rolls with i-frames, and punishing recovery windows.
   - Fluid animation chaining: Light Attack 1 ➔ Light Attack 2 ➔ Overhead Cleave 3, or windup into heavy armor-cracking slams.
2. **Elemental Synergy**:
   - **Fire**: Maximum DPS burn over time and explosive clearing.
   - **Ice**: Crowd control; slows hyper-aggressive elites and freezes targets solid.
   - **Storm**: High mobility; instantaneous dash-slashes and chain lightning across swarms.
3. **Escalating Encounter Waves**:
   - **Wave 1 (Vanguard)**: 4 Fallen Soldiers to teach melee spacing, combos, and dodging.
   - **Wave 2 (Abyssal Elites)**: 2 Corrupted Elite Knights with heavy shields and 2 Void Cultists launching homing projectiles to demand stance switching and target prioritization.
   - **Wave 3 (Boss: The Fallen King)**: 3-phase epic encounter testing all learned skills.

---

## 4. Character & Combat Mechanics

### 4.1 Player Stats
- **Health**: 100 HP. Does not passively regenerate; requires defensive play and smart evasion.
- **Energy**: 100 Energy. Used for Dodging (15), Heavy Attacks (20), Skills (25), and Ultimates (50). Regenerates at 8/second and refills on landing successful melee strikes.

### 4.2 Actions & Animations
- **Idle / Movement**: Organic breathing oscillations, dynamic foot-planting walk/run cycles, and secondary cloth physics on the cape.
- **3-Hit Light Attack Chain**:
  * *Hit 1 (Right-to-Left Slash)*: Fast execution, 18 damage.
  * *Hit 2 (Upward Diagonal Slash)*: Seamless chain, 24 damage.
  * *Hit 3 (Overhead Downward Cleave)*: High impact finisher with forward lunge and knockback, 34 damage.
- **Heavy Attack (Overhead Ground Slam)**:
  * 0.45s telegraph windup followed by an earth-shattering downward smash, 56 base damage with high critical chance and heavy stagger.
- **Evasive Dodge Roll**:
  * 0.42s duration with true invulnerability frames (i-frames). Allows dodging through shockwaves, cleaves, and projectiles.

---

## 5. The Three Elemental Powers

| Element | Identity | Passive Proc | Active Skill (Q) | Ultimate Ability (R) |
| :--- | :--- | :--- | :--- | :--- |
| **FIRE** | *Infernal Blade* | Attacks inflict Burning DoT (6 dmg / 0.4s for 3.5s) | **Flame Wave**: Launches a piercing crescent fire wave dealing 42 damage | **Magma Cataclysm**: Detonates a 9m volcanic explosion dealing 75-85 AoE damage |
| **ICE** | *Frost Reaper* | Attacks apply 50% movement & attack slow | **Glacial Spikes**: Triple fan of crystalline ice spikes dealing 32 damage | **Absolute Zero Nova**: Freezes all enemies within 10m for 3.5 seconds dealing 60-70 damage |
| **STORM** | *Thunder Warden* | Attacks trigger chain lightning arcs to nearby foes | **Thunder Dash**: Lightning speed dash through targets, dealing 38-45 damage | **Judgment of the Storm**: Global lightning strikes calling thunderbolts on all arena targets |

---

## 6. Enemy & Boss Codex

### 6.1 Fallen Soldier
- **Role**: Swarm melee infantry.
- **Weapon**: Rusted jagged cleaver.
- **Behavior**: Charges toward player, telegraphs swing with raised blade, staggers upon taking damage.
- **HP**: 50 | **Damage**: 12.

### 6.2 Void Cultist
- **Role**: Ranged artillery and zone controller.
- **Weapon**: Floating Void Crystal Staff.
- **Behavior**: Maintains 9-12m distance; channels and launches homing dark void orbs. Teleports away if player gets within 5m.
- **HP**: 40 | **Damage**: 16.

### 6.3 Corrupted Elite Knight
- **Role**: Armored front-line juggernaut.
- **Weapon**: Heavy Spiked Warhammer & Iron Greatshield.
- **Behavior**: Possesses hyper-armor (uninterruptible by light attacks). Executes crushing overhead hammer slams with ground shockwaves.
- **HP**: 120 | **Damage**: 26.

### 6.4 THE FALLEN KING (Colossal Boss)
- **Scale**: 2.4x player scale.
- **Appearance**: Corrupted obsidian crown, demonic skull pauldrons, glowing abyssal soul channel, and the giant Soulreaver Greatsword.
- **HP**: 600.
- **Phase Breakdown**:
  * **Phase 1 (100% - 66% HP)**: Heavy greatsword horizontal swings; jumping ground slams generating expanding shockwave rings (telegraphed with glowing red ground decals).
  * **Phase 2 (66% - 33% HP)**: Phase transition roar; teleport dash leaving void trails; 5-way radial projectile barrages.
  * **Phase 3 (33% - 0% HP - Enraged Calamity)**: Eyes and blade blaze with blood-crimson aura; movement speed increased by 35%; summons apocalyptic dark meteor storms raining down on player.
  * **Defeat**: Cinematic slow-motion death animation, dropping to knees as corrupted power dissipates into the sky.

---

## 7. Environment & Visual Design

- **Atmosphere**: Grimdark gothic fantasy. Color palette consists of deep obsidian (#0e1218), aged dark steel, corrupted purple, and intense warm firelight contrast.
- **Key Architecture**:
  * Central runic circular dais with dynamic elemental rune illumination.
  * Surrounding volcanic trenches with incandescent lava fissures.
  * Gothic arches and colonnade of fluted broken stone pillars.
  * Real-time burning braziers casting flickering dynamic shadows.
  * Volumetric height fog and drifting particle embers.

---

## 8. Audio Experience
- Entirely synthesized using the **Web Audio API**:
  * Zero external audio files to download; guarantees instant startup, zero 404 network errors, and low CPU usage.
  * Custom dynamic music generator playing dark minor chord arpeggios (D minor Phrygian) that intensify and add battle drums during boss phases.
  * Multi-layered physical SFX: blade swooshes (bandpass noise), metallic hit clangs, sub-bass ground slams, crackling electric arcs, and shattering ice crystals.
