// The meters, on the `meters` panel inside the gym's card (`plugins/cards`), each driven by the
// `clock` row's `t` so it moves while the game runs and holds while it is paused:
// - `bars.rows`: a labelled `ui.bar` per row, `step` pixels apart down from `first`, its label at the
//   row's place in the `caption` style, its bar `bar` pixels on in the `bar` style, filled in the
//   row's `fill` to a wave of the clock, half plus half the sine of a turn every `period` seconds from
//   `phase` of a turn in, and that fill written as `value.text`'s `{percent}` at `value.at`, the
//   point `value.anchor` of the text standing there.
// - `pips`: `count` segments `size` pixels across with `radius` corners, `step` apart from `at`, the
//   first so many of them lit in `on` and the rest `off`, by the same wave over `period`, with no
//   phase; a segment lit for each whole share of the wave, rounded.
// - `ring`: a cooldown around `at`, `radius` pixels out in the `ring` style's `width`: its `track`
//   all round, and over it in `fill` the part of the `period` gone, swept clockwise from `start`
//   radians; the seconds left are written as `value.text`'s `{seconds}`, to a tenth.
// Each section's `label` is in the `caption` style.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

type Bar = { label: string; fill: string; period: number; phase: number }

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const { Graphics, Text } = ui.PIXI
  const d = def(plugins.wire, row.kind)
  const t: number = plugins.wire.rows.find(r => r.kind === 'clock')!.data.t
  plugins.cards.card(row, plugins)

  const b = d.bars
  b.rows.forEach((r: Bar, i: number) => {
    const x = b.first[0], y = b.first[1] + i * b.step
    const k = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t / r.period + r.phase))
    const label = ui.show('meters', `bar.${i}.label`, () => new Text({ text: '', style: ui.style('caption') }))
    label.position.set(x, y)
    label.text = r.label
    const bar = ui.show('meters', `bar.${i}`, () => ui.bar(ui.style('bar')))
    bar.position.set(x + b.bar[0], y + b.bar[1])
    bar.set(k, { color: r.fill })
    const value = ui.show('meters', `bar.${i}.value`, () => new Text({ text: '', style: ui.style('caption'), anchor: { x: b.value.anchor[0], y: b.value.anchor[1] } }))
    value.position.set(x + b.value.at[0], y + b.value.at[1])
    value.text = b.value.text.replace('{percent}', `${Math.round(k * 100)}`)
  })

  const p = d.pips
  const pipsLabel = ui.show('meters', 'pips.label', () => new Text({ text: '', style: ui.style('caption') }))
  pipsLabel.position.set(p.label.at[0], p.label.at[1])
  pipsLabel.text = p.label.text
  const lit = Math.round(p.count * (0.5 + 0.5 * Math.sin(2 * Math.PI * t / p.period)))
  const pips = ui.show('meters', 'pips', () => new Graphics())
  pips.position.set(p.at[0], p.at[1])
  pips.clear()
  for (let i = 0; i < p.count; i++) pips.roundRect(i * p.step, 0, p.size[0], p.size[1], p.radius).fill(i < lit ? p.on : p.off)

  const r = d.ring, look = ui.style('ring')
  const ringLabel = ui.show('meters', 'ring.label', () => new Text({ text: '', style: ui.style('caption') }))
  ringLabel.position.set(r.label.at[0], r.label.at[1])
  ringLabel.text = r.label.text
  const gone = (t % r.period) / r.period
  const ring = ui.show('meters', 'ring', () => new Graphics())
  ring.position.set(r.at[0], r.at[1])
  ring.clear().circle(0, 0, r.radius).stroke({ width: look.width, color: look.track })
  if (gone > 0) ring.moveTo(r.radius * Math.cos(r.start), r.radius * Math.sin(r.start)).arc(0, 0, r.radius, r.start, r.start + 2 * Math.PI * gone).stroke({ width: look.width, color: look.fill, cap: 'round' })
  const left = ui.show('meters', 'ring.value', () => new Text({ text: '', style: ui.style('caption'), anchor: { x: r.value.anchor[0], y: r.value.anchor[1] } }))
  left.position.set(r.value.at[0], r.value.at[1])
  left.text = r.value.text.replace('{seconds}', (r.period * (1 - gone)).toFixed(1))
}

export function remove() {}
