import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

function makeInstancedBox({ color, count }) {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05 })
  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  return mesh
}

function addVoxel(instanced, index, x, y, z, scale = 1) {
  const m = new THREE.Matrix4()
  const s = new THREE.Vector3(scale, scale, scale)
  const q = new THREE.Quaternion()
  const p = new THREE.Vector3(x, y, z)
  m.compose(p, q, s)
  instanced.setMatrixAt(index, m)
}

function makeColor(h, s, l) {
  return new THREE.Color().setHSL(h, s, l)
}

export default function SceneCanvas({ theme = 'day', blossoms = 120 }) {
  const containerRef = useRef(null)
  const worldRef = useRef({})

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Renderer & sizing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // Scene & camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.set(28, 24, 34)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.set(0, 6, 0)

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.6)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, theme === 'day' ? 1.0 : 0.45)
    dir.position.set(20, 30, 10)
    dir.castShadow = false
    scene.add(dir)

    // Fog / background
    scene.background = new THREE.Color(theme === 'day' ? 0xdfefff : 0x0f1020)
    scene.fog = new THREE.Fog(scene.background, 60, 160)

    // Ground
    const groundGroup = new THREE.Group()
    scene.add(groundGroup)

    const groundSize = 60
    const groundGeom = new THREE.BoxGeometry(1, 1, 1)
    const green1 = new THREE.MeshStandardMaterial({ color: makeColor(0.33, 0.45, 0.45) })
    const green2 = new THREE.MeshStandardMaterial({ color: makeColor(0.33, 0.55, 0.35) })
    let tileIndex = 0
    for (let x = -groundSize / 2; x < groundSize / 2; x++) {
      for (let z = -groundSize / 2; z < groundSize / 2; z++) {
        if ((x + z) % 2 !== 0) continue
        const mat = (x + z) % 4 === 0 ? green1 : green2
        const m = new THREE.Mesh(groundGeom, mat)
        m.position.set(x, 0, z)
        groundGroup.add(m)
        tileIndex++
      }
    }

    // Decorative stones path
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9ea7b3, roughness: 1 })
    for (let i = -20; i <= 20; i++) {
      const s = new THREE.Mesh(groundGeom, stoneMat)
      s.scale.set(1, 0.3, 1)
      s.position.set(i, 0.2, Math.sin(i * 0.3) * 4)
      groundGroup.add(s)
    }

    // World group to hold voxels
    const world = new THREE.Group()
    scene.add(world)

    // Helper to build colored instanced sets
    function buildVoxelSet(color, count) {
      const mesh = makeInstancedBox({ color, count })
      world.add(mesh)
      return mesh
    }

    // Pagoda construction
    const pagoda = new THREE.Group()
    world.add(pagoda)

    // Colors palette
    const wood = 0x8e5a33
    const pillar = 0x7a3e2b
    const roofRed = 0xc0392b
    const roofGold = 0xf1c40f
    const trim = 0xd35400
    const stone = 0xbfc9ca

    // Base platform
    ;(() => {
      const width = 16, depth = 16, height = 2
      const mat = new THREE.MeshStandardMaterial({ color: stone, roughness: 0.9 })
      for (let x = -width / 2; x < width / 2; x++) {
        for (let z = -depth / 2; z < depth / 2; z++) {
          for (let y = 0; y < height; y++) {
            const b = new THREE.Mesh(groundGeom, mat)
            b.position.set(x, y + 0.5, z)
            pagoda.add(b)
          }
        }
      }
    })()

    // Stairs on two sides
    ;(() => {
      const mat = new THREE.MeshStandardMaterial({ color: stone })
      for (let s = 0; s < 6; s++) {
        for (let x = -3; x <= 3; x++) {
          const stepFront = new THREE.Mesh(groundGeom, mat)
          stepFront.position.set(x, s + 0.5, -9 - s)
          pagoda.add(stepFront)
          const stepBack = new THREE.Mesh(groundGeom, mat)
          stepBack.position.set(x, s + 0.5, 9 + s)
          pagoda.add(stepBack)
        }
      }
    })()

    // Pillars and floors
    ;(() => {
      const floors = 4
      const half = 7
      const pillarMat = new THREE.MeshStandardMaterial({ color: pillar })
      const woodMat = new THREE.MeshStandardMaterial({ color: wood })
      for (let f = 0; f < floors; f++) {
        const yBase = 2 + f * 4
        // floor deck
        for (let x = -half + f; x <= half - f; x++) {
          for (let z = -half + f; z <= half - f; z++) {
            const deck = new THREE.Mesh(groundGeom, woodMat)
            deck.position.set(x, yBase, z)
            pagoda.add(deck)
          }
        }
        // corner pillars
        const corners = [
          [-half + f, -half + f],
          [half - f, -half + f],
          [-half + f, half - f],
          [half - f, half - f],
        ]
        for (const [cx, cz] of corners) {
          for (let h = 1; h <= 3; h++) {
            const p = new THREE.Mesh(groundGeom, pillarMat)
            p.position.set(cx, yBase + h, cz)
            pagoda.add(p)
          }
        }
        // roof layer with flared edges
        const roofMat = new THREE.MeshStandardMaterial({ color: f % 2 === 0 ? roofRed : trim })
        const goldMat = new THREE.MeshStandardMaterial({ color: roofGold, metalness: 0.3, roughness: 0.4 })
        const size = half - f + 1
        for (let x = -size; x <= size; x++) {
          for (let z = -size; z <= size; z++) {
            const distEdge = Math.max(Math.abs(x), Math.abs(z))
            if (distEdge === size) {
              const y = yBase + 4
              const r = new THREE.Mesh(groundGeom, roofMat)
              // slight curvature at edges
              const curve = Math.max(0, 2 - Math.abs(Math.abs(x) - size) - Math.abs(Math.abs(z) - size))
              r.position.set(x, y + curve, z)
              pagoda.add(r)
            } else if (distEdge === size - 1) {
              const y = yBase + 4
              const r = new THREE.Mesh(groundGeom, roofMat)
              r.position.set(x, y + 1, z)
              pagoda.add(r)
            }
          }
        }
        // roof ridge gold accents
        for (let x = -size; x <= size; x++) {
          const g = new THREE.Mesh(groundGeom, goldMat)
          g.position.set(x, yBase + 6, 0)
          pagoda.add(g)
        }
      }
      // Finial
      const finMat = new THREE.MeshStandardMaterial({ color: roofGold, metalness: 0.5, roughness: 0.3 })
      for (let i = 0; i < 6; i++) {
        const f = new THREE.Mesh(groundGeom, finMat)
        f.position.set(0, 2 + 4 * floors + i, 0)
        pagoda.add(f)
      }
    })()

    // Trees (evergreen and cherry blossom)
    const trees = new THREE.Group()
    world.add(trees)

    function addTree(x, z, blossom = false) {
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1a })
      const leafMat = new THREE.MeshStandardMaterial({ color: blossom ? 0xffc0e1 : 0x3ba357 })
      // trunk
      const height = 5 + Math.floor(Math.random() * 4)
      for (let y = 1; y <= height; y++) {
        const t = new THREE.Mesh(groundGeom, trunkMat)
        t.position.set(x, y, z)
        trees.add(t)
      }
      // canopy cluster of voxels
      const radius = blossom ? 4 : 3
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dz = -radius; dz <= radius; dz++) {
            const dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz)
            const th = blossom ? 6 : 5
            if (dist <= th && Math.random() > 0.2) {
              const l = new THREE.Mesh(groundGeom, leafMat)
              l.position.set(x + dx, height + dy, z + dz)
              trees.add(l)
            }
          }
        }
      }
    }

    // Place trees around
    const ring = 22
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2
      const r = ring + (Math.random() * 6 - 3)
      const x = Math.round(Math.cos(ang) * r)
      const z = Math.round(Math.sin(ang) * r)
      addTree(x, z, i % 3 === 0)
    }

    // Cherry blossom petals particles
    const petalsGroup = new THREE.Group()
    world.add(petalsGroup)
    const petalGeom = new THREE.PlaneGeometry(0.6, 0.6)
    const petalMat = new THREE.MeshBasicMaterial({ color: 0xffa6d1, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    const petals = []
    const petalCount = Math.max(0, Math.min(400, blossoms))
    for (let i = 0; i < petalCount; i++) {
      const p = new THREE.Mesh(petalGeom, petalMat.clone())
      p.position.set((Math.random() - 0.5) * 40, 6 + Math.random() * 20, (Math.random() - 0.5) * 40)
      p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      p.userData = {
        vy: -0.01 - Math.random() * 0.02,
        vx: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
        rot: (Math.random() - 0.5) * 0.01,
      }
      petals.push(p)
      petalsGroup.add(p)
    }

    // Lamps
    const lampMat = new THREE.MeshStandardMaterial({ color: theme === 'day' ? 0xfff1c1 : 0xffe29a, emissive: theme === 'day' ? 0x000000 : 0xffc46b, emissiveIntensity: theme === 'day' ? 0 : 0.5 })
    for (let i = -6; i <= 6; i += 3) {
      const post = new THREE.Mesh(groundGeom, new THREE.MeshStandardMaterial({ color: 0x5c4b51 }))
      post.scale.set(1, 4, 1)
      post.position.set(i, 3.5, -14)
      world.add(post)

      const lantern = new THREE.Mesh(groundGeom, lampMat)
      lantern.position.set(i, 6, -14)
      world.add(lantern)
    }

    // Subtle bloom via many small emissive dots near roof (simulated with basic lambert)
    const glowMat = new THREE.MeshBasicMaterial({ color: theme === 'day' ? 0xfff2b1 : 0xffe38d })
    for (let i = 0; i < 50; i++) {
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.1), glowMat)
      g.position.set((Math.random() - 0.5) * 8, 20 + Math.random() * 6, (Math.random() - 0.5) * 8)
      world.add(g)
    }

    // Animate
    let raf = 0
    const clock = new THREE.Clock()
    function animate() {
      const dt = Math.min(clock.getDelta(), 0.033)
      raf = requestAnimationFrame(animate)
      controls.update()

      // petal motion
      for (const p of petals) {
        p.rotation.x += p.userData.rot
        p.rotation.y += p.userData.rot * 1.2
        p.rotation.z += p.userData.rot * 0.8
        p.position.x += p.userData.vx
        p.position.z += p.userData.vz
        p.position.y += p.userData.vy
        if (p.position.y < 0.6) {
          // respawn up high
          p.position.y = 12 + Math.random() * 12
          p.position.x = (Math.random() - 0.5) * 40
          p.position.z = (Math.random() - 0.5) * 40
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    worldRef.current = { renderer, scene, camera, controls, ro }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      world.clear()
      scene.clear()
    }
  }, [theme, blossoms])

  return (
    <div className="relative w-full h-[70vh] sm:h-[76vh] rounded-2xl overflow-hidden shadow-2xl border border-white/60 bg-gradient-to-b from-white to-blue-50">
      {/* gradient overlay for mood */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/30" />
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
