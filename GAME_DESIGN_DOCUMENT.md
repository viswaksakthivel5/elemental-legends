# GAME DESIGN DOCUMENT (GDD)
## ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM
### Level 3 Game Development Internship Submission

---

## 1. Executive Summary & Game Vision
- **Game Title**: Elemental Legends: The Curse of the Hollow Realm
- **Version**: 3.0 (Level 3 Submission)
- **Genre**: 3D Third-Person Dark-Fantasy Action-Adventure
- **Engine / Platform**: Three.js (WebGL) / Desktop Web Browser (HTML5/ES6+)
- **Build System**: Vite 5
- **Target Experience**: A cinematic dark-fantasy adventure combining realistic human character presentation, authentic medieval swordplay, three elemental stances (Fire, Ice, Storm), environmental storytelling through interactive clues, elemental puzzles, and an epic boss showdown inside a ruined fortress sanctum.

---

## 2. Narrative & World Lore

### 2.1 The Premise: *The Curse of the Hollow Realm*
The protagonist—a battle-worn warrior garbed in weathered leather, steel plate, and a wolf-fur mantle—arrives at the perimeter of an abandoned settlement. Guided by an enigmatic distress signal resonating from an ancient shrine, he finds the lands shrouded in an oppressive fog. The villagers have vanished, leaving behind ominous warnings and corrupting void magic.

### 2.2 Environmental Storytelling & Interactive Clues
Rather than relying on disjointed cutscenes, the narrative unfolds through discoverable artifacts placed throughout the world that the player can inspect with **[E]**:
1. **The Village Elder’s Torn Journal** (The Forgotten Village, Z: 14):
   - *Lore*: Details the arrival of the dark fog three nights prior and reveals that the forest gate was barricaded with dark thorn brambles by corrupted forces. Explains that the sacred triad of fire—igniting the three ancient stone braziers—cleanses the thorns.
2. **The Scholar’s Frost Parchment** (The Haunted Forest, Z: -4):
   - *Lore*: Discloses that the ancient canal water was transformed into corrosive abyssal bile. Advises channeling the Frost Stance to freeze the boiling bile into a solid crystalline ice bridge.
3. **The Warden’s Runic Inscription** (The Ancient Shrine, Z: -22):
   - *Lore*: Informs the warrior that The Hollow Guardian has sealed himself behind the fortress portcullis. Reveals that a discharge of Storm magic into the copper conduit will power the magnetic winch and raise the iron gate.

---

## 3. Character & Weapon Redesign

### 3.1 Realistic Human Warrior Model
Completely replacing primitive blocky placeholders, the warrior features realistic anatomical proportions (~1.82m height) inspired by dark-fantasy warriors (reference: weathered steel, thick fur collar, dark leather baldric):
- **Head & Face**: Sculpted facial features, strong jaw, weathered skin, layered dark hair with swept-back locks, and a trimmed beard.
- **Garments & Armor**:
  - Weathered quilted gambeson and dark steel chest cuirass with engraved elemental rune inlays.
  - Layered wolf-fur collar/mantle draped across the shoulders and neck.
  - Leather baldric straps crisscrossing the torso with brass buckles and waist belt.
  - Articulated dark-leather bracers, steel gauntlets, greaves, and studded leather boots.
  - Physics-responsive torn dark cloak flowing behind the warrior during sprints and evasive rolls.

### 3.2 Authentic Medieval Steel Arming Sword
Replacing the outdated "cricket bat" geometry with an authentic medieval steel arming/bastard sword:
- **Blade**: Long, narrow steel blade featuring a realistic distal taper, pointed piercing tip, central fuller groove, and diamond cross-section.
- **Hilt & Furniture**:
  - Curved steel crossguard with quillon terminals.
  - Ergonomic grip wrapped in dark cord and leather.
  - Faceted octagonal steel pommel acting as counterweight.
  - Specular steel materials that react to dynamic firelight, ice gleams, and lightning flashes.
  - Anchored securely to the right hand socket during all stances and attack animations.

---

## 4. Four Connected World Zones

The world is designed as a contiguous journey along the Z-axis, structured into four atmospheric zones:

```
[The Forgotten Village] ➔ (Fire Brazier Puzzle) ➔ [The Haunted Forest]
         │                                               │
         ▼                                               ▼
[The Ruined Fortress] ◄── (Storm Conduit Puzzle) ◄── [The Ancient Shrine]
         │
         ▼
[The Hollow Guardian Boss Sanctum]
```

1. **Zone 1: The Forgotten Village (Z: 28 to 5)**
   - *Atmosphere*: Dilapidated timber houses, stone wells, wooden fences, and eerie ground fog.
   - *Encounter*: 2 Cursed Wanderers patrolling the lane.
   - *Clue*: Village Elder's Journal on a stone pedestal.
   - *Obstacle*: Cursed Thorn Gate sealing the village exit.
2. **Zone 2: The Haunted Forest (Z: 5 to -14)**
   - *Atmosphere*: Twisted dead oaks, drifting low fog, abyssal roots, and moonlight shafts.
   - *Encounter*: Cursed Wanderers and floating Void Wraiths (Elemental Corruption).
   - *Clue*: Scholar's Frost Parchment near the water edge.
   - *Obstacle*: Corrosive Abyssal Canal.
3. **Zone 3: The Ancient Shrine (Z: -14 to -25)**
   - *Atmosphere*: Crumbling gothic stone pillars, ancient runic obelisks, and copper mechanisms.
   - *Encounter*: Corrupted Elite Guardians.
   - *Clue*: Warden's Runic Inscription.
   - *Obstacle*: Heavy Iron Portcullis blocking the fortress entrance.
