// The type and colour specimen, on the `specimen` panel inside the gym's card (`plugins/cards`).
// Each entry of the definition's `type` is a line of its text in the `world.ui` style it names, at its
// `at`: every text style the gym uses, set in itself. Under them the palette, `swatches.colors`, as
// rounded chips `size` pixels across with `radius` corners, `per` to a row from `at`, `step` apart
// across and down, each edged in the card's `edge` so the darkest still shows on the card, and its
// colour written under it at `label`, in the `swatch` style.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const { Graphics, Text } = ui.PIXI
  const d = def(plugins.wire, row.kind)
  plugins.cards.card(row, plugins)
  d.type.forEach((line: { style: string; at: [number, number]; text: string }, i: number) => {
    const text = ui.show('specimen', `type.${i}`, () => new Text({ text: '', style: ui.style(line.style) }))
    text.position.set(line.at[0], line.at[1])
    text.text = line.text
  })
  const s = d.swatches, edge = ui.style('card').edge
  s.colors.forEach((color: string, i: number) => {
    const x = s.at[0] + (i % s.per) * s.step[0], y = s.at[1] + Math.floor(i / s.per) * s.step[1]
    ui.show('specimen', `swatch.${i}`, () => new Graphics().roundRect(0, 0, s.size[0], s.size[1], s.radius).fill(color).stroke(edge)).position.set(x, y)
    const label = ui.show('specimen', `swatch.${i}.label`, () => new Text({ text: '', style: ui.style('swatch') }))
    label.position.set(x + s.label[0], y + s.label[1])
    label.text = color
  })
}

export function remove() {}
