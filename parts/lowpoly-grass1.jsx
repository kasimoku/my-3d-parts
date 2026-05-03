// ============================================================
// lowpoly-grass1.jsx — ローポリ草地パーツ
// my-3d-parts standard
//   - flatShading: なし（MeshLambertMaterial）
//   - castShadow: true（全メッシュ）
//   - THREE.Group パターン
//   - シード固定乱数（mulberry32, seed=12）
//
// 構成：
//   - 台形（四角錐をy=0.8*0.8でクランプ、底面4×4→上面3.6×3.6、高さ6.4）
//     カラー: #597444 → #ADBA7Bに20%ブレンド = #6a7f56
//   - 三角錐 × 6（ConeGeometry radialSegments=3）
//     底面辺長 0.6〜1.9、高さ 2〜4、xz±1.2、8度傾き
//     カラー: #8ecf3a〜#9fd645 系を#ADBA7Bに20%ブレンド
//
// Usage:
//   import { createLowpolyGrass1 } from './lowpoly-grass1.jsx';
//   const grass = createLowpolyGrass1();
//   scene.add(grass);
// ============================================================

import * as THREE from 'three';

// #ADBA7Bに20%ブレンド
function blend20(hex) {
  const tr = 0xAD, tg = 0xBA, tb = 0x7B;
  const sr = (hex >> 16) & 0xff;
  const sg = (hex >>  8) & 0xff;
  const sb =  hex        & 0xff;
  const r = Math.round(sr + (tr - sr) * 0.2);
  const g = Math.round(sg + (tg - sg) * 0.2);
  const b = Math.round(sb + (tb - sb) * 0.2);
  return (r << 16) | (g << 8) | b;
}

// mulberry32 seeded PRNG
function mulberry32(seed) {
  let s = seed;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return ((s >>> 0) / 0xffffffff);
  };
}

export function createLowpolyGrass1() {
  const group = new THREE.Group();

  // ── 台形（四角錐をy=0.64でクランプ） ──
  // 底面: 4×4（B=2）、クランプy=0.64、上面: 3.6×3.6（topB=1.8）
  const SCALE = 0.8;
  const H = 8 * SCALE;       // 6.4
  const B = 2 * SCALE;       // 1.6
  const CLAMP_Y = 0.8 * SCALE; // 0.64
  const topB = B * (1 - CLAMP_Y / H); // 1.44

  const b0 = [-B, 0,  B], b1 = [ B, 0,  B];
  const b2 = [ B, 0, -B], b3 = [-B, 0, -B];
  const m0 = [-topB, CLAMP_Y,  topB], m1 = [ topB, CLAMP_Y,  topB];
  const m2 = [ topB, CLAMP_Y, -topB], m3 = [-topB, CLAMP_Y, -topB];

  const verts = [];
  const pv = v => verts.push(...v);
  // 上面
  pv(m0); pv(m1); pv(m2); pv(m0); pv(m2); pv(m3);
  // 底面（法線下向き）
  pv(b3); pv(b2); pv(b1); pv(b3); pv(b1); pv(b0);
  // 前面 z+
  pv(b0); pv(b1); pv(m1); pv(b0); pv(m1); pv(m0);
  // 右面 x+
  pv(b1); pv(b2); pv(m2); pv(b1); pv(m2); pv(m1);
  // 背面 z-
  pv(b2); pv(b3); pv(m3); pv(b2); pv(m3); pv(m2);
  // 左面 x-
  pv(b3); pv(b0); pv(m0); pv(b3); pv(m0); pv(m3);

  const trapGeo = new THREE.BufferGeometry();
  trapGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  trapGeo.computeVertexNormals();

  const trapMesh = new THREE.Mesh(
    trapGeo,
    new THREE.MeshLambertMaterial({ color: blend20(0x597444) })
  );
  trapMesh.castShadow = true;
  trapMesh.receiveShadow = true;
  group.add(trapMesh);

  // ── 三角錐 × 6（seed:12） ──
  const rand = mulberry32(12);
  const baseColors = [0x8ecf3a, 0x6db82e, 0xaad84f, 0x5aa025, 0x78c235, 0x9fd645];
  const TILT = 8 * Math.PI / 180;

  for (let i = 0; i < 6; i++) {
    const side = (0.3 + rand() * 0.65) * 2;
    const r = side / Math.sqrt(3);
    const h = 2 + rand() * 2;          // 高さ 2〜4
    const px = (rand() - 0.5) * 2.4;   // xz ±1.2
    const pz = (rand() - 0.5) * 2.4;
    const ry = rand() * Math.PI * 2;
    const axis = Math.floor(rand() * 3); // 0=x, 1=y, 2=z

    const geo = new THREE.ConeGeometry(r, h, 3);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshLambertMaterial({ color: blend20(baseColors[i]) })
    );
    mesh.position.set(px, h / 2, pz);
    mesh.rotation.y = ry;
    if (axis === 0)      mesh.rotation.x = TILT;
    else if (axis === 1) mesh.rotation.y += TILT;
    else                 mesh.rotation.z = TILT;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}
