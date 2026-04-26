// ============================================================
// Forest1Preview.jsx — forest1 プレビュー用 React コンポーネント
// React 環境でのみ使用。createForest1 の動作確認用。
// ============================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createForest1 } from "./forest1.jsx";

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
