import * as THREE from 'three';

// ============================================================
// 🗼 パーツライブラリ：灯台01
// 種類：灯台・ローポリ・ミニマル
// 塔体：CylinderGeometry(0.5, 0.75, 4.0, 8)、白 #f5f0e8
// 赤帯：CylinderGeometry(0.54, 0.62, 0.45, 8)、赤 #cc2200
// 灯室：CylinderGeometry(0.55, 0.55, 0.6, 8)、暗 #333333
// 光源球：SphereGeometry(0.28, 6, 4)、発光 #ffcc00
// 屋根：ConeGeometry(0.65, 0.7, 8)、赤 #cc2200
//
// Usage:
//   import { createLighthouse } from './lowpoly_lighthouse01.js'
//   const lighthouse = createLighthouse()
//   scene.add(lighthouse)
// ============================================================

export function createLighthouse() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshPhongMaterial({ color: 0xf5f0e8, flatShading: true });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 4.0, 8), bodyMat);
  body.position.y = 2.0;
  body.castShadow = true;
  group.add(body);

  const stripeMat = new THREE.MeshPhongMaterial({ color: 0xcc2200, flatShading: true });
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.62, 0.45, 8), stripeMat);
  stripe.position.y = 1.8;
  stripe.castShadow = true;
  group.add(stripe);

  const lanternMat = new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true });
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.6, 8), lanternMat);
  lantern.position.y = 4.3;
  lantern.castShadow = true;
  group.add(lantern);

  const glowMat = new THREE.MeshPhongMaterial({
    color: 0xffee88,
    emissive: new THREE.Color(0xffcc00),
    emissiveIntensity: 0.6,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 4), glowMat);
  glow.position.y = 4.3;
  group.add(glow);

  const roofMat = new THREE.MeshPhongMaterial({ color: 0xcc2200, flatShading: true });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.7, 8), roofMat);
  roof.position.y = 4.95;
  roof.castShadow = true;
  group.add(roof);

  const baseMat = new THREE.MeshPhongMaterial({ color: 0xc0b898, flatShading: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.3, 8), baseMat);
  base.position.y = 0.15;
  base.castShadow = true;
  group.add(base);

  return group;
}

export default createLighthouse;
