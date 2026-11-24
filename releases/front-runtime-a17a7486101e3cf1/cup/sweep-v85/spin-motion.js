import {SPIN_RIG_FRAMES} from './spin-rig.js';
import {SPIN_TIMING,spinElapsed,spinFrameIndex} from './spin-timing.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
// These are display registrations, not invented skeletal joints. Never align
// individual frame bottoms: source perspective and rear-foot height are kept.
export const SPIN_PLACEMENT=Object.freeze({scale:.18,groundY:600,startAnchorX:400,endAnchorX:490,contactX:708,contactY:173});
export function spinPlacement(action,targetX=null){
 const elapsed=spinElapsed(action),p=clamp(elapsed/SPIN_TIMING.total),contact=SPIN_TIMING.windup/SPIN_TIMING.total;
 const settle=SPIN_TIMING.settleFrame/SPIN_TIMING.frameCount;
 const contactAnchor=SPIN_PLACEMENT.startAnchorX+(SPIN_PLACEMENT.endAnchorX-SPIN_PLACEMENT.startAnchorX)*smooth(contact);
 // Keep the complete registration fixed while balancing on one leg. Only
 // the lowering/landing interval may bring the figure back to the arena root.
 const finish=smooth((p-settle)/(1-settle));
 const anchor=p<=contact?SPIN_PLACEMENT.startAnchorX+(contactAnchor-SPIN_PLACEMENT.startAnchorX)*smooth(p/contact):contactAnchor+(SPIN_PLACEMENT.endAnchorX-contactAnchor)*finish;
 const naturalContact=(SPIN_PLACEMENT.contactX-contactAnchor)*SPIN_PLACEMENT.scale;
 const alignment=Number.isFinite(targetX)?targetX-naturalContact:0;
 const weight=p<=contact?smooth(p/contact):1-finish;
 return {frameIndex:spinFrameIndex(action),x:-anchor*SPIN_PLACEMENT.scale+alignment*weight,
  y:-SPIN_PLACEMENT.groundY*SPIN_PLACEMENT.scale,scale:SPIN_PLACEMENT.scale};
}
/** Sample only observed points. Null joints stay null: a disappearing limb is
 * occluded, not an invitation to reflect or reconstruct the other side. */
export function spinRigAt(action){
 const frameIndex=spinFrameIndex(action),a=SPIN_RIG_FRAMES[frameIndex],b=SPIN_RIG_FRAMES[Math.min(66,frameIndex+1)];
 let fraction=clamp(spinElapsed(action)/SPIN_TIMING.frameDuration-frameIndex);if(fraction<1e-8)fraction=0;
 const points=Object.fromEntries(Object.entries(a.points).map(([key,p])=>[key,p&&b.points[key]?[p[0]+(b.points[key][0]-p[0])*fraction,p[1]+(b.points[key][1]-p[1])*fraction]:p]));
 const guides=Object.fromEntries(Object.entries(a.guides).map(([key,g])=>[key,Object.fromEntries(Object.entries(g).map(([end,p])=>[end,b.guides[key]?.[end]?[p[0]+(b.guides[key][end][0]-p[0])*fraction,p[1]+(b.guides[key][end][1]-p[1])*fraction]:p]))]));
 const order=[...a.order];for(let pass=0;pass<4;pass++)for(const [front,back]of a.overrides)if(order.indexOf(front)<order.indexOf(back)){order.splice(order.indexOf(front),1);order.splice(order.indexOf(back)+1,0,front);}
 return {...a,points,guides,order,frameIndex,fraction};
}
/** Conservative character-only completion for genuinely occluded source
 * anchors. These points are tagged inferred and never replace the raw evidence.
 * Short gaps follow neighboring observed image positions; long arm gaps follow
 * the body so the hidden chain cannot detach during the turn. */
