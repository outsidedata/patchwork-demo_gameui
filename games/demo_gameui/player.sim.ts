// The row one seat possesses, and that seat's body: where it stands in the world (`pos`, metres, on
// the plane z = 0 facing the camera) and `move`, the way its seat's stick points, at most a unit long,
// y growing down as a stick's does. `addons/player` spawns it and writes the slot it gave the
// connection into `seat`, and every seat is sent it. A page running the scene ahead (`addons/predict`)
// draws its own from its copy, so the seat's body moves on the frame after its key, at any lag.
// `before` stands it on the scene's `start` actor for that slot, at its `pos`, once, and marks it
// `stood`. Each step it runs `speed` metres a second along `move`, up the world for a stick pushed
// up; `speed` is the player's definition in `assets/demo_gameui.json`. It stands still while the
// `pause` row is on.
//
// The acts are the page's keys and the HUD's buttons: `move(x, y)`, the stick, two finite numbers
// kept to a unit's length at most; `pause` turns the `pause` row over and `reset` puts the clock back
// to 0, both asked from the HUD's buttons and the menu, and both the whole scene's.
import type { Kind } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import * as math from '#plugins/math/math.sim.ts'

export const player: Kind = {
  before(me, _dt, w) {
    const d = me.data
    if (d.stood) return
    d.pos = [...w.find('start', s => s.data.slot === d.seat).data.pos]
    d.stood = true
  },
  tick(me, dt, w) {
    const d = me.data
    if (!d.stood || w.find('pause').data.on) return
    const [x, y] = d.move
    if (!x && !y) return
    const step = def(w, me.kind).speed * dt
    d.pos = [d.pos[0] + x * step, d.pos[1] - y * step, d.pos[2]]
  },
  acts: {
    move(me, _w, _seat, x: unknown, y: unknown) {
      if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) return
      const len = math.hypot(x, y)
      me.data.move = len > 1 ? [x / len, y / len] : [x, y]
    },
    pause(_me, w, seat) {
      w.call(w.find('pause'), 'toggle', seat)
    },
    reset(_me, w, seat) {
      w.call(w.find('clock'), 'reset', seat)
    },
  },
}
