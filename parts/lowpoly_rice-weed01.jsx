import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// 🌾 パーツライブラリ：草１
// 種類：ローポリ イネ科単子葉植物
// ベース：BufferGeometry（テーパー付きブレード × 7枚）
// 配置：Y軸まわりに均等分散 + ランダム揺らぎ
// 葉：根元から扇状、二次曲線で外側にアーチ、先端に向かって細る
// ライト：環境光 0.2、太陽光 0.5、補助光 0.5
// ============================================================

function createWeed(scene) {
  const blades = [];
  const BLADE_COUNT = 7;
  const SEGMENTS = 3; // 葉のセグメント数（ローポリ感の調整）

  const greenPalette = [
    0x4a7c3f,
    0x4f7a28,
    0x3d6b35,
    0x4f7a28,
    0x517a42,
    0x4f7a28,
    0x3e7238,
  ];

  for (let i = 0; i < BLADE_COUNT; i++) {
    // 扇状に均等配置 + 少し揺らぎ
    const angleY =
      (i / BLADE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const height = 1.4 + Math.random() * 0.9;
    const lean = 0.22 + Math.random() * 0.32; // アーチの深さ（外側への張り出し量）
    const baseW = 0.09 + Math.random() * 0.04; // 根元の半幅
    const color = greenPalette[i % greenPalette.length];

    // 頂点を積み上げる（各段：左右2頂点）
    const verts = [];
    for (let s = 0; s <= SEGMENTS; s++) {
      const t = s / SEGMENTS;
      const y = t * height;
      const w = baseW * (1.0 - t * 0.88); // 先端に向かって細る
      const z = lean * t * t;             // 二次曲線で外にアーチ
      verts.push(-w, y, z, w, y, z);
    }
    // 先端：1点に収束
    verts.push(0, height + 0.06, lean);

    // インデックス（各段を2三角形で繋ぐ）
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
      shininess: 35,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.y = angleY; // 扇状に展開
    mesh.castShadow = true;
    scene.add(mesh);
    blades.push(mesh);
  }
  return blades;
}

export default function Weed1() {
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
    ground.position.y = -1.4;
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

    // 草を生成
    const blades = createWeed(scene);

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.5, phi = 0.3;
    const R = 5.0, tgt = new THREE.Vector3(0, 0, 0);
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
    const animate = () => {
      id = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      blades.forEach((mesh, i) => {
        mesh.rotation.z = Math.sin(t * 1 + i * 0.4) * 0.04;
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
        🌾 <strong>草１</strong> — ローポリ イネ科<br />
        <span style={{ color: "#888" }}>ドラッグで回転</span>
      </div>
    </div>
  );
}
