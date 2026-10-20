// The gym's clock: `t`, the seconds the scene has run, which every meter, readout, toast and iris on
// the HUD is driven by. It stands still while the `pause` row is on, as every rule that must stop
// does, and `reset`, which the seat's `player` row hands on, puts it back to 0.
import type { Kind } from '#engine/engine.ts'

export const clock: Kind = {
  tick(me, dt, w) {
    if (w.find('pause').data.on) return
    me.data.t += dt
  },
  acts: {
    reset(me) {
      me.data.t = 0
    },
  },
}
