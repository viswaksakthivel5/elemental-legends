# ASSET CREDITS & THIRD-PARTY LICENSES
## ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM
### Final Release v1.0.0 — Internship Level 5 Submission

---

## 1. Overview & Provenance Policy
*Elemental Legends: The Curse of the Hollow Realm* was developed with a strict zero-copyright-infringement policy. All game visuals, models, procedural audio effects, and level layouts are either:
1. Procedurally generated at runtime using mathematical geometries and WebGL primitives.
2. Synthesized dynamically via the Web Audio API.
3. Open-source licensed libraries and open-font typography.

No commercial game rips, unlicensed models, or copyrighted audio files are used in this project.

---

## 2. Core Libraries & Runtime Dependencies

### 2.1 Three.js
- **Purpose**: 3D WebGL rendering engine, scene graph, materials, shaders, and lighting.
- **Version**: 0.162.0
- **Authors**: Ricardo Cabello (Mr.doob) and the Three.js Authors
- **License**: MIT License
- **Source**: [https://threejs.org/](https://threejs.org/) | [GitHub](https://github.com/mrdoob/three.js)
```text
The MIT License
Copyright © 2010-2024 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
```

### 2.2 Vite
- **Purpose**: Development server and production roll-up bundling tool.
- **Version**: 5.1.6
- **Authors**: Evan You and Vite Contributors
- **License**: MIT License
- **Source**: [https://vitejs.dev/](https://vitejs.dev/) | [GitHub](https://github.com/vitejs/vite)

---

## 3. 3D Meshes & Visual Assets

### 3.1 Procedural 3D Character & Weapon Models
- **Files**: `src/entities/CharacterModelBuilder.js`, `src/entities/Player.js`, `src/entities/Boss.js`, `src/entities/Enemy.js`
- **Creator**: Viswak K S (Original Procedural Implementation)
- **Description**: Anatomical human warrior with quilted gambeson, wolf-fur mantle, leather baldric, and steel armor. Tapered medieval steel arming sword with fuller, crossguard, quillons, and pommel. Cursed Villagers, Forest Stalkers, Void Wraiths, and The Hollow Guardian 3D boss model.
- **License**: Proprietary / MIT for Elemental Legends Project.

### 3.2 Procedural Environmental Architecture & Props
- **Files**: `src/world/EnvironmentProps.js`, `src/world/LevelManager.js`
- **Creator**: Viswak K S (Original Procedural Implementation)
- **Description**: Timber-and-stone medieval cottages, stone wells, wooden fences, dead twisted oaks, corrupted water canal, stone gate arches, ancient fire braziers, lightning dynamo conduit, gothic fortress battlements, iron portcullis, abyssal floating dais, and floating dark crystals.
- **License**: Proprietary / MIT for Elemental Legends Project.

### 3.3 Visual Branding & Cover Art
- **Files**: `public/elemental_legends_banner.jpg`, `screenshots/gameplay_banner.jpg`
- **Creator**: Viswak K S
- **Description**: Cinematic gameplay banners showcasing the medieval human warrior with wolf-fur mantle and runic sword in front of dark fantasy battlements.
- **License**: Created specifically for Elemental Legends.

---

## 4. Typography & Fonts

### 4.1 Cinzel
- **Purpose**: Primary headings, menu titles, chapter banners, and stat labels.
- **Designer**: Natanael Gama
- **License**: SIL Open Font License (OFL-1.1)
- **Source**: [Google Fonts - Cinzel](https://fonts.google.com/specimen/Cinzel)

### 4.2 MedievalSharp
- **Purpose**: Subheadings, lore parchment clue text, and story descriptions.
- **Designer**: Wojciech Kalinowski
- **License**: SIL Open Font License (OFL-1.1)
- **Source**: [Google Fonts - MedievalSharp](https://fonts.google.com/specimen/MedievalSharp)

---

## 5. Audio Engine & Sound Synthesis

### 5.1 Procedural Web Audio Engine
- **File**: `src/core/SoundManager.js`
- **Creator**: Viswak K S (Original Web Audio API Synthesis)
- **Audio Elements**:
  - Footsteps: Low-frequency synthesized resonant pulses.
  - Sword Combat: White-noise frequency-modulated blade swooshes and metallic impact clangs.
  - Elemental Magic: Filtered noise combustions (Fire), crystalline frequency sweeps (Ice), and thunderclaps (Storm).
  - Echo Vision: Mystical dual-tone sine shimmer chime and subtle ambient drone.
  - Ambient BGM: Multi-oscillator detuned dark-fantasy harmonic pads.
  - Fanfares & UI: Level complete fanfare, relic discovery chime, and parchment unroll sounds.
- **License**: Zero external copyrighted audio files used. 100% procedurally synthesized in real time.