function completedPoints(raw){
 const points=Object.fromEntries(Object.entries(raw.points).map(([k,p])=>[k,p&&[...p]])),inferred=[];
 const index=raw.frameIndex+raw.fraction;
 const neighbors=key=>{let a=raw.frameIndex,b=raw.frameIndex;while(a>=0&&!SPIN_RIG_FRAMES[a].points[key])a--;while(b<67&&!SPIN_RIG_FRAMES[b].points[key])b++;return [Math.max(0,a),Math.min(66,b)];};
 for(const key of Object.keys(points))if(!points[key]&&!/Heel|Toe/.test(key)){
  const [a,b]=neighbors(key),pa=SPIN_RIG_FRAMES[a].points[key],pb=SPIN_RIG_FRAMES[b].points[key];if(!pa&&!pb)continue;
  const q=b===a?0:clamp((index-a)/(b-a)),long=b-a>4,root=points.pelvis,ra=SPIN_RIG_FRAMES[a].points.pelvis,rb=SPIN_RIG_FRAMES[b].points.pelvis;
  points[key]=[0,1].map(j=>{const x=(pa||pb)[j]-(long?ra[j]:0),y=(pb||pa)[j]-(long?rb[j]:0);return x+(y-x)*q+(long?root[j]:0);});inferred.push(key);
 }
 for(const side of ['left','right'])for(const end of ['Heel','Toe']){const key=side+end;if(points[key])continue;
  const [a,b]=neighbors(key),get=i=>{const p=SPIN_RIG_FRAMES[i].points[key],ankle=SPIN_RIG_FRAMES[i].points[side+'Ankle'];return p&&ankle?[p[0]-ankle[0],p[1]-ankle[1]]:null;},pa=get(a),pb=get(b),ankle=points[side+'Ankle'];if(!ankle||(!pa&&!pb))continue;
  const va=pa||pb,vb=pb||pa,aa=Math.atan2(va[1],va[0]),ab=Math.atan2(vb[1],vb[0]),delta=Math.atan2(Math.sin(ab-aa),Math.cos(ab-aa)),q=b===a?0:clamp((index-a)/(b-a)),angle=aa+delta*q,length=Math.hypot(...va)+(Math.hypot(...vb)-Math.hypot(...va))*q;
  points[key]=[ankle[0]+Math.cos(angle)*length,ankle[1]+Math.sin(angle)*length];inferred.push(key);
 }
 return {points,inferred};
}
const point=(x,y)=>({x,y});
const interpolate=(a,b,t)=>point(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
export function spinHumanPose(action,idle,targetX=null){
 const raw=spinRigAt(action),a=completedPoints({...SPIN_RIG_FRAMES[raw.frameIndex],frameIndex:raw.frameIndex,fraction:0}),nextIndex=Math.min(66,raw.frameIndex+1),b=completedPoints({...SPIN_RIG_FRAMES[nextIndex],frameIndex:nextIndex,fraction:0});
 const completed={points:Object.fromEntries(Object.entries(a.points).map(([key,p])=>[key,p&&b.points[key]?[p[0]+(b.points[key][0]-p[0])*raw.fraction,p[1]+(b.points[key][1]-p[1])*raw.fraction]:p])),inferred:[...new Set([...a.inferred,...(raw.fraction?b.inferred:[])])]};
 const placement=spinPlacement(action,targetX),convert=p=>p?point(p[0]*placement.scale+placement.x,p[1]*placement.scale+placement.y):null;
 const elapsed=spinElapsed(action),weight=Math.min(smooth(elapsed/(4*SPIN_TIMING.frameDuration)),smooth((SPIN_TIMING.total-elapsed)/(9*SPIN_TIMING.frameDuration)));
 const projected=Object.fromEntries(Object.entries(completed.points).map(([key,p])=>[key,convert(p)]));
 const top=interpolate(projected.neck,projected.chest,.16);
 const points={...projected};
 // Garment shoulders/hips are attachment proxies, not measured bone centers.
 // Fit those roots inside this character's existing anatomical volumes while
 // retaining the measured elbow, knee, wrist and ankle projections.
 for(const [key,root,radius]of [['leftHip',projected.pelvis,7],['rightHip',projected.pelvis,7],['leftShoulder',top,10],['rightShoulder',top,10]])if(points[key]){const dx=points[key].x-root.x,dy=points[key].y-root.y,d=Math.hypot(dx,dy);if(d>radius)points[key]=point(root.x+dx*radius/d,root.y+dy*radius/d);}
 for(const key of Object.keys(points))if(points[key]&&idle.points[key])points[key]=interpolate(idle.points[key],points[key],weight);
 const guides=Object.fromEntries(Object.entries(raw.guides).map(([key,g])=>[key,{start:convert(g.start),end:convert(g.end)}]));
 const order=[...raw.order];
 // Reconstructed hidden arm sections stay behind the torso/knee, never expose
 // a fabricated shoulder/elbow. The observed F030–035 forearm strip is separate.
 for(const side of ['left','right'])for(const suffix of ['UpperArm','Forearm','Hand']){
  const part=side+suffix,keys=suffix==='UpperArm'?[side+'Shoulder',side+'Elbow']:suffix==='Forearm'?[side+'Elbow',side+'Wrist']:[side+'Wrist',side+'Hand'];
  if(keys.some(k=>completed.inferred.includes(k))&&!raw.guides[part]){order.splice(order.indexOf(part),1);order.splice(Math.max(0,order.indexOf('torso')),0,part);}
 }
 const view=weight<.5?'right_profile':raw.headView;
 const bodyView=weight<.5?'front_right_three_quarter':raw.torsoView;
 const yaw=bodyView==='back'?Math.PI:bodyView.includes('back_left')?Math.PI-.55:bodyView.includes('back_right')?Math.PI+.55:bodyView==='left_side'?Math.PI/2:bodyView==='right_side'?Math.PI*1.5:bodyView.includes('left')?-.55:bodyView==='front'?0:.55;
 return {points,projected,guides,frameIndex:raw.frameIndex,weight,head:points.head,hip:points.pelvis,chest:interpolate(idle.chest,top,weight),bodyTurn:0,spinYaw:yaw*weight,spinWeight:weight,headView:view,faceVisible:weight<.5||raw.faceVisible,partOrder:weight<.15?idle.partOrder:order,visibility:raw.visibility,inferred:completed.inferred,raw};
}
