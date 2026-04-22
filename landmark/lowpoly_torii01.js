import * as THREE from 'three';

// ============================================================
// ⛩️ パーツライブラリ：鳥居01
// 種類：鳥居・ローポリ・ミニマル
// 柱：CylinderGeometry(0.13, 0.17, 3.0, 7) x2、朱色 #cc2200
// 笠木：BoxGeometry(3.4, 0.25, 0.30)
// 島木：BoxGeometry(2.6, 0.14, 0.22)
// 貫：BoxGeometry(2.6, 0.12, 0.18)
//
// Usage:
//   import { createTorii } from './lowpoly_torii01.js'
//   const torii = createTorii()
//   scene.add(torii)
// ============================================================

export function createTorii() {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ color: 0xcc2200, flatShading: true });

  const pillarGeo = new THREE.CylinderGeometry(0.13, 0.17, 3.0, 7);
  [-1.1, 1.1].forEach(x => {
    const m = new THREE.Mesh(pillarGeo, mat);
    m.position.set(x, 1.5, 0);
    m.castShadow = true;
    group.add(m);
  });

  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 0.30), mat);
  kasagi.position.y = 3.12;
  kasagi.castShadow = true;
  group.add(kasagi);

  const shimagi = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.22), mat);
  shimagi.position.y = 2.86;
  shimagi.castShadow = true;
  group.add(shimagi);

  const nuki = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.18), mat);
  nuki.position.y = 2.2;
  nuki.castShadow = true;
  group.add(nuki);

  return group;
}

export default createTorii;
