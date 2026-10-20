// The kinds of main and the main.scene.json file next to this one. Every number of them that
// never changes is its definition in `assets/demo_gameui.json`, which the scene's `world.defs` names.
// Each seat's body is its `player` row, and where it starts is a `start` actor of the scene file, one
// per slot. `AGENTS.md` beside this file maps each kind to the convention of the `ui` plugin it shows.
import type { Scene, Sim } from '#engine/engine.ts'
import { scenemanager } from '#plugins/scenemanager/scenemanager.sim.ts'
import { loader } from '#plugins/loader/loader.sim.ts'
import { player } from './player.sim.ts'
import { start } from './start.sim.ts'
import { clock } from './clock.sim.ts'
import { pause } from './pause.sim.ts'
import { helix } from './helix.sim.ts'
import { specimen } from './specimen.sim.ts'
import { badge } from './badge.sim.ts'
import { buttons } from './buttons.sim.ts'
import { meters } from './meters.sim.ts'
import { iris } from './iris.sim.ts'
import { hud } from './hud.sim.ts'
import { toasts } from './toasts.sim.ts'
import { monitor } from './monitor.sim.ts'
import { beacon } from './beacon.sim.ts'
import { menu } from './menu.sim.ts'
import { help } from './help.sim.ts'
import file from './main.scene.json' with { type: 'json' }

export const sim: Sim = { scenemanager, loader, player, start, clock, pause, helix, specimen, badge, buttons, meters, iris, hud, toasts, monitor, beacon, menu, help }

export const scene = file as Scene
