// A ui panel drawn on a screen in the 3D world (`ui.surface`). The `monitor` panel is shown as any
// panel is, with `ui.show`: the gym's card (`plugins/cards`), the `clock` row's `t` as `clock.text`'s
// `{seconds}` in the `readout` style, a bar in the `bar` style filled in `bar.fill` to a wave of `t`
// every `bar.period` seconds, and the `note` in the `caption` style. Asking `ui.surface('monitor')`
// in the frame draws the panel on the surfaces' canvas instead of over the game; it hands back that
// canvas and the panel's `box` on it, `[x, y, width, height]` in the canvas's pixels, as the last
// frame ended, or undefined until the UI has a renderer for it. The look shows the canvas on a plane
// of render3d's scene `size` metres across at `at`, turned `turn` radians about the vertical, the
// texture cut to the box: a CanvasTexture told it changed each frame, unlit, so the screen glows as
// it is drawn. The plane is hidden until the first surface comes back.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

let screen: any

export function setup(row: Row, plugins: Plugins) {
  const { THREE, scene } = plugins.render3d
  const d = def(plugins.wire, row.kind)
  screen = new THREE.Mesh(new THREE.PlaneGeometry(d.size[0], d.size[1]), new THREE.MeshBasicMaterial())
  screen.position.fromArray(d.at)
  screen.rotation.y = d.turn
  screen.visible = false
  scene.add(screen)
}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const { THREE } = plugins.render3d
  const d = def(plugins.wire, row.kind)
  const t: number = plugins.wire.rows.find(r => r.kind === 'clock')!.data.t
  plugins.cards.card(row, plugins)
  const clock = ui.show('monitor', 'clock', () => new ui.PIXI.Text({ text: '', style: ui.style('readout') }))
  clock.position.set(d.clock.at[0], d.clock.at[1])
  clock.text = d.clock.text.replace('{seconds}', t.toFixed(1))
  const bar = ui.show('monitor', 'bar', () => ui.bar(ui.style('bar')))
  bar.position.set(d.bar.at[0], d.bar.at[1])
  bar.set(0.5 + 0.5 * Math.sin(2 * Math.PI * t / d.bar.period), { color: d.bar.fill })
  const note = ui.show('monitor', 'note', () => new ui.PIXI.Text({ text: '', style: ui.style('caption') }))
  note.position.set(d.note.at[0], d.note.at[1])
  note.text = d.note.text

  const surface = ui.surface('monitor')
  if (!surface) return
  if (!screen.material.map) {
    screen.material.map = new THREE.CanvasTexture(surface.canvas)
    screen.material.map.colorSpace = THREE.SRGBColorSpace
    screen.material.needsUpdate = true
  }
  const map = screen.material.map, { width, height } = surface.canvas, [x, y, w, h] = surface.box
  map.repeat.set(w / width, h / height)
  map.offset.set(x / width, 1 - (y + h) / height)
  map.needsUpdate = true
  screen.visible = w > 0
}

export function remove() {
  screen.removeFromParent()
  screen.geometry.dispose()
  screen.material.map?.dispose()
  screen.material.dispose()
}
