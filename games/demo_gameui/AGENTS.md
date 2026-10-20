# demo_gameui — the UI reference

This game is not a game. It is the living reference for drawing a HUD and menus with core's `ui`
plugin (`plugins/ui/ui.plugin.ts`). Every file here shows one convention, done the way core wants
it done. When you build UI for a game, find the convention below, open its file, and copy its
shape.

Open it: `yarn vite`, then `localhost:5173/games/demo_gameui/index.html`.

## What you are looking at

- **The scene is not the UI.** A 3D scene draws on render3d's canvas: a DNA helix turning slowly,
  drawn by the game's own `helix` plugin, which knows nothing of the UI. The UI is a second,
  transparent canvas of PixiJS laid over it. Everything on the cards is the UI.
- **PixiJS draws all of it.** Text is `PIXI.Text` (the browser's fonts) or `PIXI.BitmapText` (a
  bitmap font from the loader). Shapes are `PIXI.Graphics`. There is no HTML and no CSS.

## Where each convention lives

| Convention | File | Panel |
| --- | --- | --- |
| Text styles and a palette from `world.ui.styles` | `specimen.client.ts` | `specimen` |
| `ui.button` in four styles, each tap doing something | `buttons.client.ts` | `buttons` |
| A picture on the HUD (`"for": "ui"`), a bitmap font, a bitmap button | `badge.client.ts` | `badge` |
| `ui.bar`, segments and a ring drawn with `Graphics` | `meters.client.ts` | `meters` |
| A score, a timer and lives in a corner | `hud.client.ts` | `hud` |
| Notifications that slide in, stack and fade | `toasts.client.ts` | `toasts` |
| `ui.iris`, the circle a scene change closes on | `iris.client.ts` | `iris` |
| A nameplate and health bar over a thing in the world (`ui.pin`) | `player.client.ts` | `names` |
| An arrow at the edge pointing at a thing off screen (`ui.project`) | `beacon.client.ts` | `edge` |
| A panel drawn on a screen in the 3D world (`ui.surface`) | `monitor.client.ts` | `monitor` |
| A menu the player opens (`key`, `modal`, `group`, `ui.opened`) | `menu.client.ts` | `menu` |
| A second menu in the same group | `help.client.ts` | `help` |
| A screen the game puts up (a pause the server holds) | `pause.client.ts`, `pause.sim.ts` | `pause` |
| Keyboard and gamepad through `control`, so a pad works the menus, bound only for the row that is `mine` | `player.client.ts` | — |
| One look shared by every panel (a plugin of the game's own) | `plugins/cards/cards.plugin.ts` | all |
| Scenery under the UI that knows nothing of it | `plugins/helix/helix.plugin.ts` | — |

The panels, keys and styles are `world.ui` in `main.scene.json`. Every place, word and number a
look uses is that kind's entry in `assets/demo_gameui.json`. The pictures and the font are made by
`assets/art.py`.

## The rules every file here follows

1. **Show it every frame, in `tick`.** `ui.show(panel, key, make)` puts a thing on a panel. `make`
   runs once; every later frame hands back the same object. A thing not shown in a frame is
   destroyed at the end of it. Never show in `setup` (it throws `ui has not ticked yet`), never add
   a child to a panel any other way, and never tear UI down in `remove`.
2. **Show, then place, then write.** Each thing is three lines in this order: `const x =
   ui.show(...)`, `x.position.set(...)`, then this frame's value (`x.text = ...`, `bar.set(...)`).
   No local helper hides `ui.show`.
3. **Something shown only sometimes is behind an `if`.** A menu behind `if (!ui.opened('menu'))
   return`, a game screen behind `if (!row.data.on) return`, a picture behind `if
   (loader.get(name))`.
4. **No number and no word in a look.** Where a panel sits is `world.ui.panels`. How a thing looks
   is a named style in `world.ui.styles`, fetched with `ui.style(name)`. Every place inside a panel,
   every label, every period and count is the kind's definition, read with `def(plugins.wire,
   row.kind)`. A line built from values is written whole on the definition with `{fields}` the look
   fills in (`"{minutes}:{seconds}"`).
5. **Nothing measures text.** Node cannot, so no layout here does. Every column is a number on the
   definition. Centre a text by its `anchor` (on the definition too), never by its width.
6. **What the HUD shows comes off a row.** Every animation here runs off the `clock` row's `t`, so
   it holds while the game is paused. A value of the whole scene the HUD shows (the clock, the
   pause) is a field of the row that holds it. A value of the seat's own (its health, its score,
   its ammo) is a field of its `player` row, which is the thing the seat plays as, read with
   `possessed(plugins.wire.rows)`: a page running the scene ahead draws that row from its copy, so
   the HUD shows the seat's own value on the frame after the key.
7. **A menu the player opens is the page's alone.** Its row holds no field saying it is up; the
   server never hears of it, and the game plays on under it. A pause that must stop the game is a
   screen the game puts up: a row (`pause.on`) the rules honour, toggled by an act.
8. **The back key backs out of both.** `world.ui.keys.back` closes a menu the player opened. On a
   screen the game put up the UI leaves `back` to the game, so the pause action is bound to the
   same key and takes the screen down again.
9. **Focus the right thing first.** When a modal takes the input, the focus goes to the first
   interactive thing it showed, so show that button first.
10. **A HUD picture is its own catalogue entry.** `"for": "ui"`, preloaded, drawn as a `Sprite`.
    The game renderer's texture of the same file cannot be drawn by the UI.
11. **Wait for a bitmap font.** Show a `BitmapText` or a `bitmap` button only once
    `loader.get(font)` has it, or it lays out in a fallback face and a button keeps that face.
12. **Code several kinds share is a plugin of the game's own**, in `plugins/<name>/`, listed in
    `world.shipped.plugins`, with `shipped` after `ui` in `plugins` when it shows things in `tick`.
    One look never imports another.

## The ui API, all of it

Drawing: `show(panel, key, make)`, `PIXI` (the whole PixiJS module), `button({ size, radius, fill,
focus, text, label, bitmap? })` with `.on('pointertap', fn)`, `bar({ size, edge?, frame?, track })`
with `.set(0..1, fill)`, `iris({ size, fill? })` with `.set(x, y, r)`, `style(name)`.

Panels and the world: `panel(name)` (a `Container`; `.boundsArea` is its size), `project(point)` →
`{ x, y, behind }`, `pin(thing, point)`, `surface(name)` → `{ canvas, box } | undefined`.

Menus: `open(name)`, `dismiss(name)`, `opened(name)`, `modal()`.

Input: `hit(x, y)`, `took(event)`, `keyDown(key)`, `keyUp(key)`, `focused(thing)`. There is no
setter for the focus: the pointer, the focus keys and a modal coming up move it.

`world.ui.panels.<name>`: `anchor` (`top-left`, `top`, `top-right`, `left`, `center`, `right`,
`bottom-left`, `bottom`, `bottom-right`), `at`, `size`, `clip`, `layer`, `scale`, `modal`,
`backdrop`, `key`, `group`, `screen`. `world.ui.keys`: `up`, `down`, `left`, `right`, `press`,
`back`, each a key or a list, gamepad keys (`Pad0`…) among them.

Not there yet: text entry, sliders, toggles, scroll lists, tooltips, a layout engine, a pressed or
disabled button state. Build them from `Graphics` and `Text` in a look, or add them to
`plugins/ui` in core with its tests.
