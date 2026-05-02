// ============================================================
// Materis4.jsx — マテリス4：ワイヤー
// 2枚のslab + 白い半球目 + 縦長黒六角形瞳
// マテリアル: 青(0x2244aa) / wireframe:true
// Usage:
//   import { createMateris4 } from './Materis4.jsx';
//   const obj = createMateris4();  // THREE.Group
//   scene.add(obj);
// ============================================================

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const eps = 0.001;

function _createHex(hexGeo, hexMat) {
  const m = new THREE.Mesh(hexGeo, hexMat);
  m.scale.set(0.105, 0.35, 1);
  m.rotation.z = THREE.MathUtils.degToRad(-33);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function createMateris4() {
  const slabMat = new THREE.MeshPhongMaterial({
    color: 0x2244aa, flatShading: true,
    wireframe: true,
  });

  const sphereGeo = new THREE.SphereGeometry(2, 12, 8);
  const sp = sphereGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    if (sp.getZ(i) < 0) sp.setZ(i, 0);
  }
  sp.needsUpdate = true;
  sphereGeo.computeVertexNormals();
  const sphereMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 30 });

  const hexShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (Math.PI * 2 / 6) * i;
    const x = Math.cos(angle) * 2, y = Math.sin(angle) * 2;
    if (i === 0) hexShape.moveTo(x, y); else hexShape.lineTo(x, y);
  }
  hexShape.closePath();
  const hexGeo = new THREE.ExtrudeGeometry(hexShape, { depth: 0.2, bevelEnabled: false });
  const hexMat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true, shininess: 20 });

  const root = new THREE.Group();

  const group1 = new THREE.Group();
  const geo1 = new THREE.BoxGeometry(7, 6, 2, 14, 12, 4);
  const pos1 = geo1.attributes.position;
  for (let i = 0; i < pos1.count; i++) {
    const x = pos1.getX(i), y = pos1.getY(i);
    if (x >= -2.5 - eps && x <= -0.5 + eps && y >= 1.0 - eps) pos1.setY(i, 1.0);
  }
  pos1.needsUpdate = true;
  geo1.computeVertexNormals();
  const slab1 = new THREE.Mesh(geo1, slabMat);
  slab1.position.set(-6, 0, 0);
  slab1.castShadow = true; slab1.receiveShadow = true;
  group1.add(slab1);
  const sphere1 = new THREE.Mesh(sphereGeo, sphereMat);
  sphere1.scale.set(0.5, 0.5, 0.25);
  sphere1.position.set(-4.5, 1, 1.0);
  sphere1.castShadow = true; sphere1.receiveShadow = true;
  group1.add(sphere1);
  const hex1 = _createHex(hexGeo, hexMat);
  hex1.position.set(-4.5, 1, 1.3);
  group1.add(hex1);
  root.add(group1);

  const group2 = new THREE.Group();
  const geo2 = new THREE.BoxGeometry(8, 6, 2, 16, 12, 4);
  const pos2 = geo2.attributes.position;
  for (let i = 0; i < pos2.count; i++) {
    const x = pos2.getX(i), y = pos2.getY(i);
    if (x >= 2.0 - eps && y >= 0.0 - eps && y <= 1.0 + eps) pos2.setX(i, 2.0);
  }
  pos2.needsUpdate = true;
  geo2.computeVertexNormals();
  const slab2 = new THREE.Mesh(geo2, slabMat);
  slab2.position.set(2, 0, 0);
  slab2.castShadow = true; slab2.receiveShadow = true;
  group2.add(slab2);
  const sphere2 = new THREE.Mesh(sphereGeo, sphereMat);
  sphere2.scale.set(0.5, 0.5, 0.25);
  sphere2.position.set(2, 0.5, 1.0);
  sphere2.castShadow = true; sphere2.receiveShadow = true;
  group2.add(sphere2);
  const hex2 = _createHex(hexGeo, hexMat);
  hex2.position.set(2, 0.5, 1.3);
  group2.add(hex2);
  group2.position.set(-3, 6, 0);
  root.add(group2);

  root.position.set(4, 1, 0);
  root.rotation.z = THREE.MathUtils.degToRad(33);
  return root;
}

// ============================================================
// プレビュー用 React コンポーネント
// ============================================================

export default function Materis4Preview() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe4e8ec);
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const sun = new THREE.DirectionalLight(0xfff8f0, 0.5);
    sun.position.set(5, 8, 4); sun.castShadow = true; scene.add(sun);
    scene.add(Object.assign(new THREE.DirectionalLight(0xd0e0ff, 0.5), {
      position: new THREE.Vector3(-4, 2, -3),
    }));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshPhongMaterial({ color: 0xc8ccc8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    scene.add(createMateris4());

    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.3, phi = 0.3, R = 20;
    const tgt = new THREE.Vector3(0, 0, 0);
    const updateCam = () => {
      camera.position.set(
        tgt.x + R * Math.sin(theta) * Math.cos(phi),
        tgt.y + R * Math.sin(phi),
        tgt.z + R * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(tgt);
    };
    updateCam();

    const onDown = e => { dragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onUp = () => { dragging = false; };
    const onMove = e => {
      if (!dragging) return;
      theta -= (e.clientX - prevX) * 0.007;
      phi = Math.max(0.05, Math.min(1.2, phi + (e.clientY - prevY) * 0.007));
      prevX = e.clientX; prevY = e.clientY; updateCam();
    };
    const onWheel = e => { R = Math.max(5, Math.min(60, R + e.deltaY * 0.02)); updateCam(); };
    const onResize = () => {
      const w2 = mount.clientWidth, h2 = mount.clientHeight;
      camera.aspect = w2 / h2; camera.updateProjectionMatrix(); renderer.setSize(w2, h2);
    };

    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('resize', onResize);

    let animId;
    const animate = () => { animId = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', top: 12, left: 12,
        background: 'rgba(255,255,255,0.85)', borderRadius: 10,
        padding: '8px 14px', fontSize: 12, color: '#444', lineHeight: 1.7,
      }}>
        🕸️ <strong>Materis4</strong> — ワイヤー<br />
        <span style={{ color: '#888' }}>ドラッグで回転 / スクロールでズーム</span>
      </div>
    </div>
  );
}
