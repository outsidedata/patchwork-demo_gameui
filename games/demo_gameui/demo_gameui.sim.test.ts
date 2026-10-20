// demo_gameui: the manager booted as its page boots it and main loaded; a seat joins, its body, its
// `player` row, stands on its slot's start, and runs its definition's `speed` along the way `move`
// sends; the pause holds it still; and `move` refuses what is not two finite numbers.
import { expect, test } from 'vitest'
import { boot, type Scene } from '#engine/engine.ts'
import { connection, load, manager, type Down } from '#addons/scenemanager/scenemanager.addon.ts'
import { possessed } from '#addons/player/player.addon.ts'
import { sim } from './demo_gameui.sim.ts'
import file from './demo_gameui.scene.json' with { type: 'json' }
import defs from './assets/demo_gameui.json' with { type: 'json' }

const DT = file.prefabs.engine.dt

async function joined() {
  const truth = boot(file as Scene, sim)
  const room = (await load(truth, import.meta.url)).get('main')!
  const heard: Down[] = []
  const seat = connection(manager(truth), d => heard.push(d))
  truth.step(DT)
  let seq = 0
  const send = (action: string, ...args: unknown[]) => {
    const last = heard[heard.length - 1]
    const me = possessed(last.packet.rows)!
    seat.take({ scene: last.scene, seat: last.seat, msg: { seq: ++seq, n: last.packet.n, id: me.id, action, args } } as never)
  }
  const body = () => room.rows.find(r => r.kind === 'player')!
  const steps = (n: number) => { for (let i = 0; i < n; i++) truth.step(DT) }
  return { room, send, body, steps }
}

test('a seat joins main, its body stands on its start, and move runs it', async () => {
  const { room, send, body, steps } = await joined()
  const start = room.rows.find(r => r.kind === 'start' && r.data.slot === 0)!
  expect(body().data.pos).toEqual(start.data.pos)
  expect(room.rows.filter(r => r.kind === 'body')).toEqual([])
  send('move', 1, 0)
  steps(30)
  expect(body().data.pos[0]).toBeCloseTo(start.data.pos[0] + defs.player.speed * DT * 30)
  expect(body().data.pos[1]).toBe(start.data.pos[1])
})

test('the pause holds the body still, and move refuses what is not two finite numbers', async () => {
  const { send, body, steps } = await joined()
  send('move', 0, -1)
  steps(10)
  send('pause')
  steps(1)
  const held = [...body().data.pos]
  steps(30)
  expect(body().data.pos).toEqual(held)
  send('pause')
  send('move', 'up', 0)
  send('move', Infinity, 0)
  steps(1)
  expect(body().data.move).toEqual([0, -1])
  steps(29)
  expect(body().data.pos[1]).toBeGreaterThan(held[1])
})
