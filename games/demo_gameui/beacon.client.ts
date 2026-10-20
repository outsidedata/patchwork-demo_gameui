// An arrow at the canvas's edge pointing at each seat's body, its `player` row, walked off it, on the
// `edge` panel, which covers the canvas. `ui.project` turns the body's world point into a canvas point
// through render3d's camera; a point more than `margin` pixels inside every edge of the panel's `size`
// shows no arrow, so the arrow goes the frame the body comes back. Otherwise the arrow stands where
// the line from the panel's middle to the point crosses the box `margin` pixels in from the edge,
// turned to point along that line: a triangle `size` pixels from its middle to each corner, in the
// `arrow` style's `fill` and `edge`. Shown by the body's id, so every body has its own.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const { margin, size } = def(plugins.wire, row.kind)
  const { width, height } = ui.panel('edge').boundsArea
  const cx = width / 2, cy = height / 2
  for (const body of plugins.wire.rows.filter(r => r.kind === 'player')) {
    const p = ui.project(body.data.pos)
    if (p.x >= margin && p.x <= width - margin && p.y >= margin && p.y <= height - margin) continue
    const dx = p.x - cx, dy = p.y - cy
    const k = Math.min((cx - margin) / Math.abs(dx), (cy - margin) / Math.abs(dy))
    const arrow = ui.show('edge', `${body.id}.arrow`, () => {
      const look = ui.style('arrow')
      return new ui.PIXI.Graphics().poly([size, 0, -size, -size, -size, size]).fill(look.fill).stroke(look.edge)
    })
    arrow.position.set(cx + dx * k, cy + dy * k)
    arrow.rotation = Math.atan2(dy, dx)
  }
}

export function remove() {}
