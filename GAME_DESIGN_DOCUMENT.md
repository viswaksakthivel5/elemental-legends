# GAME DESIGN DOCUMENT (GDD)
## ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM
### Level 4 Complete Transformation — Multi-Level Campaign Architecture

---

## 1. Executive Summary & Game Vision
- **Game Title**: Elemental Legends: The Curse of the Hollow Realm
- **Version**: 4.0 (Level 4 Transformation)
- **Genre**: 3D Third-Person Dark-Fantasy Action-Adventure Campaign
- **Engine / Platform**: Three.js (WebGL) / Desktop Web Browser (HTML5/ES6+)
- **Build System**: Vite 5
- **Core Transformation**: Transitioned from a single linear level into a complete **five-chapter campaign** with dedicated scene loading, unique environmental layouts, tailored atmospheric lighting, the signature **Echo Vision** exploration mechanic, multi-elemental environmental puzzles, distinct enemy rosters, permanent character upgrades, and a persistent save system.

---

## 2. Narrative & World Lore

### 2.1 The Premise: *The Corruption of the Elemental Guardians*
The protagonist—a battle-worn warrior garbed in weathered leather, steel plate, and a wolf-fur mantle—travels across five regions of the fallen kingdom. Guided by primordial element resonance and residual memories, he discovers that the realm's elemental guardians were not destroyed by monsters, but rather betrayed and corrupted by the ancient Abyssal Core hidden beneath the Hollow Fortress.

### 2.2 Story Clues & Lore Progression
Each chapter contains an interactive lectern or ancient inscription that unravels the narrative:
1. **Chapter I (The Forgotten Village)**: *The Village Elder’s Torn Journal* — Explains how the mist descended three nights prior, trapping the villagers, and how the sacred triad of fire braziers dispels the cursed thorns.
2. **Chapter II (The Whispering Forest)**: *The Scholar’s Frost Parchment* — Reveals that the ancient canal water was transformed into boiling abyssal bile and notes that freezing temperatures can crystallize the hazardous flow.
3. **Chapter III (The Sunken Shrine)**: *The Warden’s Inscription* — Documents how ancient electrical dynamos channel storm currents to open the deep sanctum gates.
4. **Chapter IV (The Hollow Fortress)**: *The Commander’s Last Decree* — Reveals the horrifying realization that the kingdom's greatest protector voluntarily succumbed to the void to gain strength against an unseen foe.
5. **Chapter V (The Heart of the Curse)**: *The Core Revelation* — Confronting The Hollow Guardian and severing the link between the earthly plane and the Abyssal Void.

---

## 3. The Five Playable Chapters

```
[Chapter I: Forgotten Village] ➔ (Fire Braziers) ➔ [Portal to Ch. II]
                                                            │
[Chapter III: Sunken Shrine] ◄── (Ice Canal) ◄── [Chapter II: Whispering Forest]
          │
          ▼ (Storm Dynamo)
[Chapter IV: Hollow Fortress] ➔ (Dual Winch Lock) ➔ [Portal to Ch. V]
                                                            │
                                                            ▼
                                        [Chapter V: Heart of the Curse (Boss Finale)]
```

### 3.1 Chapter I — The Forgotten Village
- **Environment**: Ruined medieval hamlet with timber cottages, stone well, split-rail fences, and cold morning fog (`#6e7f91`).
- **Enemies**: 2 Cursed Villagers (melee wanderers with rusted sickles).
- **Puzzle**: *The Sacred Triad of Fire* — Ignite 3 stone braziers using Fire [1] to burn away the cursed thorn gate.
- **Echo Vision Secrets**: Reveals the hidden Rune Pillar beside the well and glowing spectral footprints leading to the exit portal.
- **Permanent Reward**: **Talisman of Vitality** (+25 Max HP).

### 3.2 Chapter II — The Whispering Forest
- **Environment**: Dense, twisted dead oaks, tangled briars, and toxic teal-green marsh fog (`#182824`).
- **Enemies**: 4 enemies (Forest Stalkers and ranged Void Wraiths).
- **Puzzle**: *The Corrupted Canal Freeze* — Channel Ice [2] to freeze the toxic canal into a crystalline ice bridge.
- **Echo Vision Secrets**: Unveils the secret path leading to the hidden *Frostfire Relic Chest*.
- **Permanent Reward**: **Glacial Focus** (-1.0s Elemental Skill Cooldown).

