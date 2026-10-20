// demo_gameui run ahead by two seats at once on main: the game's server on a clock the test moves, and
// two predicting pages (`addons/predict`) on loopbacks, framing at 60 a second. A seat's body is its
// `player` row, which its page draws from its copy, so the way its stick points is drawn no later than
// the frame after the one it was sent on, over a clean wire, a home one and the network panel's bad
// ones, while the other seat walks now and then; and the pressing page is never corrected.
import { afterAll, beforeAll, expect, test, vi } from 'vitest'
import * as PIXI from 'pixi.js'
import { boot, seeded, type Scene } from '#engine/engine.ts'
import { accept, link, load, manager, run } from '#addons/scenemanager/scenemanager.addon.ts'
import { loopback, type Net, type Time } from '#addons/loopback/loopback.addon.ts'
import { predict } from '#addons/predict/predict.addon.ts'
import { possessed } from '#addons/player/player.addon.ts'
import { sim } from './demo_gameui.sim.ts'
import file from './demo_gameui.scene.json'
import main from './main.scene.json'

beforeAll(() => {
  vi.stubGlobal('addEventListener', () => {})
  vi.stubGlobal('removeEventListener', () => {})
  vi.stubGlobal('devicePixelRatio', 1)
  vi.stubGlobal('matchMedia', () => ({ addEventListener() {}, removeEventListener() {} }))
  // The UI's textures are decoded by PixiJS on the page; node has none, so each one the loader asks
  // for is a blank texture.
  vi.spyOn(PIXI.Assets, 'load').mockImplementation((async () => PIXI.Texture.WHITE) as any)
})
afterAll(() => vi.restoreAllMocks())

const here = new URL('./', import.meta.url).href
// The canvas a page would give its client's renderer and UI.
const surface = () => ({ addEventListener: () => {}, removeEventListener: () => {}, style: {} as any, width: main.prefabs.engine.width, height: main.prefabs.engine.height, remove() {} })

// A clock the test moves, as node's `setTimeout` falls due.
function clock() {
  let now = 0
  let queue: { at: number; i: number; f: () => void }[] = []
  let i = 0
  const time: Time = { now: () => now, after: (ms, f) => { queue.push({ at: now + Math.max(1, ms), i: i++, f }) } }
  const to = (t: number) => {
    for (;;) {
      const due = queue.filter(q => q.at <= t).sort((a, b) => a.at - b.at || a.i - b.i)[0]
      if (!due) break
      queue = queue.filter(q => q !== due)
      now = due.at
      due.f()
    }
    now = t
  }
  return { time, to, get now() { return now } }
}

// The wires each way: none, a home connection's, and the network panel's bad ones, which lose, bunch
// and reorder packets.
const wires = {
  clean: { delay: 0, jitter: 0 },
  home: { delay: 30, jitter: 10 },
  'bad wifi': { delay: 40, jitter: 40, tail: true, loss: 0.01, burst: 0.2 },
  mobile: { delay: 90, jitter: 80, tail: true, loss: 0.03, burst: 0.3, reorder: 0.02 },
}

test.each(Object.entries(wires))('a seat\'s stick over %s is drawn by the frame after it was sent', async (_name, leg) => {
  const truth = boot(structuredClone(file) as Scene, sim)
  await load(truth, here)
  const c = clock()
  vi.spyOn(performance, 'now').mockImplementation(() => c.now)
  const stop = run(truth, c.time)
  const open = (net: Net) => predict(link(loopback(accept(manager(truth)), c.time, net)), file as Scene, here, me => {
    for (const s of [me.plugins.render3d, me.plugins.ui]) if (s) s.canvas = surface()
  })
  const pages = [open({ up: leg, down: leg, seed: 1 }), open({ up: leg, down: leg, seed: 2 })]
  const die = seeded(5)
  // The way sent on each frame of seat 0's from its first, and the way its page drew after it.
  const sent: number[] = [], drawn: number[] = []
  for (let f = 0; f < 60 * 6; f++) {
    c.to(c.now + 1000 / 60)
    for (const [i, p] of pages.entries()) {
      const wire = p.client?.plugins.wire
      const me = possessed(wire?.rows ?? [])
      const pressing = i === 0 && !!wire && !!me?.data.stood && p.stats.predicting && f >= 60 * 2
      // A way across the screen no two frames share, never longer than the stick's unit.
      const x = Math.round((die() * 1.8 - 0.9) * 1e6) / 1e6
      if (pressing) wire!.send(me!.id, 'move', x, 0)
      if (i === 1 && wire && me?.data.stood && p.stats.predicting && die() < 0.05) wire.send(me.id, 'move', die() * 2 - 1, die() * 2 - 1)
      p.input()
      await p.frame(c.now)
      if (i !== 0 || (!pressing && !sent.length)) continue
      sent.push(x)
      drawn.push(possessed(p.client!.plugins.wire.rows)!.data.move[0])
    }
  }
  expect(sent.length).toBeGreaterThan(200)
  // Every frame draws the way sent on it, or on the frame before when no step ran between: before
  // the first, the body stood still.
  for (const [k, x] of drawn.entries()) expect([sent[k], sent[k - 1] ?? 0]).toContain(x)
  expect(pages[0].stats.corrections).toBe(0)
  for (const p of pages) p.close()
  stop.stop()
}, 600_000)
