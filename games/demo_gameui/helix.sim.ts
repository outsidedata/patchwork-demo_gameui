// The double helix behind the HUD: no rule. Its definition holds every number of it, and the game's
// own `helix` plugin (`plugins/helix`) draws it on render3d's scene from that definition. The UI
// knows nothing of it.
import type { Kind } from '#engine/engine.ts'

export const helix: Kind = {}
