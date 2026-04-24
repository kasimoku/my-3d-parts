import * as THREE from 'three'
import Alea from 'alea'

// Three.js専用エクスポート（React不要・シード値で再現可能）
// 底面クランプなし・全軸ランダム回転で自然な岩の見た目
export function createRock01Group(seed) {
  const rng = Alea(seed)
  const rnd = () => (rng() - 0.5) * 0.8

  const group = new THREE.Group()
  const shapes = [
    { geo: new THREE.IcosahedronGeometry(1.2, 0),  color: 0x8a8a8a },
    { geo: new THREE.IcosahedronGeometry(1.2, 0),  color: 0x7a7872 },
    { geo: new THREE.DodecahedronGeometry(1.2, 0), color: 0x969490 },
  ]

  shapes.forEach(({ geo, color }) => {
    const mat = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 18 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(rnd(), 0, rnd())
    mesh.rotation.set(rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2)
    group.add(mesh)
  })

  return group
}
