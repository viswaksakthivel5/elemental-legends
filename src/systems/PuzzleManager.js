/**
 * PuzzleManager.js
 * Controls the 3 Elemental Environmental Puzzles and Story Clues:
 * - Puzzle 1 (FIRE): Ignite 3 Ancient Village Braziers to burn away the cursed thorn gate.
 * - Puzzle 2 (ICE): Freeze the Corrupted Canal into a solid crystalline ice bridge.
 * - Puzzle 3 (STORM): Charge the Lightning Conduit to raise the Fortress Iron Portcullis.
 * - 3 Interactive Lore Clues with inspection prompts.
 */

import * as THREE from 'three';
import { soundManager } from '../core/SoundManager.js';

export class PuzzleManager {
  constructor(scene, vfxManager) {
    this.scene = scene;
    this.vfx = vfxManager;

    // Puzzle 1: 3 Village Braziers
    this.braziers = [];
    this.braziersLitCount = 0;
    this.villageGateUnlocked = false;
    this.villageGateMesh = null;
    this.cursedVinesMesh = null;

    // Puzzle 2: Corrupted Canal Ice Bridge
    this.canalFrozen = false;
    this.canalWaterMesh = null;
    this.iceBridgeMesh = null;
    this.canalBounds = { minZ: -12, maxZ: -6, minX: -15, maxX: 15 };

    // Puzzle 3: Fortress Lightning Conduit & Portcullis
    this.conduitCharged = false;
    this.conduitMesh = null;
    this.conduitLight = null;
    this.portcullisMesh = null;
    this.portcullisRaised = false;

    // Puzzle 4: Dual Elemental Fortress Winch
    this.winchFireActive = false;
    this.winchIceActive = false;
    this.winchFireMesh = null;
    this.winchIceMesh = null;

    // Interactive Story Clues
    this.clues = [
      {
        id: 'clue_village',
        title: "VILLAGE ELDER'S TORN JOURNAL",
        position: new THREE.Vector3(-6, 1.0, 14),
        read: false,
        text: `"The mist crept in from the hollow woods three nights ago. Those who breathed it spoke in tongues before vanishing into the shadows.\n\nOur only hope was the Ancient Shrine, but the corruption has bound the forest gate with dark brambles. Only the sacred triad of fire—igniting the three ancient stone braziers—can cleanse the cursed thorns and open the path."`
      },
      {
        id: 'clue_forest',
        title: "SCHOLAR'S FROST PARCHMENT",
        position: new THREE.Vector3(8, 1.0, -4),
        read: false,
        text: `"The canal waters have turned into corrosive abyssal bile. Nothing living can cross without being dissolved.\n\nYet the elemental wardens left behind frost crystals. If channeled with the Frost Stance, the absolute cold will solidify the corrupted water into a permanent crystalline ice bridge."`
      },
      {
        id: 'clue_fortress',
        title: "WARDEN'S RUNIC INSCRIPTION",
        position: new THREE.Vector3(-7, 1.0, -22),
        read: false,
        text: `"The Hollow Guardian has barricaded himself behind the fortress portcullis. The iron winches are rusted dead, but the copper lightning conduit remains intact.\n\nA single discharge of Storm magic directed into the conduit terminal will shock the magnetic gears and raise the iron gate."`
      }
    ];

    // Nearby interaction state
    this.activeInteractable = null; // { type: 'CLUE'|'BRAZIER'|'CONDUIT'|'CANAL', data, prompt }

    // UI Callbacks
    this.onPromptChange = null; // (promptText)
    this.onClueOpen = null; // (clueData)
    this.onObjectiveUpdate = null; // (objectiveText)
  }

  registerBrazier(mesh, light, index) {
    this.braziers.push({
      mesh,
      light,
      isLit: false,
      position: mesh.position.clone()
    });
  }

  registerVillageGate(gateMesh, vinesMesh) {
    this.villageGateMesh = gateMesh;
    this.cursedVinesMesh = vinesMesh;
  }

  registerCanal(waterMesh, iceBridgeMesh) {
    this.canalWaterMesh = waterMesh;
    this.iceBridgeMesh = iceBridgeMesh;
    if (this.iceBridgeMesh) {
      this.iceBridgeMesh.visible = false;
    }
  }

  get lightningConduitActive() {
    return this.conduitCharged;
  }

  registerPortcullis(mesh) {
    this.portcullisMesh = mesh;
  }

  registerDualWinch(winchFire, winchIce) {
    this.winchFireMesh = winchFire;
    this.winchIceMesh = winchIce;
    this.winchFireActive = false;
    this.winchIceActive = false;
  }

