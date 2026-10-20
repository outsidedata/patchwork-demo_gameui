// A picture and a bitmap font on the HUD, on the `badge` panel inside the gym's card (`plugins/cards`).
// The picture is the loader's `picture` entry, `gem.ui`, which is `"for": "ui"`: the UI's PixiJS
// draws only an entry decoded for it, never the scene renderer's, so a file both draw is an entry
// for each. It is preloaded, and `plugins.loader.get` hands it back once it has landed and undefined
// until then, so it is shown behind an `if`: a `Sprite` at `icon.at`, drawn `icon.scale` canvas
// pixels to each of its own, filtered nearest as the entry says. Beside it, `count.text` with
// `{gems}` one more every `count.every` seconds of the `clock` row's `t`, a `BitmapText` in the
// `pixel` style, whose `fontFamily` is the loader's `font` entry, a `bitmapfont` for the ui. And a
// `ui.button` in the `button.pixel` style, whose `bitmap` draws its label in that font, at
// `button.at`, which asks the seat's `player` row to put the clock back to 0. Both wait behind
// `loader.get(font)` as the picture does: a `BitmapText` made before its font is installed lays out
// in a fallback face, and a button's label is written once, when it is made, so it would keep it.
// Under them the `notes` in the `caption` style.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui, loader, player } = plugins
  const { BitmapText, Sprite, Text } = ui.PIXI
  const d = def(plugins.wire, row.kind)
  const t: number = plugins.wire.rows.find(r => r.kind === 'clock')!.data.t
  plugins.cards.card(row, plugins)
  const picture = loader.get(d.picture)
  if (picture) {
    const icon = ui.show('badge', 'icon', () => new Sprite(picture))
    icon.position.set(d.icon.at[0], d.icon.at[1])
    icon.scale.set(d.icon.scale)
  }
  if (loader.get(d.font)) {
    const gems = ui.show('badge', 'count', () => new BitmapText({ text: '', style: ui.style('pixel') }))
    gems.position.set(d.count.at[0], d.count.at[1])
    gems.text = d.count.text.replace('{gems}', `${Math.floor(t / d.count.every)}`)
    const reset = ui.show('badge', 'button', () => ui.button({ ...ui.style(d.button.style), label: d.button.text }).on('pointertap', () => player.reset()))
    reset.position.set(d.button.at[0], d.button.at[1])
  }
  d.notes.forEach((n: { at: [number, number]; text: string }, i: number) => {
    const note = ui.show('badge', `note.${i}`, () => new Text({ text: '', style: ui.style('caption') }))
    note.position.set(n.at[0], n.at[1])
    note.text = n.text
  })
}

export function remove() {}
