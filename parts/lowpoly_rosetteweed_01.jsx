import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// 🌿 パーツライブラリ：草２
// 種類：ローポリ ロゼット植物（タンポポ・オオバコ型）
// ベース：BufferGeometry（ヘラ型ブレード × 8枚）
// 配置：Y軸まわりに均等分散、X軸で地面に向けて寝かせる
// 葉：根元が幅広・先端に向かって細り、二次曲線で下にたわむ
// ライト：環境光 0.2、太陽光 0.5、補助光 0.5
// ============================================================

function createRosette(scene) {
  const blades = [];
  const BLADE_COUNT = 8;
  const SEGMENTS = 3;

  const greenPalette = [
    0x4a7a30,
    0x3d6b28,
    0x4f7a28,
    0x567a35,
    0x3e6e22,
    0x4a7a30,
    0x608040,
    0x3d6b28,
  ];

  for (let i = 0; i < BLADE_COUNT; i++) {
    const angleY =
      (i / BLADE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;

    // 葉の形：草より幅広・短め
    const length = 0.9 + Math.random() * 0.5;
    const droop = 0.18 + Math.random() * 0.15; // 先端が下にたわむ量
    const baseW = 0.17 + Math.random() * 0.06;
    const tiltX = 1.15 + Math.random() * 0.2; // 地面に向けて寝かせる角度（ラジアン）
    const color = greenPalette[i % greenPalette.length];

    const verts = [];
    for (let s = 0; s <= SEGMENTS; s++) {
      const t = s / SEGMENTS;
      const y = t * length;
      // ヘラ型：根元〜中央が最も広く、先端で細る
      const widthCurve = Math.sin(t * Math.PI * 0.85);
      const w = baseW * widthCurve + 0.01;
      // 二次曲線で先端をやや下方向に（Z = droopとして後でtiltXで地面方向へ）
      const z = droop * t * t;
      verts.push(-w, y, z, w, y, z);
    }
    // 先端：1点に収束
    verts.push(0, length + 0.04, droop);

    const idxs = [];
    for (let s = 0; s < SEGMENTS; s++) {
      const a = s * 2, b = s * 2 + 1, c = s * 2 + 2, d = s * 2 + 3;
      idxs.push(a, b, c, b, d, c);
    }
    const tipIdx = (SEGMENTS + 1) * 2;
    idxs.push(SEGMENTS * 2, SEGMENTS * 2 + 1, tipIdx);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(verts, 3)
    );
    geo.setIndex(idxs);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color,
      flatShading: true,
      side: THREE.DoubleSide,
      shininess: 25,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.order = 'YXZ'; // Y（方向）→ X（傾き）の順で適用
    mesh.rotation.y = angleY;
    mesh.rotation.x = tiltX; // ← ここで地面方向に寝かせる
    mesh.castShadow = true;
    scene.add(mesh);
    blades.push(mesh);
  }
  return blades;
}

function createRosetteLayer2(scene) {
  const blades = [];
  const BLADE_COUNT = 6;
  const SEGMENTS = 3;

  const greenPalette = [
    0x77bb41,
    0x77bb41,
    0x77bb41,
    0x77bb41,
    0x77bb41,
    0x77bb41,
  ];

  for (let i = 0; i < BLADE_COUNT; i++) {
    // 第一層とずらして配置
    const angleY =
      (i / BLADE_COUNT) * Math.PI * 2 + Math.PI / BLADE_COUNT + (Math.random() - 0.5) * 0.3;

    const length = 0.7 + Math.random() * 0.4;   // 少し短め
    const droop = 0.25 + Math.random() * 0.15;
    const baseW = 0.14 + Math.random() * 0.05;
    const tiltX = 0.5 + Math.random() * 0.1;    // 立ち気味
    const color = greenPalette[i % greenPalette.length];

    const verts = [];
    for (let s = 0; s <= SEGMENTS; s++) {
      const t = s / SEGMENTS;
      const y = t * length;
      const widthCurve = Math.sin(t * Math.PI * 0.85);
      const w = baseW * widthCurve + 0.01;
      const z = droop * t * t * t; // ← t³でより先端に集中するしなり
      verts.push(-w, y, z, w, y, z);
    }
    verts.push(0, length + 0.04, droop);

    const idxs = [];
    for (let s = 0; s < SEGMENTS; s++) {
      const a = s * 2, b = s * 2 + 1, c = s * 2 + 2, d = s * 2 + 3;
      idxs.push(a, b, c, b, d, c);
    }
    const tipIdx = (SEGMENTS + 1) * 2;
    idxs.push(SEGMENTS * 2, SEGMENTS * 2 + 1, tipIdx);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idxs);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color,
      flatShading: true,
      side: THREE.DoubleSide,
      shininess: 25,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.order = 'YXZ';
    mesh.rotation.y = angleY;
    mesh.rotation.x = tiltX;
    mesh.castShadow = true;
    scene.add(mesh);
    blades.push(mesh);
  }
  return blades;
}


export default function Rosette1() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe4e8ec);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(4, 32),
      new THREE.MeshPhongMaterial({ color: 0xc8ccc8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
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

    // ロゼットを生成（二層）
    const blades = [
      ...createRosette(scene),
      ...createRosetteLayer2(scene),
    ];

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.5, phi = 0.6;
    const R = 4.0, tgt = new THREE.Vector3(0, 0, 0);
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
      phi = Math.max(0.05, Math.min(1.4, phi + (e.clientY - prevY) * 0.007));
      prevX = e.clientX; prevY = e.clientY; updateCam();
    };
    const onTS = e => { dragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; };
    const onTE = () => { dragging = false; };
    const onTM = e => {
      if (!dragging) return;
      theta -= (e.touches[0].clientX - prevX) * 0.007;
      phi = Math.max(0.05, Math.min(1.4, phi + (e.touches[0].clientY - prevY) * 0.007));
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
    const animate = () => {
      id = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      blades.forEach((mesh, i) => {
        mesh.rotation.z = Math.sin(t * 0.8 + i * 0.4) * 0.03;
      });
      renderer.render(scene, camera);
    };
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
        🌿 <strong>草２</strong> — ローポリ ロゼット<br />
        <span style={{ color: "#888" }}>ドラッグで回転</span>
      </div>
    </div>
  );
}
