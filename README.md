# Arena of Elements

A 3v3 elemental arena game that runs in the browser (Three.js).

Pick an element — **Fire, Water, Earth or Air** — and fight alongside two computer teammates.
Hit the other team to push them back across the zone lines. Knock everyone off the back edge
into the water, or hold more ground when time runs out. Win 2 rounds to win the match.

Works on PC and on phones/tablets (on-screen joystick and buttons, attacks auto-aim at the nearest enemy).
Choose **Easy / Normal / Hard** on the menu, customise your fighter (body, outfit, hair), and use
**⚙️ Settings** for volume, announcer voice, graphics level and a frame-rate counter.

**Local 2-player:** Co-op (both on blue) or Versus (one per team) on the same PC — Player 2 uses a controller
or the arrow keys (Enter attack · Right Shift special · Right Ctrl dodge · / ultimate).

Three arenas (Night, Sunset, Day), 12 achievements, a career with XP levels and stats saved in your browser, and it can be
**installed as an app** (📲 Install button or your browser's "Add to Home screen") and played offline.

## Controls

| Key | Action |
|---|---|
| WASD | Move |
| Mouse | Aim |
| Hold left click | Attack |
| Right click / E | Special |
| Space | Dodge |
| Q | Ultimate (when the meter is full): Inferno, Tsunami, Earthquake or Tornado |
| P | Pause |
| M | Mute |
| G | Graphics quality (Low / Medium / High) |

**Controller** (Xbox / PlayStation): left stick move · right stick aim (or auto-aim) · RT or A attack ·
B or RB special · X or LB dodge · Y ultimate · Start pause. On the menu, D-pad picks the element and A starts.

## Feedback

Use the **💬 Feedback** button (menu, pause screen or end screen). It opens a pre-filled issue
in this repository's [Issues](../../issues) tab, labelled `bug`, `idea`, `balance` or `feedback`.

## Run it locally

The game loads 3D model files, so it needs to be served over HTTP (opening `index.html` directly won't work):

```
python -m http.server 5180
```

Then open http://localhost:5180

## Files

- `index.html` — the game (arena, rules, AI, effects, sound, HUD)
- `looks.js` — fighter characters: bodies, hair, painted sports outfits, animations
- `models/quaternius/` — character, hair and animation models
- `model-test.html` — shows all four outfits side by side (`?body=female` for the female versions)

## Credits

- Characters, hair and animations: [Quaternius](https://quaternius.com) — Universal Base Characters and
  Universal Animation Library (CC0, see `models/quaternius/LICENSE-Quaternius.txt`)
- 3D engine: [three.js](https://threejs.org)
