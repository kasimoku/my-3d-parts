import * as THREE from 'three';

/**
 * kummo ☁️
 * ローポリ雲生物パーツ
 *
 * 構成:
 *  - 白球ボディ  IcosahedronGeometry(1.5, 1) + twist/squash/Z伸張/Xテーパー
 *  - 白十二面体  DodecahedronGeometry(1.5, 0) + Y×0.7 + X軸20°
 *  - 黒トーラス×2  TorusGeometry(0.2, 0.08) + X軸100° @ x=±0.4, y=0.5, z=0.6
 *  - 青球(目)   IcosahedronGeometry(0.1, 0) #2A537B @ x=0, y=0.4, z=0.8
 */
export function createKummo() {
  const group = new THREE.Group();

  // ─── 白球ボディ ───────────────────────────────────────
  const geoSphere = new THREE.IcosahedronGeometry(1.5, 1);
  const pos = geoSphere.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const ox = pos.getX(i), oy = pos.getY(i), oz = pos.getZ(i);

    // 1. twist: Y値に応じてXZ回転
    const angle = oy * 0.2;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    let x = ox * cos - oz * sin;
    let z = ox * sin + oz * cos;
    let y = oy;

    // 2. Y×0.5 扁平化
    y = y * 0.5;

    // 3. Z後方に+1.0伸張（z<0の頂点をz方向へ押し出し）
    if (z < 0) z = z - 1.0 * (-z / 1.5);

    // 4. z<-0.5より後方のXをテーパー（1.0→0.6）
    if (z < -0.5) {
      const t = Math.min(1.0, (z - (-0.5)) / ((-2.5) - (-0.5)));
      x = x * (1.0 - t * 0.4);
    }

    pos.setX(i, x);
    pos.setY(i, y);
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  geoSphere.computeVertexNormals();

  const body = new THREE.Mesh(
    geoSphere,
    new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 30 })
  );
  body.position.y = -0.2;
  body.castShadow = true;
  group.add(body);

  // ─── 白十二面体 ───────────────────────────────────────
  const geoDodec = new THREE.DodecahedronGeometry(1.5, 0);
  const posD = geoDodec.attributes.position;
  for (let i = 0; i < posD.count; i++) {
    posD.setY(i, posD.getY(i) * 0.7);
  }
  posD.needsUpdate = true;
  geoDodec.computeVertexNormals();

  const dodec = new THREE.Mesh(
    geoDodec,
    new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 30 })
  );
  dodec.rotation.x = 20 * Math.PI / 180;
  dodec.castShadow = true;
  group.add(dodec);

  // ─── 黒トーラス × 2 ──────────────────────────────────
  const torusMat = new THREE.MeshPhongMaterial({ color: 0x111111, flatShading: true, shininess: 20 });
  [-0.4, 0.4].forEach(xPos => {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.08, 8, 24),
      torusMat
    );
    torus.position.set(xPos, 0.5, 0.6);
    torus.rotation.x = 100 * Math.PI / 180;
    torus.castShadow = true;
    group.add(torus);
  });

  // ─── 青球（目） ───────────────────────────────────────
  const eye = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 0),
    new THREE.MeshPhongMaterial({ color: 0x2A537B, flatShading: true, shininess: 40 })
  );
  eye.position.set(0, 0.4, 0.8);
  eye.castShadow = true;
  group.add(eye);

  return group;
}
