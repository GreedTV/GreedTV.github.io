// Fighter looks: Quaternius "Universal Base Characters" bodies + hair (CC0),
// animated with the Quaternius "Universal Animation Library" (CC0).
// Clothing is painted onto the body in the shader, using the body's T-pose (bind pose)
// coordinates to decide where each piece goes (jersey, shorts, socks, sneakers, pads, stripes...).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const DIR = 'models/quaternius/';
export const TARGET_HEIGHT = 2.2;

export const BODY_FILES = { male: 'Superhero_Male_FullBody', female: 'Superhero_Female_FullBody' };
// Hairstyles per body. Each hair model is shaped for one head, so it is only offered on that body.
export const HAIR_STYLES = {
  male: [
    { name: 'Buzz cut + beard', parts: ['Hair_Buzzed', 'Hair_Beard'] },
    { name: 'Buzz cut', parts: ['Hair_Buzzed'] },
    { name: 'Side part', parts: ['Hair_SimpleParted'] },
    { name: 'Side part + beard', parts: ['Hair_SimpleParted', 'Hair_Beard'] },
    { name: 'Bald + beard', parts: ['Hair_Beard'] },
  ],
  female: [
    { name: 'Long hair', parts: ['Hair_Long'] },
    { name: 'Buns', parts: ['Hair_Buns'] },
    { name: 'Buzz cut', parts: ['Hair_BuzzedFemale'] },
  ],
};
// Modern sports outfits, all painted in the body shader (kit number = shader variant).
export const OUTFITS = [
  { id: 'suit', name: 'Hero suit', kit: 0 },
  { id: 'jersey', name: 'Sport jersey', kit: 1 },
  { id: 'track', name: 'Tracksuit', kit: 2 },
  { id: 'gear', name: 'Pro armor', kit: 3 },
];
export const HAIR_COLORS = [
  { name: 'Black', hex: 0x15151a }, { name: 'Dark brown', hex: 0x2e1c10 }, { name: 'Auburn', hex: 0x6a2410 },
  { name: 'Blonde', hex: 0xc9a25a }, { name: 'Silver', hex: 0xe2dbd0 }, { name: 'Fire red', hex: 0xb02010 },
  { name: 'Ocean blue', hex: 0x1d4f9a },
];
// element colours used on panels, stripes, glow lines, emblem and eyes
export const ELEMENT_STYLE = {
  fire:  { panel: 0xd0400c, glow: 0xff6a1a },
  water: { panel: 0x1a8ad8, glow: 0x3fb4ff },
  earth: { panel: 0x8a6436, glow: 0xe0a050 },
  air:   { panel: 0xc8d8e6, glow: 0xbff0ff },
};

// game action -> clip name in Anims.glb (from the Universal Animation Library)
export const CLIP_NAMES = {
  idle: 'Idle_Loop', run: 'Jog_Fwd_Loop', sprint: 'Sprint_Loop', back: 'Walk_Loop',
  punchA: 'Punch_Jab', punchB: 'Punch_Cross', cast: 'Spell_Simple_Shoot', stomp: 'Jump_Land',
  hitA: 'Hit_Chest', hitB: 'Hit_Head', roll: 'Roll', fall: 'Jump_Loop', cheer: 'Dance_Loop',
};

const BODIES = {}, HAIRS = {};
export let CLIPS = [];

export async function loadLooks(onProgress = () => {}) {
  const loader = new GLTFLoader();
  const hairNames = [...new Set(Object.values(HAIR_STYLES).flat().flatMap(s => s.parts))];
  const jobs = [
    ...Object.entries(BODY_FILES).map(([k, f]) => [f, 'body', k]),
    ...hairNames.map(n => [n, 'hair']),
    ['Anims', 'anim'], // the 13 clips the game uses, cut from the Universal Animation Library
  ];
  let done = 0;
  await Promise.all(jobs.map(([n, kind, key]) =>
    loader.loadAsync(DIR + n + '.glb').then(g => {
      if (kind === 'body') BODIES[key] = prepBody(g);
      else if (kind === 'hair') HAIRS[n] = g.scene;
      else CLIPS = g.animations;
      onProgress(++done, jobs.length);
    })));
}

