// A screen the game puts up: while `on`, the clock and every seat's body (its `player` row) stand
// still and the pause screen is shown (`pause.client.ts`). `toggle` turns it over; it lists no `open`,
// so a seat reaches it only through its own `player` row.
import type { Kind } from '#engine/engine.ts'

export const pause: Kind = {
  acts: {
    toggle(me) {
      me.data.on = !me.data.on
    },
  },
}
