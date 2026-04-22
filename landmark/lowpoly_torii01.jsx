import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// ⛩️ パーツライブラリ：鳥居01
// 種類：鳥居・ローポリ・ミニマル
// 柱：CylinderGeometry(0.13, 0.17, 3.0, 7) x2、朱色 #cc2200
// 笠木：BoxGeometry(3.4, 0.25, 0.30)
// 島木：BoxGeometry(2.6, 0.14, 0.22)
// 貫：BoxGeometry(2.6, 0.12, 0.18)
// ============================================================

function createTorii(scene) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ color: 0xcc2200, flatShading: true });

  // 柱 x2
  const pillarGeo = new THREE.CylinderGeometry(0.13, 0.17, 3.0, 7);
  [-1.1, 1.1].forEach(x => {
    const m = new THREE.Mesh(pillarGeo, mat);
    m.position.set(x, 1.5, 0);
    m.castShadow = true;
    group.add(m);
  });

  // 笠木（最上部 横木）
  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 0.30), mat);
  kasagi.position.y = 3.12;
  kasagi.castShadow = true;
  group.add(kasagi);

  // 島木（笠木直下）
  const shimagi = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.22), mat);
  shimagi.position.y = 2.86;
  shimagi.castShadow = true;
  group.add(shimagi);

  // 貫（中間 横木）
  const nuki = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.18), mat);
  nuki.position.y = 2.2;
  nuki.castShadow = true;
  group.add(nuki);

  scene.add(group);
  return group;
}

export default function Torii01() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece0);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(5, 8),
      new THREE.MeshPhongMaterial({ color: 0xd8c8a0, flatShading: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ライト
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.5));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.6);
    sun.position.set(5, 9, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffd0a0, 0.4);
    fill.position.set(-4, 3, -3);
    scene.add(fill);

    createTorii(scene);

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.4, phi = 0.28;
    const R = 7.0, tgt = new THREE.Vector3(0, 1.5, 0);
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
        ⛩️ <strong>鳥居01</strong> — ローポリ鳥居<br />
        <span style={{ color: "#888" }}>ドラッグで回転</span>
      </div>
    </div>
  );
}
