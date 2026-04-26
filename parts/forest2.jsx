import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// 🌳🌲 パーツライブラリ：forest1
// 種類：混成林・ローポリ・ミニマル
// 広葉樹（BLTree系）+ 針葉樹（CTree系）をランダム配置
// 地面：HexagonGeometry 半径10、グリーン系
// 木の本数：広葉樹6本、針葉樹7本、計13本
// スケール：ランダムに0.75〜1.3倍でばらつき付与
// カラー：夕方気味の自然光設定
// ============================================================

function createBLTree(scene, x, z, scale = 1) {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshPhongMaterial({ color: 0x6b3f1f, flatShading: true });
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.22, 1.2, 6),
    trunkMat
  );
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  group.add(trunk);

  const leafColors = [0x4a7c3f, 0x3d6b34, 0x5a8f48];
  const leafLayers = [
    { y: 1.5, scale: [1.35, 1.1, 1.35] },
    { y: 2.1, scale: [1.05, 0.95, 1.1] },
    { y: 2.6, scale: [0.75, 0.8, 0.75] },
  ];

  leafLayers.forEach((layer, i) => {
    const mat = new THREE.MeshPhongMaterial({ color: leafColors[i], flatShading: true });
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), mat);
    mesh.position.y = layer.y;
    mesh.scale.set(...layer.scale);
    mesh.rotation.y = i * 1.3;
    mesh.rotation.x = i * 0.2;
    mesh.castShadow = true;
    group.add(mesh);
  });

  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  group.rotation.y = Math.random() * Math.PI * 2;
  scene.add(group);
  return group;
}

function createCTree(scene, x, z, scale = 1) {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshPhongMaterial({ color: 0x5c3310, flatShading: true });
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.18, 0.8, 6),
    trunkMat
  );
  trunk.position.y = 0.4;
  trunk.castShadow = true;
  group.add(trunk);

  const leafLayers = [
    { y: 1.0, r: 1.05, h: 1.1 },
    { y: 1.7, r: 0.78, h: 1.0 },
    { y: 2.35, r: 0.52, h: 0.9 },
  ];

  leafLayers.forEach((layer, i) => {
    const mat = new THREE.MeshPhongMaterial({ color: 0x1e3d1a, flatShading: true });
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(layer.r, layer.h, 7), mat);
    mesh.position.y = layer.y;
    mesh.rotation.y = i * 0.45;
    mesh.castShadow = true;
    group.add(mesh);
  });

  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  group.rotation.y = Math.random() * Math.PI * 2;
  scene.add(group);
  return group;
}

const TREES = [
  // 広葉樹 [x, z, scale]
  { type: "BL", x: -3.5, z: -2.0, s: 1.2 },
  { type: "BL", x:  2.8, z: -3.5, s: 1.0 },
  { type: "BL", x: -1.2, z:  3.8, s: 1.1 },
  { type: "BL", x:  4.5, z:  1.5, s: 0.85 },
  { type: "BL", x: -5.0, z:  1.2, s: 1.3 },
  { type: "BL", x:  1.0, z: -5.5, s: 0.9 },
  // 針葉樹 [x, z, scale]
  { type: "C",  x:  0.5, z:  1.0, s: 1.15 },
  { type: "C",  x: -2.5, z: -4.5, s: 1.0  },
  { type: "C",  x:  3.8, z: -1.0, s: 1.25 },
  { type: "C",  x: -4.2, z:  3.5, s: 0.8  },
  { type: "C",  x:  5.5, z:  4.0, s: 1.0  },
  { type: "C",  x: -0.5, z: -2.5, s: 0.95 },
  { type: "C",  x:  2.2, z:  4.8, s: 1.1  },
];

export default function Forest1() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd4ecd4);
    scene.fog = new THREE.Fog(0xd4ecd4, 14, 30);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(10, 8),
      new THREE.MeshPhongMaterial({ color: 0x8fc878, flatShading: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ライト
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff0cc, 2.0);
    sun.position.set(6, 12, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc8d8ff, 0.35);
    fill.position.set(-5, 4, -3);
    scene.add(fill);

    // 木を配置
    TREES.forEach(t => {
      if (t.type === "BL") createBLTree(scene, t.x, t.z, t.s);
      else createCTree(scene, t.x, t.z, t.s);
    });

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.5, phi = 0.32;
    const R = 14, tgt = new THREE.Vector3(0, 1.5, 0);
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
      phi = Math.max(0.05, Math.min(1.3, phi + (e.clientY - prevY) * 0.007));
      prevX = e.clientX; prevY = e.clientY; updateCam();
    };
    const onTS = e => { dragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; };
    const onTE = () => { dragging = false; };
    const onTM = e => {
      if (!dragging) return;
      theta -= (e.touches[0].clientX - prevX) * 0.007;
      phi = Math.max(0.05, Math.min(1.3, phi + (e.touches[0].clientY - prevY) * 0.007));
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
        🌳🌲 <strong>forest1</strong> — 混成林・ローポリ<br />
        <span style={{ color: "#888" }}>広葉樹6本 + 針葉樹7本 ／ ドラッグで回転</span>
      </div>
    </div>
  );
}
