// A screen the game puts up: the `pause` panel, a modal on the layer over the menus, shown while the
// `pause` row is `on`. It is up for every seat and the server holds it: the clock and every seat's
// body, its `player` row, stand still under it. Escape, which is `world.ui`'s `back` and a key of the
// `pause` action, takes it down through the game, since on a screen the game put up the UI leaves
// `back` to the game. While it is
// up: the gym's card (`plugins/cards`); `resume`, a `button.primary` that asks the seat's `player` row
// to pause again, shown before anything else that takes the pointer so it takes the focus, and so a
// pad's A presses it; and the `head` in the `display` style and the `note` in the `caption` style,
// each with the point `anchor` of it at `at`.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  if (!row.data.on) return
  const { ui } = plugins
  const { Text } = ui.PIXI
  const d = def(plugins.wire, row.kind)
  plugins.cards.card(row, plugins)
  const resume = ui.show('pause', 'resume', () => ui.button({ ...ui.style('button.primary'), label: d.resume.text }).on('pointertap', () => plugins.player.pause()))
  resume.position.set(d.resume.at[0], d.resume.at[1])
  const head = ui.show('pause', 'head', () => new Text({ text: '', style: ui.style('display'), anchor: { x: d.head.anchor[0], y: d.head.anchor[1] } }))
  head.position.set(d.head.at[0], d.head.at[1])
  head.text = d.head.text
  const note = ui.show('pause', 'note', () => new Text({ text: '', style: ui.style('caption'), anchor: { x: d.note.anchor[0], y: d.note.anchor[1] } }))
  note.position.set(d.note.at[0], d.note.at[1])
  note.text = d.note.text
}

export function remove() {}
