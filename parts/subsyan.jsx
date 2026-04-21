import * as THREE from 'three';

/**
 * サブちゃん — 3D世界の現場監督アバター
 * ======================================
 * 1 unit = 0.1m / 全体scale: 1.54
 *
 * パーツ構成:
 *   HEAD      SphereGeometry(1.6, 19, 13)  scale(6/3.2, 5/3.2, 4/3.2×1.1)  z=0.0
 *             頂点加工: |x|≤0.5 → yz×1.05 / |x|>0.5 → yz×1.05〜1.2
 *   INHEAD    SphereGeometry(1.6, 19, 13)  scale(HEAD×0.9)  z=0.5
 *   EARS      TorusGeometry(1.5, 0.3, 8, 26)  x=±2.5  rotation.y=±PI/2
 *   EAR_PAD   SphereGeometry(1.5, 8, 6)  x=±2.5
 *   EYES      TorusGeometry(0.5, 0.15, 6, 19)  x=±1.03  z=2.10
 *             rotation.x=-PI/6+3°  rotation.y=±PI/18
 *   NOSE      SphereGeometry(0.184, 5, 4)  z=2.29  y=-0.44
 *   SENSOR    SphereGeometry(0.184, 5, 4)  z=2.30  y=0.30
 *   NECK      SphereGeometry(0.5, 8, 6) x2  x=±1.33  y=-2.58  z=0.10
 *             scale(1.2, 1.44, 1.44)
 *   BODY      ConeGeometry(4.0, 3.0, 26, 1)  y=-4.22  rotation.x=PI
 *   COLLAR    TorusGeometry(3.75, 0.4, 13, 26) x2  y=-2.42
 *             collar2: rotation.x=PI/2
 *   ORNAMENT  SphereGeometry(0.5, 8, 6)  y=-4.00  z=2.18
 *
 * カラー:
 *   HEAD/BODY/COLLAR  #C8E2EA (Lambert)
 *   INHEAD            #EDEDF5 (Lambert)
 *   EARS/EYES/NECK    #20202c (Lambert)
 *   EAR_PAD/ORNAMENT  #323244 (Phong, shininess:80)
 *   NOSE/SENSOR       #00C6B2 (Phong, shininess:120)
 */

function makeHeadGeo() {
  const geo = new THREE.SphereGeometry(1.6, 19, 13);
  const pos = geo.attributes.position;
  const maxX = 1.6, boundary = 0.5;
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(pos.getX(i));
    const expand = ax <= boundary
      ? 1.05
      : 1.05 + ((ax - boundary) / (maxX - boundary)) * 0.15;
    pos.setY(i, pos.getY(i) * expand);
    pos.setZ(i, pos.getZ(i) * expand);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function createSabchan(scene) {
  const mHead   = new THREE.MeshLambertMaterial({ color: 0xC8E2EA });
  const mInhead = new THREE.MeshLambertMaterial({ color: 0xEDEDF5 });
  const mD      = new THREE.MeshLambertMaterial({ color: 0x20202c });
  const mE      = new THREE.MeshPhongMaterial({ color: 0x323244, shininess: 80,  specular: 0x6666aa });
  const mAccent = new THREE.MeshPhongMaterial({ color: 0x00C6B2, shininess: 120, specular: 0x88ffee });

  const sab = new THREE.Group();

  // HEAD
  const head = new THREE.Mesh(makeHeadGeo(), mHead);
  head.scale.set(6/3.2, 5/3.2, 4/3.2 * 1.1);
  head.position.z = 0.0;
  sab.add(head);

  // INHEAD
  const inhead = new THREE.Mesh(makeHeadGeo(), mInhead);
  inhead.scale.set(6/3.2 * 0.9, 5/3.2 * 0.9, 4/3.2 * 0.9);
  inhead.position.z = 0.5;
  sab.add(inhead);

  // EARS × 2
  const earGeo = new THREE.TorusGeometry(1.5, 0.3, 8, 26);
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(earGeo, mD);
    ear.position.set(s * 2.5, 0.10, 0.0);
    ear.rotation.y = Math.PI / 2;
    sab.add(ear);

    const pad = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6), mE);
    pad.position.set(s * 2.5, 0.10, 0.0);
    sab.add(pad);
  });

  // EYES × 2
  const eyeRX = -Math.PI / 6 + (3 * Math.PI / 180);
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.15, 6, 19), mD);
    eye.position.set(s * 1.03, 0.04, 2.10);
    eye.rotation.x = eyeRX;
    eye.rotation.y = s * (Math.PI / 18);
    sab.add(eye);
  });

  // NOSE
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.184, 5, 4), mAccent);
  nose.position.set(0, -0.44, 2.29);
  sab.add(nose);

  // SENSOR
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.184, 5, 4), mAccent);
  sensor.position.set(0, 0.30, 2.30);
  sab.add(sensor);

  // NECK × 2
  [-1.33, 1.33].forEach((x) => {
    const nb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), mD);
    nb.scale.set(1.2, 1.44, 1.44);
    nb.position.set(x, -2.58, 0.10);
    sab.add(nb);
  });

  // BODY
  const body = new THREE.Mesh(new THREE.ConeGeometry(4.0, 3.0, 26, 1), mHead);
  body.position.set(0, -4.22, 0);
  body.rotation.x = Math.PI;
  sab.add(body);

  // COLLAR × 2
  const collarGeo = new THREE.TorusGeometry(3.75, 0.4, 13, 26);
  const collar = new THREE.Mesh(collarGeo, mHead);
  collar.position.set(0, -2.42, 0);
  sab.add(collar);

  const collar2 = new THREE.Mesh(collarGeo, mHead);
  collar2.position.set(0, -2.42, 0);
  collar2.rotation.x = Math.PI / 2;
  sab.add(collar2);

  // ORNAMENT
  const orn = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), mE);
  orn.position.set(0, -4.00, 2.18);
  sab.add(orn);

  sab.scale.setScalar(1.54);
  sab.position.y = 0;
  scene.add(sab);

  return { group: sab, head, inhead };
}

/**
 * アニメーションループ内で呼ぶ
 * @param {{ group, head, inhead }} sabchan
 * @param {number} t  elapsed time (seconds)
 */
export function animateSabchan({ group, head, inhead }, t) {
  group.position.y = Math.sin(t * 0.72) * 0.12;
  head.rotation.z  = Math.sin(t * 0.51) * 0.046;
  inhead.rotation.z = Math.sin(t * 0.51) * 0.046;
}
