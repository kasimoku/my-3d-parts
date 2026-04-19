import * as THREE from 'three';

/**
 * サブちゃん — 現場監督アバター
 * 1 unit = 0.1m
 * 全体scale: 1.54
 *
 * パーツ一覧:
 *   HEAD     SphereGeometry(1.6) scale(6/3.2, 5/3.2, 4/3.2)
 *   EARS     TorusGeometry(1.5, 0.3)  x=±2.5  rotation.y=±PI/2
 *   EAR_PAD  SphereGeometry(1.5)      x=±2.5
 *   EYES     TorusGeometry(0.5, 0.1)  x=±1.03  z=1.70  rotation.x=-PI/6  rotation.y=±PI/18
 *   NOSE     SphereGeometry(0.184)    z=1.89
 *   SENSOR   SphereGeometry(0.184)    z=1.90
 *   NECK     SphereGeometry(0.5) x2   x=±1.53  y=-2.58  z=0.10
 *   BODY     ConeGeometry(4.0, 3.0, 32)  y=-4.22  rotation.x=PI
 *   ORNAMENT SphereGeometry(0.5)      y=-4.00  z=2.88
 */
export function createSabchan(scene) {
  const mH = new THREE.MeshLambertMaterial({ color: 0xEEEDF5 });
  const mD = new THREE.MeshLambertMaterial({ color: 0x20202c });
  const mE = new THREE.MeshLambertMaterial({ color: 0x323244 });
  const mA = new THREE.MeshLambertMaterial({ color: 0xD5D5E5 });

  const sab = new THREE.Group();

  // HEAD
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), mH);
  head.scale.set(6 / 3.2, 5 / 3.2, 4 / 3.2);
  sab.add(head);

  // EARS × 2
  const earGeo = new THREE.TorusGeometry(1.5, 0.3, 10, 32);
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(earGeo, mD);
    ear.position.set(s * 2.5, 0.10, 0);
    ear.rotation.y = Math.PI / 2;
    sab.add(ear);

    const pad = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), mE);
    pad.position.set(s * 2.5, 0.10, 0);
    sab.add(pad);
  });

  // EYES × 2
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 24), mD);
    eye.position.set(s * 1.03, 0.04, 1.70);
    eye.rotation.x = -Math.PI / 6;   // x軸まわり手前30度
    eye.rotation.y = s * (Math.PI / 18); // y軸まわり外側10度
    sab.add(eye);
  });

  // NOSE
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.184, 5, 4), mD);
  nose.position.set(0, -0.24, 1.89);
  sab.add(nose);

  // SENSOR
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.184, 5, 4), mD);
  sensor.position.set(0, 0.50, 1.90);
  sab.add(sensor);

  // NECK × 2
  [-1.53, 1.53].forEach((x) => {
    const nb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), mD);
    nb.position.set(x, -2.58, 0.10);
    sab.add(nb);
  });

  // BODY (円錐・逆さ)
  const body = new THREE.Mesh(new THREE.ConeGeometry(4.0, 3.0, 32, 1), mD);
  body.position.set(0, -4.22, 0);
  body.rotation.x = Math.PI;
  sab.add(body);

  // ORNAMENT
  const orn = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), mA);
  orn.position.set(0, -4.00, 2.88);
  sab.add(orn);

  // 全体スケール・初期位置
  sab.scale.setScalar(1.54);
  sab.position.y = 0;

  scene.add(sab);

  // アニメーション用に head を返す
  return { group: sab, head };
}

/**
 * アニメーションループ内で呼ぶ
 * @param {{ group: THREE.Group, head: THREE.Mesh }} sabchan
 * @param {number} t  elapsed time (seconds)
 */
export function animateSabchan({ group, head }, t) {
  group.position.y = Math.sin(t * 0.72) * 0.12;
  head.rotation.z  = Math.sin(t * 0.51) * 0.046;
}