function prepBody(g) {
  const root = g.scene;
  root.updateMatrixWorld(true);
  const P = {};
  root.traverse(o => { if (o.isBone) P[o.name] = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); });
  const box = new THREE.Box3().setFromObject(root);
  return {
    root, height: box.max.y - box.min.y,
    // body landmarks in bind pose (metres, T-pose: arms straight out along X)
    marks: {
      neck: P.neck_01.y + 0.02, wrist: Math.abs(P.hand_l.x) - 0.035, ankle: P.foot_l.y + 0.07,
      pelvis: P.pelvis.y, armY: P.upperarm_l.y, chest: P.spine_03.y + 0.06,
      elbow: Math.abs(P.lowerarm_l.x), knee: P.calf_l.y, shoulderX: Math.abs(P.upperarm_l.x), thighX: Math.abs(P.thigh_l.x),
    },
  };
}

// Each kit is a block of shader code that sets: col (cloth colour), cover (0..1 how much is clothed),
// glowM (glowing trim), rough (cloth roughness). Shared helpers/masks are computed before it.
const KITS = [
  // 0: Hero suit — skin-tight suit in team colour, element panels, gloves, boots, glowing trim
  `cover = belowNeck;
   float shoulder = smoothstep(0.165, 0.18, ax) * (1.0 - smoothstep(0.34, 0.355, ax)) * smoothstep(uArmY - 0.02, uArmY - 0.005, b.y);
   float armStripe = smoothstep(0.35, 0.36, ax) * (1.0 - glove) * bandAt(b.y, uArmY + 0.035, 0.035);
   float legStripe = smoothstep(0.155, 0.165, ax) * legs * (1.0 - boot);
   float side = smoothstep(0.13, 0.14, ax) * (1.0 - step(0.2, ax)) * step(uPelvis, b.y) * (1.0 - step(uArmY - 0.07, b.y));
   float belt = bandAt(b.y, uPelvis + 0.04, 0.05) * (1.0 - step(0.3, ax));
   col = uSuit;
   col = mix(col, uPanel, clamp(shoulder + armStripe + legStripe + side + emblemRing, 0.0, 1.0));
   col = mix(col, uDark, clamp(glove + boot + belt, 0.0, 1.0));
   col = mix(col, uGlow, emblem);
   glowM = bandAt(b.y, uNeck - 0.012, 0.01) + bandAt(ax, uWrist - 0.01, 0.01) * isArm + bandAt(b.y, uAnkle + 0.01, 0.01)
         + bandAt(b.y, uPelvis + 0.075, 0.008) * (1.0 - isArm) + bandAt(ax, 0.155, 0.006) * legs * (1.0 - boot) + emblem;
   rough = 0.32;`,
  // 1: Sport jersey — sleeveless team jersey, shorts, knee socks, sneakers, wristbands (bare arms and knees)
  `float jersey = torso * (1.0 - smoothstep(uNeck - 0.035, uNeck - 0.025, b.y));
   float shorts = legs * step(uKnee + 0.12, b.y) + step(uPelvis - 0.02, b.y) * (1.0 - step(uPelvis + 0.06, b.y)) * (1.0 - isArm);
   float socks = legs * step(uAnkle, b.y) * (1.0 - step(uKnee - 0.03, b.y));
   float band = isArm * step(uWrist - 0.075, ax) * (1.0 - step(uWrist - 0.005, ax));
   float shoes = boot;
   cover = clamp(jersey + shorts + socks + band + shoes, 0.0, 1.0);
   float sidePanel = jersey * smoothstep(0.12, 0.13, ax);
   float shortStripe = shorts * smoothstep(uThighX + 0.055, uThighX + 0.065, ax);
   col = uSuit * 1.1;
   col = mix(col, uPanel, clamp(sidePanel + emblemRing * jersey, 0.0, 1.0));
   col = mix(col, uGlow, emblem * jersey);
   col = mix(col, uSuit * 0.45, shorts); col = mix(col, uPanel, shortStripe);
   col = mix(col, vec3(0.85), socks); col = mix(col, uPanel, socks * bandAt(b.y, uKnee - 0.06, 0.03));
   col = mix(col, uPanel, band);
   col = mix(col, vec3(0.9), shoes); col = mix(col, uDark, shoes * (1.0 - step(0.025, b.y)));
   glowM = jersey * bandAt(b.y, uNeck - 0.035, 0.008) + jersey * bandAt(ax, uShoulderX - 0.012, 0.008) + band * bandAt(ax, uWrist - 0.04, 0.008)
         + emblem * jersey + shoes * bandAt(b.y, 0.03, 0.008);
   rough = 0.75;`,
  // 2: Tracksuit — zip jacket with arm stripes and glowing zip, track pants with side stripes, sneakers
  `float jacket = belowNeck * step(uPelvis - 0.04, b.y) * (1.0 - glove * 0.0) * (1.0 - step(uWrist - 0.01, ax));
   float pants = (1.0 - step(uPelvis - 0.04, b.y)) * (1.0 - boot);
   float shoes = boot;
   cover = clamp(jacket + pants + shoes, 0.0, 1.0);
   float armStripes = isArm * (bandAt(b.y, uArmY + 0.05, 0.012) + bandAt(b.y, uArmY + 0.03, 0.012) + bandAt(b.y, uArmY + 0.01, 0.012));
   float pantStripes = pants * (bandAt(ax, uThighX + 0.07, 0.012) + bandAt(ax, uThighX + 0.045, 0.012)) * 0.0
                     + pants * smoothstep(uThighX + 0.05, uThighX + 0.06, ax) * (1.0 - smoothstep(uThighX + 0.085, uThighX + 0.095, ax));
   float cuff = isArm * step(uWrist - 0.05, ax);
   float collar = jacket * step(uNeck - 0.045, b.y);
   col = uSuit; col = mix(col, uPanel, clamp(armStripes + collar + cuff, 0.0, 1.0));
   col = mix(col, uSuit * 0.3, pants); col = mix(col, uPanel, pantStripes);
   col = mix(col, vec3(0.92), shoes); col = mix(col, uPanel, shoes * (1.0 - step(0.03, b.y)));
   glowM = jacket * front * bandAt(b.x, 0.0, 0.008) * (1.0 - isArm) + collar * bandAt(b.y, uNeck - 0.045, 0.008) + shoes * bandAt(b.y, 0.035, 0.008);
   rough = 0.6;`,
  // 3: Pro armor — dark under-suit with team chest plate, big shoulder pads, element elbow/knee pads
  `cover = belowNeck;
   float plate = torso * front * step(uPelvis + 0.14, b.y) * (1.0 - step(uNeck - 0.05, b.y)) * (1.0 - smoothstep(0.13, 0.14, ax));
   float pads = smoothstep(uShoulderX - 0.07, uShoulderX - 0.06, ax) * (1.0 - smoothstep(uShoulderX + 0.11, uShoulderX + 0.12, ax)) * step(uArmY - 0.03, b.y) * belowNeck;
   float elbow = isArm * (1.0 - smoothstep(0.045, 0.05, abs(ax - uElbow)));
   float kneeP = legs * front * (1.0 - smoothstep(0.055, 0.06, abs(b.y - uKnee)));
   col = vec3(0.07, 0.075, 0.09);
   col = mix(col, uSuit * 1.15, clamp(plate + pads, 0.0, 1.0));
   col = mix(col, uPanel, clamp(elbow + kneeP + emblemRing * plate, 0.0, 1.0));
   col = mix(col, uGlow, emblem);
   col = mix(col, uDark, clamp(glove + boot, 0.0, 1.0));
   glowM = plate * (bandAt(ax, 0.13, 0.008) + bandAt(b.y, uPelvis + 0.145, 0.008)) + pads * bandAt(b.y, uArmY - 0.025, 0.008)
         + bandAt(ax, uWrist - 0.01, 0.01) * isArm + bandAt(b.y, uAnkle + 0.01, 0.01) + emblem;
   rough = 0.4;`,
];

