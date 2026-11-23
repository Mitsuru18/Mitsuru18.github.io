import {BODY_UPPERCUT_R3 as DATA} from './body-uppercut-r3-data.js';
import {fromParams,params,receiverPose,pointSegmentDistance} from './approved-2d-core.js';
// Same speed allocation as other techniques. At speed=1, game tempo=.5:
// 65 exact held poses play at 24000/1001 fps in 2.711041667 real seconds.
export const BODY_UPPERCUT_JOIN=Object.freeze({prefix:.22,suffix:.30,clockScale:2});
export const BODY_UPPERCUT_CORE=65*1001/24000;
const dt=1001/24000, start=31*dt, end=36*dt;
export const BODY_UPPERCUT_TIMING=Object.freeze({windup:(.22+start)/2,active:(end-start)/2,recovery:(BODY_UPPERCUT_CORE-end+.30)/2});
export const bodyUppercut=id=>id==='bodyuppercut';
const clamp=q=>Math.max(0,Math.min(1,q));
export const bodyUppercutEase=q=>{q=clamp(q);return q*q*q*(10+q*(-15+6*q))};
const aliases={center:'pelvis',chest:'chest',head:'head',support_hip:'right_hip',support_knee:'right_knee',support_ankle:'right_ankle',support_heel:'right_heel',support_toe:'right_toe',strike_hip:'left_hip',strike_knee:'left_knee',strike_ankle:'left_ankle',strike_heel:'left_heel',strike_toe:'left_toe',near_shoulder:'right_shoulder',near_elbow:'right_elbow',near_wrist:'right_wrist',near_hand:'right_fist',far_shoulder:'left_shoulder',far_elbow:'left_elbow',far_wrist:'left_wrist',far_hand:'left_fist'};
const jointsFor=row=>Object.fromEntries(Object.entries(aliases).map(([a,b])=>[a,[row.points[b][0],-row.points[b][1]]]));
const freezeJoints=j=>Object.freeze(Object.fromEntries(Object.entries(j).map(([k,p])=>[k,Object.freeze(p)])));
const core=DATA.frames.map(row=>freezeJoints(jointsFor(row))),base=freezeJoints(fromParams(params(receiverPose())));
export const bodyUppercutBlend=(a,b,q)=>q<=0?a:q>=1?b:Object.fromEntries(Object.keys(a).map(k=>[k,[a[k][0]+(b[k][0]-a[k][0])*q,a[k][1]+(b[k][1]-a[k][1])*q]]));
export function bodyUppercutPose(elapsed=0){
 const t=Math.max(0,Number(elapsed)||0)*2,total=(.22+BODY_UPPERCUT_CORE+.30)/2;
 let joints,index,weight,stage;
 if(t<.22){index=0;weight=bodyUppercutEase(t/.22);joints=bodyUppercutBlend(base,core[0],weight);stage='join-in';}
 else if(t<.22+BODY_UPPERCUT_CORE){index=Math.min(64,Math.floor((t-.22+1e-10)/dt));weight=1;joints=core[index];stage='approved-r3';}
 else{index=64;weight=1-bodyUppercutEase((t-.22-BODY_UPPERCUT_CORE)/.30);joints=bodyUppercutBlend(base,core[64],weight);stage='join-out';}
 return {joints,stage,total,coreDuration:BODY_UPPERCUT_CORE/2,approvedDuration:BODY_UPPERCUT_CORE,sourceElapsed:Math.max(0,Math.min(BODY_UPPERCUT_CORE,t-.22)),sourceIndex:DATA.frames[index].source_index,frameIndex:index,customWeight:weight};
}
export function bodyUppercutRow(joints,frameIndex=0){const points=Object.fromEntries(Object.entries(aliases).map(([a,b])=>[b,[joints[a][0],-joints[a][1]]]));points.hip=points.pelvis;return {points,draw_order:DATA.frames[Math.max(0,Math.min(64,frameIndex))].draw_order};}
export function bodyUppercutContact(j,d,gap,face=1,defFace=-1){
 const point=[j.far_hand[0]*face,j.far_hand[1]],receiver=[d.center,d.chest].map(p=>[gap+p[0]*defFace,p[1]]),radius=3.5,distance=pointSegmentDistance(point,...receiver);
 // Same world point as the R3 painted left fist. No range-only or head hit.
 return {reaches:distance<=8+radius+1e-9,distance,radius,point,receiver,target:'body',surface:'left-fist'};
}
export function bodyUppercutInterrupted(snapshot,elapsed){return bodyUppercutBlend(snapshot.joints,snapshot.neutral,bodyUppercutEase(elapsed/(snapshot.duration||.2)));}
