import { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================
// 🌬️ パーツライブラリ：風車01
// 種類：風車・ローポリ・ミニマル・羽根回転あり
// 塔体：CylinderGeometry(0.4, 0.7, 3.5, 8)、石灰 #d4c4a0
// 屋根：ConeGeometry(0.55, 0.7, 8)、木茶 #8b6340
// 羽根：BoxGeometry(0.18, 1.5, 0.07) x4、Y軸回転アニメ
// ハブ：SphereGeometry(0.18, 6, 4)
// ============================================================

function createWindmill(scene) {
  const group = new THREE.Group();

  // 塔体
  const towerMat = new THREE.MeshPhongMaterial({ color: 0xd4c4a0, flatShading: true });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 3.5, 8), towerMat);
  tower.position.y = 1.75;
  tower.castShadow = true;
  group.add(tower);

  // 屋根
  const capMat = new THREE.MeshPhongMaterial({ color: 0x8b6340, flatShading: true });
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.7, 8), capMat);
  cap.position.y = 3.85;
  cap.castShadow = true;
  group.add(cap);

  // 基礎台
  const baseMat = new THREE.MeshPhongMaterial({ color: 0xb8a880, flatShading: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.25, 8), baseMat);
  base.position.y = 0.12;
  group.add(base);

  // 羽根グループ（Z軸で回転アニメ）
  const bladeGroup = new THREE.Group();
  bladeGroup.position.set(0, 3.1, 0.45);

  // ハブ
  const hubMat = new THREE.MeshPhongMaterial({ color: 0x6b4f2a, flatShading: true });
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), hubMat);
  bladeGroup.add(hub);

  // 羽根 x4（90°刻みで配置）
  const bladeMat = new THREE.MeshPhongMaterial({ color: 0xc4a060, flatShading: true });
  for (let i = 0; i < 4; i++) {
    const holder = new THREE.Group();
    holder.rotation.z = (i * Math.PI) / 2;

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.5, 0.07), bladeMat);
    blade.position.y = 0.75;
    blade.castShadow = true;
    holder.add(blade);

    bladeGroup.add(holder);
  }

  group.add(bladeGroup);
  scene.add(group);
  return { group, bladeGroup };
}

export default function Windmill01() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8eedc);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(5, 8),
      new THREE.MeshPhongMaterial({ color: 0xb0cc88, flatShading: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ライト
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xfff8e0, 1.8);
    sun.position.set(5, 9, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xd0f0d0, 0.4);
    fill.position.set(-4, 3, -3);
    scene.add(fill);

    const { bladeGroup } = createWindmill(scene);

    // カメラ orbit
    let dragging = false, prevX = 0, prevY = 0;
    let theta = 0.5, phi = 0.28;
    const R = 7.0, tgt = new THREE.Vector3(0, 2.0, 0);
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
      bladeGroup.rotation.z += 0.008;
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
        🌬️ <strong>風車01</strong> — ローポリ風車<br />
        <span style={{ color: "#888" }}>ドラッグで回転</span>
      </div>
    </div>
  );
}
