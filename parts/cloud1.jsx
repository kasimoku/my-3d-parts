// ============================================================
// cloud1.jsx — ローポリ白球群の雲
// my-3d-parts standard
//   - flatShading: true / castShadow: true（全メッシュ）
//   - THREE.Group パターン
//   - シード固定乱数（mulberry32, seed=7）
//   - 白球4種 計24個（opacity: 0.8）
//     種類1: 半径1.2〜2.0 × 6個（xz±1.5, y -1〜6）
//     種類2: 半径2.2〜2.6 × 3個（xz±1.0, y 0〜2）
//     種類3: 半径0.6〜1.0 × 6個（xz±2.0, y 2〜7）
//     種類4: 半径0.6〜1.2 × 8個（xz±4.0, y=0）
//     固定球: 半径1.0, position(0, 6.5, -1)
// Usage:
//   import { createCloud1 } from './cloud1.jsx';
//   const cloud = createCloud1();
//   scene.add(cloud);
// ============================================================

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

export function createCloud1() {
  const group = new THREE.Group();
  const rand = mulberry32(7);

  const whiteMat = new THREE.MeshPhongMaterial({
    color: 0xffffff, flatShading: true, shininess: 60,
    transparent: true, opacity: 0.8
  });

  // 種類1：半径1.2〜2.0 × 6個（xz±1.5, y -1〜6）
  for (let i = 0; i < 6; i++) {
    const r = 1.2 + rand() * 0.8;
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), whiteMat);
    ball.position.set(
      (rand() * 2 - 1) * 1.5,
      rand() * 7.0 - 1.0,
      (rand() * 2 - 1) * 1.5
    );
    ball.rotation.y = rand() * Math.PI * 2;
    ball.castShadow = true;
    group.add(ball);
  }

  // 種類2：半径2.2〜2.6 × 3個（xz±1.0, y 0〜2）
  for (let i = 0; i < 3; i++) {
    const r = 2.2 + rand() * 0.4;
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), whiteMat);
    ball.position.set(
      (rand() * 2 - 1) * 1.0,
      (rand() * 2 - 1) * 1.0 + 1.0,
      (rand() * 2 - 1) * 1.0
    );
    ball.rotation.y = rand() * Math.PI * 2;
    ball.castShadow = true;
    group.add(ball);
  }

  // 種類3：半径0.6〜1.0 × 6個（xz±2.0, y 2〜7）
  for (let i = 0; i < 6; i++) {
    const r = 0.6 + rand() * 0.4;
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), whiteMat);
    ball.position.set(
      (rand() * 2 - 1) * 2.0,
      rand() * 5.0 + 2.0,
      (rand() * 2 - 1) * 2.0
    );
    ball.rotation.y = rand() * Math.PI * 2;
    ball.castShadow = true;
    group.add(ball);
  }

  // 種類4：半径0.6〜1.2 × 8個（xz±4.0, y=0）
  for (let i = 0; i < 8; i++) {
    const r = 0.6 + rand() * 0.6;
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), whiteMat);
    ball.position.set(
      (rand() * 2 - 1) * 4.0,
      0,
      (rand() * 2 - 1) * 4.0
    );
    ball.rotation.y = rand() * Math.PI * 2;
    ball.castShadow = true;
    group.add(ball);
  }

  // 固定球：半径1.0、position(0, 6.5, -1)
  const fixedBall = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 1), whiteMat);
  fixedBall.position.set(0, 6.5, -1);
  fixedBall.castShadow = true;
  group.add(fixedBall);

  return group;
}

// ============================================================
// プレビュー用 React コンポーネント
// ============================================================
import { useEffect, useRef } from "react";

export default function Cloud1Preview() {
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
    const fill = new THREE.DirectionalLight(0xd0e0ff, 0.5);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

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

    scene.add(createCloud1());

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
        ☁️ <strong>cloud1</strong> — ローポリ白球群の雲<br />
        <span style={{ color: "#888" }}>ドラッグで回転 / スクロールでズーム</span>
      </div>
    </div>
  );
}
