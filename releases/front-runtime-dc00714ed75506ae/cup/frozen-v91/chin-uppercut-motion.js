import {CHIN_UPPERCUT_R3 as DATA}from'./chin-uppercut-r3-data.js';
import {fromParams,params,receiverPose}from'./approved-2d-core.js';
export const CHIN_UPPERCUT_JOIN=Object.freeze({prefix:.22,suffix:.30,clockScale:2});
export const CHIN_UPPERCUT_CORE=43/25;
// Source f1856–1859 is the rising/contact interval, including three occluded fists.
export const CHIN_UPPERCUT_TIMING=Object.freeze({windup:(.22+14/25)/2,active:(4/25)/2,recovery:(CHIN_UPPERCUT_CORE-18/25+.30)/2});
export const chinUppercut=id=>id==='uppercut';
const clamp=q=>Math.max(0,Math.min(1,q));
export const chinEase=q=>{q=clamp(q);return q*q*q*(10+q*(-15+6*q))};
export const chinBlend=(a,b,q)=>q<=0?a:q>=1?b:Object.fromEntries(Object.keys(a).map(k=>[k,a[k].map((x,i)=>x+(b[k][i]-x)*q)]));
const aliases={center:'pelvis',chest:'chest',head:'head',support_hip:'right_hip',support_knee:'right_knee',support_ankle:'right_ankle',strike_hip:'left_hip',strike_knee:'left_knee',strike_ankle:'left_ankle',near_shoulder:'right_shoulder',near_elbow:'right_elbow',near_wrist:'right_wrist',near_hand:'right_fist',far_shoulder:'left_shoulder',far_elbow:'left_elbow',far_wrist:'left_wrist',far_hand:'left_fist'};
function jointsFor(row){const j=Object.fromEntries(Object.entries(aliases).map(([a,b])=>[a,[row.game_fit.points[b][0],-row.game_fit.points[b][1]]]));for(const[s,side]of[['support','right'],['strike','left']]){const poly=row.foot_surface.continuous_render_outline[side],lo=poly.reduce((a,b)=>a[0]<b[0]?a:b),hi=poly.reduce((a,b)=>a[0]>b[0]?a:b);j[s+'_heel']=[lo[0],-lo[1]];j[s+'_toe']=[hi[0],-hi[1]];}return j;}
// The heel/toe aliases above are display contour bounds for generic interruption
// handling only, not anatomical observations or an inferred source foot axis.
const freeze=j=>Object.freeze(Object.fromEntries(Object.entries(j).map(([k,v])=>[k,Object.freeze(v)]))),core=DATA.frames.map(r=>freeze(jointsFor(r))),neutral=freeze(fromParams(params(receiverPose())));
export function chinUppercutPose(elapsed=0){const t=Math.max(0,Number(elapsed)||0)*2,total=(.22+CHIN_UPPERCUT_CORE+.30)/2;let index,weight,joints,stage;if(t<.22){index=0;weight=chinEase(t/.22);joints=chinBlend(neutral,core[0],weight);stage='join-in';}else if(t<.22+CHIN_UPPERCUT_CORE){index=Math.min(42,Math.floor((t-.22+1e-10)*25));weight=1;joints=core[index];stage='approved-r3';}else{index=42;weight=1-chinEase((t-.22-CHIN_UPPERCUT_CORE)/.30);joints=chinBlend(neutral,core[42],weight);stage='join-out';}return{joints,frameIndex:index,sourceIndex:1842+index,sourceElapsed:Math.max(0,Math.min(CHIN_UPPERCUT_CORE,t-.22)),customWeight:weight,stage,total,coreDuration:CHIN_UPPERCUT_CORE/2,approvedDuration:CHIN_UPPERCUT_CORE};}
const mix=(a,b,q)=>a.map((x,i)=>x+(b[i]-x)*q);
export function chinUppercutRow(j,index=0,weight=1,{groundFeet=false}={}){const row=DATA.frames[Math.max(0,Math.min(42,index))];if(weight===1&&j===core[index])return row;const points=Object.fromEntries(Object.entries(aliases).map(([a,b])=>[b,[j[a][0],-j[a][1]]]));const foot_surface={projected_outline:{},continuous_render_outline:{},right_surface_highlight:[]};for(const side of['left','right']){const anchor=points[side+'_ankle'],old=row.game_fit.points[side+'_ankle'],alias=side==='right'?'support':'strike',before=core[index],ov=[before[alias+'_toe'][0]-before[alias+'_heel'][0],-before[alias+'_toe'][1]+before[alias+'_heel'][1]],nv=[j[alias+'_toe'][0]-j[alias+'_heel'][0],-j[alias+'_toe'][1]+j[alias+'_heel'][1]],angle=Math.atan2(nv[1],nv[0])-Math.atan2(ov[1],ov[0]),scale=Math.hypot(...nv)/Math.max(1e-8,Math.hypot(...ov)),transform=v=>{const x=v[0]-old[0],y=v[1]-old[1];return[anchor[0]+(x*Math.cos(angle)-y*Math.sin(angle))*scale,anchor[1]+x*Math.sin(angle)+y*Math.cos(angle)];};for(const key of['projected_outline','continuous_render_outline'])foot_surface[key][side]=row.foot_surface[key][side].map(transform);if(side==='right')foot_surface.right_surface_highlight=row.foot_surface.right_surface_highlight.map(transform);}

 // Off-core entry/exit/recoil only. Keep the existing foot envelope/heel raise;
 // translate its lowest contact to the floor while the ankle joins neutral.
 if(groundFeet){for(const side of['left','right']){const dy=Math.max(...foot_surface.continuous_render_outline[side].map(v=>v[1]));for(const key of['projected_outline','continuous_render_outline'])for(const v of foot_surface[key][side])v[1]-=dy;if(side==='right')for(const v of foot_surface.right_surface_highlight)v[1]-=dy;}}
 const surface_application={...row.surface_application};for(const k of['torso_yaw','pelvis_yaw','head_back_weight','head_pitch_display_radians','right_leg_posterior_weight'])surface_application[k]*=weight;
 const refs={};for(const side of['left','right']){const p=points[side+'_fist'],old=row.game_fit.points[side+'_fist'],ref=row.r3_fit.fist_orientation_reference_elbow[side],shifted=[ref[0]+p[0]-old[0],ref[1]+p[1]-old[1]];refs[side]=mix(points[side+'_elbow'],shifted,weight);}
 return{...row,game_fit:{points},foot_surface,surface_application,r3_fit:{fist_orientation_reference_elbow:refs}};
}
export const chinInterrupted=(s,age)=>chinBlend(s.joints,s.neutral,chinEase(age/(s.duration||.2)));
export function chinReceivingPose(f,time=0){if(chinUppercut(f.action?.technique))return chinUppercutPose(f.action.elapsed);const s=f.interruptedStrike;if(!chinUppercut(s?.action?.technique))return null;const p=chinUppercutPose(s.action.elapsed),age=Math.max(0,time-s.createdTime);return{...p,joints:chinInterrupted(s,age),customWeight:p.customWeight*(1-chinEase(age/(s.duration||.2))),stage:'interrupted'};}
