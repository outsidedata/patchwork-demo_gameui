# demo_gameui: the UI reference

Not a game: every way of drawing a HUD and menus with core's `ui` plugin, each on a card of its own
over a slowly turning DNA helix. Text styles and a palette, buttons in four styles, a picture and a
bitmap font on the HUD, bars, segments and a ring, a score, a timer and lives in a corner, toasts
that slide in and fade, the iris a scene change closes on, a nameplate and health bar over each
player, an arrow at the screen's edge pointing at a thing off screen, a panel drawn on a screen in
the 3D world, two menus the player opens, and a pause screen the game puts up.

Arrows or WASD walk your cube, or a gamepad's stick or d-pad. M opens the menu and H the help;
the arrows move the focus, Enter or Space presses, and Escape backs out. Escape, or a pad's Start,
pauses the game; Escape again, or the pause screen's Resume button, resumes it.

`AGENTS.md` says which file shows each convention and the rules every file follows.

## Playing it

```
yarn vite                                                         # then /games/demo_gameui/index.html
node --experimental-strip-types games/demo_gameui/demo_gameui.server.ts   # then /games/demo_gameui/client.html
```

## Remaking the art

```
python3 games/demo_gameui/assets/art.py                           # gem.png, and the pixel font: pixel.png and pixel.fnt
```

`art.py` draws every picture from the dots written in it, with Pillow, and reads nothing from the
library.
