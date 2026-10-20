// The iris a scene change closes on, on the `iris` panel inside the gym's card (`plugins/cards`): a
// little scene in a `box` `size` pixels across at `at`, its `ground` with a `hero` dot on it, under a
// `ui.iris` of the box's size in `fill`. The iris closes on the hero and opens again every `period`
// seconds of the `clock` row's `t`, its radius `reach` times the size of the cosine of half a turn a
// period, so it opens past the box's far corner and shuts to nothing; it holds while the game is
// paused, as the clock does.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const { Container, Graphics } = ui.PIXI
  const d = def(plugins.wire, row.kind)
  const t: number = plugins.wire.rows.find(r => r.kind === 'clock')!.data.t
  const [w, h] = d.box.size, hero = d.hero
  plugins.cards.card(row, plugins)
  const scene = ui.show('iris', 'scene', () => {
    const c = new Container()
    const cover = ui.iris({ size: [w, h], fill: { color: d.fill } })
    cover.label = 'cover'
    c.addChild(new Graphics().rect(0, 0, w, h).fill(d.ground), new Graphics().circle(hero.at[0], hero.at[1], hero.radius).fill(hero.fill), cover)
    return c
  })
  scene.position.set(d.box.at[0], d.box.at[1])
  scene.getChildByLabel('cover').set(hero.at[0], hero.at[1], d.reach * Math.abs(Math.cos(Math.PI * t / d.period)))
}

export function remove() {}