### 3.3 Chapter III — The Sunken Shrine
- **Environment**: Subterranean gothic stone ruins partially submerged under dark reflective water, shrouded in deep oceanic indigo haze (`#101726`).
- **Enemies**: 3 enemies (Armored Corrupted Knights and Elite Sentinel).
- **Puzzle**: *The Storm Dynamo Conduit* — Discharge Storm [3] into the copper dynamo terminal to power the shrine gate.
- **Echo Vision Secrets**: Highlights ancient subterranean wall glyphs and hidden submerged power lines.
- **Permanent Reward**: **Storm Conduit Mastery** (+15% Critical Hit Chance).

### 3.4 Chapter IV — The Hollow Fortress
- **Environment**: High-altitude fortress battlements, imposing round towers, iron portcullises, and dark stormy ash-slate sky (`#282c34`).
- **Enemies**: 6 enemies (Fortress guards, wraiths, and the Fortress Warmaster mini-boss).
- **Puzzle**: *The Dual Elemental Winch Lock* — Strike the left winch with Fire [1] and the right winch with Ice [2] to balance thermal pressure and lift the portcullis.
- **Echo Vision Secrets**: Reveals the secret armory chamber containing the *Aegis of the Fallen King* relic.
- **Permanent Reward**: **Warrior's Resolve** (+25 Max Energy).

### 3.5 Chapter V — The Heart of the Curse (Boss Finale)
- **Environment**: Abyssal obsidian dais suspended in a cosmic void of swirling starlight and dark purple nebula (`#160c22`), ringed by floating purple crystals.
- **Boss Encounter**: **The Hollow Guardian** (Colossal corrupted titan in horned armor, 600 HP).
  - **Phase 1**: Sweeping greatsword cleaves, leaping ground slams with expanding danger circles and shockwaves.
  - **Phase 2**: Teleport dashes, radial dark energy projectile volleys; activating **Echo Vision [V]** reveals the boss's exposed Soul Core weak point for **2x critical strikes**.
  - **Phase 3 (Cataclysm)**: Apocalyptic meteor storm and void eruption frenzy. Defeating the boss clears the realm of corruption and displays the Campaign Victory screen.

---

## 4. Signature Mechanic: Echo Vision (`[V]` / `[C]`)

Echo Vision is an ethereal perception mode designed to deepen exploration and tactical combat:
- **Visual Presentation**: Dynamic pulsating cyan vignette overlay (`#echo-vignette`), ethereal runic scanlines, and high-contrast entity highlights.
- **Spectral Trail Navigation**: Emits a chain of glowing cyan waypoints floating above the ground that guides the warrior toward active objectives.
- **Hidden Object Detection**: Unveils concealed runic pillars, hidden walls, and secret relic chests that are otherwise invisible.
- **Weak Point Targeting**: During boss fights and elite encounters, highlights vulnerable soul cores with radiant runic reticles that double incoming strike damage.

---

## 5. Campaign Progression & Save System

Managed centrally by `SaveManager.js`:
- **Persistence**: Saved automatically in browser `localStorage` under `elemental_legends_level4_save_v1` with graceful in-memory fallback.
- **Data Model**: Tracks unlocked chapters (`unlockedLevels`), completed chapters (`completedLevels`), current chapter, best completion times, highest combo streaks, total enemy kills, acquired clues, discovered relics, and permanent stat upgrades.
- **Level Select UI**: Dedicated modal featuring 5 chapter cards showing status tags (**LOCKED**, **AVAILABLE**, **COMPLETED**), descriptions, thumbnails, and personal records. Replaying a level preserves all campaign unlocks.
- **New Game Safety**: Title screen "NEW GAME" includes a confirmation dialog before resetting saved campaign progress.

---

## 6. Combat & Elemental Systems

- **Fire Stance [1]**: High damage-over-time burns, flame wave projectiles, braziers ignition, left winch activation.
- **Ice Stance [2]**: 50% movement/attack speed slow, glacial spikes barrage, canal surface freezing, right winch cooling.
- **Storm Stance [3]**: Chain lightning arcing, lightning teleport dash, electrical dynamo overcharging.
- **Combos & Hit-Stop**: 3-hit light combo with micro-freezes on impact, overhead heavy smash, and dodge roll with 0.42s invulnerability frames.
- **Upgrades Scaling**: Player stats dynamically scaled by `SaveManager.getPlayerModifiers()`.

---

## 7. Procedural Audio Engine

Zero-dependency procedural sound synthesized in real-time via the Web Audio API:
- **Footsteps**: Synchronized foot-fall thuds.
- **Combat**: Blade swooshes, metallic impact clangs, parry rings, dodge whooshes.
- **Magic**: Fire combustion roar, crystalline ice crackle, storm thunderclaps.
- **Echo Vision**: Mystical ethereal activation chime and continuous subtle ambient hum.
- **UI & Environment**: Level complete fanfare, relic discovery chime, portcullis grinding.
