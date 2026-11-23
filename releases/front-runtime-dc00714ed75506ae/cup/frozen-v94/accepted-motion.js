import{freeFK as pushkickFreeFK}from'./pushkick-free-fk.js';
import{dutchlowInterrupted}from'./dutchlow-r19-motion.js';
import{jumpKick,jumpPose,jumpInterrupted}from'./jump-approved-motion.js';
import{corePose}from'./axe-prototype/runtime.js';
import {backfist,backfistPose,backfistInterrupted} from './backfist-prototype.js';
import {threeCombat,threePose,threeContact,threeInterrupted,threeReceiving,threeBlend,paintThreeCombat,HORIZONTAL_ELBOW_METADATA} from './approved-three-combat.js';
import{chinUppercut,chinUppercutPose,chinInterrupted}from'./chin-uppercut-motion.js';
import{chinContact}from'./chin-uppercut-contact.js';
import{bodyUppercut,bodyUppercutPose,bodyUppercutContact,bodyUppercutInterrupted}from'./body-uppercut-motion.js';
import{isFourTrace,fourTracePose,fourTraceContact,fourTraceInterrupted}from'./four-trace-motion.js';
import{worldStrike,worldStrikePose,worldContact}from'./world-strikes.js';
import {constrainStrike} from './contact-motion.js';
// Integration adapter only. Frozen approved source coordinates/times are read-only.
import{APPROVED_2D}from'./approved-motion-data.js';
import{poseAt,params,blendParams,fromParams,receiverPose,add,sub,mul,len,clamp,strikePoint,pointSegmentDistance}from'./approved-2d-core.js';
export const WORLD_TO_DRAW=.41;
export const KNEE_RECOVERY=Object.freeze({unchangedUntil:.69,sourceEnd:1.50,compressedDuration:.42,suffix:.18});
export const GAME_JOIN=Object.freeze({prefix:.22,suffix:.30});
export const acceptedMove=id=>typeof id==='string'&&(backfist(id)||jumpKick(id)||isFourTrace(id)||threeCombat(id)||Object.hasOwn(APPROVED_2D,id)||worldStrike(id)||bodyUppercut(id)||chinUppercut(id));
export const acceptedIdleMove=id=>acceptedMove(id)&&id!=='jumpkick101'&&!['jab','frontkick','lowkick'].includes(id);
export const translated=(j,dx)=>Object.fromEntries(Object.entries(j).map(([n,p])=>[n,[p[0]+dx,p[1]]]));
export const commonStance=()=>fromParams(params(receiverPose()));
const ease=q=>{q=clamp(q);return q*q*q*(10+q*(-15+6*q))};
// Foot normals are signed offsets, NOT discrete IK branch selectors. Interpolate
// that local offset continuously during the off-core pivot; never switch it at
// the boundary. The approved core uses the untouched original reconstruction.
function join(a,b,q,anchor){
 if(q<=1e-12)return a;if(q>=1-1e-12)return b;
 const p=blendParams(params(a),params(b),ease(q)),pa=params(a),pb=params(b);
 p.sn=pa.sn+(pb.sn-pa.sn)*ease(q);p.kn=pa.kn+(pb.kn-pa.kn)*ease(q);
 let j=fromParams(p);j=translated(j,anchor-j.support_toe[0]);
 return j;
}
function setup(id){let m=APPROVED_2D[id],base=commonStance();
 // Knee is the rear-leg strike: the front leg supports it. Relabel the neutral
 // legs, without moving a single neutral joint, before connecting the motion.
 if(id==='knee'){for(const n of['hip','knee','ankle','heel','toe'])[base['support_'+n],base['strike_'+n]]=[base['strike_'+n],base['support_'+n]];}
 const first=poseAt(m,0),shift=base.support_toe[0]-first.support_toe[0];
 return{m,base,shift,first:translated(first,shift),last:translated(poseAt(m,m.duration),shift)};
}
const setups=new Map();const get=id=>{if(!setups.has(id))setups.set(id,setup(id));return setups.get(id)};
export function kneeSourceTime(t){if(t<=KNEE_RECOVERY.unchangedUntil)return t;let q=clamp((t-KNEE_RECOVERY.unchangedUntil)/KNEE_RECOVERY.compressedDuration),a=KNEE_RECOVERY.compressedDuration,b=KNEE_RECOVERY.sourceEnd-KNEE_RECOVERY.unchangedUntil;return KNEE_RECOVERY.unchangedUntil+a*q+(b-a)*(q*q*(3-2*q));}
function originalGamePose(id,elapsed){if(!acceptedMove(id))return null;const s=get(id),coreDuration=id==='knee'?KNEE_RECOVERY.unchangedUntil+KNEE_RECOVERY.compressedDuration:s.m.duration,suffix=id==='knee'?KNEE_RECOVERY.suffix:GAME_JOIN.suffix,t=clamp(elapsed,0,GAME_JOIN.prefix+coreDuration+suffix);let joints,stage;
 if(t<GAME_JOIN.prefix){joints=join(s.base,s.first,t/GAME_JOIN.prefix,s.base.support_toe[0]);stage='join-in'}
 else if(t<=GAME_JOIN.prefix+coreDuration){joints=translated(poseAt(s.m,id==='knee'?kneeSourceTime(t-GAME_JOIN.prefix):t-GAME_JOIN.prefix),s.shift);stage='approved'}
 else{joints=join(s.last,s.base,(t-GAME_JOIN.prefix-coreDuration)/suffix,s.base.support_toe[0]);stage='join-out'}
 return{joints,stage,total:GAME_JOIN.prefix+coreDuration+suffix,approvedDuration:s.m.duration,coreDuration,sourceElapsed:clamp(id==='knee'?kneeSourceTime(t-GAME_JOIN.prefix):t-GAME_JOIN.prefix,0,s.m.duration),coreTranslation:s.shift};
}
export function acceptedGamePose(id,elapsed,contactLimit=null,kneeSign=null,kneeAngle=null){if(backfist(id))return backfistPose(elapsed);if(id==='axekick')return corePose(elapsed);if(jumpKick(id))return jumpPose(elapsed,contactLimit);if(threeCombat(id))return threePose(id,elapsed);if(isFourTrace(id))return fourTracePose(id,elapsed,contactLimit);if(chinUppercut(id))return chinUppercutPose(elapsed);if(bodyUppercut(id))return bodyUppercutPose(elapsed);if(worldStrike(id))return worldStrikePose(id,elapsed,contactLimit);const p=originalGamePose(id,id==='sidekick'?elapsed*2:elapsed);if(p)p.joints=constrainStrike(p.joints,id,contactLimit,kneeSign,kneeAngle);return id==='sidekick'&&p?{...p,total:p.total/2,coreDuration:p.coreDuration/2}:p;}
export const ACCEPTED_TIMING=Object.freeze({
 sidekick:Object.freeze({windup:(GAME_JOIN.prefix+.85)/2,active:.58/2,recovery:(1.75+GAME_JOIN.suffix-.85-.58)/2}),
 knee:Object.freeze({windup:GAME_JOIN.prefix+.26,active:.43,recovery:KNEE_RECOVERY.unchangedUntil+KNEE_RECOVERY.compressedDuration+KNEE_RECOVERY.suffix-.26-.43})
});
export function contactLocal(kind,attJoints,defJoints,drawGap,attFace=1,defFace=-1){if(threeCombat(kind))return threeContact(kind,attJoints,defJoints,drawGap,attFace,defFace);if(isFourTrace(kind))return fourTraceContact(kind,attJoints,defJoints,drawGap,attFace,defFace);if(chinUppercut(kind))return chinContact(attJoints,defJoints,drawGap,attFace,defFace);if(bodyUppercut(kind))return bodyUppercutContact(attJoints,defJoints,drawGap,attFace,defFace);if(worldStrike(kind))return worldContact(kind,attJoints,defJoints,drawGap,attFace,defFace);const point=strikePoint(kind,attJoints).map((v,i)=>i===0?v*attFace:v),a=defJoints.center.map((v,i)=>i===0?drawGap+v*defFace:v),b=defJoints.chest.map((v,i)=>i===0?drawGap+v*defFace:v),radius=kind==='knee'?3.6:2.3;let distance=pointSegmentDistance(point,a,b);if(kind==='sidekick'){for(const key of['strike_toe','strike_ankle']){const v=[attJoints[key][0]*attFace,attJoints[key][1]],d=pointSegmentDistance(v,a,b);if(d<distance){point[0]=v[0];point[1]=v[1];distance=d;}}}return{reaches:distance<=8+radius,distance,radius,point,receiver:[a,b]};}

