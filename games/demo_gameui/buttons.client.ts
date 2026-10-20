// The button styles, on the `buttons` panel inside the gym's card (`plugins/cards`): each entry of
// the definition's `buttons` is a `ui.button` in the `world.ui` style it names, at its `at`, reading
// its `text`, and each does what its `does` names: `pause` asks the seat's `player` row to pause the
// game, `reset` to put the clock back to 0, and `menu` and `help` open those menus on the page. A
// button shows its style's `focus` fill while the pointer is over it. Under them, the `notes`, each a
// line in the `caption` style.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui, player } = plugins
  const d = def(plugins.wire, row.kind)
  const does: Record<string, () => void> = {
    pause: () => player.pause(),
    reset: () => player.reset(),
    menu: () => ui.open('menu'),
    help: () => ui.open('help'),
  }
  plugins.cards.card(row, plugins)
  d.buttons.forEach((b: { style: string; at: [number, number]; text: string; does: string }, i: number) => {
    if (!(b.does in does)) throw new Error(`the buttons have no ${b.does} to do`)
    const button = ui.show('buttons', `button.${i}`, () => ui.button({ ...ui.style(b.style), label: b.text }).on('pointertap', () => does[b.does]()))
    button.position.set(b.at[0], b.at[1])
  })
  d.notes.forEach((n: { at: [number, number]; text: string }, i: number) => {
    const note = ui.show('buttons', `note.${i}`, () => new ui.PIXI.Text({ text: '', style: ui.style('caption') }))
    note.position.set(n.at[0], n.at[1])
    note.text = n.text
  })
}

export function remove() {}
