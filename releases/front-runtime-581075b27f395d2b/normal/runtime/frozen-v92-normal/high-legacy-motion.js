/** Approved HIGH timing/directions, retargeted to the pre-v15 character.
 * R1 rest attachments and painter are deliberately not used. */
import {HIGH_R1_FRAMES as FRAMES} from './high-r1-data.js';
export {FRAMES as APPROVED_HIGH_FRAMES};
export const HIGH_TIMING=Object.freeze({windup:.38,active:.12,recovery:.52,total:1.02,entry:.06,sourceEnd:.88,exitStart:.9,exit:.12,contactFrame:15});
const p=(x,y)=>({x,y}),add=(a,b)=>p(a.x+b.x,a.y+b.y),sub=(a,b)=>p(a.x-b.x,a.y-b.y),lerp=(a,b,t)=>p(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);},unit=(v,L)=>{const d=Math.hypot(v.x,v.y)||1;return p(v.x*L/d,v.y*L/d);};
export const HIGH_GAME_KEYS=(()=>{const keys=Array(33);for(const [lo,hi,start,end] of [[0,15,.06,.38],[15,16,.38,.5],[16,32,.5,.88]]){keys[lo]=start;const residual=end-start-(hi-lo)/60,span=FRAMES[hi].sourceTimeSeconds-FRAMES[lo].sourceTimeSeconds;for(let i=lo+1;i<=hi;i++)keys[i]=start+(i-lo)/60+residual*(FRAMES[i].sourceTimeSeconds-FRAMES[lo].sourceTimeSeconds)/span;keys[hi]=end;}return Object.freeze(keys);})();
export function highElapsed(a){if(Number.isFinite(a?.elapsed))return clamp(a.elapsed,0,1.02);const q=clamp(a?.phaseProgress||0);return a?.phase==='windup'?.38*q:a?.phase==='active'?.38+.12*q:.5+.52*q;}
export function highFrame(a){const e=highElapsed(a);let i=0;while(i<32&&HIGH_GAME_KEYS[i+1]<=e+1e-10)i++;return FRAMES[i];}
const angleMix=(a,b,w)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*w;
function blendVector(a,b,w){const A=Math.atan2(a.y,a.x),B=Math.atan2(b.y,b.x),angle=angleMix(A,B,w),L=Math.hypot(a.x,a.y)*(1-w)+Math.hypot(b.x,b.y)*w;return p(Math.cos(angle)*L,Math.sin(angle)*L);}
const standing=[[-3,-2],[2,-2],[4,0],[9,1],[10,3],[-4,3]];
// Sampling only computes the floor registration of the unchanged old foot
// outline. The actual drawing still calls the original renderer's foot().
const pointed=(()=>{let at=[-2,-2],out=[at];const curve=(controls)=>{const ps=[at,...controls];for(let i=1;i<=80;i++){let q=i/80,rows=ps.map(x=>x.slice());while(rows.length>1)rows=rows.slice(0,-1).map((v,j)=>v.map((n,k)=>n+(rows[j+1][k]-n)*q));out.push(rows[0]);}at=controls.at(-1);};curve([[1,-2.1],[3,-.9],[5.2,-1.2]]);for(const s of [[[8.4,-1.6],[9,.3]],[[9.8,2.1],[7.7,2.7]],[[5.8,3.1],[3.8,2.1]],[[1.2,1.4],[-.7,3.1]],[[-3.5,3.8],[-3.2,.9]],[[-3.1,-.8],[-2,-2]]])curve(s);return out;})();
export function legacyFootBounds(ankle,f){const scale=(1-2*(f.pivot||0))*(f.projection??1),angle=f.angle||0,vertices=(f.pointed?pointed:standing).map(([x,y])=>p(ankle.x+x*scale*Math.cos(angle)-y*Math.sin(angle),ankle.y+x*scale*Math.sin(angle)+y*Math.cos(angle)));if(Math.abs(scale)<.28)vertices.push(p(ankle.x,ankle.y+2.8));return [Math.min(...vertices.map(q=>q.x)),Math.min(...vertices.map(q=>q.y)),Math.max(...vertices.map(q=>q.x)),Math.max(...vertices.map(q=>q.y))];}
export function legacyHighMotion(action,idle,bodyRig,support){
 const frame=highFrame(action),s=frame.art.p,e=highElapsed(action),raw={...idle,hip:{...s.pelvis},chest:add(s.pelvis,unit(sub(s.torsoTop,s.pelvis),30)),bodyTurn:clamp((1-(s.leftHip.x-s.rightHip.x)/9)/2,-.1,1),turn:0};raw.head=add(raw.chest,unit(sub(s.headCenter,s.torsoTop),14));
 const roots=bodyRig(raw),points={pelvis:raw.hip,head:raw.head},aliases={left:['nearHip','nearShoulder'],right:['farHip','farShoulder']};
 for(const side of ['left','right']){const [hip,shoulder]=aliases[side];points[side+'Hip']=roots[hip];points[side+'Shoulder']=roots[shoulder];for(const [a,b]of [['Hip','Knee'],['Knee','Ankle'],['Shoulder','Elbow'],['Elbow','Wrist']]){const sourceB=b==='Wrist'?'Fist':b;points[side+b]=add(points[side+a],sub(s[side+sourceB],s[side+a]));}points[side+'Hand']=points[side+'Wrist'];}
 let weight=1;if(e<.06)weight=smooth(e/.06);else if(e>.9)weight=1-smooth((e-.9)/.12);
 let o=raw;
 if(weight<1){o={...raw,hip:lerp(idle.hip,raw.hip,weight),bodyTurn:idle.bodyTurn+(raw.bodyTurn-idle.bodyTurn)*weight};o.chest=add(o.hip,blendVector(sub(idle.chest,idle.hip),sub(raw.chest,raw.hip),weight));o.head=add(o.chest,blendVector(sub(idle.head,idle.chest),sub(raw.head,raw.chest),weight));const r=bodyRig(o);points.pelvis=o.hip;points.head=o.head;
  for(const side of ['left','right']){const [hip,shoulder]=aliases[side],target={...points};points[side+'Hip']=r[hip];points[side+'Shoulder']=r[shoulder];for(const [a,b]of [['Hip','Knee'],['Knee','Ankle'],['Shoulder','Elbow'],['Elbow','Wrist']])points[side+b]=add(points[side+a],blendVector(sub(idle.points[side+b],idle.points[side+a]),sub(target[side+b],target[side+a]),weight));points[side+'Hand']=points[side+'Wrist'];}
 }
 const footWeight=(frame.frameIndex>=7&&frame.frameIndex<=22)?weight:0,feet={left:{angle:angleMix(0,frame.art.feet.left.angle,weight),projection:1+(frame.art.feet.left.projection-1)*weight,pointed:footWeight>.01},right:{angle:support.angle,pivot:support.pivot,projection:1,pointed:false}};
 const bounds=Object.fromEntries(['left','right'].map(side=>[side,legacyFootBounds(points[side+'Ankle'],feet[side])]));
 const registration={x:idle.points.rightAnkle.x-points.rightAnkle.x,y:-Math.max(bounds.left[3],bounds.right[3])};
 const delta=sub(points.leftElbow,s.leftElbow),armClip=frame.art.armClip?.map(poly=>poly.map(q=>add(q,delta)));
 return {...o,points,frameIndex:frame.frameIndex,sourceTime:frame.sourceTimeSeconds,weight,feet,registration,partOrder:weight<.5?idle.partOrder:frame.art.order,headView:weight<.5?'right_profile':frame.art.headView,suppressFullLeftFist:frame.art.suppressFullLeftFist,armClip,scale:1};
}
