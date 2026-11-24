import {spearDWLCandidate} from './spear-dwl-candidate-motion.js';
import {dutchlowPose} from './dutchlow-r19-motion.js';
import {threeCombat,threePose,threeContact,threeInterrupted,threeReceiving,threeBlend,paintThreeCombat,HORIZONTAL_ELBOW_METADATA} from './approved-three-combat.js';
import{specialPose,specialContact,swapLegs}from'./leg-strike-motion.js';
import {axeReferencePose} from './axe-reference-motion.js';
// Original fixed2D game choreography, NOT mocap or a claim of exact sporting reproduction.
// All poses reuse the accepted body:26/25 legs,18/17 arms,30 torso,14 neck/head offset.
import{params,fromParams,receiverPose,blendParams,clamp,add,sub,mul,len,vec,pointSegmentDistance}from'./approved-2d-core.js';
export const WORLD_STRIKES=Object.freeze({horizontalelbow:HORIZONTAL_ELBOW_METADATA,
 pushkick:{name:'散打の押し蹴り',target:'body',contactSurface:'sole',point:'strike_toe',radius:2.3,windup:.42,active:.22,recovery:.42},
 dutchlow:{name:'踏み込みロー',target:'leg',contactSurface:'rear-shin-to-thigh',point:'support_ankle',radius:2.3,windup:.32,active:.18,recovery:.40},
 elbow:{name:'縦肘',target:'head',point:'near_elbow',radius:3.0,windup:.25,active:.16,recovery:.34},
 bolopunch:{name:'ボロパンチ',target:'head',point:'near_hand',radius:2.5,windup:.38,active:.19,recovery:.39},
 spear:{name:'ダンベの槍拳',target:'head',point:'far_hand',radius:2.5,windup:.33,active:.17,recovery:.39},
 axekick:{name:'踵落とし',target:'head',point:'strike_heel',radius:2.3,windup:.64,active:.18,recovery:.64}
});
export const worldStrike=id=>Object.hasOwn(WORLD_STRIKES,id);
const base=()=>fromParams(params(receiverPose())),ease=q=>{q=clamp(q);return q*q*q*(10+q*(-15+q*6))},angle=v=>Math.atan2(v[1],v[0]),mix=(a,b,q)=>a+(b-a)*q;
function chain(a,c,l1,l2,bend){const v=sub(c,a),d=clamp(len(v),Math.abs(l1-l2)+.01,l1+l2-.01),u=mul(v,1/(len(v)||1)),along=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-along*along));return{joint:add(add(a,mul(u,along)),mul([-u[1],u[0]],bend*h)),end:add(a,mul(u,d))};}
function foot(j,a,theta){const u=vec(theta),n=[-u[1],u[0]];j.strike_ankle=a;j.strike_heel=add(add(a,mul(u,-4)),mul(n,-3));j.strike_toe=add(add(a,mul(u,6.9)),mul(n,-3));}
function leg(j,target,theta){const r=chain(j.strike_hip,target,26,25,1);j.strike_knee=r.joint;foot(j,r.end,theta);}
function arm(j,side,target){const r=chain(j[side+'_shoulder'],target,18,17,-1);j[side+'_elbow']=r.joint;j[side+'_wrist']=r.end;j[side+'_hand']=add(r.end,mul(sub(r.end,r.joint),3.5/17));}
function armTip(j,side,target){const r=chain(j[side+'_shoulder'],target,18,20.5,-1);j[side+'_elbow']=r.joint;j[side+'_hand']=r.end;j[side+'_wrist']=add(r.joint,mul(sub(r.end,r.joint),17/20.5));}
function elbow(j,theta){const sh=j.near_shoulder;j.near_elbow=add(sh,mul(vec(theta),18));j.near_wrist=add(j.near_elbow,mul(vec(theta+2.0),17));j.near_hand=add(j.near_wrist,mul(vec(theta+2.0),3.5));}
function frame(id,q){if(id==='spear')return spearDWLCandidate(q);if(id==='axekick')return axeReferencePose(q);let j=base(),p=params(j);if(q<=0||q>=1)return j;
 // Support ankle/sole remain planted; fixed-angle torso/hip work is local only.
 if(id==='axekick'){const lift=q<=.5?ease(q/.5):ease((.8-q)/.3);p.sf=-.3*lift;p.sa=[-11.1-6.9*Math.cos(p.sf)-3*Math.sin(p.sf),3];p.ss=mix(p.ss,1.35,lift);p.st=mix(p.st,1.35,lift);}
 const drive=Math.sin(Math.PI*q),shift=(id==='pushkick'?5:id==='dutchlow'?4:id==='spear'?3:1)*drive;p.spine-=drive*(id==='axekick'?.19:id==='spear'?.11:id==='elbow'?.18:.045);p.st-=shift/180;p.ss+=shift/180;j=fromParams(p);
 const motions={
 pushkick:[[0,17,3,0],[.26,12,47,.5],[.43,43,64,.15],[.60,47,62,.15],[.76,13,40,.4],[1,17,3,0]],
 dutchlow:[[0,17,3,0],[.25,7,23,-.3],[.44,32,25,-.5],[.58,38,21,-.45],[.78,13,18,-.2],[1,17,3,0]],
 axekick:[[0,17,3,0],[.24,22,43,.8],[.44,36,82,1.5],[.50,8,105,0],[.66,26,90,1.5],[.78,20,43,1.1],[.9,15,18,.4],[1,17,3,0]],
 bolopunch:[[0,17,79],[.25,-8,58],[.45,12,64],[.58,30,89],[.69,27,94],[.83,14,86],[1,17,79]],
 spear:[[0,3,82],[.22,-7,77],[.42,26,91],[.58,28,91],[.74,10,84],[1,3,82]],
 elbow:[[0,1.0],[.27,1.9],[.45,.50],[.58,.15],[.72,.6],[1,1.0]]
 };
 const nodes=motions[id];let i=nodes.findIndex(n=>n[0]>=q);i=Math.max(1,i);const a=nodes[i-1],b=nodes[i],u=ease((q-a[0])/(b[0]-a[0]));const v=a.slice(1).map((x,n)=>mix(x,b[n+1],u));
 if(['pushkick','dutchlow','axekick'].includes(id))leg(j,[v[0],v[1]],v[2]);else if(id==='elbow')elbow(j,v[0]);else arm(j,id==='spear'?'far':'near',[v[0],v[1]]);
 // Blending bone angles gives a continuous common-stance boundary at both ends.
 const boundary=Math.min(q/.13,(1-q)/.12,1);return fromParams(blendParams(params(base()),params(j),ease(boundary)));
}
function surfaces(ctx,target){if(!ctx)return[];const d=ctx.joints,tf=p=>[ctx.gap+p[0]*ctx.defFace*ctx.face,p[1]],head=d.head??add(d.chest,[0,14]),headSeg=[tf(head),tf(head),7],body=[tf(d.center),tf(d.chest),8],legs=['support','strike'].map(s=>[tf(d[s+'_knee']??add(d.center,[s==='support'?-10:10,-22])),tf(d[s+'_ankle']??[s==='support'?-18:17,3]),5]);return target==='head'?[headSeg]:target==='body'?[body]:legs;}
const near=(p,segment,radius)=>{const[a,b,r]=segment;const q=clamp((p[1]-a[1])/(b[1]-a[1]||1)),y=a[1]+q*(b[1]-a[1]),dy=Math.abs(p[1]-y),rr=r+radius;return dy<=rr?a[0]+q*(b[0]-a[0])-Math.sqrt(Math.max(0,rr*rr-dy*dy)):Infinity;};
export function worldStrikePose(id,elapsed,ctx=null){if(id==='dutchlow')return dutchlowPose(elapsed,ctx);if(threeCombat(id))return threePose(id,elapsed);const m=WORLD_STRIKES[id];if(!m)return null;if(id==='dutchlow'||id==='pushkick'){const total=m.windup+m.active+m.recovery;return{joints:id==='dutchlow'?swapLegs(specialPose(id,elapsed,total,ctx)):specialPose(id,elapsed,total,ctx),total,stage:'game-choreography',coreDuration:total,approvedDuration:null,sourceElapsed:null};}const total=m.windup+m.active+m.recovery,q=clamp(elapsed/total);let j=frame(id,q);if(ctx){const all=[...surfaces(ctx,'head'),...surfaces(ctx,'body'),...surfaces(ctx,'leg')],p=j[m.point];let cap=Math.min(...all.map(s=>near(p,s,m.radius)));if(Number.isFinite(cap)&&p[0]>cap+.01){if(['pushkick','dutchlow','axekick'].includes(id)){const theta=angle(sub(j.strike_toe,j.strike_heel)),delta=cap-p[0]+.01;leg(j,add(j.strike_ankle,[delta,0]),theta);}else if(id==='elbow'){const raw=angle(sub(j.near_elbow,j.near_shoulder)),sh=j.near_shoulder;const valid=t=>{const e=add(sh,mul(vec(t),18));return e[0]<=Math.min(...all.map(s=>near(e,s,m.radius)))+.01;};let best=null;for(let n=1;n<=180&&best===null;n++)for(const sign of[1,-1])if(valid(raw+sign*n*Math.PI/180)){let lo=0,hi=n*Math.PI/180;for(let k=0;k<18;k++){const mid=(lo+hi)/2;if(valid(raw+sign*mid))hi=mid;else lo=mid;}best=raw+sign*hi;break;}if(best!==null)elbow(j,best);}else{const side=id==='spear'?'far':'near';armTip(j,side,[cap+.01,p[1]]);}}
 }
 return{joints:j,stage:q<.12||q>.88?'join':'game-choreography',total,coreDuration:total,approvedDuration:null,sourceElapsed:null};}
