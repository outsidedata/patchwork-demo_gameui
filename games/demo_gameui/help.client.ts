// The key reference, a menu the player opens: the `help` panel, a modal whose `key` (H) opens it and
// which `back` (Esc) or H closes, in one `group` with the menu. While `ui.opened('help')`: the gym's
// card (`plugins/cards`); its `close` button first, so it takes the focus, in the `button.secondary`
// style; and a line per entry of `lines`, `step` pixels apart down from `first`, its `key` in the
// `key` style and, `text` pixels on, what it does in the `body` style.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  if (!ui.opened('help')) return
  const { Text } = ui.PIXI
  const d = def(plugins.wire, row.kind)
  plugins.cards.card(row, plugins)
  ui.show('help', 'close', () => ui.button({ ...ui.style('button.secondary'), label: d.close.text }).on('pointertap', () => ui.dismiss('help'))).position.set(d.close.at[0], d.close.at[1])
  d.lines.forEach((line: { key: string; text: string }, i: number) => {
    const y = d.first[1] + i * d.step
    const key = ui.show('help', `key.${i}`, () => new Text({ text: '', style: ui.style('key') }))
    key.position.set(d.first[0], y)
    key.text = line.key
    const says = ui.show('help', `text.${i}`, () => new Text({ text: '', style: ui.style('body') }))
    says.position.set(d.first[0] + d.text, y)
    says.text = line.text
  })
}

export function remove() {}