function kitMaterial(orig, marks, teamColor, el, kit) {
  const m = orig.clone();
  const S = ELEMENT_STYLE[el];
  const U = {
    uSuit: { value: new THREE.Color(teamColor).multiplyScalar(0.55) },
    uPanel: { value: new THREE.Color(S.panel) },
    uGlow: { value: new THREE.Color(S.glow) },
    uDark: { value: new THREE.Color(0x15171c) },
    uNeck: { value: marks.neck }, uWrist: { value: marks.wrist }, uAnkle: { value: marks.ankle },
    uPelvis: { value: marks.pelvis }, uArmY: { value: marks.armY }, uChest: { value: marks.chest },
    uElbow: { value: marks.elbow }, uKnee: { value: marks.knee }, uShoulderX: { value: marks.shoulderX }, uThighX: { value: marks.thighX },
  };
  m.customProgramCacheKey = () => 'kit-v3-' + kit;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vBind;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vBind = position;');
    sh.fragmentShader = `varying vec3 vBind;
      uniform vec3 uSuit, uPanel, uGlow, uDark;
      uniform float uNeck, uWrist, uAnkle, uPelvis, uArmY, uChest, uElbow, uKnee, uShoulderX, uThighX;
      float bandAt(float v, float c, float w) { return 1.0 - smoothstep(w * 0.5, w * 0.5 + 0.005, abs(v - c)); }
      float coverMask, glowMask, roughK;
      ` + sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        {
          vec3 b = vBind; float ax = abs(b.x);
          float front = smoothstep(0.0, 0.03, b.z);
          float belowNeck = 1.0 - smoothstep(uNeck - 0.006, uNeck + 0.006, b.y);
          float isArm = smoothstep(uShoulderX - 0.02, uShoulderX, ax) * step(uPelvis + 0.15, b.y);
          float glove = smoothstep(uWrist - 0.006, uWrist + 0.006, ax);
          float boot = 1.0 - smoothstep(uAnkle - 0.006, uAnkle + 0.006, b.y);
          float legs = 1.0 - step(uPelvis - 0.02, b.y);
          float torso = belowNeck * (1.0 - isArm) * step(uPelvis - 0.02, b.y);
          float emblemD = abs(b.x) + abs(b.y - uChest - 0.02);
          float emblem = (1.0 - smoothstep(0.032, 0.037, emblemD)) * front;
          float emblemRing = bandAt(emblemD, 0.047, 0.012) * front;
          vec3 col = diffuseColor.rgb; float cover = 0.0; float glowM = 0.0; float rough = 0.5;
          ${KITS[kit]}
          coverMask = clamp(cover, 0.0, 1.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, col, coverMask);
          glowMask = clamp(glowM, 0.0, 1.0) * coverMask;
          roughK = rough;
        }`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, roughK, coverMask);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += uGlow * glowMask * 1.8;');
  };
  return m;
}

const wrap = (i, n) => ((i % n) + n) % n;

// Build one character.
//   look = { el, team: 0xRRGGBB, body: 'male'|'female', hair, hairColor (indexes), outfit: OUTFITS id }
// Returns { model, mats, hands: [left, right], head, feet, scale }. Model faces +Z, feet at y=0.
export function makeCharacter(look) {
  const B = BODIES[look.body] || BODIES.male;
  const styles = HAIR_STYLES[look.body] || HAIR_STYLES.male;
  const style = styles[wrap(look.hair | 0, styles.length)];
  const hairHex = HAIR_COLORS[wrap(look.hairColor | 0, HAIR_COLORS.length)].hex;
  const kit = (OUTFITS.find(o => o.id === look.outfit) || OUTFITS[0]).kit;
  const glow = new THREE.Color(ELEMENT_STYLE[look.el].glow);
  const model = SkeletonUtils.clone(B.root);
  const mats = [], bones = {};
  model.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const head = bones.Head;
  model.updateMatrixWorld(true);
  const toHead = head.matrixWorld.clone().invert().multiply(model.matrixWorld);
  const zero = () => new THREE.Color(0, 0, 0);
  const hairMat = (orig) => { const m = orig.clone(); m.color = new THREE.Color(hairHex); m.userData.baseEmissive = zero(); return m; };
  const meshes = [];
  model.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) {
    o.castShadow = true; o.frustumCulled = false;
    if (/Superhero|SuperHero/.test(o.name)) o.material = kitMaterial(o.material, B.marks, look.team, look.el, kit);
    else if (/Hair/.test(o.material.name)) o.material = hairMat(o.material);
    else if (/Eye/.test(o.material.name)) { o.material = o.material.clone(); o.material.userData.baseEmissive = glow.clone().multiplyScalar(1.4); }
    else o.material = o.material.clone();
    if (!o.material.userData.baseEmissive) o.material.userData.baseEmissive = zero();
    mats.push(o.material);
  }
  for (const h of style.parts) {
    const hm = HAIRS[h].clone(true);
    hm.applyMatrix4(toHead);
    hm.traverse(o => { if (o.isMesh) { o.material = hairMat(o.material); o.castShadow = true; mats.push(o.material); } });
    head.add(hm);
  }
  const scale = TARGET_HEIGHT / B.height;
  model.scale.setScalar(scale);
  return { model, mats, hands: [bones.hand_l, bones.hand_r], head, feet: [bones.foot_l, bones.foot_r], scale };
}

// Random looks for computer fighters, avoiding repeats inside one match.
export function randomLook(el, team, used) {
  for (let tries = 0; tries < 30; tries++) {
    const body = Math.random() < 0.5 ? 'male' : 'female';
    const hair = (Math.random() * HAIR_STYLES[body].length) | 0;
    const hairColor = (Math.random() * HAIR_COLORS.length) | 0;
    const outfit = OUTFITS[(Math.random() * OUTFITS.length) | 0].id;
    const key = body + hair + '-' + hairColor + '-' + outfit;
    if (used.has(key) && tries < 29) continue;
    used.add(key);
    return { el, team, body, hair, hairColor, outfit };
  }
}
