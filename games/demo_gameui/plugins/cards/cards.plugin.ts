// The gym's card, the one look every specimen panel shares: `card(row, plugins)`, called from a look's
// `tick` every frame it wants its panel shown, draws the panel's background and its title from the
// row's definition, `card: { panel, title: { at, text } }`. The background fills the panel's `size`
// (its `boundsArea`) in the `card` style of `world.ui`, `radius`, `fill` and `edge`; the title is a
// `Text` in the `eyebrow` style at `title.at`. Both are shown before anything else of the panel, so
// they lie under it, and neither takes the pointer, so a modal's focus goes to its first button.
// A look of a modal calls it only behind the `if` that shows the modal, since a modal showing
// anything has the input. It has no tick and keeps nothing.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function cards() {
  return {
    card(row: Row, plugins: Plugins) {
      const { ui } = plugins
      const { panel, title } = def(plugins.wire, row.kind).card
      const s = ui.style('card'), box = ui.panel(panel).boundsArea
      ui.show(panel, 'card', () => new ui.PIXI.Graphics().roundRect(0, 0, box.width, box.height, s.radius).fill(s.fill).stroke(s.edge))
      const text = ui.show(panel, 'title', () => new ui.PIXI.Text({ text: '', style: ui.style('eyebrow') }))
      text.position.set(title.at[0], title.at[1])
      text.text = title.text
    },
  }
}
