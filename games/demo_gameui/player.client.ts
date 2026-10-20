// One seat's body, its `player` row, drawn for every seat: a cube of the player's definition's `size`
// and `colour` in `assets/demo_gameui.json`, unlit, at the row's `pos` in render3d's scene. Over it, a
// nameplate pinned to the world point `nameplate.lift` metres above `pos` (`ui.pin`) on the `names`
// panel: the nameplate's `text` in the `nameplate` style, its bottom middle on the point, and under it
// a bar in the `bar.small` style at `bar.at`, filled in `bar.fill` to a wave of the `clock` row's `t`,
// half plus half the sine of a turn every `bar.period` seconds. Shown by the row's id, so every body
// has its own. A page running the scene ahead draws its own seat's row from its copy, so its own cube
// moves on the frame after the key.
//
// For the seat's own row, the one that is `mine`, also its controls, on the scene's actions
// (`world.player.actions`) through `plugins.player.control`, so a gamepad plays as the keyboard does
// and reaches the UI's menus: `walk`, a stick, sends `move` the way it points, y growing down; `pause`
// sends `pause` the moment it goes down. `pause`'s keys are Escape, which is `world.ui`'s `back`, and a
// pad's Start: on the pause screen the UI leaves `back` to the game, so Escape takes the screen down
// again; a pad, whose keys reach no game act while a modal is up, leaves it by its Resume button.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import type { Controls } from '#plugins/player/player.plugin.ts'
import { def } from '#plugins/loader/loader.sim.ts'

let cube: any
let ours = false

export function setup(row: Row, plugins: Plugins) {
  const { THREE, scene } = plugins.render3d
  const { size, colour } = def(plugins.wire, row.kind)
  cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshBasicMaterial({ color: colour }))
  cube.position.fromArray(row.data.pos)
  scene.add(cube)
  ours = row.data.mine === true
  if (!ours) return
  plugins.player.control({
    stick: { walk: (x, y) => ['move', x, y] },
    press: { pause: ['pause'] },
  } satisfies Controls)
}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const plate = def(plugins.wire, row.kind).nameplate
  const t: number = plugins.wire.rows.find(r => r.kind === 'clock')!.data.t
  cube.position.fromArray(row.data.pos)
  const tag = ui.show('names', `${row.id}.plate`, () => {
    const it = new ui.PIXI.Container()
    const name = new ui.PIXI.Text({ text: plate.text, style: ui.style('nameplate'), anchor: { x: 0.5, y: 1 } })
    const health = ui.bar(ui.style('bar.small'))
    health.label = 'health'
    health.position.set(plate.bar.at[0], plate.bar.at[1])
    it.addChild(name, health)
    return it
  })
  tag.getChildByLabel('health').set(0.5 + 0.5 * Math.sin(2 * Math.PI * t / plate.bar.period), { color: plate.bar.fill })
  ui.pin(tag, [row.data.pos[0], row.data.pos[1] + plate.lift, row.data.pos[2]])
}

export function remove(plugins: Plugins) {
  cube.removeFromParent()
  cube.geometry.dispose()
  cube.material.dispose()
  if (ours) plugins.player.unbind()
}
