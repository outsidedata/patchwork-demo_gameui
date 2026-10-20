// The double helix behind the gym's HUD, drawn on render3d's scene: it shows that the UI rests on a
// scene of its own and is not it. Nothing of the UI knows of it, and it knows nothing of the UI.
//
// It draws the `helix` row's definition (`assets/demo_gameui.json`), which holds every number of it:
// a column of rungs standing on the vertical line through `at`, rising `rise` metres a second and
// turning `spin` radians a second about that line. A rung is two balls `ball` metres in radius, one
// in each of `strands`' colours, `radius` metres either side of the line, and a rod `rod` metres in
// radius between them in `rung`; and from each ball a rod in `backbone` up to the ball of its strand
// on the rung above, `spacing` metres up and `twist` radians round. A rung is made at `bottom`, below
// the canvas, the moment the lowest one has risen `spacing` above it, and taken out once it rises
// past `top`, above the canvas; none is moved back down or used again. On its first frame it fills
// the column from `top` down. Spheres and cylinders are `segments` round, every material three's
// standard one with `surface`'s `roughness` and `metalness`. It lights what it draws
// with `ambient` and a `sun` at `sun.at`, each a colour and an intensity.
//
// It moves by the page's own clock, every frame, so it turns on while the game is paused: it is
// scenery, not a rule. Its browser half is all of it; it has no row and no server half.
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function helix() {
  let made: {
    column: any
    lights: any[]
    shared: { ball: any; rod: any; strands: any[]; rung: any; backbone: any }
    rungs: any[]
    head: number
    angle: number
  } | undefined
  let last: number | undefined

  return {
    tick(plugins: Plugins) {
      const row = plugins.wire.rows.find(r => r.kind === 'helix')
      if (!row) return
      const d = def(plugins.wire, row.kind)
      const { THREE, scene } = plugins.render3d
      const now = performance.now() / 1000
      const dt = last === undefined ? 0 : now - last
      last = now

      if (!made) {
        const column = new THREE.Group()
        column.position.fromArray(d.at)
        const sun = new THREE.DirectionalLight(d.sun.color, d.sun.intensity)
        sun.position.fromArray(d.sun.at)
        const lights = [new THREE.AmbientLight(d.ambient.color, d.ambient.intensity), sun]
        scene.add(column, ...lights)
        const material = (color: string) => new THREE.MeshStandardMaterial({ color, ...d.surface })
        made = {
          column,
          lights,
          shared: {
            ball: new THREE.SphereGeometry(d.ball, d.segments, d.segments),
            rod: new THREE.CylinderGeometry(d.rod, d.rod, 1, d.segments),
            strands: d.strands.map(material),
            rung: material(d.rung),
            backbone: material(d.backbone),
          },
          rungs: [],
          head: d.top + d.spacing,
          angle: 0,
        }
      }
      const m = made

      // A rod of the shared unit cylinder from `a` to `b`, in the rung's own frame.
      const rod = (a: any, b: any, material: any) => {
        const it = new THREE.Mesh(m.shared.rod, material)
        it.position.copy(a).add(b).multiplyScalar(0.5)
        it.scale.set(1, a.distanceTo(b), 1)
        it.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
        return it
      }

      const spawn = (y: number, angle: number, above: boolean) => {
        const rung = new THREE.Group()
        rung.position.y = y
        rung.rotation.y = angle
        const ends = [new THREE.Vector3(d.radius, 0, 0), new THREE.Vector3(-d.radius, 0, 0)]
        ends.forEach((end, i) => {
          const ball = new THREE.Mesh(m.shared.ball, m.shared.strands[i])
          ball.position.copy(end)
          rung.add(ball)
          // The same strand's ball on the rung above, in this rung's frame: `spacing` up and
          // `twist` round the line.
          if (above) rung.add(rod(end, end.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), d.twist).setY(d.spacing), m.shared.backbone))
        })
        rung.add(rod(ends[0], ends[1], m.shared.rung))
        m.column.add(rung)
        m.rungs.push(rung)
      }

      m.column.rotation.y += d.spin * dt
      for (const rung of m.rungs) rung.position.y += d.rise * dt
      m.head += d.rise * dt
      for (const rung of m.rungs.filter(r => r.position.y > d.top)) {
        m.column.remove(rung)
        m.rungs.splice(m.rungs.indexOf(rung), 1)
      }
      while (m.head - d.spacing >= d.bottom) {
        const above = m.head <= d.top
        m.head -= d.spacing
        m.angle -= d.twist
        spawn(m.head, m.angle, above)
      }
    },
    close(plugins: Plugins) {
      if (!made) return
      plugins.render3d.scene.remove(made.column, ...made.lights)
      const { ball, rod, strands, rung, backbone } = made.shared
      for (const it of [ball, rod, ...strands, rung, backbone]) it.dispose()
      made = undefined
    },
  }
}
