/**
 * Materis.js
 * しあんのThree.js マテリアルライブラリ
 *
 * 使い方:
 *   import { createMateris, applyMaterisColors } from './Materis.js';
 *
 *   const mat = createMateris(1);   // ざらざら
 *   mesh.material = mat;
 *
 *   // 5番（頂点カラー）を使う場合は色も仕込む
 *   const mat5 = createMateris(5);
 *   applyMaterisColors(geometry, yMin, yMax);
 *   mesh.material = mat5;
 *
 * ラインナップ:
 *   1: 🪨 ざらざら   — グレー / shininess:2  / specular暗め
 *   2: 🪞 ツルツル   — ダークグレー / shininess:120 / specular明るめ
 *   3: 💚 ライム発光 — emissive(0x88ff22) / emissiveIntensity:0.6
 *   4: 🕸️ ワイヤー   — 青 / wireframe:true
 *   5: 🎨 頂点カラー — vertexColors:true / ツヤツヤ / 赤↔青グラデーション
 *      └ applyMaterisColors(geo, yMin, yMax) でジオメトリに色を仕込んでから使う
 */

import * as THREE from 'three';

// ── マテリアル定義 ──────────────────────────────────────────

const _cache = {};

const _defs = {
  1: () => new THREE.MeshPhongMaterial({
    color: 0x9a9a9a,
    flatShading: true,
    shininess: 2,
    specular: 0x222222,
  }),

  2: () => new THREE.MeshPhongMaterial({
    color: 0x333333,
    flatShading: true,
    shininess: 120,
    specular: 0xaaaaaa,
  }),

  3: () => new THREE.MeshPhongMaterial({
    color: 0x224422,
    flatShading: true,
    shininess: 10,
    emissive: new THREE.Color(0x88ff22),
    emissiveIntensity: 0.6,
  }),

  4: () => new THREE.MeshPhongMaterial({
    color: 0x2244aa,
    flatShading: true,
    wireframe: true,
  }),

  5: () => new THREE.MeshPhongMaterial({
    vertexColors: true,
    flatShading: true,
    shininess: 120,
    specular: 0x999999,
  }),
};

/**
 * マテリスを呼び出す
 * @param {number} n - 1〜5
 * @returns {THREE.MeshPhongMaterial}
 */
export function createMateris(n) {
  if (!_defs[n]) {
    console.warn(`Materis: ${n}番は存在しません。1〜5を指定してください。`);
    return new THREE.MeshPhongMaterial({ color: 0xff00ff }); // ピンク=エラー色
  }
  // インスタンスを毎回新しく返す（複数メッシュで独立して使えるように）
  return _defs[n]();
}

/**
 * 頂点カラーを仕込む（5番専用）
 * y軸の高さで下=青、上=赤のグラデーションを付与する
 *
 * @param {THREE.BufferGeometry} geo
 * @param {number} yMin - 青になるy座標（板の下端など）
 * @param {number} yMax - 赤になるy座標（板の上端など）
 */
export function applyMaterisColors(geo, yMin, yMax) {
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const colorTop    = new THREE.Color(0xff2222); // 赤
  const colorBottom = new THREE.Color(0x2244ff); // 青
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, Math.min(1, (pos.getY(i) - yMin) / (yMax - yMin)));
    c.lerpColors(colorBottom, colorTop, t);
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}
