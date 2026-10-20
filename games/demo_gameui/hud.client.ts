// The corner readout, on the `hud` panel inside the gym's card (`plugins/cards`), the way a game's
// score, timer and lives sit in a corner. From the `clock` row's `t`: the score, `rate` points a
// second, whole, written `digits` wide with leading zeros as `score.text`'s `{score}`; the time as
// `time.text`'s `{minutes}` and `{seconds}`, the seconds two digits wide; each in the `readout` style
// at its `at`, under its `label` in the `caption` style. And `lives.count` diamonds, `lives.size`
// pixels from the middle to each point, in `lives.fill`, the first centred on `lives.at` and each
// `lives.step` pixels on, under their `label`.
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

export function setup() {}

export function tick(row: Row, plugins: Plugins) {
  const { ui } = plugins
  const { Graphics, Text } = ui.PIXI
  const { score, time, lives } = def(plugins.wire, row.kind)
  const t: number = plugins.wire.rows.find(r => r.kind === 'clock')!.data.t
  plugins.cards.card(row, plugins)

  const scoreLabel = ui.show('hud', 'score.label', () => new Text({ text: '', style: ui.style('caption') }))
  scoreLabel.position.set(score.label.at[0], score.label.at[1])
  scoreLabel.text = score.label.text
  const points = ui.show('hud', 'score', () => new Text({ text: '', style: ui.style('readout') }))
  points.position.set(score.at[0], score.at[1])
  points.text = score.text.replace('{score}', `${Math.floor(t * score.rate)}`.padStart(score.digits, '0'))

  const timeLabel = ui.show('hud', 'time.label', () => new Text({ text: '', style: ui.style('caption') }))
  timeLabel.position.set(time.label.at[0], time.label.at[1])
  timeLabel.text = time.label.text
  const clock = ui.show('hud', 'time', () => new Text({ text: '', style: ui.style('readout') }))
  clock.position.set(time.at[0], time.at[1])
  clock.text = time.text.replace('{minutes}', `${Math.floor(t / 60)}`).replace('{seconds}', `${Math.floor(t % 60)}`.padStart(2, '0'))

  const livesLabel = ui.show('hud', 'lives.label', () => new Text({ text: '', style: ui.style('caption') }))
  livesLabel.position.set(lives.label.at[0], lives.label.at[1])
  livesLabel.text = lives.label.text
  const diamonds = ui.show('hud', 'lives', () => new Graphics())
  diamonds.position.set(lives.at[0], lives.at[1])
  diamonds.clear()
  for (let i = 0; i < lives.count; i++) {
    const x = i * lives.step, s = lives.size
    diamonds.poly([x, -s, x + s, 0, x, s, x - s, 0]).fill(lives.fill)
  }
}

export function remove() {}
