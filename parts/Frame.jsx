/**
 * Frame.jsx
 * ローポリ格子フレーム — 小・中・大の3サイズ
 *
 * 使い方:
 *   import { createFrameS, createFrameM, createFrameL } from './Frame.jsx';
 *
 *   const frame = createFrameS();       // 小 (8-4)
 *   frame.position.set(0, 0, 0);
 *   scene.add(frame);
 *
 * サイズ定義:
 *   S (小) createFrameS() — halfSize=2, height=8
 *   M (中) createFrameM() — halfSize=3, height=10
 *   L (大) createFrameL() — halfSize=4, height=18
 *
 * Standard: flatShading:true, castShadow:true, THREE.Group
 */

import * as THREE from 'three';

function createFrame(halfSize, height) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true });
  const T = 0.1;
  const range = [];
  for (let i = -halfSize; i <= halfSize; i++) range.push(i);

  const addMesh = (geo, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    group.add(m);
  };

  // 縦柱: 外周 (x=±halfSize OR z=±halfSize) の格子点のみ
  const pillarGeo = new THREE.BoxGeometry(T, height, T);
  for (const x of range) {
    for (const z of range) {
      if (Math.abs(x) === halfSize || Math.abs(z) === halfSize) {
        addMesh(pillarGeo, x, height / 2, z);
      }
    }
  }

  // 横梁: y=1〜height 間隔1、外周4辺
  const span = halfSize * 2;
  for (let y = 1; y <= height; y++) {
    addMesh(new THREE.BoxGeometry(span, T, T),  0, y,  halfSize); // 前面
    addMesh(new THREE.BoxGeometry(span, T, T),  0, y, -halfSize); // 後面
    addMesh(new THREE.BoxGeometry(T, T, span), -halfSize, y,  0); // 左面
    addMesh(new THREE.BoxGeometry(T, T, span),  halfSize, y,  0); // 右面
  }

  return group;
}

export const createFrameS = () => createFrame(2, 8);   // 小
export const createFrameM = () => createFrame(3, 10);  // 中
export const createFrameL = () => createFrame(4, 18);  // 大
