/**
 * Frame_6-4.jsx
 * 6x4 ローポリフレーム構造
 * - 外周◻︎ 縦柱: x・z ±2, 間隔1
 * - 横梁: y=1〜6, 外周4辺
 * - 全方向間隔1統一
 * Standard: flatShading, castShadow, THREE.Group, height ~6.0 units
 */

import * as THREE from 'three';

export function createFrame64() {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });

  const T = 0.1;  // 棒の太さ
  const H = 6;    // 高さ
  const range = [-2, -1, 0, 1, 2];

  const addMesh = (geo, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    group.add(m);
  };

  // 縦柱: 外周 (x=±2 OR z=±2) の格子点のみ
  const pillarGeo = new THREE.BoxGeometry(T, H, T);
  for (const x of range) {
    for (const z of range) {
      if (Math.abs(x) === 2 || Math.abs(z) === 2) {
        addMesh(pillarGeo, x, H / 2, z);
      }
    }
  }

  // 横梁: y=1〜6, 外周4辺
  for (let y = 1; y <= H; y++) {
    addMesh(new THREE.BoxGeometry(4, T, T),  0, y,  2);  // 前面
    addMesh(new THREE.BoxGeometry(4, T, T),  0, y, -2);  // 後面
    addMesh(new THREE.BoxGeometry(T, T, 4), -2, y,  0);  // 左面
    addMesh(new THREE.BoxGeometry(T, T, 4),  2, y,  0);  // 右面
  }

  return group;
}
