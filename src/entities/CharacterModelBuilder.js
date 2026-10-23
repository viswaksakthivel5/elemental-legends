/**
 * CharacterModelBuilder.js - Level 3 Overhaul
 * Generates high-detail dark-fantasy characters with realistic human proportions:
 * - Rugged Medieval Warrior (Natural proportions, detailed face/hair, fur mantle, leather straps, realistic sword)
 * - Cursed Wanderer (Shambling corrupted villager with rusted sickle)
 * - Elemental Corruption (Ethereal void shade with floating smoke tails)
 * - The Hollow Guardian (Towering corrupted knight boss with great-helm and runic blade)
 */

import * as THREE from 'three';

export class CharacterModelBuilder {
  static cachedTextures = {};

  // Procedural canvas textures for rich realistic materials
  static getLeatherTexture() {
    if (this.cachedTextures['leather']) return this.cachedTextures['leather'];
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Weathered dark leather base
    ctx.fillStyle = '#241a15';
    ctx.fillRect(0, 0, 512, 512);

    // Leather grain noise
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const c = Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgba(${30 + c}, ${22 + c}, ${16 + c}, 0.25)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    this.cachedTextures['leather'] = tex;
    return tex;
  }

  static getClothTexture() {
    if (this.cachedTextures['cloth']) return this.cachedTextures['cloth'];
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c2026';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#282f38';
    ctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 256);
      ctx.moveTo(0, i); ctx.lineTo(256, i);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    this.cachedTextures['cloth'] = tex;
    return tex;
  }

  // --- BUILD REALISTIC MEDIEVAL WARRIOR HERO ---
  static buildHero() {
    const root = new THREE.Group();
    root.name = 'RealisticWarrior';

    // Premium realistic materials
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x484f58,
      roughness: 0.32,
      metalness: 0.88
    });

    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x22262c,
      roughness: 0.4,
      metalness: 0.92
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x3a281e,
      roughness: 0.75,
      metalness: 0.15,
      map: this.getLeatherTexture()
    });

    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x2a2f38,
      roughness: 0.85,
      metalness: 0.05,
      map: this.getClothTexture()
    });

    const furMat = new THREE.MeshStandardMaterial({
      color: 0x423832,
      roughness: 0.95,
      metalness: 0.05
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc89d7c,
      roughness: 0.65,
      metalness: 0.05
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1c1612,
      roughness: 0.85
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0x9e7f3b,
      roughness: 0.35,
      metalness: 0.9
    });

    const runeMat = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff4400,
      emissiveIntensity: 1.6,
      roughness: 0.2
    });

    // 1. Root Pelvis / Hips (Natural human height ~ 0.98m from ground)
    const hips = new THREE.Group();
    hips.position.y = 0.98;
    root.add(hips);

    // Leather belt and lower gambeson tunic skirt
    const beltGeom = new THREE.CylinderGeometry(0.24, 0.25, 0.14, 12);
    const belt = new THREE.Mesh(beltGeom, leatherMat);
    belt.castShadow = true;
    hips.add(belt);

    // Brass Belt Buckle
    const buckleGeom = new THREE.BoxGeometry(0.08, 0.09, 0.03);
    const buckle = new THREE.Mesh(buckleGeom, brassMat);
    buckle.position.set(0, 0, 0.25);
    hips.add(buckle);

    // Tunic Skirt (flared medieval gambeson hem)
    const tunicSkirtGeom = new THREE.CylinderGeometry(0.25, 0.32, 0.32, 12, 1, true);
    tunicSkirtGeom.translate(0, -0.16, 0);
    const tunicSkirt = new THREE.Mesh(tunicSkirtGeom, clothMat);
    tunicSkirt.castShadow = true;
    hips.add(tunicSkirt);

    // Scabbard on left hip
    const scabbardGeom = new THREE.BoxGeometry(0.06, 0.95, 0.03);
    scabbardGeom.rotateZ(-0.25);
    scabbardGeom.translate(0.24, -0.25, 0);
    const scabbard = new THREE.Mesh(scabbardGeom, leatherMat);
    hips.add(scabbard);

    // 2. Spine / Torso
    const spine = new THREE.Group();
    spine.position.y = 0.12;
    hips.add(spine);

    // Quilted gambeson chest
    const chestGeom = new THREE.CylinderGeometry(0.26, 0.23, 0.44, 10);
    chestGeom.translate(0, 0.22, 0);
    const chest = new THREE.Mesh(chestGeom, clothMat);
    chest.castShadow = true;
    spine.add(chest);

    // Weathered dark steel cuirass (chestplate plate armor)
    const breastplateGeom = new THREE.BoxGeometry(0.38, 0.36, 0.22);
    breastplateGeom.translate(0, 0.24, 0.04);
    const breastplate = new THREE.Mesh(breastplateGeom, darkSteelMat);
    breastplate.castShadow = true;
    spine.add(breastplate);

    // Cross-body leather baldric harness
    const strapGeom = new THREE.BoxGeometry(0.07, 0.48, 0.25);
    strapGeom.rotateZ(0.5);
    strapGeom.translate(0, 0.24, 0);
    const strap = new THREE.Mesh(strapGeom, leatherMat);
    spine.add(strap);

    // Runic elemental crest on chest
    const crestGeom = new THREE.OctahedronGeometry(0.045);
    const crest = new THREE.Mesh(crestGeom, runeMat);
    crest.position.set(0, 0.28, 0.16);
    spine.add(crest);

    // --- THICK FUR MANTLE / COLLAR (matching reference photo) ---
    const furCollarGroup = new THREE.Group();
    furCollarGroup.position.set(0, 0.42, 0);

    const furMainGeom = new THREE.TorusGeometry(0.25, 0.12, 8, 16);
    furMainGeom.rotateX(Math.PI / 2);
    const furCollar = new THREE.Mesh(furMainGeom, furMat);
    furCollar.castShadow = true;
    furCollarGroup.add(furCollar);

    // Left & Right fur shoulder drapes
    const furShoulderGeom = new THREE.SphereGeometry(0.14, 8, 6);
    furShoulderGeom.scale(1.2, 0.8, 1.4);
    const furL = new THREE.Mesh(furShoulderGeom, furMat);
    furL.position.set(0.26, -0.02, 0);
    furCollarGroup.add(furL);

    const furR = new THREE.Mesh(furShoulderGeom, furMat);
    furR.position.set(-0.26, -0.02, 0);
    furCollarGroup.add(furR);

    spine.add(furCollarGroup);

    // 3. Head & Natural Facial Sculpt
    const head = new THREE.Group();
    head.position.y = 0.48;
    spine.add(head);

    // Neck
    const neckGeom = new THREE.CylinderGeometry(0.085, 0.1, 0.14, 8);
    neckGeom.translate(0, 0.05, 0);
    const neck = new THREE.Mesh(neckGeom, skinMat);
    head.add(neck);

    // Head Cranium
    const skullGeom = new THREE.SphereGeometry(0.13, 12, 10);
    skullGeom.scale(0.9, 1.1, 1.0);
    skullGeom.translate(0, 0.2, 0);
    const skull = new THREE.Mesh(skullGeom, skinMat);
    skull.castShadow = true;
    head.add(skull);

    // Jawline & Chin
    const jawGeom = new THREE.BoxGeometry(0.13, 0.12, 0.14);
    jawGeom.translate(0, 0.14, 0.04);
    const jaw = new THREE.Mesh(jawGeom, skinMat);
    head.add(jaw);

    // Rugged Medieval Hair & Stubble / Beard
    const hairGeom = new THREE.SphereGeometry(0.142, 10, 8);
    hairGeom.scale(0.95, 1.12, 1.05);
    hairGeom.translate(0, 0.23, -0.01);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    head.add(hair);

    const beardGeom = new THREE.BoxGeometry(0.14, 0.09, 0.12);
    beardGeom.translate(0, 0.12, 0.06);
    const beard = new THREE.Mesh(beardGeom, hairMat);
    head.add(beard);

    // Forehead furrow & brow
    const browGeom = new THREE.BoxGeometry(0.14, 0.035, 0.06);
    browGeom.translate(0, 0.22, 0.11);
    const brow = new THREE.Mesh(browGeom, skinMat);
    head.add(brow);

    // 4. Cloak / Cape (hanging from under fur collar)
    const capeGeom = new THREE.PlaneGeometry(0.65, 1.25, 4, 8);
    capeGeom.translate(0, -0.62, 0);
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x1f2228,
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, 0.4, -0.16);
    cape.rotation.x = 0.08;
    cape.castShadow = true;
    spine.add(cape);

    // 5. Left Arm
    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.32, 0.38, 0);
    spine.add(shoulderL);

    // Steel pauldron with leather strap
    const pauldronGeom = new THREE.SphereGeometry(0.12, 8, 8);
    pauldronGeom.scale(1.1, 0.8, 1.2);
    const pauldronL = new THREE.Mesh(pauldronGeom, darkSteelMat);
    pauldronL.position.set(0.04, 0.02, 0);
    shoulderL.add(pauldronL);

    const upperArmGeom = new THREE.CylinderGeometry(0.07, 0.06, 0.3, 8);
    upperArmGeom.translate(0, -0.15, 0);
    const upperArmL = new THREE.Mesh(upperArmGeom, clothMat);
    shoulderL.add(upperArmL);

    const elbowL = new THREE.Group();
    elbowL.position.set(0, -0.3, 0);
    shoulderL.add(elbowL);

    // Leather-reinforced vambrace / gauntlet
    const forearmGeom = new THREE.CylinderGeometry(0.062, 0.052, 0.28, 8);
    forearmGeom.translate(0, -0.14, 0);
    const forearmL = new THREE.Mesh(forearmGeom, leatherMat);
    elbowL.add(forearmL);

    const gauntletPlateGeom = new THREE.BoxGeometry(0.09, 0.2, 0.03);
    gauntletPlateGeom.translate(0, -0.14, 0.04);
    const gauntletPlateL = new THREE.Mesh(gauntletPlateGeom, steelMat);
    elbowL.add(gauntletPlateL);

    const handL = new THREE.Group();
    handL.position.set(0, -0.28, 0);
    elbowL.add(handL);

    const handLGeom = new THREE.BoxGeometry(0.07, 0.09, 0.05);
    const handLMesh = new THREE.Mesh(handLGeom, leatherMat);
    handL.add(handLMesh);

    // 6. Right Arm (Sword Arm)
    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.32, 0.38, 0);
    spine.add(shoulderR);

    const pauldronR = new THREE.Mesh(pauldronGeom, darkSteelMat);
    pauldronR.position.set(-0.04, 0.02, 0);
    shoulderR.add(pauldronR);

    const upperArmR = new THREE.Mesh(upperArmGeom, clothMat);
    shoulderR.add(upperArmR);

    const elbowR = new THREE.Group();
    elbowR.position.set(0, -0.3, 0);
    shoulderR.add(elbowR);

    const forearmR = new THREE.Mesh(forearmGeom, leatherMat);
    elbowR.add(forearmR);

    const gauntletPlateR = new THREE.Mesh(gauntletPlateGeom, steelMat);
    elbowR.add(gauntletPlateR);

    const handR = new THREE.Group();
    handR.position.set(0, -0.28, 0);
    elbowR.add(handR);

    const handRMesh = new THREE.Mesh(handLGeom, leatherMat);
    handR.add(handRMesh);

    // 7. Left Leg
    const hipL = new THREE.Group();
    hipL.position.set(0.14, -0.06, 0);
    hips.add(hipL);

    const thighGeom = new THREE.CylinderGeometry(0.1, 0.08, 0.44, 8);
    thighGeom.translate(0, -0.22, 0);
    const thighL = new THREE.Mesh(thighGeom, clothMat);
    thighL.castShadow = true;
    hipL.add(thighL);

    const kneeL = new THREE.Group();
    kneeL.position.set(0, -0.44, 0);
    hipL.add(kneeL);

    // Leather riding boot with steel knee cop
    const kneeCapGeom = new THREE.SphereGeometry(0.075, 6, 6);
    const kneeCapL = new THREE.Mesh(kneeCapGeom, darkSteelMat);
    kneeCapL.position.set(0, 0, 0.05);
    kneeL.add(kneeCapL);

    const shinGeom = new THREE.CylinderGeometry(0.085, 0.07, 0.46, 8);
    shinGeom.translate(0, -0.23, 0);
    const shinL = new THREE.Mesh(shinGeom, leatherMat);
    shinL.castShadow = true;
    kneeL.add(shinL);

    // Boot foot
    const footGeom = new THREE.BoxGeometry(0.11, 0.1, 0.26);
    const footL = new THREE.Mesh(footGeom, leatherMat);
    footL.position.set(0, -0.46, 0.06);
    footL.castShadow = true;
    kneeL.add(footL);

    // 8. Right Leg
    const hipR = new THREE.Group();
    hipR.position.set(-0.14, -0.06, 0);
    hips.add(hipR);

    const thighR = new THREE.Mesh(thighGeom, clothMat);
    thighR.castShadow = true;
    hipR.add(thighR);

    const kneeR = new THREE.Group();
    kneeR.position.set(0, -0.44, 0);
    hipR.add(kneeR);

    const kneeCapR = new THREE.Mesh(kneeCapGeom, darkSteelMat);
    kneeCapR.position.set(0, 0, 0.05);
    kneeR.add(kneeCapR);

    const shinR = new THREE.Mesh(shinGeom, leatherMat);
    shinR.castShadow = true;
    kneeR.add(shinR);

    const footR = new THREE.Mesh(footGeom, leatherMat);
    footR.position.set(0, -0.46, 0.06);
    footR.castShadow = true;
    kneeR.add(footR);

    // 9. REALISTIC MEDIEVAL SWORD (Completely replaces the cricket bat!)
    const sword = this.buildMedievalSword();
    sword.position.set(0, -0.05, 0.08);
    sword.rotation.x = Math.PI / 2;
    handR.add(sword);

    return {
      root,
      joints: {
        hips, spine, head, cape,
        shoulderL, elbowL, handL,
        shoulderR, elbowR, handR,
        hipL, kneeL, hipR, kneeR
      },
      sword,
      runeMaterials: [runeMat],
      capeMesh: cape
    };
  }

  // --- BUILD RECOGNIZABLE MEDIEVAL SWORD ---
  static buildMedievalSword() {
    const swordGroup = new THREE.Group();
    swordGroup.name = 'MedievalSteelSword';

    // High-specular reflective steel
    const bladeSteelMat = new THREE.MeshStandardMaterial({
      color: 0xdde2ea,
      roughness: 0.18,
      metalness: 0.96,
      emissive: 0xff3300,
      emissiveIntensity: 0.8
    });

    const guardSteelMat = new THREE.MeshStandardMaterial({
      color: 0x3a4049,
      roughness: 0.3,
      metalness: 0.92
    });

    const gripLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x2e1e16,
      roughness: 0.7,
      metalness: 0.1
    });

    const pommelBrassMat = new THREE.MeshStandardMaterial({
      color: 0x8a7035,
      roughness: 0.25,
      metalness: 0.92
    });

    // 1. Faceted Octagonal Pommel
    const pommelGeom = new THREE.DodecahedronGeometry(0.045, 0);
    const pommel = new THREE.Mesh(pommelGeom, pommelBrassMat);
    pommel.position.y = -0.32;
    pommel.castShadow = true;
    swordGroup.add(pommel);

    // 2. Ergonomic Leather-Wrapped Grip (narrow 2.8cm diameter, 26cm length)
    const gripGeom = new THREE.CylinderGeometry(0.02, 0.023, 0.26, 12);
    gripGeom.translate(0, -0.15, 0);
    const grip = new THREE.Mesh(gripGeom, gripLeatherMat);
    swordGroup.add(grip);

    // Grip wire wrap ring accents
    for (let i = 0; i < 4; i++) {
      const ringGeom = new THREE.TorusGeometry(0.022, 0.003, 6, 16);
      ringGeom.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeom, pommelBrassMat);
      ring.position.y = -0.23 + i * 0.055;
      swordGroup.add(ring);
    }

    // 3. Arched Medieval Crossguard with Quillons & Langet
    const guardGeom = new THREE.BoxGeometry(0.32, 0.04, 0.05);
    const guard = new THREE.Mesh(guardGeom, guardSteelMat);
    guard.position.y = 0.0;
    guard.castShadow = true;
    swordGroup.add(guard);

    // Curved tips on crossguard
    const quillonGeom = new THREE.SphereGeometry(0.025, 8, 8);
    const quillonL = new THREE.Mesh(quillonGeom, guardSteelMat);
    quillonL.position.set(0.16, 0.015, 0);
    guard.add(quillonL);

    const quillonR = new THREE.Mesh(quillonGeom, guardSteelMat);
    quillonR.position.set(-0.16, 0.015, 0);
    guard.add(quillonR);

    // 4. Narrow Steel Blade (0.055m wide at base, tapering smoothly to 0.028m near tip, 1.05m long)
    const bladeShape = new THREE.Shape();
    // Tapered double-edged silhouette with pointed tip
    bladeShape.moveTo(-0.026, 0);
    bladeShape.lineTo(-0.014, 0.95);
    bladeShape.lineTo(0.0, 1.08); // Sharp pointed tip!
    bladeShape.lineTo(0.014, 0.95);
    bladeShape.lineTo(0.026, 0);
    bladeShape.closePath();

    const extrudeSettings = {
      depth: 0.016,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.006,
      bevelThickness: 0.008
    };

    const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    bladeGeom.center();
    bladeGeom.translate(0, 0.54, 0);

    const blade = new THREE.Mesh(bladeGeom, bladeSteelMat);
    blade.castShadow = true;
    swordGroup.add(blade);

    // 5. Central Fuller Groove (deep dark fuller down the center)
    const fullerGeom = new THREE.BoxGeometry(0.012, 0.72, 0.019);
    fullerGeom.translate(0, 0.42, 0);
    const fullerMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.6,
      metalness: 0.8
    });
    const fuller = new THREE.Mesh(fullerGeom, fullerMat);
    swordGroup.add(fuller);

    // 6. Elemental Aura Ribbon
    const auraGeom = new THREE.PlaneGeometry(0.08, 1.1);
    auraGeom.translate(0, 0.55, 0);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const aura = new THREE.Mesh(auraGeom, auraMat);
    swordGroup.add(aura);

    // Sharp pointed tip locator
    const tipMarker = new THREE.Group();
    tipMarker.position.set(0, 1.1, 0);
    swordGroup.add(tipMarker);

    swordGroup.bladeMesh = blade;
    swordGroup.bladeTip = tipMarker;
    swordGroup.auraMesh = aura;
    swordGroup.fullerMesh = fuller;

    return swordGroup;
  }

  // --- BUILD CURSED WANDERER (ENEMY TYPE A) ---
  static buildSoldier() {
    const root = new THREE.Group();
    root.name = 'CursedWanderer';

    const tatteredMat = new THREE.MeshStandardMaterial({
      color: 0x322822,
      roughness: 0.9,
      metalness: 0.1
    });

    const paleSkinMat = new THREE.MeshStandardMaterial({
      color: 0x7a807d,
      roughness: 0.8,
      metalness: 0.1
    });

    const hollowEyeMat = new THREE.MeshBasicMaterial({
      color: 0x66ffaa // Eerie sickly green glow
    });

    const rustedIronMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e1d,
      roughness: 0.7,
      metalness: 0.6
    });

    const hips = new THREE.Group();
    hips.position.y = 0.88;
    root.add(hips);

    const waistGeom = new THREE.CylinderGeometry(0.2, 0.18, 0.22, 8);
    const waist = new THREE.Mesh(waistGeom, tatteredMat);
    hips.add(waist);

    const spine = new THREE.Group();
    spine.position.y = 0.12;
    hips.add(spine);

    // Slouched torso
    const chestGeom = new THREE.BoxGeometry(0.36, 0.4, 0.22);
    chestGeom.translate(0, 0.2, 0);
    const chest = new THREE.Mesh(chestGeom, tatteredMat);
    chest.castShadow = true;
    spine.add(chest);

    // Withered head
    const head = new THREE.Group();
    head.position.y = 0.44;
    spine.add(head);

    const skullGeom = new THREE.SphereGeometry(0.12, 8, 8);
    skullGeom.scale(0.9, 1.1, 1.0);
    skullGeom.translate(0, 0.12, 0);
    const skull = new THREE.Mesh(skullGeom, paleSkinMat);
    head.add(skull);

    // Glowing hollow eyes
    const eyeGeom = new THREE.SphereGeometry(0.024, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeom, hollowEyeMat);
    eyeL.position.set(0.045, 0.14, 0.11);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeom, hollowEyeMat);
    eyeR.position.set(-0.045, 0.14, 0.11);
    head.add(eyeR);

    // Arms
    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.25, 0.35, 0);
    spine.add(shoulderL);
    const armGeom = new THREE.CylinderGeometry(0.05, 0.04, 0.44, 6);
    armGeom.translate(0, -0.22, 0);
    const armL = new THREE.Mesh(armGeom, paleSkinMat);
    shoulderL.add(armL);

    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.25, 0.35, 0);
    spine.add(shoulderR);
    const armR = new THREE.Mesh(armGeom, paleSkinMat);
    shoulderR.add(armR);

    // Rusted Sickle / Cleaver
    const sickleGroup = new THREE.Group();
    const handleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
    const handle = new THREE.Mesh(handleGeom, tatteredMat);
    sickleGroup.add(handle);

    const sickleBladeGeom = new THREE.TorusGeometry(0.18, 0.035, 6, 12, Math.PI * 0.7);
    sickleBladeGeom.translate(0.12, 0.22, 0);
    const sickleBlade = new THREE.Mesh(sickleBladeGeom, rustedIronMat);
    sickleBlade.castShadow = true;
    sickleGroup.add(sickleBlade);

    sickleGroup.position.set(0, -0.4, 0.12);
    sickleGroup.rotation.x = Math.PI / 2;
    shoulderR.add(sickleGroup);

    // Legs
    const hipL = new THREE.Group();
    hipL.position.set(0.1, 0, 0);
    hips.add(hipL);
    const legGeom = new THREE.CylinderGeometry(0.065, 0.05, 0.78, 6);
    legGeom.translate(0, -0.39, 0);
    const legL = new THREE.Mesh(legGeom, tatteredMat);
    legL.castShadow = true;
    hipL.add(legL);

    const hipR = new THREE.Group();
    hipR.position.set(-0.1, 0, 0);
    hips.add(hipR);
    const legR = new THREE.Mesh(legGeom, tatteredMat);
    legR.castShadow = true;
    hipR.add(legR);

    return {
      root,
      joints: { hips, spine, head, shoulderL, shoulderR, hipL, hipR },
      weapon: sickleGroup
    };
  }

  // --- BUILD ELEMENTAL CORRUPTION (ENEMY TYPE B - VOID WRAITH) ---
  static buildCultist() {
    const root = new THREE.Group();
    root.name = 'ElementalCorruption';

    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x0f121a,
      roughness: 0.6,
      metalness: 0.3,
      transparent: true,
      opacity: 0.88
    });

    const voidCoreMat = new THREE.MeshStandardMaterial({
      color: 0x7700ff,
      emissive: 0x9922ff,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    const hips = new THREE.Group();
    hips.position.y = 1.0;
    root.add(hips);

    // Swirling ethereal smoke tail (floating)
    const tailGeom = new THREE.ConeGeometry(0.3, 1.1, 8, 2, true);
    tailGeom.rotateX(Math.PI);
    tailGeom.translate(0, -0.5, 0);
    const tail = new THREE.Mesh(tailGeom, shadeMat);
    hips.add(tail);

    const spine = new THREE.Group();
    spine.position.y = 0.15;
    hips.add(spine);

    const torsoGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.42, 6);
    torsoGeom.translate(0, 0.2, 0);
    const torso = new THREE.Mesh(torsoGeom, shadeMat);
    spine.add(torso);

    // Pulsing Corrupted Core
    const coreGeom = new THREE.OctahedronGeometry(0.12);
    const core = new THREE.Mesh(coreGeom, voidCoreMat);
    core.position.set(0, 0.22, 0.08);
    spine.add(core);

    // Hood with Pitch-Black Visage
    const head = new THREE.Group();
    head.position.y = 0.48;
    spine.add(head);

    const hoodGeom = new THREE.ConeGeometry(0.22, 0.35, 6);
    hoodGeom.rotateX(-0.15);
    hoodGeom.translate(0, 0.12, -0.04);
    const hood = new THREE.Mesh(hoodGeom, shadeMat);
    head.add(hood);

    // Dual violet void eyes
    const eyeGeom = new THREE.SphereGeometry(0.025, 4, 4);
    const eyeL = new THREE.Mesh(eyeGeom, voidCoreMat);
    eyeL.position.set(0.05, 0.1, 0.08);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeom, voidCoreMat);
    eyeR.position.set(-0.05, 0.1, 0.08);
    head.add(eyeR);

    // Skeletal Casting Arms
    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.24, 0.32, 0);
    spine.add(shoulderL);

    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.24, 0.32, 0);
    spine.add(shoulderR);

    const clawGeom = new THREE.CylinderGeometry(0.03, 0.02, 0.5, 4);
    clawGeom.translate(0, -0.25, 0);
    shoulderL.add(new THREE.Mesh(clawGeom, shadeMat));
    shoulderR.add(new THREE.Mesh(clawGeom, shadeMat));

    return {
      root,
      joints: { hips, spine, head, shoulderL, shoulderR },
      crystalMesh: core
    };
  }

  // --- BUILD THE HOLLOW GUARDIAN (FINAL BOSS) ---
  static buildBoss() {
    const root = new THREE.Group();
    root.name = 'TheHollowGuardian';
    root.scale.set(2.3, 2.3, 2.3);

    const darkPlateMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.28,
      metalness: 0.94
    });

    const corruptedGoldMat = new THREE.MeshStandardMaterial({
      color: 0x826425,
      roughness: 0.35,
      metalness: 0.88
    });

    const hollowSoulMat = new THREE.MeshStandardMaterial({
      color: 0x9911ff,
      emissive: 0xaa22ff,
      emissiveIntensity: 2.4,
      roughness: 0.1
    });

    const tatteredCapeMat = new THREE.MeshStandardMaterial({
      color: 0x221128,
      roughness: 0.9,
      side: THREE.DoubleSide
    });

    const hips = new THREE.Group();
    hips.position.y = 1.0;
    root.add(hips);

    const waistGeom = new THREE.CylinderGeometry(0.3, 0.32, 0.2, 8);
    const waist = new THREE.Mesh(waistGeom, darkPlateMat);
    hips.add(waist);

    const spine = new THREE.Group();
    spine.position.y = 0.2;
    hips.add(spine);

    // Colossal Horned Torso
    const chestGeom = new THREE.BoxGeometry(0.68, 0.6, 0.42);
    chestGeom.translate(0, 0.32, 0);
    const chest = new THREE.Mesh(chestGeom, darkPlateMat);
    chest.castShadow = true;
    spine.add(chest);

    // Glowing fractured Hollow Core
    const soulCoreGeom = new THREE.OctahedronGeometry(0.14);
    const soulCore = new THREE.Mesh(soulCoreGeom, hollowSoulMat);
    soulCore.position.set(0, 0.35, 0.22);
    spine.add(soulCore);

    // Horned Great-Helm with Obsidian Crown
    const head = new THREE.Group();
    head.position.y = 0.68;
    spine.add(head);

    const helmGeom = new THREE.BoxGeometry(0.32, 0.36, 0.34);
    const helm = new THREE.Mesh(helmGeom, darkPlateMat);
    head.add(helm);

    // Horns
    const hornGeom = new THREE.ConeGeometry(0.06, 0.38, 5);
    const hornL = new THREE.Mesh(hornGeom, corruptedGoldMat);
    hornL.position.set(0.2, 0.22, 0);
    hornL.rotation.z = -0.55;
    head.add(hornL);

    const hornR = new THREE.Mesh(hornGeom, corruptedGoldMat);
    hornR.position.set(-0.2, 0.22, 0);
    hornR.rotation.z = 0.55;
    head.add(hornR);

    // Glowing visor slit
    const visorGeom = new THREE.BoxGeometry(0.22, 0.04, 0.06);
    const visor = new THREE.Mesh(visorGeom, hollowSoulMat);
    visor.position.set(0, 0.06, 0.17);
    head.add(visor);

    // Demon-Skull Pauldrons
    const pauldronGeom = new THREE.BoxGeometry(0.44, 0.36, 0.44);
    const pauldronL = new THREE.Mesh(pauldronGeom, corruptedGoldMat);
    pauldronL.position.set(0.56, 0.52, 0);
    spine.add(pauldronL);

    const pauldronR = new THREE.Mesh(pauldronGeom, corruptedGoldMat);
    pauldronR.position.set(-0.56, 0.52, 0);
    spine.add(pauldronR);

    // Cape
    const capeGeom = new THREE.PlaneGeometry(0.9, 1.8, 6, 10);
    capeGeom.translate(0, -0.9, 0);
    const cape = new THREE.Mesh(capeGeom, tatteredCapeMat);
    cape.position.set(0, 0.6, -0.22);
    cape.rotation.x = 0.12;
    cape.castShadow = true;
    spine.add(cape);

    // Arms
    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.48, 0.38, 0);
    spine.add(shoulderL);
    const armGeom = new THREE.CylinderGeometry(0.09, 0.08, 0.55, 6);
    armGeom.translate(0, -0.27, 0);
    shoulderL.add(new THREE.Mesh(armGeom, darkPlateMat));

    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.48, 0.38, 0);
    spine.add(shoulderR);
    shoulderR.add(new THREE.Mesh(armGeom, darkPlateMat));

    // Colossal Soulreaver Greatsword
    const bossSword = new THREE.Group();
    const bossBladeGeom = new THREE.BoxGeometry(0.2, 1.85, 0.04);
    bossBladeGeom.translate(0, 0.98, 0);
    const bossBlade = new THREE.Mesh(bossBladeGeom, darkPlateMat);
    bossBlade.castShadow = true;
    bossSword.add(bossBlade);

    // Soul channel glowing inlay
    const channelGeom = new THREE.PlaneGeometry(0.07, 1.6);
    channelGeom.translate(0, 0.92, 0.025);
    const channel = new THREE.Mesh(channelGeom, hollowSoulMat);
    bossSword.add(channel);

    bossSword.position.set(0, -0.55, 0.15);
    bossSword.rotation.x = Math.PI / 2;
    shoulderR.add(bossSword);

    // Legs
    const hipL = new THREE.Group();
    hipL.position.set(0.2, 0, 0);
    hips.add(hipL);
    const legGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 6);
    legGeom.translate(0, -0.45, 0);
    hipL.add(new THREE.Mesh(legGeom, darkPlateMat));

    const hipR = new THREE.Group();
    hipR.position.set(-0.2, 0, 0);
    hips.add(hipR);
    hipR.add(new THREE.Mesh(legGeom, darkPlateMat));

    return {
      root,
      joints: { hips, spine, head, shoulderL, shoulderR, hipL, hipR, cape },
      sword: bossSword,
      bossBlade,
      abyssalMaterials: [hollowSoulMat],
      heartRune: soulCore
    };
  }
}
