// ============================================================
// EB_v87.jsx — EBキャラクター v87（octa装飾）
// Usage:
//   import { createEB_v87 } from './EB_v87.jsx';
//   const eb = createEB_v87();
//   scene.add(eb);
// ============================================================

import * as THREE from 'three';

function buildEBGeo() {
  const geo = new THREE.IcosahedronGeometry(3, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (y <= 0) { x *= 1.1; z *= 1.1; }
    if (z >= 0) { x *= 1.1; y *= 1.1; }
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function buildPlainGeo() {
  const geo = new THREE.IcosahedronGeometry(3, 1);
  geo.computeVertexNormals();
  return geo;
}

function buildArmGeo() {
  const geo = new THREE.IcosahedronGeometry(1.2, 1);
  const pos = geo.attributes.position;
  let zMax = -Infinity, zMin = Infinity;
  for (let i = 0; i < pos.count; i++) {
    zMax = Math.max(zMax, pos.getZ(i));
    zMin = Math.min(zMin, pos.getZ(i));
  }
  const zRange = zMax - zMin;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const t = (zMax - z) / zRange;
    x *= (1 + t * 0.3);
    y *= (1 + t * 0.3);
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function buildShoesGeo() {
  const geo = new THREE.IcosahedronGeometry(1.2, 1);
  const pos = geo.attributes.position;
  let zMax = -Infinity, zMin = Infinity, yMax = -Infinity, yMin = Infinity;
  for (let i = 0; i < pos.count; i++) {
    zMax = Math.max(zMax, pos.getZ(i)); zMin = Math.min(zMin, pos.getZ(i));
    yMax = Math.max(yMax, pos.getY(i)); yMin = Math.min(yMin, pos.getY(i));
  }
  const zRange = zMax - zMin, yRange = yMax - yMin;
  const fT = zMax - zRange * 0.25, bT = zMin + zRange * (1 / 3), yC = yMin + yRange * 0.75;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (z >= fT) { const t = (z - fT) / (zMax - fT); z = z - t * (zMax - fT) * 0.5; }
    if (z <= bT) { const t = (bT - z) / (bT - zMin); z = z + t * (bT - zMin) * 0.2; }
    if (y > yC) y = yC;
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function createEB_v87() {
  const group = new THREE.Group();
  const face = new THREE.Group();

  // 顔メッシュ
  const eb = new THREE.Mesh(buildEBGeo(), new THREE.MeshPhongMaterial({ color: 0xF4E0D6, flatShading: true, shininess: 18 }));
  eb.rotation.x = 15 * Math.PI / 180;
  eb.castShadow = true;
  face.add(eb);

  const ebClone = new THREE.Mesh(buildPlainGeo(), new THREE.MeshPhongMaterial({ color: 0xAB8151, flatShading: true, shininess: 18 }));
  ebClone.scale.setScalar(1.32);
  ebClone.rotation.x = Math.PI;
  ebClone.position.set(0, 1.2, -1.0);
  ebClone.castShadow = true;
  face.add(ebClone);

  // 耳
  const earGeo = new THREE.OctahedronGeometry(1.2, 0);
  const deg6 = 6 * Math.PI / 180;
  [{ x: -3.5, rz: deg6 }, { x: 3.5, rz: -deg6 }].forEach(({ x, rz }) => {
    const ear = new THREE.Mesh(earGeo, new THREE.MeshPhongMaterial({ color: 0xF4E0D6, flatShading: true, shininess: 18 }));
    ear.scale.set(0.5, 1, 1);
    ear.rotation.z = rz;
    ear.position.set(x, 0, 0);
    ear.castShadow = true;
    face.add(ear);
  });

  // アンクル
  const ankleGeo = new THREE.IcosahedronGeometry(1.2, 1);
  [{ x: -2.0 }, { x: 2.0 }].forEach(({ x }) => {
    const ankle = new THREE.Mesh(ankleGeo, new THREE.MeshPhongMaterial({ color: 0xF4E0D6, flatShading: true, shininess: 18 }));
    ankle.name = 'ankle';
    ankle.scale.set(1, 1, 1.5);
    ankle.position.set(x, -2.5, -10);
    ankle.castShadow = true;
    face.add(ankle);
  });

  // アーム
  const armGeo = buildArmGeo();
  const armL = new THREE.Mesh(armGeo, new THREE.MeshPhongMaterial({ color: 0xF4E0D6, flatShading: true, shininess: 18 }));
  armL.name = 'arm';
  armL.scale.set(1, 1, 2.25);
  armL.rotation.set(10 * Math.PI / 180, 60 * Math.PI / 180, -10 * Math.PI / 180);
  armL.position.set(-2.0, -2.5, 1.5);
  armL.castShadow = true;
  face.add(armL);

  const armR = new THREE.Mesh(armGeo, new THREE.MeshPhongMaterial({ color: 0xF4E0D6, flatShading: true, shininess: 18 }));
  armR.name = 'arm';
  armR.scale.set(1, 1, 2.7);
  armR.rotation.set(10 * Math.PI / 180, -50 * Math.PI / 180, 0);
  armR.position.set(2.0, -2.5, 2.0);
  armR.castShadow = true;
  face.add(armR);

  // シューズ
  const shoesGeo = buildShoesGeo();
  [{ x: -2.0 }, { x: 2.0 }].forEach(({ x }) => {
    const shoes = new THREE.Mesh(shoesGeo, new THREE.MeshPhongMaterial({ color: 0xB7452E, flatShading: true, shininess: 18 }));
    shoes.name = 'shoes';
    shoes.scale.set(1.2, 1.2, 1.8);
    shoes.rotation.x = -45 * Math.PI / 180;
    shoes.position.set(x, -2.5, -12);
    shoes.castShadow = true;
    face.add(shoes);
  });

  // トーラス（目）
  const torusMat = new THREE.MeshPhongMaterial({ color: 0x495560, flatShading: true, shininess: 30 });
  const torusGeo = new THREE.TorusGeometry(0.8, 0.3, 8, 16);
  [{ x: -1.5, ry: -15 * Math.PI / 180 }, { x: 1.5, ry: 15 * Math.PI / 180 }].forEach(({ x, ry }) => {
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(x, 0.0, 2.3);
    torus.rotation.x = -35 * Math.PI / 180;
    torus.rotation.y = ry;
    torus.castShadow = true;
    face.add(torus);
  });

  // 八面体装飾
  const octaGeo = new THREE.OctahedronGeometry(1.2, 0);
  const octaMat = new THREE.MeshPhongMaterial({ color: 0xAB8151, flatShading: true, shininess: 18 });

  const octaC = new THREE.Mesh(octaGeo, octaMat);
  octaC.scale.set(1, 1.5, 0.5);
  octaC.rotation.x = -23 * Math.PI / 180;
  octaC.position.set(0, 2.0, 2.7);
  octaC.castShadow = true;
  face.add(octaC);

  const octaTop = new THREE.Mesh(octaGeo, octaMat);
  octaTop.scale.set(0.5, 1, 0.5);
  octaTop.position.set(-2, 4, 0.7);
  octaTop.castShadow = true;
  face.add(octaTop);

  const octaTop2 = new THREE.Mesh(octaGeo, octaMat);
  octaTop2.scale.set(0.5, 1, 0.5);
  octaTop2.rotation.x = 20 * Math.PI / 180;
  octaTop2.rotation.z = 20 * Math.PI / 180;
  octaTop2.position.set(-2.5, 3.5, 1.2);
  octaTop2.castShadow = true;
  face.add(octaTop2);

  [{ x: -2, ry: -25 * Math.PI / 180 }, { x: 2, ry: 25 * Math.PI / 180 }].forEach(({ x, ry }) => {
    const octa = new THREE.Mesh(octaGeo, octaMat);
    octa.scale.set(1, 1.5, 0.5);
    octa.rotation.x = -23 * Math.PI / 180;
    octa.rotation.y = ry;
    octa.position.set(x, 2.0, 2.0);
    octa.castShadow = true;
    face.add(octa);
  });

  group.add(face);

  // ボディ（しましま12角柱）
  const rSegs = 12, stripes = 3, hSegs = stripes * 2, cylH = 10, R = 4;
  const positions = [], matIndices = [];
  const segH = cylH / hSegs, yMinC = -cylH / 2, yMaxOrig = cylH / 2;
  function deform(x, y, z) {
    if (z > 0) { const t = z / R; z = z - t * R * 0.3; }
    if (y > 0) { const t = y / yMaxOrig; x *= (1 - t * 0.2); z *= (1 - t * 0.2); }
    y *= 0.7;
    return [x, y, z];
  }
  for (let h = 0; h < hSegs; h++) {
    const matIdx = h % 2;
    const y0 = yMinC + h * segH, y1 = yMinC + (h + 1) * segH;
    for (let r = 0; r < rSegs; r++) {
      const a0 = (r / rSegs) * Math.PI * 2, a1 = ((r + 1) / rSegs) * Math.PI * 2;
      const d00 = deform(Math.cos(a0) * R, y0, Math.sin(a0) * R);
      const d10 = deform(Math.cos(a1) * R, y0, Math.sin(a1) * R);
      const d01 = deform(Math.cos(a0) * R, y1, Math.sin(a0) * R);
      const d11 = deform(Math.cos(a1) * R, y1, Math.sin(a1) * R);
      positions.push(...d00, ...d10, ...d11); matIndices.push(matIdx, matIdx, matIdx);
      positions.push(...d00, ...d11, ...d01); matIndices.push(matIdx, matIdx, matIdx);
    }
  }
  for (let r = 0; r < rSegs; r++) {
    const a0 = (r / rSegs) * Math.PI * 2, a1 = ((r + 1) / rSegs) * Math.PI * 2;
    positions.push(...deform(0, cylH / 2, 0), ...deform(Math.cos(a0) * R, cylH / 2, Math.sin(a0) * R), ...deform(Math.cos(a1) * R, cylH / 2, Math.sin(a1) * R));
    matIndices.push(2, 2, 2);
  }
  for (let r = 0; r < rSegs; r++) {
    const a0 = (r / rSegs) * Math.PI * 2, a1 = ((r + 1) / rSegs) * Math.PI * 2;
    positions.push(...deform(0, -cylH / 2, 0), ...deform(Math.cos(a1) * R, -cylH / 2, Math.sin(a1) * R), ...deform(Math.cos(a0) * R, -cylH / 2, Math.sin(a0) * R));
    matIndices.push(2, 2, 2);
  }
  const cylGeo = new THREE.BufferGeometry();
  cylGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  cylGeo.computeVertexNormals();
  const faceCount = matIndices.length / 3;
  const faceMat = [];
  for (let f = 0; f < faceCount; f++) faceMat.push(matIndices[f * 3]);
  let gs = 0, gm = faceMat[0];
  for (let f = 1; f <= faceCount; f++) {
    if (f === faceCount || faceMat[f] !== gm) { cylGeo.addGroup(gs * 3, (f - gs) * 3, gm); gs = f; gm = faceMat[f]; }
  }
  const cylinder = new THREE.Mesh(cylGeo, [
    new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 20, side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: 0xB7452E, flatShading: true, shininess: 20, side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 20, side: THREE.DoubleSide }),
  ]);
  cylinder.scale.set(1, 1, 0.8);
  cylinder.rotation.x = Math.PI / 2;
  cylinder.position.set(0, -2.5, -4.5);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  group.add(cylinder);

  // 脚・ショルダー
  function makeLeg(color, rx, ry, rz, x, y, z, scale, name = '') {
    const legGeo = new THREE.CylinderGeometry(1.2, 1.2, 4, 8);
    const pos = legGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let lx = pos.getX(i), ly = pos.getY(i), lz = pos.getZ(i);
      if (ly <= 0) { lx *= 1.3; lz *= 1.3; }
      pos.setXYZ(i, lx, ly, lz);
    }
    pos.needsUpdate = true;
    legGeo.computeVertexNormals();
    const leg = new THREE.Mesh(legGeo, new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 20 }));
    if (name) leg.name = name;
    leg.position.set(x, y, z);
    leg.rotation.x = rx; leg.rotation.y = ry; leg.rotation.z = rz;
    leg.scale.setScalar(scale);
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);
  }

  const deg65r = -65 * Math.PI / 180, deg100 = 100 * Math.PI / 180, deg10y = 10 * Math.PI / 180;
  makeLeg(0xB7452E, deg65r,  deg10y, -10 * Math.PI / 180, -3.0, -2.0, -1.5, 1.0, 'shoulder');
  makeLeg(0xB7452E, deg65r, -deg10y,  10 * Math.PI / 180,  3.0, -2.0, -1.5, 1.0, 'shoulder');
  makeLeg(0x495560, deg100,  deg10y, -10 * Math.PI / 180, -1.5, -2.7, -7.0, 1.2);
  makeLeg(0x495560, deg100, -deg10y,  10 * Math.PI / 180,  1.5, -2.7, -7.0, 1.2);

  return group;
}