4. **Zone 4: The Ruined Fortress (Z: -25 to -50)**
   - *Atmosphere*: High fortress battlements, stormy thunderclouds, and the dark throne sanctum.
   - *Encounter*: The Hollow Guardian (Level 3 Final Boss).

---

## 5. Three Elemental Environmental Puzzles

### 5.1 Puzzle 1: The Sacred Triad of Fire (Zone 1)
- **Objective**: Ignite all 3 ancient stone braziers scattered across the village.
- **Solution**: Switch to **FIRE Stance** (`1`) and strike each brazier with a sword attack, cast *Flame Wave* (`Q`), or press **[E]** while standing adjacent.
- **Feedback**: Each lit brazier bursts into orange flames, casts dynamic flickering point lighting, and plays a flame ignition sound.
- **Resolution**: Upon lighting the 3rd brazier, the cursed thorn brambles dissolve in a burst of embers, and the wooden gate opens.

### 5.2 Puzzle 2: The Abyssal Canal Freeze (Zone 2)
- **Objective**: Cross the corrosive, boiling canal waters.
- **Solution**: Switch to **ICE Stance** (`2`) and cast *Glacial Spikes* (`Q`) or press **[E]** at the canal bank.
- **Feedback**: Deep freezing sound, glacial shockwave, and the dark water crystalizes into a solid ice-blue crystalline bridge.
- **Resolution**: Grants safe passage across the canal to Zone 3.

### 5.3 Puzzle 3: The Storm Magnetic Conduit (Zone 3)
- **Objective**: Raise the rusted iron portcullis blocking the fortress sanctum.
- **Solution**: Switch to **STORM Stance** (`3`) and discharge *Thunder Dash* (`Q`) or strike the copper coil terminal.
- **Feedback**: High-voltage electrical arcs crackle around the coil, blue beacon illuminates, and chains grind.
- **Resolution**: The heavy iron portcullis lifts smoothly into the battlements, opening the route to the final boss.

---

## 6. Combat & Elemental Stance Systems

### 6.1 Responsive Combat Mechanics
- **3-Hit Light Attack Combo**: Chained slashes with input buffering and hit stop.
- **Heavy Attack**: Two-handed overhead ground breaker that staggers adversaries.
- **Evasive Dodge Roll**: 0.42 seconds of true invulnerability frames (i-frames).
- **Target Lock-On**: Soft-tracking orbit on targeted enemy (`Tab` / Middle Click).
- **Damage Vignette & Screen Shake**: Visceral feedback on taking damage.

### 6.2 Elemental Stances & Combat Utilities
- 🔥 **FIRE (Infernal Stance)**: Burning damage-over-time. Active Skill: *Flame Wave* crescent projectile. Ultimate: *Magma Cataclysm* AoE eruption.
- ❄️ **ICE (Frost Stance)**: 50% movement & attack speed slow debuff. Active Skill: *Glacial Spikes* triple shard barrage. Ultimate: *Absolute Zero Nova* freeze dome.
- ⚡ **STORM (Thunder Stance)**: Chaining electric arcs to adjacent enemies. Active Skill: *Thunder Dash* lightning teleport. Ultimate: *Judgment of the Storm* aerial lightning strikes.

---

## 7. Enemies & Boss Fight

### 7.1 Cursed Wanderer
- **Visuals**: Hollow villager corrupted by void tendrils, wielding a rusted sickle.
- **Behavior**: Patrols zone lanes; charges the player within 10m; executes a telegraphed overhead slash. Staggers on sword impact.
- **Stats**: 50 HP | 12 Damage.

### 7.2 Elemental Corruption (Void Wraith)
- **Visuals**: Floating ethereal wraith with obsidian hood and flowing shade tail.
- **Behavior**: Hovers at medium range, casts homing void projectiles, and teleports when approached. Highly susceptible to Ice slows.
- **Stats**: 40 HP | 16 Damage.

### 7.3 THE HOLLOW GUARDIAN (Final Boss)
- **Visuals**: Colossal warrior (2.4x scale) clad in blackened horned plate armor, wielding the Soulreaver Greatsword.
- **Stats**: 600 HP | 3 Escalating Phases.
  - **Phase 1 (100%–66% HP)**: Sweeping greatsword cleaves and leaping ground slams with expanding red shockwaves.
  - **Phase 2 (66%–33% HP)**: Phase transition roar; teleportation dashes; radial 5-way dark projectile volleys.
  - **Phase 3 (33%–0% HP - Enraged Calamity)**: Eyes ignite with crimson fury; attack speed increased by 35%; calls down apocalyptic dark meteor strikes.
- **Defeat & Ending**: Boss collapses to knees as void corruption dissolves into pure elemental light. Displays Victory Screen with statistics (Clear Time, Max Combo Hits, Total Damage Dealt).

---

## 8. Procedural Audio Architecture

The game utilizes a zero-latency Web Audio API procedural sound engine requiring no external MP3/WAV downloads:
- **Surface Footsteps**: Low-frequency synthesized thuds synchronized to the player's run cycle.
- **Weapon Audio**: White-noise frequency-modulated swooshes for light/heavy attacks and metallic clangs on impact.
- **Elemental Magic**: Filtered noise bursts for fire ignitions, crystal resonance for ice freezes, and frequency-swept square waves for thunderclaps.
- **Environmental & UI**: Deep metallic gear rumbles for portcullis lifting, parchment unroll chime for clues, and victory fanfare.
- **Ambient Soundtrack**: Eerie dark-fantasy drone built from detuned sawtooth/sine oscillators.
