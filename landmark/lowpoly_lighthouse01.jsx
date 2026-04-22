import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// 🗼 パーツライブラリ：灯台01
// 種類：灯台・ローポリ・ミニマル
// 塔体：CylinderGeometry(0.5, 0.75, 4.0, 8)、白 #f5f0e8
// 赤帯：CylinderGeometry(0.54, 0.62, 0.45, 8)、赤 #cc2200
// 灯室：CylinderGeometry(0.55, 0.55, 0.6, 8)、暗 #333333
// 光源球：SphereGeometry(0.28, 6, 4)、発光 #ffcc00
// 屋根：ConeGeometry(0.65, 0.7, 8)、赤 #cc2200
// ============================================================

function createLighthouse(scene) {
  const group = new THREE.Group();

  // 塔体（テーパー）
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0xf5f0e8, flatShading: true });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 4.0, 8), bodyMat);
  body.position.y = 2.0;
  body.castShadow = true;
  group.add(body);

  // 赤帯
  const stripeMat = new THREE.MeshPhongMaterial({ color: 0xcc2200, flatShading: true });
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.62, 0.45, 8), stripeMat);
  stripe.position.y = 1.8;
  stripe.castShadow = true;
  group.add(stripe);

  // 灯室
  const lanternMat = new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true });
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.6, 8), lanternMat);
  lantern.position.y = 4.3;
  lantern.castShadow = true;
  group.add(lantern);

  // 光源球（発光）
  const glowMat = new THREE.MeshPhongMaterial({
    color: 0xffee88,
    emissive: 0xffcc00,
    emissiveIntensity: 0.6,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 4), glowMat);
  glow.position.y = 4.3;
  group.add(glow);

  // 屋根コーン
  const roofMat = new THREE.MeshPhongMaterial({ color: 0xcc2200, flatShading: true });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.7, 8), roofMat);
  roof.position.y = 4.95;
  roof.castShadow = true;
  group.add(roof);

  // 基礎台
  const baseMat = new THREE.MeshPhongMaterial({ color: 0xc0b898, flatShading: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.3, 8), baseMat);
  base.position.y = 0.15;
  base.castShadow = true;
  group.add(base);

  scene.add(group);
  return group;
}

export default function Lighthouse01() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0e8f5);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(5, 8),
      new THREE.MeshPhongMaterial({ color: 0x9ab8c8, flatShading: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ライト
    scene.add(new THREE.AmbientLight(0xddeeff, 0.6));
    const sun = new THREE.DirectionalLight(0xfff8f0, 1.8);
    sun.position.set(6, 10, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc0d8f0, 0.4);
    fill.position.set(-4, 4, -3);
    scene.add(fill);

    createLighthouse(scene);

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.5, phi = 0.28;
    const R = 8.0, tgt = new THREE.Vector3(0, 2.5, 0);
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
        🗼 <strong>灯台01</strong> — ローポリ灯台<br />
        <span style={{ color: "#888" }}>ドラッグで回転</span>
      </div>
    </div>
  );
}
