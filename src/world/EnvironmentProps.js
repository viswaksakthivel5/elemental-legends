/**
 * EnvironmentProps.js
 * Procedural dark-fantasy props: broken gothic pillars, ancient stone arches,
 * burning braziers with dynamic point lights, and glowing arcane crystals.
 */

import * as THREE from 'three';

export class EnvironmentProps {
  static stoneMat = null;
  static darkStoneMat = null;
  static crystalMat = null;

  static initMaterials() {
    if (this.stoneMat) return;

    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x3d434d,
      roughness: 0.85,
      metalness: 0.15
    });

    this.darkStoneMat = new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.9,
      metalness: 0.2
    });

    this.crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00d9ff,
      emissive: 0x0099ff,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.3
    });
  }

  // --- RUINED GOTHIC PILLAR ---
  static createPillar(height = 6.0, radius = 0.65, isBroken = false) {
    this.initMaterials();
    const group = new THREE.Group();

    // Base plinth
    const baseGeom = new THREE.BoxGeometry(radius * 2.6, 0.6, radius * 2.6);
    const base = new THREE.Mesh(baseGeom, this.darkStoneMat);
    base.position.y = 0.3;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Fluted shaft
    const actualHeight = isBroken ? height * 0.6 : height;
    const shaftGeom = new THREE.CylinderGeometry(radius * 0.85, radius, actualHeight, 12);
    shaftGeom.translate(0, actualHeight / 2 + 0.6, 0);
    const shaft = new THREE.Mesh(shaftGeom, this.stoneMat);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);

    // Capital on top if not broken
    if (!isBroken) {
      const capGeom = new THREE.BoxGeometry(radius * 2.4, 0.5, radius * 2.4);
      capGeom.translate(0, height + 0.85, 0);
      const cap = new THREE.Mesh(capGeom, this.darkStoneMat);
      cap.castShadow = true;
      group.add(cap);
    } else {
      // Jagged broken top
      const jaggedGeom = new THREE.ConeGeometry(radius * 0.8, 0.8, 5);
      jaggedGeom.translate(0, actualHeight + 0.7, 0);
      const jagged = new THREE.Mesh(jaggedGeom, this.stoneMat);
      group.add(jagged);
    }

    return group;
  }

  // --- GRAND RUINED GOTHIC ARCH ---
  static createArch(width = 12.0, height = 9.0) {
    this.initMaterials();
    const group = new THREE.Group();

    // Left & Right Pillars
    const p1 = this.createPillar(height, 0.85, false);
    p1.position.set(-width / 2, 0, 0);
    group.add(p1);

    const p2 = this.createPillar(height, 0.85, false);
    p2.position.set(width / 2, 0, 0);
    group.add(p2);

    // Crossbeam Lintels
    const lintelGeom = new THREE.BoxGeometry(width + 2.5, 1.1, 1.4);
    lintelGeom.translate(0, height + 1.2, 0);
    const lintel = new THREE.Mesh(lintelGeom, this.darkStoneMat);
    lintel.castShadow = true;
    group.add(lintel);

    // Arch Crest Keystone
    const crestGeom = new THREE.ConeGeometry(1.2, 1.8, 4);
    crestGeom.translate(0, height + 2.5, 0);
    const crest = new THREE.Mesh(crestGeom, this.stoneMat);
    group.add(crest);

    return group;
  }

  // --- BURNING BRAZIER WITH FLICKERING LIGHT ---
  static createBrazier(position = new THREE.Vector3()) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    // Iron Stand
    const standGeom = new THREE.CylinderGeometry(0.12, 0.35, 1.4, 6);
    standGeom.translate(0, 0.7, 0);
    const stand = new THREE.Mesh(standGeom, this.darkStoneMat);
    stand.castShadow = true;
    group.add(stand);

    // Fire Bowl
    const bowlGeom = new THREE.CylinderGeometry(0.65, 0.3, 0.45, 8);
    bowlGeom.translate(0, 1.5, 0);
    const bowl = new THREE.Mesh(bowlGeom, this.darkStoneMat);
    bowl.castShadow = true;
    group.add(bowl);

    // Burning Coals Mesh
    const coalsGeom = new THREE.SphereGeometry(0.48, 8, 8);
    coalsGeom.scale(1, 0.5, 1);
    coalsGeom.translate(0, 1.62, 0);
    const coalsMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const coals = new THREE.Mesh(coalsGeom, coalsMat);
    group.add(coals);

    // Dynamic Flickering Point Light
    const light = new THREE.PointLight(0xff6622, 18.0, 16.0);
    light.position.set(0, 2.0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.002;
    group.add(light);

    group.flickerLight = light;
    return group;
  }

  // --- GLOWING ARCANE CRYSTAL CLUSTER ---
  static createCrystalCluster(position = new THREE.Vector3(), color = 0x00d9ff) {
    this.initMaterials();
    const group = new THREE.Group();
    group.position.copy(position);

    const crystalMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.9,
      roughness: 0.15,
      metalness: 0.4
    });

    const heights = [1.8, 1.3, 0.9, 1.5];
    const angles = [0, 1.2, 2.5, 4.2];

    for (let i = 0; i < heights.length; i++) {
      const geom = new THREE.ConeGeometry(0.2, heights[i], 6);
      geom.translate(0, heights[i] / 2, 0);
      const mesh = new THREE.Mesh(geom, crystalMat);
      mesh.position.set(Math.cos(angles[i]) * 0.4, 0, Math.sin(angles[i]) * 0.4);
      mesh.rotation.z = (Math.random() - 0.5) * 0.35;
      mesh.rotation.x = (Math.random() - 0.5) * 0.35;
      mesh.castShadow = true;
      group.add(mesh);
    }

    const light = new THREE.PointLight(color, 6.0, 8.0);
    light.position.set(0, 1.2, 0);
    group.add(light);

    return group;
  }
}
