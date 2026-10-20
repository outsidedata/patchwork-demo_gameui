// A menu the player opens: the `menu` panel, a modal whose `key` (M) opens it and which `back` (Esc)
// or M closes, in one `group` with `help`, so opening one closes the other. Nothing of it reaches the
// server, and the game plays on under it. While `ui.opened('menu')`: the gym's card
// (`plugins/cards`), and a `button.menu` per entry of `items`, `step` pixels apart down from `first`,
// the first shown first so it takes the focus, the arrows moving it and Enter or space pressing it.
// Each does what its `does` names: `close` closes the menu, `pause` closes it and asks the seat's
// `player` row to pause the game, `help` opens the help in its place, and `reset` puts the clock back
// to 0. Under them the `hint` in the `caption` style.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui, player } = plugins
  if (!ui.opened('menu')) return
  const d = def(plugins.wire, row.kind)
  const does: Record<string, () => void> = {
    close: () => ui.dismiss('menu'),
    pause: () => { ui.dismiss('menu'); player.pause() },
    help: () => ui.open('help'),
    reset: () => player.reset(),
  }
  plugins.cards.card(row, plugins)
  d.items.forEach((item: { text: string; does: string }, i: number) => {
    if (!(item.does in does)) throw new Error(`the menu has no ${item.does} to do`)
    ui.show('menu', `item.${i}`, () => ui.button({ ...ui.style('button.menu'), label: item.text }).on('pointertap', () => does[item.does]())).position.set(d.first[0], d.first[1] + i * d.step)
  })
  const hint = ui.show('menu', 'hint', () => new ui.PIXI.Text({ text: '', style: ui.style('caption') }))
  hint.position.set(d.hint.at[0], d.hint.at[1])
  hint.text = d.hint.text
}

export function remove() {}
