import{backstepPose}from'./backstep-trial.js';
// Game-authored4-to-KO bridge. Original accepted poses and KO source are read-only.
// Age is ORIGINAL KO seconds, not wall time; future slow clock passes this same API.
import{isFourTrace,fourTracePose,fourTraceInterrupted,fourTraceJoints,fourTraceFallEntry,fourTraceFootArt,fourTraceFootOutline}from'./four-trace-motion.js';
import{fallenPose}from'./finish-motion.js';
import{TECHNIQUES}from'./technique-data.js';
const clone=structuredClone,mix=(a,b,q)=>a+(b-a)*q,pt=(x,y)=>({x,y}),smooth=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)},live=new WeakMap(),frozen=new WeakMap();
const links=[['pelvis','chest'],['chest','head'],['head','neck'],...['left','right'].flatMap(s=>[['pelvis',s+'Hip'],[s+'Hip',s+'Knee'],[s+'Knee',s+'Ankle'],[s+'Ankle',s+'Heel'],[s+'Ankle',s+'Toe'],['chest',s+'Shoulder'],[s+'Shoulder',s+'Elbow'],[s+'Elbow',s+'Wrist'],[s+'Wrist',s+'Hand']])];
const polar=(a,b)=>({l:Math.hypot(b.x-a.x,b.y-a.y),a:Math.atan2(b.y-a.y,b.x-a.x)});
export function visibleFourSnapshot(f,time=0){if(f.backstep)return backstepPose(f);if(f.interruptedStrike?.fourTrace)return fourTraceInterrupted(f.interruptedStrike,Math.max(0,time-f.interruptedStrike.createdTime));if(isFourTrace(f.action?.technique))return fourTracePose(f.action.technique,f.action.elapsed,f.action.contactLimit);if(!f.action&&f.pose==='idle'&&f.traceRestRig)return{rig:f.traceRestRig,joints:fourTraceJoints(f.traceRestRig),traceId:f.traceRestId};return null;}
export function rememberFourPresentation(b,index,p,rootX,facing){if(!b||b.done)return;let a=live.get(b);if(!a){a=[];live.set(b,a);}a[index]=p?{rig:clone(p.rig),joints:clone(p.joints),rootX,facing,source:'last-live-render',at:b.time}:null;}
export function clearFourPresentation(b,index){if(b&&!b.done){let a=live.get(b);if(a)a[index]=null;}}
function continuousFoot(r,side){const p=r.points,a=p[side+'Ankle'],h=p[side+'Heel'],t=p[side+'Toe'],dx=t.x-h.x,dy=t.y-h.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,v=-((a.x-h.x)*(-uy)+(a.y-h.y)*ux)/3;return{x:a.x,y:a.y,ux,uy,vx:-uy*v,vy:ux*v,heel:clone(h),toe:clone(t),roundness:0};}
export function makeFourKOSnapshot(b,f,index){let a=frozen.get(b);if(!a){a=[];frozen.set(b,a);}if(a[index]!==undefined)return a[index];const persisted=Object.hasOwn(f,'finishTraceSnapshot');if(persisted&&!f.finishTraceSnapshot)return a[index]=null;const p=persisted?f.finishTraceSnapshot:visibleFourSnapshot(f,b.time);if(!p)return a[index]=null;const s=clone({...p,rootX:p.rootX??traceDisplayRoot(b,f,index),facing:p.facing??f.action?.facing??f.facing,source:p.source??'legacy-current-state-visible-rig'});s.bounds={minX:s.facing===1?8-(28+s.rootX*.41):(28+s.rootX*.41)-376,maxX:s.facing===1?376-(28+s.rootX*.41):(28+s.rootX*.41)-8};const source=s.rig.points;let previous=links.map(([h,k])=>polar(source[h],source[k]).a);s.track=[];for(let n=0;n<=260;n++){const t=n/1000,j=fallenPose(s.joints,t,s.bounds),r=fourTraceFallEntry(s,j,.26).rig,angles=links.map(([h,k],i)=>{const now=polar(r.points[h],r.points[k]).a,u=previous[i]+Math.atan2(Math.sin(now-previous[i]),Math.cos(now-previous[i]));previous[i]=u;return u;});s.track.push({t,target:r,angles});}return a[index]=s;}
export function fourKOEntry(s,age){if(age<=0)return{rig:clone(s.rig),joints:clone(s.joints)};const t=Math.max(0,Math.min(.26,age)),q=smooth(t/.26),x=t*1000,i=Math.min(259,Math.floor(x)),w=x-i,A=s.track[i],B=s.track[i+1],target=fourTraceFallEntry(s,fallenPose(s.joints,t,s.bounds),.26).rig;if(q===1)return{rig:target,joints:fourTraceJoints(target)};const r=clone(s.rig),src=s.rig.points,dst=target.points,p={pelvis:pt(mix(src.pelvis.x,dst.pelvis.x,q),mix(src.pelvis.y,dst.pelvis.y,q))};for(let n=0;n<links.length;n++){const[h,k]=links[n],u=polar(src[h],src[k]),v=polar(dst[h],dst[k]),angle=mix(u.a,mix(A.angles[n],B.angles[n],w),q),length=mix(u.l,v.l,q);p[k]=pt(p[h].x+length*Math.cos(angle),p[h].y+length*Math.sin(angle));}r.points=p;r.hip=p.pelvis;r.chest=p.chest;r.head=p.head;for(const key of['bodyTurn','spinWeight','spinYaw'])r[key]=mix(s.rig[key]||0,target[key]||0,q);r.reviewFootOrientation={};for(const[side,key]of[['left','art'],['right','farSupportArt']]){const f=fourTraceFootArt(s.rig,side),g=continuousFoot(target,side),art={};for(const k of['ux','uy','vx','vy','roundness'])art[k]=mix(f[k]||0,g[k]||0,q);art.x=p[side+'Ankle'].x+mix(f.x-src[side+'Ankle'].x,g.x-dst[side+'Ankle'].x,q);art.y=p[side+'Ankle'].y+mix(f.y-src[side+'Ankle'].y,g.y-dst[side+'Ankle'].y,q);for(const k of['heel','toe'])art[k]=clone(p[side+k[0].toUpperCase()+k.slice(1)]);r.reviewFootOrientation[key]=art;}const below=Math.max(0,...['left','right'].flatMap(side=>fourTraceFootOutline(r,side).map(v=>-v[1])));if(below>0){for(const v of Object.values(p))v.y-=below;for(const a of Object.values(r.reviewFootOrientation)){a.y-=below;a.heel.y-=below;a.toe.y-=below;}}r.koBridge={gameAuthored:true,originalKOSeconds:t,source:s.source,floorLift:below};return{rig:r,joints:fourTraceJoints(r)};}

