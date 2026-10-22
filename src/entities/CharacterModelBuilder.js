/**
 * CharacterModelBuilder.js
 * Generates detailed 3D dark-fantasy character models with hierarchical skeletal nodes,
 * procedural normal/rune textures, metallic shaders, and weapon mounts.
 */

import * as THREE from 'three';

export class CharacterModelBuilder {
  static cachedTextures = {};

  // Generate procedural canvas textures for rich dark-fantasy materials
  static getRuneTexture(type = 'fire') {
    const key = `rune_${type}`;
    if (this.cachedTextures[key]) return this.cachedTextures[key];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark brushed metal background
    ctx.fillStyle = '#16191f';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle metallic scratches
    ctx.strokeStyle = '#282e3a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60);
      ctx.stroke();
    }

    // Glowing mystical runes
    ctx.lineWidth = 4;
    let glowColor = '#ff5500';
    let coreColor = '#ffccaa';

    if (type === 'ice') {
      glowColor = '#00aaff';
      coreColor = '#ddf5ff';
    } else if (type === 'storm') {
      glowColor = '#3388ff';
      coreColor = '#ffffff';
    } else if (type === 'void') {
      glowColor = '#9911ff';
      coreColor = '#ffbbff';
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = coreColor;

    // Draw arcane rune glyphs
    const glyphs = [
      () => { ctx.moveTo(60, 60); ctx.lineTo(120, 180); ctx.lineTo(180, 60); ctx.moveTo(90, 120); ctx.lineTo(150, 120); },
      () => { ctx.arc(256, 120, 40, 0, Math.PI * 1.6); ctx.moveTo(256, 80); ctx.lineTo(256, 160); },
      () => { ctx.moveTo(360, 60); ctx.lineTo(440, 100); ctx.lineTo(380, 160); ctx.lineTo(460, 200); },
      () => { ctx.rect(80, 260, 80, 80); ctx.moveTo(80, 260); ctx.lineTo(160, 340); },
      () => { ctx.arc(256, 320, 50, 0, Math.PI * 2); ctx.moveTo(220, 320); ctx.lineTo(292, 320); },
      () => { ctx.moveTo(380, 280); ctx.lineTo(440, 280); ctx.lineTo(410, 360); ctx.closePath(); },
      () => { ctx.moveTo(100, 420); ctx.lineTo(160, 480); ctx.lineTo(220, 430); },
      () => { ctx.moveTo(320, 450); ctx.lineTo(420, 450); ctx.moveTo(370, 410); ctx.lineTo(370, 490); }
    ];

    ctx.beginPath();
    glyphs.forEach(g => g());
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cachedTextures[key] = texture;
    return texture;
  }

