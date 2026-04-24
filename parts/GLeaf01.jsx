// ============================================================
// GLeaf01.jsx — ローポリ 葉っぱ
// my-3d-parts standard
//   - flatShading: true  / castShadow: true（全メッシュ）
//   - THREE.Group パターン
//   - 高さ約4.0ユニット（y: -1.10 〜 2.90）
//   - 外縁11頂点 + 中心点(v8)のファン三角形構成
//   - デフォルトカラー: #62965A
// Usage:
//   import { createGLeaf } from './GLeaf01.jsx';
//   const leaf = createGLeaf();       // デフォルト
//   const leaf = createGLeaf(0.5, 0x4a7c3f);  // scale, color
//   scene.add(leaf);
// ============================================================

import * as THREE from 'three';

export function createGLeaf(scale = 1.0, color = 0x62965A) {
  const group = new THREE.Group();

  // ----------------------------------------------------------
  // 葉身ジオメトリ
  // 外縁: v0(先端) → v1 → v9 → v2 → v3 → v4(付け根)
  //                → v5 → v6 → v10 → v7 → v0（時計回り）
  // v8: 中心点（全三角形がここに集まる）
  // ----------------------------------------------------------
  const verts = new Float32Array([
  //   x       y      z
     0.00,  2.90, -0.40,  // 0:  先端
     0.99,  1.60,  0.15,  // 1:  右上
     1.98,  0.25,  0.27,  // 2:  右中（最大幅）
     0.99, -1.20,  0.15,  // 3:  右下
     0.00, -1.10, -0.40,  // 4:  付け根
    -0.99, -1.20,  0.15,  // 5:  左下
    -1.98,  0.25,  0.27,  // 6:  左中（最大幅）
    -0.99,  1.60,  0.15,  // 7:  左上
     0.00, -0.10, -0.19,  // 8:  中心点
     1.98,  1.40,  0.27,  // 9:  右上中（最大幅の上）
    -1.98,  1.40,  0.27,  // 10: 左上中（最大幅の上）
  ]);

  const idx = [
    // 表面 (CCW)
    0,1,8,   1,9,8,  9,2,8,  2,3,8,  3,4,8,
    4,5,8,  5,6,8,  6,10,8, 10,7,8,  7,0,8,
    // 裏面 (CW)
    0,8,1,   1,8,9,  9,8,2,  2,8,3,  3,8,4,
    4,8,5,  5,8,6,  6,8,10, 10,8,7,  7,8,0,
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const mat = new THREE.MeshPhongMaterial({
    color,
    flatShading: true,
    shininess: 35,
    side: THREE.DoubleSide,
  });

  const blade = new THREE.Mesh(geo, mat);
  blade.scale.setScalar(scale);
  blade.castShadow = true;
  group.add(blade);

  return group;
}
