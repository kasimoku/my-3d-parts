// ============================================================
// field01.jsx — ローポリ フィールド01
// my-3d-parts standard
//   - flatShading: true / castShadow: true（全メッシュ）
//   - THREE.Group パターン
//   - シード固定乱数（mulberry32, seed=3）
//   - ロゼット植物（2層・10枚ブレード）
//   - stem（三角柱 + 葉ブレード4枚・2段）
//   - 三角台形 大1 + ランダム小3（#6E9871）
//   - 三角錐 ランダム6本（#9EBB6D）
// Usage:
//   import { createField01 } from './field01.jsx';
//   const field = createField01();
//   scene.add(field);
// ============================================================

import * as THREE from "three";

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function buildBladeGeo(length, droop, baseW, segments = 3, droopPow = 2) {
  const verts = [];
  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const w = baseW * Math.sin(t * Math.PI * 0.85) + 0.01;
    const z = droop * Math.pow(t, droopPow);
    verts.push(-w, t * length, z, w, t * length, z);
  }
  verts.push(0, length + 0.04, droop);

  const idxs = [];
  for (let s = 0; s < segments; s++) {
    const a = s * 2, b = a + 1, c = a + 2, d = a + 3;
    idxs.push(a, b, c, b, d, c);
  }
  idxs.push(segments * 2, segments * 2 + 1, (segments + 1) * 2);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idxs);
  geo.computeVertexNormals();
  return geo;
}

function makeBlade(parent, angleY, tiltX, posY, length, droop, baseW, color, droopPow = 2) {
  const geo = buildBladeGeo(length, droop, baseW, 3, droopPow);
  const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, side: THREE.DoubleSide, shininess: 25 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.order = "YXZ";
  mesh.rotation.y = angleY;
  mesh.rotation.x = tiltX;
  mesh.position.y = posY;
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function addRosette(parent) {
  const BLADE_COUNT = 6;
  const palette = [0x4a7a30, 0x3d6b28, 0x4f7a28, 0x567a35, 0x3e6e22, 0x4a7a30, 0x608040, 0x3d6b28];
  for (let i = 0; i < BLADE_COUNT; i++) {
    makeBlade(parent,
      (i / BLADE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
      1.15 + Math.random() * 0.2, 0,
      (0.9 + Math.random() * 0.5) / 2,
      0.18 + Math.random() * 0.15,
      0.17 + Math.random() * 0.06,
      palette[i % palette.length]
    );
  }
}

function addRosetteLayer2(parent) {
  const BLADE_COUNT = 4;
  for (let i = 0; i < BLADE_COUNT; i++) {
    makeBlade(parent,
      (i / BLADE_COUNT) * Math.PI * 2 + Math.PI / BLADE_COUNT + (Math.random() - 0.5) * 0.3,
      0.5 + Math.random() * 0.1, 0,
      (0.7 + Math.random() * 0.4) / 2,
      0.25 + Math.random() * 0.15,
      0.14 + Math.random() * 0.05,
      0x77bb41, 3
    );
  }
}

export function createField01() {
  const group = new THREE.Group();
  const rng = mulberry32(3);
  const TILT_X = -Math.PI / 18;

  // ロゼット
  const rosetteGroup = new THREE.Group();
  rosetteGroup.position.set(0.3, 0.2, 0.3);
  group.add(rosetteGroup);
  addRosette(rosetteGroup);
  addRosetteLayer2(rosetteGroup);

  // stem（茎 + 葉ブレード2段）
  const stemGroup = new THREE.Group();
  stemGroup.position.set(-0.5, 0, -0.2);
  stemGroup.rotation.y = -Math.PI / 2;
  group.add(stemGroup);

  const stemMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.8, 3),
    new THREE.MeshPhongMaterial({ color: 0x4a7a30, flatShading: true })
  );
  stemMesh.position.y = 0.4;
  stemMesh.castShadow = true;
  stemGroup.add(stemMesh);

  [
    { angleY: 0,             posY: 0.5, scale: 1.0 },
    { angleY: Math.PI,       posY: 0.5, scale: 1.0 },
    { angleY: 0.8,           posY: 0.8, scale: 0.7 },
    { angleY: Math.PI + 0.8, posY: 0.8, scale: 0.7 },
  ].forEach(({ angleY, posY, scale }, i) => {
    makeBlade(stemGroup, angleY, 1.15 + Math.random() * 0.2, posY,
      (0.9 + Math.random() * 0.5) / 2 * scale,
      0.18 + Math.random() * 0.15,
      (0.17 + Math.random() * 0.06) * scale,
      [0x4a7a30, 0x567a35][i % 2]
    );
  });

  // 三角台形（大・地面）
  const pyramidGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.2, 3);
  const largePyramid = new THREE.Mesh(pyramidGeo,
    new THREE.MeshPhongMaterial({ color: 0x587A5A, flatShading: true }));
  largePyramid.rotation.y = Math.PI / 3;
  largePyramid.scale.set(4, 1, 4);
  largePyramid.castShadow = true;
  group.add(largePyramid);

  // 三角台形（小 × 3）
  const smallPyramidMat = new THREE.MeshPhongMaterial({ color: 0x6E9871, flatShading: true });
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(pyramidGeo, smallPyramidMat);
    m.position.set(rng() * 2 - 1, 0.1, rng() * 2 - 1);
    m.rotation.x = TILT_X;
    m.rotation.y = rng() * Math.PI * 2;
    m.castShadow = true;
    group.add(m);
  }

  // 三角錐（× 6）
  const coneMat = new THREE.MeshPhongMaterial({ color: 0x9EBB6D, flatShading: true });
  for (let i = 0; i < 6; i++) {
    const h = 0.5 * (0.8 + rng() * 0.4);
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.2, h, 3), coneMat);
    m.position.set(rng() * 2 - 1, h / 2, rng() * 2 - 1);
    m.rotation.x = TILT_X;
    m.rotation.y = rng() * Math.PI * 2;
    m.castShadow = true;
    group.add(m);
  }

  return group;
}
