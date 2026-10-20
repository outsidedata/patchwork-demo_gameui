// The stack of notifications, on the `toasts` panel inside the gym's card (`plugins/cards`). Every
// `every` seconds of the `clock` row's `t` a new toast comes in at the top of the stack, `first`, and
// pushes the others `step` pixels down each, and each stays `stack` turns, so `stack` show at once.
// A toast fades and slides in from `slide` pixels to the right over its first `fade` seconds and fades
// out over its last. It is the `toast` style's card `size` pixels across, with a stripe `stripe` wide
// down its left in its line's `fill`, its `head` and `body` in the `toast.head` and `toast.body`
// styles at those places. The toasts take the `lines` in turn, the n-th toast the line n round them.
// Each is shown by its number, so it is made once and keeps its line while it moves down the stack.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const { Container, Graphics, Text } = ui.PIXI
  const d = def(plugins.wire, row.kind)
  const t: number = plugins.wire.rows.find(r => r.kind === 'clock')!.data.t
  plugins.cards.card(row, plugins)
  const newest = Math.floor(t / d.every), life = d.every * d.stack
  for (let i = 0; i < d.stack && newest - i >= 0; i++) {
    const n = newest - i, age = t - n * d.every
    const into = Math.min(1, age / d.fade), out = Math.min(1, (life - age) / d.fade)
    const toast = ui.show('toasts', `toast.${n}`, () => {
      const line = d.lines[n % d.lines.length], s = ui.style('toast'), [w, h] = d.size
      const c = new Container()
      const card = new Graphics().roundRect(0, 0, w, h, s.radius).fill(s.fill).stroke(s.edge)
      const stripe = new Graphics().roundRect(0, 0, s.stripe, h, s.radius).fill(line.fill)
      const head = new Text({ text: line.head, style: ui.style('toast.head') })
      const body = new Text({ text: line.body, style: ui.style('toast.body') })
      head.position.set(d.head[0], d.head[1])
      body.position.set(d.body[0], d.body[1])
      c.addChild(card, stripe, head, body)
      return c
    })
    toast.position.set(d.first[0] + d.slide * (1 - into), d.first[1] + i * d.step)
    toast.alpha = Math.min(into, out)
  }
}

export function remove() {}