export function traceDisplayRoot(b,f,index,postSeconds=0){const event=(b?.events||[]).filter(e=>e.fighter===index&&e.type==='hit'&&(TECHNIQUES.find(t=>t.id===e.technique)?.postureKind||e.receiverPosture)).at(-1),age=event?(b.tick-event.tick)/60+(b.done?Math.max(0,postSeconds):0):Infinity,q=smooth(age/.12);return event&&age>=0&&age<.12?mix(event.receiverX??f.x,f.x,q):f.x;}
export function captureLethalTrace(b,f){const index=b.fighters.indexOf(f),p=visibleFourSnapshot(f,b.time);if(p)f.finishTraceSnapshot=clone({rig:p.rig,joints:p.joints,rootX:traceDisplayRoot(b,f,index),facing:f.action?.facing??f.facing,source:'pre-lethal-hit-visible-rig'});}

// Limited surface candidate: static hidden-arm masks need their own solution.
// Preserve the R3 path for those starts rather than lose an arm or reveal a
// disconnected fragment. This guard reads only; no snapshot/save changes.
export function supportsFourKOSurface(snapshot){const hidden=Object.entries(snapshot.rig.visibility||{}).filter(([part,v])=>/arm|hand/i.test(part)&&v==='occluded').map(([part])=>part);return hidden.length===0||completeHiddenSide(snapshot.rig).length===1&&hidden.length===3;}
// Keep the approved character style throughout KO. Only art transforms join;
// fourKOEntry and fallenPose still own every joint and original KO second.
export function fourKOSurface(snapshot,fall,age,headTilt=0){
 const entry=age<.26?fourKOEntry(snapshot,age):fourTraceFallEntry(snapshot,fall,.26);
 if(age<=0)return {...entry,singleSurface:true};
 const rig={...entry.rig},q=smooth(age/.26),footQ=smooth((age-.18)/.08);
 // The saved head roll joins the existing KO head tilt continuously.
 rig.referenceHeadRoll=mix(snapshot.rig.referenceHeadRoll||0,headTilt,q);
 rig.koSurface=true;
 if(age<.26&&footQ>0){
  // The old entry's oversized continuousFoot has a different art basis from
  // the normal four-trace foot. Resolve that surface-only mismatch before
  // the .26 boundary; retain every FK joint and its existing floor lift.
  const target=fourTraceFallEntry(snapshot,entry.joints,.26).rig;
  rig.reviewFootOrientation={...rig.reviewFootOrientation};
  for(const[side,key]of[['left','art'],['right','farSupportArt']]){
   const a=fourTraceFootArt(entry.rig,side),b=fourTraceFootArt(target,side),art={...a};
   for(const k of['x','y','ux','uy','vx','vy','roundness'])art[k]=mix(a[k]||0,b[k]||0,footQ);
   for(const k of['heel','toe'])art[k]={x:mix(a[k].x,b[k].x,footQ),y:mix(a[k].y,b[k].y,footQ)};
   rig.reviewFootOrientation[key]=art;
  }
 }
 // Rounded-foot capsules share the same display basis as the filled foot.
 // fourKOEntry's raw-joint heel/toe assignment changes that basis at 0+;
 // derive only these art anchors from the unchanged affine foot geometry.
 rig.reviewFootOrientation={...rig.reviewFootOrientation};
 for(const[side,key]of[['left','art'],['right','farSupportArt']]){
  const art=fourTraceFootArt(rig,side);
  art.heel=pt(art.x-4*art.ux+3*art.vx,art.y-4*art.uy+3*art.vy);
  art.toe=pt(art.x+10*art.ux+3*art.vx,art.y+10*art.uy+3*art.vy);
  rig.reviewFootOrientation[key]=art;
 }
 // Resolve the full painted body at draw time, including capsules and stroke.
 // Source geometry stays fixed. Shared live/KO foot calibration supersedes
 // old foot-pixel identity; no inherited below-floor allowance remains.
 rig.koFloorRegistration={originalKOSeconds:age,entryProxyLift:age<.26?(entry.rig.koBridge?.floorLift||0):0};
 return {...entry,rig:inferHiddenArm(snapshot,rig,age),singleSurface:true};
}

