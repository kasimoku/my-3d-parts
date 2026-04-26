// ============================================================
// DeadTree01.jsx — ローポリ 枯れ木（葉っぱ付き）
// my-3d-parts standard
//   - flatShading: true / castShadow: true（全メッシュ）
//   - THREE.Group パターン
//   - 幹: y=0〜3.5（y=3.0で鋭利に細まる）
//   - 主枝6本（60°均等配置）+ 小枝12本
//   - GLeaf01の葉を12枚バラバラに内包
//   - 木カラー: #707050 / 葉カラー: #62965A系
// Usage:
//   import { createDeadTree } from './DeadTree01.jsx';
//   const tree = createDeadTree();        // デフォルト
//   const tree = createDeadTree(0.5);     // scale指定
//   scene.add(tree);
// ============================================================

import * as THREE from 'three';

// ── 内部ヘルパー ─────────────────────────────────────────────

const WOOD = 0x707050;

// 四角柱1本（ピボット=根元）
function makeBranch(length, rTop, rBot) {
  const geo = new THREE.CylinderGeometry(rTop, rBot, length, 4);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo,
    new THREE.MeshPhongMaterial({ color: WOOD, flatShading: true }));
  mesh.castShadow = true;
  mesh.position.y = length / 2;
  const g = new THREE.Group();
  g.add(mesh);
  return g;
}

// 子枝を親の指定y位置にアタッチ
function attach(parent, parentLength, child, rotZ, rotY) {
  child.position.y = parentLength;
  child.rotation.y = rotY ?? 0;
  child.rotation.z = rotZ ?? 0;
  parent.add(child);
}

// 主枝を幹の指定高さにアタッチ
function addMainBranch(parent, attachY, rotZ, rotY, len, rTop, rBot) {
  const pivot = new THREE.Group();
  pivot.position.y = attachY;
  pivot.rotation.y = rotY;
  pivot.rotation.z = rotZ;
  const b = makeBranch(len, rTop, rBot);
  pivot.add(b);
  parent.add(pivot);
  return { pivot, branch: b, len };
}

// GLeaf01の葉ジオメトリ（インライン）
function createGLeaf(scale = 1.0, color = 0x62965A) {
  const verts = new Float32Array([
     0.00,  2.90, -0.40,
     0.99,  1.60,  0.15,
     1.98,  0.25,  0.27,
     0.99, -1.20,  0.15,
     0.00, -1.10, -0.40,
    -0.99, -1.20,  0.15,
    -1.98,  0.25,  0.27,
    -0.99,  1.60,  0.15,
     0.00, -0.10, -0.19,
     1.98,  1.40,  0.27,
    -1.98,  1.40,  0.27,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex([
    0,1,8, 1,9,8, 9,2,8, 2,3,8, 3,4,8,
    4,5,8, 5,6,8, 6,10,8, 10,7,8, 7,0,8,
    0,8,1, 1,8,9, 9,8,2, 2,8,3, 3,8,4,
    4,8,5, 5,8,6, 6,8,10, 10,8,7, 7,8,0,
  ]);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    color, flatShading: true, shininess: 35, side: THREE.DoubleSide,
  }));
  mesh.castShadow = true;
  const g = new THREE.Group();
  g.add(mesh);
  g.scale.setScalar(scale);
  return g;
}

// ── createDeadTree ───────────────────────────────────────────

