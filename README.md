# Arena of Elements

A 3v3 elemental arena game that runs in the browser (Three.js).

Pick an element — **Fire, Water, Earth, Air or Lightning** — and fight alongside two computer teammates.
Hit the other team to push them back across the zone lines. Knock everyone off the back edge
into the water, or hold more ground when time runs out. Win 2 rounds to win the match.

Works on PC and on phones/tablets (on-screen joystick and buttons, attacks auto-aim at the nearest enemy).
Choose **Easy / Normal / Hard** on the menu, customise your fighter (body, outfit, hair), and use
**⚙️ Settings** for volume, announcer voice, graphics level and a frame-rate counter.

**🏆 Ladder:** five stages in a row — Rookie Ring, Rising Tide, Stone Wall, Storm Front and the Grand Final —
each harder, with its own arena and enemy team. Progress is saved; beat all five to become 👑 Champion.

**🎯 Practice:** pick *Practice* under Players for a training room — 3 dummies that don't fight back, no timer,
and a step-by-step guide through moving, attacking, specials, dodging, ultimates and ring-outs.

**🌐 Online with friends:** press **Online** on the menu → *Host a room* and share the 5-letter code or the
invite link. Up to 6 players (3 per team); computer fighters fill empty spots. Players connect directly to each
other (WebRTC via [PeerJS](https://peerjs.com)); the host's game runs the match.

**Local 2-player:** Co-op (both on blue) or Versus (one per team) on the same PC — Player 2 uses a controller
or the arrow keys (Enter attack · Right Shift special · Right Ctrl dodge · / ultimate).

🗓️ **Daily challenges** (3 new goals every day, +150 XP each), three arenas (Night, Sunset, Day), 12 achievements, a career with XP levels and stats saved in your browser, and it can be
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
| 1–4 | Quick chat: GG! · Nice shot! · Help! · Watch this! (D-pad on a controller, 💬 on touch) |
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