export function worldContact(id,j,d,gap,face=1,defFace=-1){if(threeCombat(id))return threeContact(id,j,d,gap,face,defFace);if(id==='dutchlow'||id==='pushkick'){const c=specialContact(id,id==='dutchlow'?swapLegs(j):j,{joints:d,gap:gap*face,face,defFace});return{...c,point:[c.point[0]*face,c.point[1]],receiver:c.receiver.map(p=>[p[0]*face,p[1]])};}const m=WORLD_STRIKES[id],point=j[m.point],ctx={joints:d,gap:gap*face,face,defFace},segments=surfaces(ctx,m.target),distance=Math.min(...segments.map(([a,b])=>pointSegmentDistance(point,a,b))),r=segments.find(([a,b])=>Math.abs(pointSegmentDistance(point,a,b)-distance)<1e-6)?.[2]??7;return{reaches:distance<=r+m.radius+.04,distance,radius:m.radius,point:[point[0]*face,point[1]],receiver:segments[0].slice(0,2).map(p=>[p[0]*face,p[1]]),target:m.target};}
export function legacyWorldJoints(o){const up=p=>[p.x,-p.y],j={center:up(o.hip),chest:up(o.chest),head:up(o.head)};for(const[s,dx,t]of[['support',-4,o.rearFoot],['strike',4,o.frontFoot]]){j[s+'_hip']=add(j.center,[dx,0]);const r=chain(j[s+'_hip'],up(t),26,25,1);j[s+'_knee']=r.joint;j[s+'_ankle']=r.end;}return j;}