  update(dt, playerPosition, playerElement, cameraManager) {
    // 1. Check proximity to interactive elements
    let closestInteractable = null;
    let minDistance = 2.8;

    // Check Clues
    for (const clue of this.clues) {
      const dist = playerPosition.distanceTo(clue.position);
      if (dist < minDistance) {
        minDistance = dist;
        closestInteractable = {
          type: 'CLUE',
          data: clue,
          prompt: `[E] Read ${clue.title}`
        };
      }
    }

    // Check Unlit Braziers
    if (!this.villageGateUnlocked) {
      for (let i = 0; i < this.braziers.length; i++) {
        const b = this.braziers[i];
        if (!b.isLit) {
          const dist = playerPosition.distanceTo(b.position);
          if (dist < 3.2) {
            closestInteractable = {
              type: 'BRAZIER',
              data: b,
              index: i,
              prompt: playerElement === 'FIRE'
                ? `[Q] Cast Flame Wave or [Click] Strike to Ignite Brazier (${this.braziersLitCount}/3)`
                : `[1] Switch to Fire to Ignite Brazier (${this.braziersLitCount}/3)`
            };
            break;
          }
        }
      }
    }

    // Check Canal
    if (!this.canalFrozen) {
      const canalCenter = new THREE.Vector3(0, 0, -9);
      if (playerPosition.distanceTo(canalCenter) < 6.5) {
        closestInteractable = {
          type: 'CANAL',
          prompt: playerElement === 'ICE'
            ? `[Q] Cast Glacial Spikes to Freeze Corrupted Canal`
            : `[2] Switch to Ice Stance to Freeze Canal`
        };
      }
    }

    // Check Conduit
    if (!this.conduitCharged && this.conduitMesh) {
      const conduitPos = this.conduitMesh.position;
      if (playerPosition.distanceTo(conduitPos) < 4.5) {
        closestInteractable = {
          type: 'CONDUIT',
          prompt: playerElement === 'STORM'
            ? `[Q] Cast Thunder Dash or Strike to Power Conduit`
            : `[3] Switch to Storm Stance to Power Conduit`
        };
      }
    }

    // Animate portcullis opening
    if (this.portcullisRaised && this.portcullisMesh && this.portcullisMesh.position.y < 8.0) {
      this.portcullisMesh.position.y += dt * 3.5;
    }

    // Animate village gate opening
    if (this.villageGateUnlocked && this.villageGateMesh && this.villageGateMesh.rotation.y > -Math.PI * 0.45) {
      this.villageGateMesh.rotation.y -= dt * 1.2;
    }

    // Update prompt callback
    if (closestInteractable !== this.activeInteractable) {
      this.activeInteractable = closestInteractable;
      if (this.onPromptChange) {
        this.onPromptChange(this.activeInteractable ? this.activeInteractable.prompt : '');
      }
    }
  }

  // --- PLAYER PRESSES [E] (INTERACT KEY) ---
  interact(player) {
    if (!this.activeInteractable) return;

    if (this.activeInteractable.type === 'CLUE') {
      const clue = this.activeInteractable.data;
      clue.read = true;
      soundManager.playSwitchElement('ICE');
      if (this.onClueOpen) {
        this.onClueOpen(clue);
      }
    } else if (this.activeInteractable.type === 'BRAZIER' && player.element === 'FIRE') {
      this.igniteBrazier(this.activeInteractable.data);
    } else if (this.activeInteractable.type === 'CANAL' && player.element === 'ICE') {
      this.freezeCanal();
    } else if (this.activeInteractable.type === 'CONDUIT' && player.element === 'STORM') {
      this.chargeConduit();
    }
  }

  // --- IGNITE BRAZIER (FIRE PUZZLE) ---
  igniteBrazier(brazier) {
    if (brazier.isLit) return;
    brazier.isLit = true;
    this.braziersLitCount++;

    if (brazier.light) {
      brazier.light.intensity = 22.0;
      brazier.light.color.setHex(0xff5500);
    }

    soundManager.playSkill('FIRE');
    this.vfx.spawnShockwave(brazier.position, 2.5, 0xff4400);
    this.vfx.spawnHitSparks(brazier.position, 'FIRE', 20);

    if (this.onObjectiveUpdate) {
      this.onObjectiveUpdate(`Village Braziers Ignited: (${this.braziersLitCount}/3)`);
    }

    // Check if all 3 braziers are lit!
    if (this.braziersLitCount >= 3 && !this.villageGateUnlocked) {
      this.villageGateUnlocked = true;
      soundManager.playVictory();

      // Burn away cursed vines
      if (this.cursedVinesMesh) {
        this.vfx.spawnHitSparks(this.cursedVinesMesh.position, 'FIRE', 40);
        this.scene.remove(this.cursedVinesMesh);
      }

      if (this.onObjectiveUpdate) {
        this.onObjectiveUpdate(`Forest Gate Unlocked! Cross into the Haunted Forest.`);
      }
    }
  }