  // Common dark metal material
  static createArmorMaterial(emissiveColor = 0xff4400, emissiveIntensity = 0.4) {
    return new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.35,
      metalness: 0.85,
      emissive: emissiveColor,
      emissiveIntensity: emissiveIntensity
    });
  }

  // --- BUILD HERO MODEL ---
  static buildHero() {
    const root = new THREE.Group();
    root.name = 'Hero';

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x222730,
      roughness: 0.3,
      metalness: 0.85,
      map: this.getRuneTexture('fire')
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.4,
      metalness: 0.9
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xc89b3c,
      roughness: 0.25,
      metalness: 0.95
    });

    const runeMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff4400,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.1
    });

    // 1. Root Pelvis / Hips (y ~ 0.95)
    const hips = new THREE.Group();
    hips.position.y = 0.95;
    root.add(hips);

    const pelvisGeom = new THREE.BoxGeometry(0.36, 0.22, 0.26);
    const pelvis = new THREE.Mesh(pelvisGeom, darkTrimMat);
    pelvis.castShadow = true;
    hips.add(pelvis);

    // Faulds / Tassets (waist armor plates)
    const tassetGeom = new THREE.BoxGeometry(0.14, 0.26, 0.05);
    const tassetL = new THREE.Mesh(tassetGeom, goldTrimMat);
    tassetL.position.set(0.18, -0.1, 0);
    tassetL.rotation.z = -0.15;
    hips.add(tassetL);

    const tassetR = new THREE.Mesh(tassetGeom, goldTrimMat);
    tassetR.position.set(-0.18, -0.1, 0);
    tassetR.rotation.z = 0.15;
    hips.add(tassetR);

    // 2. Spine / Torso
    const spine = new THREE.Group();
    spine.position.y = 0.15;
    hips.add(spine);

    const chestGeom = new THREE.BoxGeometry(0.44, 0.45, 0.3);
    const chest = new THREE.Mesh(chestGeom, armorMat);
    chest.position.y = 0.24;
    chest.castShadow = true;
    spine.add(chest);

    // Glowing core rune crest on chest
    const chestCoreGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8);
    chestCoreGeom.rotateX(Math.PI / 2);
    const chestCore = new THREE.Mesh(chestCoreGeom, runeMat);
    chestCore.position.set(0, 0.26, 0.15);
    spine.add(chestCore);

    // 3. Head & Helmet / Hood
    const head = new THREE.Group();
    head.position.y = 0.52;
    spine.add(head);

    // Dark Knight Helm
    const helmGeom = new THREE.BoxGeometry(0.24, 0.28, 0.26);
    const helm = new THREE.Mesh(helmGeom, darkTrimMat);
    helm.position.y = 0.14;
    helm.castShadow = true;
    head.add(helm);

    // Helmet horns / crest
    const crestGeom = new THREE.ConeGeometry(0.04, 0.25, 4);
    crestGeom.rotateX(-0.3);
    const crest = new THREE.Mesh(crestGeom, goldTrimMat);
    crest.position.set(0, 0.32, 0.02);
    head.add(crest);

    // Glowing eye visor slit
    const visorGeom = new THREE.BoxGeometry(0.18, 0.035, 0.05);
    const visor = new THREE.Mesh(visorGeom, runeMat);
    visor.position.set(0, 0.14, 0.13);
    head.add(visor);

    // 4. Cape
    const capeGeom = new THREE.PlaneGeometry(0.48, 1.15, 4, 8);
    capeGeom.translate(0, -0.55, 0);
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x661111,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, 0.44, -0.16);
    cape.rotation.x = 0.12;
    cape.castShadow = true;
    spine.add(cape);

    // 5. Left Arm
    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.3, 0.42, 0);
    spine.add(shoulderL);

    // Pauldron (shoulder guard)
    const pauldronGeom = new THREE.ConeGeometry(0.16, 0.2, 5);
    pauldronGeom.rotateZ(-0.4);
    const pauldronL = new THREE.Mesh(pauldronGeom, goldTrimMat);
    pauldronL.position.set(0.04, 0.06, 0);
    shoulderL.add(pauldronL);

    const upperArmLGeom = new THREE.CylinderGeometry(0.065, 0.06, 0.26, 6);
    upperArmLGeom.translate(0, -0.13, 0);
    const upperArmL = new THREE.Mesh(upperArmLGeom, armorMat);
    shoulderL.add(upperArmL);

    const elbowL = new THREE.Group();
    elbowL.position.set(0, -0.26, 0);
    shoulderL.add(elbowL);

    const forearmLGeom = new THREE.CylinderGeometry(0.06, 0.07, 0.26, 6);
    forearmLGeom.translate(0, -0.13, 0);
    const forearmL = new THREE.Mesh(forearmLGeom, darkTrimMat);
    elbowL.add(forearmL);

    const handL = new THREE.Group();
    handL.position.set(0, -0.26, 0);
    elbowL.add(handL);

    // 6. Right Arm (Weapon Arm)
    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.3, 0.42, 0);
    spine.add(shoulderR);

    const pauldronR = new THREE.Mesh(pauldronGeom.clone().rotateZ(0.8), goldTrimMat);
    pauldronR.position.set(-0.04, 0.06, 0);
    shoulderR.add(pauldronR);

    const upperArmR = new THREE.Mesh(upperArmLGeom, armorMat);
    shoulderR.add(upperArmR);

    const elbowR = new THREE.Group();
    elbowR.position.set(0, -0.26, 0);
    shoulderR.add(elbowR);

    const forearmR = new THREE.Mesh(forearmLGeom, darkTrimMat);
    elbowR.add(forearmR);

    const handR = new THREE.Group();
    handR.position.set(0, -0.26, 0);
    elbowR.add(handR);

    // 7. Left Leg
    const hipL = new THREE.Group();
    hipL.position.set(0.13, -0.05, 0);
    hips.add(hipL);

    const thighLGeom = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 6);
    thighLGeom.translate(0, -0.21, 0);
    const thighL = new THREE.Mesh(thighLGeom, armorMat);
    thighL.castShadow = true;
    hipL.add(thighL);

    const kneeL = new THREE.Group();
    kneeL.position.set(0, -0.42, 0);
    hipL.add(kneeL);

    const shinLGeom = new THREE.CylinderGeometry(0.07, 0.06, 0.42, 6);
    shinLGeom.translate(0, -0.21, 0);
    const shinL = new THREE.Mesh(shinLGeom, darkTrimMat);
    shinL.castShadow = true;
    kneeL.add(shinL);

    const footLGeom = new THREE.BoxGeometry(0.12, 0.09, 0.22);
    const footL = new THREE.Mesh(footLGeom, goldTrimMat);
    footL.position.set(0, -0.45, 0.05);
    kneeL.add(footL);

    // 8. Right Leg
    const hipR = new THREE.Group();
    hipR.position.set(-0.13, -0.05, 0);
    hips.add(hipR);

    const thighR = new THREE.Mesh(thighLGeom, armorMat);
    thighR.castShadow = true;
    hipR.add(thighR);

    const kneeR = new THREE.Group();
    kneeR.position.set(0, -0.42, 0);
    hipR.add(kneeR);

    const shinR = new THREE.Mesh(shinLGeom, darkTrimMat);
    shinR.castShadow = true;
    kneeR.add(shinR);

    const footR = new THREE.Mesh(footLGeom, goldTrimMat);
    footR.position.set(0, -0.45, 0.05);
    kneeR.add(footR);

    // 9. Massive Elemental Greatsword
    const sword = this.buildGreatsword();
    sword.position.set(0, -0.05, 0.1);
    sword.rotation.x = Math.PI / 2;
    handR.add(sword);

    return {
      root,
      joints: {
        hips,
        spine,
        head,
        cape,
        shoulderL,
        elbowL,
        handL,
        shoulderR,
        elbowR,
        handR,
        hipL,
        kneeL,
        hipR,
        kneeR
      },
      sword,
      runeMaterials: [runeMat],
      capeMesh: cape
    };
  }

  // --- BUILD HERO GREATSWORD ---
  static buildGreatsword() {
    const swordGroup = new THREE.Group();
    swordGroup.name = 'ElementalGreatsword';

    const hiltMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.9
    });

    const crossguardMat = new THREE.MeshStandardMaterial({
      color: 0xc89b3c,
      roughness: 0.25,
      metalness: 0.95
    });

    // Blade core with emissive rune edge
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x222a35,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xff4400,
      emissiveIntensity: 0.9
    });

    // Pommel
    const pommelGeom = new THREE.SphereGeometry(0.045, 8, 8);
    const pommel = new THREE.Mesh(pommelGeom, crossguardMat);
    pommel.position.y = -0.36;
    swordGroup.add(pommel);

    // Grip
    const gripGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.32, 8);
    gripGeom.translate(0, -0.18, 0);
    const grip = new THREE.Mesh(gripGeom, hiltMat);
    swordGroup.add(grip);

    // Crossguard
    const guardGeom = new THREE.BoxGeometry(0.38, 0.06, 0.08);
    const guard = new THREE.Mesh(guardGeom, crossguardMat);
    guard.position.y = 0.02;
    swordGroup.add(guard);

    // Guard gem/eye
    const gemGeom = new THREE.OctahedronGeometry(0.035);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff5500,
      emissiveIntensity: 2.0
    });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    gem.position.set(0, 0.02, 0.045);
    swordGroup.add(gem);

    // Blade: 1.3m long broad double-edged sword
    const bladeGeom = new THREE.BoxGeometry(0.14, 1.25, 0.025);
    bladeGeom.translate(0, 0.65, 0);
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.castShadow = true;
    swordGroup.add(blade);

    // Blade tip
    const tipGeom = new THREE.ConeGeometry(0.07, 0.22, 4);
    tipGeom.rotateY(Math.PI / 4);
    tipGeom.translate(0, 1.36, 0);
    const tip = new THREE.Mesh(tipGeom, bladeMat);
    swordGroup.add(tip);

    // Emissive edge aura quads
    const edgeAuraGeom = new THREE.PlaneGeometry(0.22, 1.4);
    edgeAuraGeom.translate(0, 0.72, 0);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const aura = new THREE.Mesh(edgeAuraGeom, auraMat);
    swordGroup.add(aura);

    swordGroup.bladeMesh = blade;
    swordGroup.bladeTip = tip;
    swordGroup.auraMesh = aura;
    swordGroup.gemMesh = gem;

    return swordGroup;
  }

  // --- BUILD FALLEN SOLDIER ENEMY ---
  static buildSoldier() {
    const root = new THREE.Group();
    root.name = 'FallenSoldier';

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x333b42,
      roughness: 0.6,
      metalness: 0.7
    });

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x777064,
      roughness: 0.8,
      metalness: 0.1
    });

    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xff1122
    });

    const hips = new THREE.Group();
    hips.position.y = 0.85;
    root.add(hips);

    const spine = new THREE.Group();
    spine.position.y = 0.12;
    hips.add(spine);

    // Ribcage & corroded breastplate
    const chestGeom = new THREE.BoxGeometry(0.38, 0.4, 0.24);
    const chest = new THREE.Mesh(chestGeom, armorMat);
    chest.position.y = 0.2;
    chest.castShadow = true;
    spine.add(chest);

    // Skull
    const head = new THREE.Group();
    head.position.y = 0.45;
    spine.add(head);

    const skullGeom = new THREE.BoxGeometry(0.2, 0.22, 0.22);
    const skull = new THREE.Mesh(skullGeom, boneMat);
    skull.position.y = 0.11;
    head.add(skull);

    // Broken helmet
    const helmGeom = new THREE.ConeGeometry(0.14, 0.16, 5);
    const helm = new THREE.Mesh(helmGeom, armorMat);
    helm.position.set(0, 0.23, 0);
    helm.rotation.z = 0.2;
    head.add(helm);

    // Glowing red eyes
    const eyeGeom = new THREE.SphereGeometry(0.025, 4, 4);
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(0.05, 0.12, 0.11);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeR.position.set(-0.05, 0.12, 0.11);
    head.add(eyeR);

    // Arms & jagged sword
    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.25, 0.35, 0);
    spine.add(shoulderL);
    const armLGeom = new THREE.CylinderGeometry(0.05, 0.045, 0.45, 5);
    armLGeom.translate(0, -0.22, 0);
    const armL = new THREE.Mesh(armLGeom, boneMat);
    shoulderL.add(armL);

    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.25, 0.35, 0);
    spine.add(shoulderR);
    const armR = new THREE.Mesh(armLGeom, boneMat);
    shoulderR.add(armR);

    // Jagged cleaver
    const bladeGeom = new THREE.BoxGeometry(0.09, 0.85, 0.02);
    bladeGeom.translate(0, 0.4, 0);
    const rustedMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a1a,
      roughness: 0.7,
      metalness: 0.6
    });
    const cleaver = new THREE.Mesh(bladeGeom, rustedMat);
    cleaver.position.set(0, -0.42, 0.1);
    cleaver.rotation.x = Math.PI / 2;
    cleaver.castShadow = true;
    shoulderR.add(cleaver);

    // Legs
    const hipL = new THREE.Group();
    hipL.position.set(0.1, 0, 0);
    hips.add(hipL);
    const legGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.75, 5);
    legGeom.translate(0, -0.37, 0);
    const legL = new THREE.Mesh(legGeom, boneMat);
    legL.castShadow = true;
    hipL.add(legL);

    const hipR = new THREE.Group();
    hipR.position.set(-0.1, 0, 0);
    hips.add(hipR);
    const legR = new THREE.Mesh(legGeom, boneMat);
    legR.castShadow = true;
    hipR.add(legR);

    return {
      root,
      joints: { hips, spine, head, shoulderL, shoulderR, hipL, hipR },
      weapon: cleaver
    };
  }

  // --- BUILD VOID ARCHER / CULTIST ENEMY ---
  static buildCultist() {
    const root = new THREE.Group();
    root.name = 'VoidCultist';

    const robeMat = new THREE.MeshStandardMaterial({
      color: 0x1f122b,
      roughness: 0.7,
      metalness: 0.2
    });

    const voidCrystalMat = new THREE.MeshStandardMaterial({
      color: 0x8800ff,
      emissive: 0xaa22ff,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.3
    });

    const hips = new THREE.Group();
    hips.position.y = 0.9;
    root.add(hips);

    // Flowing Robe Skirt (hovering)
    const skirtGeom = new THREE.ConeGeometry(0.35, 0.9, 8, 1, true);
    skirtGeom.translate(0, -0.45, 0);
    const skirt = new THREE.Mesh(skirtGeom, robeMat);
    skirt.castShadow = true;
    hips.add(skirt);

    const spine = new THREE.Group();
    spine.position.y = 0.15;
    hips.add(spine);

    const torsoGeom = new THREE.CylinderGeometry(0.16, 0.2, 0.45, 6);
    torsoGeom.translate(0, 0.22, 0);
    const torso = new THREE.Mesh(torsoGeom, robeMat);
    torso.castShadow = true;
    spine.add(torso);

    // Deep Hood with pitch-black void inside & purple glowing eyes
    const head = new THREE.Group();
    head.position.y = 0.5;
    spine.add(head);

    const hoodGeom = new THREE.ConeGeometry(0.2, 0.32, 6);
    hoodGeom.rotateX(-0.2);
    hoodGeom.translate(0, 0.14, -0.04);
    const hood = new THREE.Mesh(hoodGeom, robeMat);
    head.add(hood);

    const voidEyeGeom = new THREE.SphereGeometry(0.025, 4, 4);
    const eyeL = new THREE.Mesh(voidEyeGeom, voidCrystalMat);
    eyeL.position.set(0.045, 0.12, 0.08);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(voidEyeGeom, voidCrystalMat);
    eyeR.position.set(-0.045, 0.12, 0.08);
    head.add(eyeR);

    // Staff Arm
    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.25, 0.35, 0);
    spine.add(shoulderR);

    const staffHandleGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6);
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const staff = new THREE.Mesh(staffHandleGeom, staffMat);
    staff.position.set(-0.1, 0.2, 0.3);
    staff.rotation.x = 0.2;
    shoulderR.add(staff);

    // Floating Void Crystal on top of staff
    const crystalGeom = new THREE.OctahedronGeometry(0.12);
    const crystal = new THREE.Mesh(crystalGeom, voidCrystalMat);
    crystal.position.set(-0.1, 1.05, 0.45);
    shoulderR.add(crystal);

    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.25, 0.35, 0);
    spine.add(shoulderL);

    return {
      root,
      joints: { hips, spine, head, shoulderL, shoulderR },
      crystalMesh: crystal
    };
  }

  // --- BUILD CORRUPTED ELITE KNIGHT ---
  static buildEliteKnight() {
    const root = new THREE.Group();
    root.name = 'EliteKnight';

    const heavyArmorMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e22,
      roughness: 0.3,
      metalness: 0.9
    });

    const bloodSteelMat = new THREE.MeshStandardMaterial({
      color: 0x5a1818,
      roughness: 0.4,
      metalness: 0.8
    });

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });

    const hips = new THREE.Group();
    hips.position.y = 1.05;
    root.add(hips);

    const spine = new THREE.Group();
    spine.position.y = 0.2;
    hips.add(spine);

    // Bulky plate chest
    const chestGeom = new THREE.BoxGeometry(0.65, 0.55, 0.4);
    const chest = new THREE.Mesh(chestGeom, heavyArmorMat);
    chest.position.y = 0.28;
    chest.castShadow = true;
    spine.add(chest);

    // Spiked Helm
    const head = new THREE.Group();
    head.position.y = 0.65;
    spine.add(head);

    const helmGeom = new THREE.BoxGeometry(0.32, 0.34, 0.32);
    const helm = new THREE.Mesh(helmGeom, heavyArmorMat);
    head.add(helm);

    // Horns
    const hornGeom = new THREE.ConeGeometry(0.06, 0.35, 5);
    const hornL = new THREE.Mesh(hornGeom, bloodSteelMat);
    hornL.position.set(0.18, 0.2, 0);
    hornL.rotation.z = -0.6;
    head.add(hornL);

    const hornR = new THREE.Mesh(hornGeom, bloodSteelMat);
    hornR.position.set(-0.18, 0.2, 0);
    hornR.rotation.z = 0.6;
    head.add(hornR);

    // Massive Spiked Pauldrons
    const pauldronGeom = new THREE.BoxGeometry(0.35, 0.3, 0.35);
    const pauldronL = new THREE.Mesh(pauldronGeom, bloodSteelMat);
    pauldronL.position.set(0.48, 0.48, 0);
    spine.add(pauldronL);

    const pauldronR = new THREE.Mesh(pauldronGeom, bloodSteelMat);
    pauldronR.position.set(-0.48, 0.48, 0);
    spine.add(pauldronR);

    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.42, 0.35, 0);
    spine.add(shoulderL);

    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.42, 0.35, 0);
    spine.add(shoulderR);

    // Heavy Warhammer in Right Hand
    const hammerHandleGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6);
    hammerHandleGeom.translate(0, 0.4, 0);
    const hammer = new THREE.Mesh(hammerHandleGeom, heavyArmorMat);
    hammer.position.set(0, -0.4, 0.2);
    hammer.rotation.x = Math.PI / 2;

    const hammerHeadGeom = new THREE.BoxGeometry(0.3, 0.35, 0.5);
    const hammerHead = new THREE.Mesh(hammerHeadGeom, bloodSteelMat);
    hammerHead.position.set(0, 1.05, 0);
    hammer.add(hammerHead);
    hammer.castShadow = true;
    shoulderR.add(hammer);

    // Tower Shield in Left Hand
    const shieldGeom = new THREE.BoxGeometry(0.45, 0.9, 0.06);
    const shield = new THREE.Mesh(shieldGeom, heavyArmorMat);
    shield.position.set(0.2, -0.1, 0.2);
    shield.rotation.y = -0.3;
    shield.castShadow = true;
    shoulderL.add(shield);

    // Heavy Legs
    const hipL = new THREE.Group();
    hipL.position.set(0.18, 0, 0);
    hips.add(hipL);
    const legGeom = new THREE.BoxGeometry(0.18, 0.9, 0.22);
    legGeom.translate(0, -0.45, 0);
    const legL = new THREE.Mesh(legGeom, heavyArmorMat);
    legL.castShadow = true;
    hipL.add(legL);

    const hipR = new THREE.Group();
    hipR.position.set(-0.18, 0, 0);
    hips.add(hipR);
    const legR = new THREE.Mesh(legGeom, heavyArmorMat);
    legR.castShadow = true;
    hipR.add(legR);

    return {
      root,
      joints: { hips, spine, head, shoulderL, shoulderR, hipL, hipR },
      weapon: hammer
    };
  }

  // --- BUILD THE EPIC BOSS: THE FALLEN KING ---
  static buildBoss() {
    const root = new THREE.Group();
    root.name = 'TheFallenKing';
    root.scale.set(2.4, 2.4, 2.4); // Towering scale

    const kingArmorMat = new THREE.MeshStandardMaterial({
      color: 0x14181f,
      roughness: 0.25,
      metalness: 0.95
    });

    const obsidianCrownMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.15,
      metalness: 0.98
    });

    const corruptedGoldMat = new THREE.MeshStandardMaterial({
      color: 0x9e7a2b,
      roughness: 0.35,
      metalness: 0.85
    });

    // Abyssal Flame Emissive Material for eyes, blade, runes
    const abyssalGlowMat = new THREE.MeshStandardMaterial({
      color: 0x7700ff,
      emissive: 0x9911ff,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    const hips = new THREE.Group();
    hips.position.y = 1.0;
    root.add(hips);

    const spine = new THREE.Group();
    spine.position.y = 0.2;
    hips.add(spine);

    // Colossal Chestplate with demonic ribs
    const chestGeom = new THREE.BoxGeometry(0.68, 0.58, 0.42);
    const chest = new THREE.Mesh(chestGeom, kingArmorMat);
    chest.position.y = 0.32;
    chest.castShadow = true;
    spine.add(chest);

    // Glowing corrupted heart/rune in chest
    const heartRuneGeom = new THREE.OctahedronGeometry(0.12);
    const heartRune = new THREE.Mesh(heartRuneGeom, abyssalGlowMat);
    heartRune.position.set(0, 0.35, 0.22);
    spine.add(heartRune);

    // Head, Horned Helm & Jagged Spiked Obsidian Crown
    const head = new THREE.Group();
    head.position.y = 0.7;
    spine.add(head);

    const helmGeom = new THREE.BoxGeometry(0.3, 0.35, 0.32);
    const helm = new THREE.Mesh(helmGeom, kingArmorMat);
    head.add(helm);

    // Spiked Crown
    const crownBaseGeom = new THREE.CylinderGeometry(0.2, 0.22, 0.08, 8);
    const crownBase = new THREE.Mesh(crownBaseGeom, obsidianCrownMat);
    crownBase.position.y = 0.2;
    head.add(crownBase);

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const spikeGeom = new THREE.ConeGeometry(0.04, 0.24 + (i % 2 === 0 ? 0.12 : 0), 4);
      const spike = new THREE.Mesh(spikeGeom, obsidianCrownMat);
      spike.position.set(Math.cos(angle) * 0.19, 0.32, Math.sin(angle) * 0.19);
      spike.rotation.y = angle;
      head.add(spike);
    }

    // Glowing Abyssal Eye Visors
    const bossEyeGeom = new THREE.BoxGeometry(0.1, 0.04, 0.04);
    const eyeL = new THREE.Mesh(bossEyeGeom, abyssalGlowMat);
    eyeL.position.set(0.08, 0.08, 0.16);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(bossEyeGeom, abyssalGlowMat);
    eyeR.position.set(-0.08, 0.08, 0.16);
    head.add(eyeR);

    // Regal Tattered Abyssal Cape
    const capeGeom = new THREE.PlaneGeometry(0.85, 1.7, 6, 10);
    capeGeom.translate(0, -0.85, 0);
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x330044,
      roughness: 0.85,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, 0.58, -0.22);
    cape.rotation.x = 0.14;
    cape.castShadow = true;
    spine.add(cape);

    // Massive Demon-Skull Pauldrons
    const pauldronGeom = new THREE.BoxGeometry(0.42, 0.38, 0.42);
    const pauldronL = new THREE.Mesh(pauldronGeom, corruptedGoldMat);
    pauldronL.position.set(0.55, 0.52, 0);
    spine.add(pauldronL);

    const pauldronR = new THREE.Mesh(pauldronGeom, corruptedGoldMat);
    pauldronR.position.set(-0.55, 0.52, 0);
    spine.add(pauldronR);

    // Arms
    const shoulderL = new THREE.Group();
    shoulderL.position.set(0.48, 0.38, 0);
    spine.add(shoulderL);

    const armLGeom = new THREE.CylinderGeometry(0.09, 0.08, 0.55, 6);
    armLGeom.translate(0, -0.27, 0);
    const armL = new THREE.Mesh(armLGeom, kingArmorMat);
    shoulderL.add(armL);

    const shoulderR = new THREE.Group();
    shoulderR.position.set(-0.48, 0.38, 0);
    spine.add(shoulderR);

    const armR = new THREE.Mesh(armLGeom, kingArmorMat);
    shoulderR.add(armR);

    // Colossal Soulreaver Greatsword
    const swordGroup = new THREE.Group();
    const swordHandleGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.7, 8);
    const swordHandle = new THREE.Mesh(swordHandleGeom, obsidianCrownMat);
    swordHandle.position.y = -0.3;
    swordGroup.add(swordHandle);

    const bossGuardGeom = new THREE.BoxGeometry(0.6, 0.1, 0.12);
    const bossGuard = new THREE.Mesh(bossGuardGeom, corruptedGoldMat);
    swordGroup.add(bossGuard);

    // Giant Blade (1.9m long)
    const bossBladeGeom = new THREE.BoxGeometry(0.24, 1.8, 0.04);
    bossBladeGeom.translate(0, 0.95, 0);
    const bossBlade = new THREE.Mesh(bossBladeGeom, kingArmorMat);
    bossBlade.castShadow = true;
    swordGroup.add(bossBlade);

    // Glowing Soul Channel along the blade
    const channelGeom = new THREE.PlaneGeometry(0.08, 1.6);
    channelGeom.translate(0, 0.9, 0.025);
    const channel = new THREE.Mesh(channelGeom, abyssalGlowMat);
    swordGroup.add(channel);

    swordGroup.position.set(0, -0.55, 0.15);
    swordGroup.rotation.x = Math.PI / 2;
    shoulderR.add(swordGroup);

    // Heavy Legs
    const hipL = new THREE.Group();
    hipL.position.set(0.2, 0, 0);
    hips.add(hipL);
    const legGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 6);
    legGeom.translate(0, -0.45, 0);
    const legL = new THREE.Mesh(legGeom, kingArmorMat);
    legL.castShadow = true;
    hipL.add(legL);

    const hipR = new THREE.Group();
    hipR.position.set(-0.2, 0, 0);
    hips.add(hipR);
    const legR = new THREE.Mesh(legGeom, kingArmorMat);
    legR.castShadow = true;
    hipR.add(legR);

    return {
      root,
      joints: { hips, spine, head, shoulderL, shoulderR, hipL, hipR, cape },
      sword: swordGroup,
      bossBlade,
      abyssalMaterials: [abyssalGlowMat],
      heartRune
    };
  }
}
