// Pure opt-in runtime. No storage, network, globals, stats, unlocks, or engine hooks.
import {HAMMERFIST_DATA} from './hammerfist-data.mjs';
// Pure sampling and geometry; painter dependency deliberately excluded.

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
export const DATA=freeze(HAMMERFIST_DATA);
export const FRAME_SECONDS=1001/60000;
export const ATTACK_SECONDS=88*FRAME_SECONDS;
// A constant actor-to-floor registration, not a pose or bone correction.
// Whole .65-unit shoe stroke, including miter joins, extends at most
// .5577115919040606 below sole y=0 (f400 A toe). Same offset for all 88.
export const SOLE_STROKE_CLEARANCE=.558;
export const ACTIVE_SOURCE_FRAMES=Object.freeze([386,387,388,389]);
export const HAND_POLYGON=freeze([[-2,-2.7],[1.5,-3],[4,-1.8],[4,1.7],[1,3],[-2,2.2]]);

function indexChecked(index) {
  if (!Number.isInteger(index) || index<0 || index>=88) throw new RangeError('Frame index must be 0..87');
  return index;
}
function placementChecked(p) {
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.floorY) || !Number.isFinite(p.scale) || p.scale<=0 || ![1,-1].includes(p.facing)) throw new TypeError('Explicit x, floorY, positive scale and facing ±1 required');
  return p;
}
export function frameAtIndex(index) { return DATA.frames[indexChecked(index)]; }
export function sampleMotionSeconds(seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError('Finite source-motion seconds required');
  // Caller supplies its already-scaled motion clock. Never multiply by .4 here.
  const index=Math.min(87,Math.max(0,Math.floor(seconds/FRAME_SECONDS+1e-9)));
  return {frame:DATA.frames[index],index,insideAttack:seconds>=0&&seconds<ATTACK_SECONDS};
}
export function nativeToWorld(point,placement) {
  const p=placementChecked(placement);
  // Source root motion is already present in point. Add actor placement ONCE.
  return [p.x+p.facing*p.scale*point[0],p.floorY+p.scale*(point[1]-SOLE_STROKE_CLEARANCE)];
}
export function handPolygon(index,placement) {
  const r=frameAtIndex(index),f=r.projected2d.fist_A,e=r.projected2d.elbow_A,a=Math.atan2(f[1]-e[1],f[0]-e[0]),co=Math.cos(a),si=Math.sin(a);
  return HAND_POLYGON.map(([x,y])=>nativeToWorld([f[0]+x*co-y*si,f[1]+x*si+y*co],placement));
}
export function contactShape(index,placement) {
  const row=frameAtIndex(index),poly=handPolygon(index,placement);
  // Downward-leading visible rim. The generic glyph cannot certify anatomy.
  const rim=poly.map((p,i)=>({i,y:(p[1]+poly[(i+1)%poly.length][1])/2})).sort((a,b)=>b.y-a.y)[0].i;
  return {
    sourceIndex:row.source_index,
    active:ACTIVE_SOURCE_FRAMES.includes(row.source_index),
    armIdentity:'A',target:'head',blockLevel:'high',
    // Authored game striking edge, not a verified anatomical ulnar surface.
    edge:[poly[rim],poly[(rim+1)%poly.length]], polygonEdgeIndex:rim, radius:placement.scale*.65,
    classification:'GAME_AUTHORED_CONTACT_EDGE_NOT_MEASURED_ULNAR_FACE',
    sourceFistStatus:row.source_fist_status.A,
  };
}
export function crossedActiveFrames(previousSeconds,currentSeconds) {
  if (![previousSeconds,currentSeconds].every(Number.isFinite) || currentSeconds<previousSeconds) throw new RangeError('Monotonic motion seconds required');
  // Includes the current interval and every crossed active source frame, even
  // under low FPS. The engine owns one-hit-per-attack and target collision.
  const lo=Math.max(0,Math.floor(previousSeconds/FRAME_SECONDS+1e-9));
  const hi=Math.min(87,Math.floor(currentSeconds/FRAME_SECONDS+1e-9));
  if (currentSeconds<0 || previousSeconds>=ATTACK_SECONDS) return [];
  return ACTIVE_SOURCE_FRAMES.map(f=>f-343).filter(i=>i>=lo&&i<=hi);
}
export function createAttackContactState() {
  // Caller holds this ephemeral state. It must never enter persisted saves.
  const hits=new Set();
  return Object.freeze({hasHit:id=>hits.has(id),claimHit:id=>{if(hits.has(id))return false;hits.add(id);return true;}});
}

// Connection poses must be authored against the confirmed current engine.
// This package deliberately does not disguise first/last-frame holding as
// idle, walk, hurt, KO, entry or exit. All are distinct adapter obligations.
export const CONNECTION_REQUIREMENTS=freeze({
  entry:{classification:'GAME_AUTHORED',sourceIndex:null,required:true},
  exit:{classification:'GAME_AUTHORED',sourceIndex:null,required:true},
  idle:{required:true},walk:{required:true},hurt:{required:true},ko:{required:true},
  onePainterAndSilhouette:true,noWholeBodyCrossfade:true,noAnatomicalRoleSwap:true,
  exactAttackSamples:true,confirmedEngineBaseRequired:true,
});
