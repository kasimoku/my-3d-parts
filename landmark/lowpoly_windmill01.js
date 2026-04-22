import * as THREE from 'three';

// ============================================================
// 🌬️ パーツライブラリ：風車01
// 種類：風車・ローポリ・ミニマル・羽根回転あり
// 塔体：CylinderGeometry(0.4, 0.7, 3.5, 8)、石灰 #d4c4a0
// 屋根：ConeGeometry(0.55, 0.7, 8)、木茶 #8b6340
// 羽根：BoxGeometry(0.18, 1.5, 0.07) x4、ハブ付き
//
// Usage:
//   import { createWindmill } from './lowpoly_windmill01.js'
//   const { group, update } = createWindmill()
//   scene.add(group)
//   // アニメーションループ内で:
//   update()
// ============================================================

export function createWindmill() {
  const group = new THREE.Group();

  const towerMat = new THREE.MeshPhongMaterial({ color: 0xd4c4a0, flatShading: true });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 3.5, 8), towerMat);
  tower.position.y = 1.75;
  tower.castShadow = true;
  group.add(tower);

  const capMat = new THREE.MeshPhongMaterial({ color: 0x8b6340, flatShading: true });
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.7, 8), capMat);
  cap.position.y = 3.85;
  cap.castShadow = true;
  group.add(cap);

  const baseMat = new THREE.MeshPhongMaterial({ color: 0xb8a880, flatShading: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.25, 8), baseMat);
  base.position.y = 0.12;
  group.add(base);

  const bladeGroup = new THREE.Group();
  bladeGroup.position.set(0, 3.1, 0.45);

  const hubMat = new THREE.MeshPhongMaterial({ color: 0x6b4f2a, flatShading: true });
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), hubMat);
  bladeGroup.add(hub);

  const bladeMat = new THREE.MeshPhongMaterial({ color: 0xc4a060, flatShading: true });
  for (let i = 0; i < 4; i++) {
    const holder = new THREE.Group();
    holder.rotation.z = (i * Math.PI) / 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.5, 0.07), bladeMat);
    blade.position.y = 0.75;
    blade.castShadow = true;
    holder.add(blade);
    bladeGroup.add(holder);
  }

  group.add(bladeGroup);

  return {
    group,
    update: () => { bladeGroup.rotation.z += 0.008; },
  };
}

export default createWindmill;
