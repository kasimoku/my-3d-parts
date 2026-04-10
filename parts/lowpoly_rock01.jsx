import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// 🪨 パーツライブラリ：岩１
// 種類：ローポリ岩石・重ね合わせ
// ベース：IcosahedronGeometry x2、DodecahedronGeometry x1
// 配置：XZ ±0.4ランダム、Y固定、Y軸のみ回転ランダム
// 底面：Y < -0.2 の頂点を -0.2 にクランプ
// ライト：環境光 0.2、太陽光 0.5、補助光 0.5
// ============================================================

function createRock(scene) {
  const rnd = () => (Math.random() - 0.5) * 0.8; // ±0.4

  const shapes = [
    { geo: new THREE.IcosahedronGeometry(1.2, 0),  color: 0x8a8a8a },
    { geo: new THREE.IcosahedronGeometry(1.2, 0),  color: 0x7a7872 },
    { geo: new THREE.DodecahedronGeometry(1.2, 0), color: 0x969490 },
  ];

  shapes.forEach(({ geo, color }) => {
    // Y < -0.2 の頂点を -0.2 に押し込む（接地面を作る）
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < -0.2) pos.setY(i, -0.2);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 18 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(rnd(), 0, rnd()); // XZランダム、Y固定
    mesh.rotation.set(0, Math.random() * Math.PI * 2, 0); // Y軸のみランダム
    mesh.castShadow = true;
    scene.add(mesh);
  });
}

export default function Rock1() {
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

    // 岩を生成
    createRock(scene);

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
        🪨 <strong>岩１</strong> — ローポリ岩石<br />
        <span style={{ color: "#888" }}>ドラッグで回転</span>
      </div>
    </div>
  );
}
