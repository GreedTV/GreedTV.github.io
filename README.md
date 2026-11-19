# Arena of Elements

A 3v3 elemental arena game that runs in the browser (Three.js).

Pick an element — **Fire, Water, Earth or Air** — and fight alongside two computer teammates.
Hit the other team to push them back across the zone lines. Knock everyone off the back edge
into the water, or hold more ground when time runs out. Win 2 rounds to win the match.

## Controls

| Key | Action |
|---|---|
| WASD | Move |
| Mouse | Aim |
| Hold left click | Attack |
| Right click / E | Special |
| Space | Dodge |
| P | Pause |
| M | Mute |
| G | Graphics quality (Low / Medium / High) |

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