export function createDeadTree(scale = 1.0) {
  const group = new THREE.Group();

  // 幹（下部: y=0〜3.0 / 上部: y=3.0〜3.5 鋭利に細まる）
  const trunk = new THREE.Group();
  const trunkLow  = makeBranch(3.0, 0.18, 0.26);
  const trunkHigh = makeBranch(0.5, 0.04, 0.18);
  trunkHigh.position.y = 3.0;
  trunk.add(trunkLow);
  trunk.add(trunkHigh);

  // 主枝（60°均等・6本）
  const A = addMainBranch(trunk, 1.3,  1.25,  0.00,  2.2, 0.05, 0.12);
  const B = addMainBranch(trunk, 1.8, -1.25,  1.05,  1.9, 0.05, 0.11);
  const C = addMainBranch(trunk, 2.2,  1.30,  2.09,  1.6, 0.04, 0.10);
  const D = addMainBranch(trunk, 2.7, -1.35,  3.14,  1.3, 0.03, 0.08);
  const E = addMainBranch(trunk, 3.1,  1.40,  4.19,  1.0, 0.03, 0.07);
  const F = addMainBranch(trunk, 2.5,  1.30,  5.24,  1.4, 0.04, 0.09);

  // 小枝
  const a1 = makeBranch(0.9,  0.02, 0.05); attach(A.branch, A.len,        a1,  0.5,  1.2);
  const a2 = makeBranch(1.0,  0.02, 0.05); attach(A.branch, A.len * 0.6,  a2, -0.4,  3.5);
  const b1 = makeBranch(0.8,  0.02, 0.05); attach(B.branch, B.len,        b1,  0.55, 0.8);
  const b2 = makeBranch(0.75, 0.02, 0.04); attach(B.branch, B.len * 0.7,  b2, -0.5,  4.2);
  const c1 = makeBranch(0.85, 0.02, 0.05); attach(C.branch, C.len,        c1,  0.6,  2.0);
  const c2 = makeBranch(0.7,  0.02, 0.04); attach(C.branch, C.len * 0.55, c2, -0.45, 5.0);
  const d1 = makeBranch(0.7,  0.02, 0.04); attach(D.branch, D.len,        d1,  0.7,  1.5);
  const e1 = makeBranch(0.6,  0.015,0.03); attach(E.branch, E.len,        e1,  0.6,  0.5);
  const e2 = makeBranch(0.55, 0.015,0.03); attach(E.branch, E.len * 0.6,  e2, -0.5,  3.0);
  const f1 = makeBranch(0.8,  0.02, 0.04); attach(F.branch, F.len,        f1,  0.6,  1.0);
  const f2 = makeBranch(0.65, 0.02, 0.04); attach(F.branch, F.len * 0.6,  f2, -0.5,  3.8);

  group.add(trunk);

  // 葉（GLeaf01）12枚 — y=1.8〜3.0 / x,z=±1.2
  const leafColors = [0x62965A, 0x5a8c45, 0x4a7c3f, 0x789e3a, 0x6ba040];
  const leafData = [
    // [x,     y,    z,    sc,   rx,   ry,   rz  ]
    [  1.1,  2.1,  0.5,  0.17,  0.4,  0.5,  0.3 ],
    [ -1.0,  1.8, -0.9,  0.16, -0.3,  1.2, -0.2 ],
    [  1.2,  3.0, -0.4,  0.18,  0.2,  2.0,  0.4 ],
    [ -1.2,  2.5,  1.0,  0.17, -0.5,  3.5, -0.3 ],
    [  0.5,  1.9,  1.2,  0.16,  0.3,  0.8,  0.1 ],
    [ -0.9,  3.0, -1.2,  0.18, -0.4,  4.0, -0.4 ],
    [  1.2,  2.8,  0.7,  0.17,  0.5,  1.5,  0.2 ],
    [ -0.7,  2.0,  1.2,  0.16,  0.2,  2.5,  0.3 ],
    [  1.2,  2.0, -1.0,  0.17, -0.3,  5.0, -0.2 ],
    [ -1.2,  2.2,  0.3,  0.18,  0.4,  1.0,  0.4 ],
    [  0.3,  2.8, -1.2,  0.16, -0.2,  3.8, -0.1 ],
    [ -1.2,  2.2,  1.1,  0.17,  0.3,  0.3,  0.3 ],
  ];

  leafData.forEach(([x, y, z, sc, rx, ry, rz]) => {
    const leaf = createGLeaf(sc, leafColors[Math.floor(Math.random() * leafColors.length)]);
    leaf.position.set(x, y, z);
    leaf.rotation.set(rx, ry, rz);
    group.add(leaf);
  });

  group.scale.setScalar(scale);
  return group;
}
