// ============================================================
// TORCH.jsx
// LANDMARK: TORCH — 惑星coccolithのランドマーク #01
// Part of: my-3d-parts
//
// Usage:
//   import { createTORCH } from './TORCH.jsx'
//   const torch = createTORCH()
//   scene.add(torch)
//
// Structure:
//   TORCH (Group, rotation.x = -18deg, position.y = 7.5)
//     ├─ TI  : 三角錐ベース         color #5C1753  pos(0, 0.5, 0.8)
//     ├─ TS1 : 上部カット x1.1      color #8899bb  clipY=-3  (上残し)
//     ├─ TS2 : 下部カット x1.1      color #8899bb  clipY=-3.5(下残し)
//     └─ TF  : 下部カット x1.1 発光 color #E4E4D6  pos(0, 8, 2.5)
//
// Style:
//   flatShading: true / castShadow: true / height: ~16 units
// ============================================================

import * as THREE from 'three';

// -----------------------------------------------
// ジオメトリをy平面でクリップしてキャップも返す
// keepBelow=true  → y <= clipY を残す
// keepBelow=false → y >= clipY を残す
// -----------------------------------------------
function clipGeoAtY(geo, clipY, keepBelow) {
  const pos = geo.attributes.position;
  const outVerts = [];
  const capPts = [];

  for (let i = 0; i < pos.count; i += 3) {
    const vs = [0, 1, 2].map(j => new THREE.Vector3(
      pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j)
    ));
    const inside = vs.map(v => keepBelow ? v.y <= clipY : v.y >= clipY);
    const inCount = inside.filter(Boolean).length;
    if (inCount === 0) continue;

    if (inCount === 3) {
      vs.forEach(v => outVerts.push(v.x, v.y, v.z));
      continue;
    }

    const poly = [];
    for (let j = 0; j < 3; j++) {
      const a = vs[j], b = vs[(j + 1) % 3];
      if (inside[j]) poly.push(a.clone());
      if (inside[j] !== inside[(j + 1) % 3]) {
        const t = (clipY - a.y) / (b.y - a.y);
        const p = new THREE.Vector3(
          a.x + t * (b.x - a.x), clipY, a.z + t * (b.z - a.z)
        );
        poly.push(p);
        capPts.push(p.clone());
      }
    }

    for (let j = 1; j < poly.length - 1; j++) {
      outVerts.push(poly[0].x, poly[0].y, poly[0].z);
      outVerts.push(poly[j].x, poly[j].y, poly[j].z);
      outVerts.push(poly[j + 1].x, poly[j + 1].y, poly[j + 1].z);
    }
  }

  const clippedGeo = new THREE.BufferGeometry();
  clippedGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(outVerts), 3));
  clippedGeo.computeVertexNormals();

  let capGeo = null;
  if (capPts.length >= 3) {
    const center = new THREE.Vector3();
    capPts.forEach(p => center.add(p));
    center.divideScalar(capPts.length);

    capPts.sort((a, b) =>
      Math.atan2(a.z - center.z, a.x - center.x) -
      Math.atan2(b.z - center.z, b.x - center.x)
    );
    const unique = [capPts[0]];
    for (let i = 1; i < capPts.length; i++) {
      if (unique[unique.length - 1].distanceTo(capPts[i]) > 0.001) unique.push(capPts[i]);
    }

    const capVerts = [];
    for (let i = 0; i < unique.length; i++) {
      const next = unique[(i + 1) % unique.length];
      capVerts.push(center.x, center.y, center.z);
      capVerts.push(unique[i].x, unique[i].y, unique[i].z);
      capVerts.push(next.x, next.y, next.z);
    }
    capGeo = new THREE.BufferGeometry();
    capGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(capVerts), 3));
    capGeo.computeVertexNormals();
  }

  return { clippedGeo, capGeo };
}

// -----------------------------------------------
// ベース三角錐ジオメトリ（+24度焼き込み済み）
// 天面: 底辺6・高さ4の二等辺三角形（xz平面）
// 先端: y=-10
// -----------------------------------------------
function buildBaseGeo(scale = 1) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -3,  0,  0,   3,  0,  0,   0,  0, -4,  // Top face
    -3,  0,  0,   0,-10,  0,   3,  0,  0,  // Front
     3,  0,  0,   0,-10,  0,   0,  0, -4,  // Right
     0,  0, -4,   0,-10,  0,  -3,  0,  0,  // Back-left
  ]), 3));
  g.applyMatrix4(new THREE.Matrix4().makeRotationX(24 * Math.PI / 180));
  if (scale !== 1) g.applyMatrix4(new THREE.Matrix4().makeScale(scale, scale, scale));
  g.computeVertexNormals();
  return g;
}

// -----------------------------------------------
// メッシュ+エッジをGroupにまとめるヘルパー
// -----------------------------------------------
function makePartGroup(geo, mat, capGeo) {
  const group = new THREE.Group();

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  group.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xaabbdd })
  ));

  if (capGeo) {
    const cap = new THREE.Mesh(capGeo, mat.clone());
    cap.castShadow = true;
    group.add(cap);
  }

  return group;
}

// -----------------------------------------------
// createTORCH — メインエクスポート関数
// -----------------------------------------------
export function createTORCH() {
  const TORCH = new THREE.Group();

  // --- TI: ベース三角錐 ---
  const TI = makePartGroup(
    buildBaseGeo(1.0),
    new THREE.MeshStandardMaterial({
      color: 0x5C1753,
      flatShading: true,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    }),
    null
  );
  TI.position.set(0, 0.5, 0.8);

  // --- TS1: y >= -3 を残す（上部カット）scale 1.1 ---
  const { clippedGeo: geoTS1, capGeo: capTS1 } = clipGeoAtY(buildBaseGeo(1.1), -3, false);
  const TS1 = makePartGroup(
    geoTS1,
    new THREE.MeshStandardMaterial({
      color: 0x8899bb,
      flatShading: true,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    }),
    capTS1
  );

  // --- TS2: y <= -3.5 を残す（下部＝先端カット）scale 1.1 ---
  const { clippedGeo: geoTS2, capGeo: capTS2 } = clipGeoAtY(buildBaseGeo(1.1), -3.5, true);
  const TS2 = makePartGroup(
    geoTS2,
    new THREE.MeshStandardMaterial({
      color: 0x8899bb,
      flatShading: true,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    }),
    capTS2
  );

  // --- TF: TS2と同形状・発光 / pos(0, 8, 2.5) ---
  const { clippedGeo: geoTF, capGeo: capTF } = clipGeoAtY(buildBaseGeo(1.1), -3.5, true);
  const TF = makePartGroup(
    geoTF,
    new THREE.MeshStandardMaterial({
      color: 0xE4E4D6,
      emissive: new THREE.Color(0xE4E4D6),
      emissiveIntensity: 0.6,
      flatShading: true,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    }),
    capTF
  );
  TF.position.set(0, 8, 2.5);

  TORCH.add(TI);
  TORCH.add(TS1);
  TORCH.add(TS2);
  TORCH.add(TF);

  TORCH.rotation.x = -18 * Math.PI / 180;
  TORCH.position.y = 7.5;

  return TORCH;
}

export default createTORCH;