  // --- FREEZE CANAL (ICE PUZZLE) ---
  freezeCanal() {
    if (this.canalFrozen) return;
    this.canalFrozen = true;

    soundManager.playSkill('ICE');
    soundManager.playVictory();

    // Turn water into shimmering crystalline ice bridge
    if (this.canalWaterMesh) {
      this.canalWaterMesh.material.color.setHex(0x00d9ff);
      this.canalWaterMesh.material.roughness = 0.1;
    }

    if (this.iceBridgeMesh) {
      this.iceBridgeMesh.visible = true;
      this.vfx.spawnShockwave(this.iceBridgeMesh.position, 6.0, 0x00d9ff);
    }

    if (this.onObjectiveUpdate) {
      this.onObjectiveUpdate(`Corrupted Canal Frozen! Path to the Ancient Shrine is open.`);
    }
  }

  // --- CHARGE CONDUIT (STORM PUZZLE) ---
  chargeConduit() {
    if (this.conduitCharged) return;
    this.conduitCharged = true;

    soundManager.playSkill('STORM');
    soundManager.playBossRoar(); // Deep metallic grind of chains

    if (this.conduitLight) {
      this.conduitLight.intensity = 25.0;
      this.conduitLight.color.setHex(0x3388ff);
    }

    if (this.conduitMesh) {
      this.vfx.spawnShockwave(this.conduitMesh.position, 4.0, 0x5599ff);
      this.vfx.spawnHitSparks(this.conduitMesh.position, 'STORM', 30);
    }

    // Raise portcullis!
    this.portcullisRaised = true;

    if (this.onObjectiveUpdate) {
      this.onObjectiveUpdate(`Fortress Portcullis Raised! Enter the Sanctum to confront The Hollow Guardian.`);
    }
  }

  // Check environmental triggers when player strikes or casts skills
  checkAttackPuzzleTriggers(position, element) {
    if (element === 'FIRE') {
      for (const b of this.braziers) {
        if (!b.isLit && position.distanceTo(b.position) < 4.0) {
          this.igniteBrazier(b);
        }
      }
      if (this.winchFireMesh && !this.winchFireActive && position.distanceTo(this.winchFireMesh.position) < 4.5) {
        this.winchFireActive = true;
        this.winchFireMesh.isLit = true;
        if (this.winchFireMesh.light) {
          this.winchFireMesh.light.color.setHex(0xff5500);
          this.winchFireMesh.light.intensity = 20.0;
        }
        soundManager.playSkill('FIRE');
        this._checkDualWinchComplete();
      }
    } else if (element === 'ICE') {
      const canalCenter = new THREE.Vector3(0, 0, -6);
      if (!this.canalFrozen && position.distanceTo(canalCenter) < 8.5) {
        this.freezeCanal();
      }
      if (this.winchIceMesh && !this.winchIceActive && position.distanceTo(this.winchIceMesh.position) < 4.5) {
        this.winchIceActive = true;
        this.winchIceMesh.isLit = true;
        if (this.winchIceMesh.light) {
          this.winchIceMesh.light.color.setHex(0x00d9ff);
          this.winchIceMesh.light.intensity = 20.0;
        }
        soundManager.playSkill('ICE');
        this._checkDualWinchComplete();
      }
    } else if (element === 'STORM') {
      if (!this.conduitCharged && this.conduitMesh && position.distanceTo(this.conduitMesh.position) < 6.0) {
        this.chargeConduit();
      }
    }
  }

  _checkDualWinchComplete() {
    if (this.winchFireActive && this.winchIceActive && !this.portcullisRaised) {
      this.portcullisRaised = true;
      soundManager.playVictory();
      if (this.onObjectiveUpdate) {
        this.onObjectiveUpdate('Fortress Portcullis Raised! Enter the Sanctum.');
      }
    } else if (this.onObjectiveUpdate) {
      const count = (this.winchFireActive ? 1 : 0) + (this.winchIceActive ? 1 : 0);
      this.onObjectiveUpdate(`Fortress Winch Clamps Disengaged: (${count}/2)`);
    }
  }

  reset() {
    this.braziersLitCount = 0;
    this.villageGateUnlocked = false;
    this.canalFrozen = false;
    this.conduitCharged = false;
    this.portcullisRaised = false;
    this.winchFireActive = false;
    this.winchIceActive = false;
    this.winchFireMesh = null;
    this.winchIceMesh = null;
    this.braziers = [];
    for (const b of this.braziers) {
      b.isLit = false;
      if (b.light) {
        b.light.intensity = 0;
      }
    }
    if (this.canalWaterMesh) {
      this.canalWaterMesh.material.color.setHex(0x1a2e22);
      this.canalWaterMesh.material.roughness = 0.6;
    }
    if (this.iceBridgeMesh) {
      this.iceBridgeMesh.visible = false;
    }
    if (this.conduitLight) {
      this.conduitLight.intensity = 0;
    }
    if (this.portcullisMesh) {
      this.portcullisMesh.position.y = 0;
    }
    if (this.villageGateMesh) {
      this.villageGateMesh.rotation.y = 0;
    }
    for (const clue of this.clues) {
      clue.read = false;
    }
  }
}
