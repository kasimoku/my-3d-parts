import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// 🌳 パーツライブラリ：木１
// 種類：広葉樹・ローポリ・ミニマル
// 幹：CylinderGeometry、高さ1.2、茶色 #6b3f1f
// 葉：IcosahedronGeometry x3層、低分割・不均一配置
// スケール：高さ約3.0単位
// カラー：幹 #6b3f1f、葉 #4a7c3f / #3d6b34 / #5a8f48
// ============================================================

function createTree(scene) {
  const group = new THREE.Group();

  // 幹
  const trunkMat = new THREE.MeshPhongMaterial({ color: 0x6b3f1f, flatShading: true });
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.22, 1.2, 6),
    trunkMat
  );
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  group.add(trunk);

  // 葉っぱ（3層）
  const leafColors = [0x4a7c3f, 0x3d6b34, 0x5a8f48];
  const leafLayers = [
    { y: 1.5, scale: [1.35, 1.1, 1.35] },
    { y: 2.1, scale: [1.05, 0.95, 1.1] },
    { y: 2.6, scale: [0.75, 0.8, 0.75] },
  ];

  leafLayers.forEach((layer, i) => {
    const mat = new THREE.MeshPhongMaterial({ color: leafColors[i], flatShading: true });
    const geo = new THREE.IcosahedronGeometry(0.9, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = layer.y;
    mesh.scale.set(...layer.scale);
    mesh.rotation.y = i * 1.3;
    mesh.rotation.x = i * 0.2;
    mesh.castShadow = true;
    group.add(mesh);
  });

  scene.add(group);
  return group;
}

export default function Tree1() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f4e8);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3, 6),
      new THREE.MeshPhongMaterial({ color: 0xb5d5a0, flatShading: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ライト
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
    sun.position.set(4, 8, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xd0e8ff, 0.4);
    fill.position.set(-3, 3, -2);
    scene.add(fill);

    // 木を生成
    createTree(scene);

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.5, phi = 0.28;
    const R = 5.5, tgt = new THREE.Vector3(0, 1.5, 0);
    const updateCam = () => {
      camera.position.set(
        tgt.x + R * Math.sin(theta) * Math.cos(phi),
        tgt.y + R * Math.sin(phi),
        tgt.z + R * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(tgt);
    };
    updateCam();

    const onMD = e => { dragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onMU = () => { dragging = false; };
    const onMM = e => {
      if (!dragging) return;
      theta -= (e.clientX - prevX) * 0.007;
      phi = Math.max(0.05, Math.min(1.2, phi + (e.clientY - prevY) * 0.007));
      prevX = e.clientX; prevY = e.clientY; updateCam();
    };
    const onTS = e => { dragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; };
    const onTE = () => { dragging = false; };
    const onTM = e => {
      if (!dragging) return;
      theta -= (e.touches[0].clientX - prevX) * 0.007;
      phi = Math.max(0.05, Math.min(1.2, phi + (e.touches[0].clientY - prevY) * 0.007));
      prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; updateCam();
    };

    mount.addEventListener("mousedown", onMD);
    window.addEventListener("mouseup", onMU);
    window.addEventListener("mousemove", onMM);
    mount.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchend", onTE);
    window.addEventListener("touchmove", onTM, { passive: true });

    const onResize = () => {
      const w2 = mount.clientWidth, h2 = mount.clientHeight;
      camera.aspect = w2 / h2; camera.updateProjectionMatrix(); renderer.setSize(w2, h2);
    };
    window.addEventListener("resize", onResize);

    let id;
    const animate = () => { id = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

    return () => {
      cancelAnimationFrame(id);
      mount.removeEventListener("mousedown", onMD);
      window.removeEventListener("mouseup", onMU);
      window.removeEventListener("mousemove", onMM);
      mount.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend", onTE);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
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
        🌳 <strong>木１</strong> — 広葉樹・ローポリ<br />
        <span style={{ color: "#888" }}>ドラッグで回転</span>
      </div>
    </div>
  );
}
