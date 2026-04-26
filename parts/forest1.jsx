// ============================================================
// forest1.jsx — ローポリ球群の森
// my-3d-parts standard
//   - flatShading: true / castShadow: true（全メッシュ）
//   - THREE.Group パターン
//   - シード固定乱数（mulberry32, seed=42）
//   - 球3種 × 計16個 + 半透明球4個 + 細柱（球あたり2〜3本）
//   - 球カラー: #3CAD90 / #53AE81 / #4A967F
//   - 柱カラー: #80836A
// Usage:
//   import { createForest1 } from './forest1.jsx';
//   const forest = createForest1();
//   scene.add(forest);
// ============================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";

// シード固定乱数
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function createForest1() {
  const group = new THREE.Group();
  const rand = mulberry32(42);

  const ballGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const scaleY = 1.0 / 1.2;

  // 球3種
  const ballTypes = [
    { color: 0x3CAD90, sx: 2.0 * 1.2, sy: scaleY * 0.6, sz: 2.0 * 1.2, count: 6, range: 6.0, opacity: 1.0 },
    { color: 0x53AE81, sx: 1.6 * 1.2, sy: scaleY * 0.6, sz: 1.6 * 1.2, count: 6, range: 6.0, opacity: 1.0 },
    { color: 0x4A967F, sx: 1.2 * 1.2, sy: 1.0 * 0.6,   sz: 1.2 * 1.2, count: 4, range: 5.0, opacity: 1.0 },
  ];

  const ballPositions = [];
  ballTypes.forEach(({ color, sx, sy, sz, count, range, opacity }) => {
    const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 30, transparent: opacity < 1.0, opacity });
    for (let i = 0; i < count; i++) {
      const ball = new THREE.Mesh(ballGeo, mat);
      const px = (rand() * 2 - 1) * range;
      const pz = (rand() * 2 - 1) * range;
      ball.position.set(px, (rand() * 2 - 1) * 0.5 + 1.5, pz);
      ball.scale.set(sx, sy, sz);
      ball.rotation.y = rand() * Math.PI * 2;
      ball.castShadow = true;
      group.add(ball);
      ballPositions.push({ x: px, z: pz });
    }
  });

  // 半透明球（固定位置）
  const transmat = new THREE.MeshPhongMaterial({ color: 0x4A967F, flatShading: true, shininess: 30, transparent: true, opacity: 0.7 });
  [{ x: 2, z: 2 }, { x: -2, z: -2 }, { x: 2, z: -2 }, { x: -2, z: 2 }].forEach(({ x, z }) => {
    const ball = new THREE.Mesh(ballGeo, transmat);
    ball.position.set(x, (rand() * 2 - 1) * 0.5 + 1.5, z);
    ball.scale.set(1.2 * 1.2, 1.0 * 0.6, 1.2 * 1.2);
    ball.rotation.y = rand() * Math.PI * 2;
    ball.castShadow = true;
    group.add(ball);
    ballPositions.push({ x, z });
  });

  // 細柱（球の下に2〜3本）
  const pillarGeo = new THREE.BoxGeometry(0.1, 2.0, 0.1);
  const pillarMat = new THREE.MeshPhongMaterial({ color: 0x80836A, flatShading: true });
  ballPositions.forEach(({ x, z }) => {
    const count = 2 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(
        x + (rand() * 2 - 1) * 1.2,
        0.5,
        z + (rand() * 2 - 1) * 1.2
      );
      pillar.rotation.y = rand() * Math.PI * 2;
      pillar.castShadow = true;
      group.add(pillar);
    }
  });

  return group;
}

// ============================================================
// プレビュー用 React コンポーネント
// ============================================================
export default function Forest1Preview() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe4e8ec);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 200);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshPhongMaterial({ color: 0xc8ccc8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // ライト
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const sun = new THREE.DirectionalLight(0xfff8f0, 0.5);
    sun.position.set(5, 8, 4);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(Object.assign(new THREE.DirectionalLight(0xd0e0ff, 0.5), { position: new THREE.Vector3(-4, 2, -3) }));

    // 軸ドット
    const posV = [], negV = [];
    for (let i = -10; i <= 10; i++) {
      const a = i < 0 ? negV : posV;
      a.push(i, 0, 0, 0, i, 0, 0, 0, i);
    }
    const mkPts = (verts, color) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      return new THREE.Points(g, new THREE.PointsMaterial({ color, size: 4, sizeAttenuation: false }));
    };
    scene.add(mkPts(posV, 0x000000));
    scene.add(mkPts(negV, 0x5070D0));

    // forest1 パーツ追加
    scene.add(createForest1());

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.5, phi = 0.3, R = 18.0;
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
    const onWheel = e => { R = Math.max(2, Math.min(40, R + e.deltaY * 0.02)); updateCam(); };

    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    let animId;
    const animate = () => { animId = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <div style={{
        position: "absolute", top: 12, left: 12,
        background: "rgba(255,255,255,0.85)", borderRadius: 10,
        padding: "8px 14px", fontSize: 12, color: "#444", lineHeight: 1.7
      }}>
        🌳 <strong>forest1</strong> — ローポリ球群の森<br />
        <span style={{ color: "#888" }}>ドラッグで回転 / スクロールでズーム</span>
      </div>
    </div>
  );
}