// Inferred DISPLAY-only hidden arm. Original source points/contact/FK stay fixed.
// At entry its opaque silhouette is behind the observed arm; it unfolds to the
// canonical KO chain by.26. No translucent hand or second body is drawn.
function completeHiddenSide(r){const sides=['left','right'],parts=s=>['UpperArm','Forearm','Hand'].map(k=>s+k);return sides.filter(s=>parts(s).every(p=>r.visibility[p]==='occluded')&&parts(s==='left'?'right':'left').every(p=>r.visibility[p]!=='occluded'));}
function inferHiddenArm(snapshot,rig,age){
 const sides=completeHiddenSide(snapshot.rig);if(!sides.length)return rig;
 const r={...rig,points:{...rig.points},visibility:{...rig.visibility},partOrder:[...rig.partOrder],koOriginalPartOrder:rig.partOrder,koInferredParts:[]},q=smooth(age/.26);
 const t=Math.min(.26,Math.max(0,age)),x=t*1000,i=Math.min(259,Math.floor(x)),w=x-i,A=snapshot.track[i],B=snapshot.track[i+1],S=snapshot.rig.points,sp=(a,b,z)=>pt(mix(a.x,b.x,z),mix(a.y,b.y,z));
 const directed=(side,h,k)=>{const key=links.findIndex(pair=>pair[0]===side+h&&pair[1]===side+k),u=polar(S[side+h],S[side+k]).a;return u+(mix(A.angles[key],B.angles[key],w)-u)*q;};
 for(const side of sides){const other=side==='left'?'right':'left',parts=['UpperArm','Forearm','Hand'].map(k=>side+k);r.koInferredParts.push(...parts);/* Source occlusion stays occluded; koInferredParts alone enables display. */r.partOrder=r.partOrder.filter(p=>!parts.includes(p));const before=r.partOrder.indexOf(other+'UpperArm');r.partOrder.splice(Math.max(0,before),0,...parts);
  if(age<.26){r.points[side+'Shoulder']=sp(rig.points[other+'Shoulder'],rig.points[side+'Shoulder'],q);for(const[h,k]of[['Shoulder','Elbow'],['Elbow','Wrist'],['Wrist','Hand']]){const a=polar(S[other+h],S[other+k]).a,b=polar(S[side+h],S[side+k]).a,offset=Math.round((a-b)/(2*Math.PI))*2*Math.PI,angle=mix(directed(other,h,k),directed(side,h,k)+offset,q),length=mix(polar(rig.points[other+h],rig.points[other+k]).l,polar(rig.points[side+h],rig.points[side+k]).l,q),origin=r.points[side+h];r.points[side+k]=pt(origin.x+length*Math.cos(angle),origin.y+length*Math.sin(angle));}}
 }
 return r;
}