// Cosmetic hit transition outside approved strike paths. Shared by contact and drawing.
function pushkickTraceInterrupted(snapshot,elapsed){
 const q=clamp(elapsed/(snapshot.duration||.2)),a=snapshot.joints,b=snapshot.neutral;
 if(q<=0)return a;if(q>=1)return b;
 // Free fixed-length FK retains support step/lift; shared by contact and drawing.
 const p=blendParams(params(a),params(b),ease(q));
 const j=pushkickFreeFK(p),below=Math.min(j.support_heel[1],j.support_toe[1],j.strike_heel[1],j.strike_toe[1]);
 // Only prevent penetration; never pull an airborne support foot down.
 if(below<0)for(const v of Object.values(j))v[1]-=below;
 return j;
}
export function interruptedPose(snapshot,elapsed){if(snapshot?.action?.technique==='pushkick'&&snapshot.joints&&snapshot.neutral)return pushkickTraceInterrupted(snapshot,elapsed);if(snapshot?.action?.technique==='dutchlow')return dutchlowInterrupted(snapshot,elapsed).joints;if(backfist(snapshot?.action?.technique))return backfistInterrupted(snapshot,elapsed).joints;if(snapshot?.fourTrace)return fourTraceInterrupted(snapshot,elapsed).joints;if(!snapshot?.joints)return null;if(jumpKick(snapshot.action?.technique))return jumpInterrupted(snapshot,elapsed).joints;if(threeCombat(snapshot.action?.technique))return threeInterrupted(snapshot,elapsed);if(chinUppercut(snapshot.action?.technique))return chinInterrupted(snapshot,elapsed);if(bodyUppercut(snapshot.action?.technique))return bodyUppercutInterrupted(snapshot,elapsed);const q=clamp(elapsed/(snapshot.duration||.2)),a=snapshot.joints,b=snapshot.neutral;return join(a,b,q,a.support_toe[0]+(b.support_toe[0]-a.support_toe[0])*ease(q));}
