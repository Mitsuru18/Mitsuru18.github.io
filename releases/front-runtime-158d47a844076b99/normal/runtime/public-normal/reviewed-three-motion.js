import {REVIEWED_THREE_DATA} from './reviewed-three-data.js';
// Presentation-only registry. These entries do not grant skills or change combat.
export const REVIEWED_THREE = Object.freeze({
 horizontal_elbow:Object.freeze({label:'横肘',combatId:null,originY:0}),
 bolo:Object.freeze({label:'ボロ',combatId:'bolopunch',originY:-55}),
 sweep:Object.freeze({label:'前掃腿',combatId:null,originY:-33})
});
const copy=v=>structuredClone(v),clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export function reviewedDuration(id,{extension=false,entry=.2,recovery=.3}={}){
 const s=REVIEWED_THREE_DATA[id];if(!s)throw new RangeError('unknown reviewed motion');
 const frames=extension&&id==='bolo'?REVIEWED_THREE_DATA.bolo31.frames:s.frames;
 return entry+(frames.length-1)/s.fps+recovery;
}
function projectedFoot(f,id){
 if(!f)return null;
 const add=(a,b,n)=>a.map((x,i)=>x+b[i]*n);
 const project=p=>id==='horizontal_elbow'?[Math.cos(Math.PI/15)*p[0]+Math.sin(Math.PI/15)*p[2],-p[1]]:[p[0],-p[1]];
 return [f.heel,f.toe,add(f.toe,f.up,2),add(f.ankle,id==='bolo'?[0,1,0]:f.up,2),add(f.heel,f.up,3.5)].map(project);
}
// No role remapping, IK, point completion, floor fitting or source-time rewriting.
export function reviewedSample(id,elapsed,{extension=false,entry=.2,recovery=.3,interpolate=true,facing=1,originX=0,originY=0}={}){
 if(!REVIEWED_THREE[id])throw new RangeError('unknown reviewed motion');
 if(![elapsed,entry,recovery,originX,originY].every(Number.isFinite)||entry<0||recovery<=0||![1,-1].includes(facing))throw new TypeError('invalid presentation input');
 const s=REVIEWED_THREE_DATA[id],frames=extension&&id==='bolo'?REVIEWED_THREE_DATA.bolo31.frames:s.frames;
 const core=(frames.length-1)/s.fps,total=entry+core+recovery,pos=clamp((elapsed-entry)/core)*(frames.length-1);
 const nearest=Math.round(pos),snapped=Math.abs(pos-nearest)<1e-8?nearest:pos;
 const a=Math.floor(snapped),b=Math.min(frames.length-1,a+1),q=interpolate?snapped-a:0;
 const blend=(x,y)=>x===null||y===null?(q===0?copy(x):null):x.map((v,i)=>v+(y[i]-v)*q);
 const transform=p=>p===null?null:[originX+facing*p[0],originY+p[1]];
 const points=Object.fromEntries(Object.entries(frames[a].display_points).map(([k,v])=>[k,transform(q===0?copy(v):blend(v,frames[b].display_points[k]))]));
 const feet=Object.fromEntries(['A','B'].map(side=>{const x=projectedFoot(frames[a].display_feet[side],id),y=projectedFoot(frames[b].display_feet[side],id);return[side,q===0?(x?x.map(transform):null):x&&y?x.map((p,i)=>transform(blend(p,y[i]))):null]}));
 const stage=elapsed<entry?'entry':elapsed<=entry+core?'reviewed-core':elapsed<total?'recovery':'idle';
 const weight=stage==='entry'?(entry===0?1:ease(elapsed/entry)):stage==='reviewed-core'?1:stage==='recovery'?1-ease((elapsed-entry-core)/recovery):0;
 return {id,stage,weight,points,feet,index:a,nextIndex:b,fraction:q,total,sourceA:copy(frames[a]),sourceB:q?copy(frames[b]):null,provenance:q?'display-interpolation':'exact-reviewed-sample',extension:extension&&id==='bolo',contactCalibrated:false};
}
// Caller explicitly supplies the active action clock. Never substitute battle.time.
export function reviewedForFighter(f){
 const r=f.reviewedMotion;if(!r||!REVIEWED_THREE[r.id])return null;
 if(f.pose==='hit'||f.pose==='down'||f.finishFallJoints||f.interruptedStrike)return null;
 const elapsed=r.clock==='action'?f.action?.elapsed:r.elapsed;
 if(!Number.isFinite(elapsed))return null;
 return reviewedSample(r.id,elapsed,{extension:r.extension===true,interpolate:r.interpolate!==false,originY:REVIEWED_THREE[r.id].originY});
}
export function paintReviewedThree(c,s,palette){
 const j=s.points,skin=palette.skin||'#c8916e',cloth=palette.cloth||'#23565c';
 const line=(a,b,w,color)=>{if(!a||!b)return;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineWidth=w;c.lineCap='round';c.strokeStyle=color;c.stroke()};
 const polygon=(points,color)=>{if(!points||points.some(p=>!p))return;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill()};
 for(const side of ['A','B']){
  line(j['hip'+side],j['knee'+side],7,cloth);line(j['knee'+side],j['ankle'+side],5,skin);
  polygon(s.feet[side],skin);
 }
 polygon([j.shoulderA,j.shoulderB,j.hipB,j.hipA],skin);line(j.pelvis,j.neck,10,skin);
 for(const side of ['A','B']){line(j['shoulder'+side],j['elbow'+side],5,skin);line(j['elbow'+side],j['wrist'+side],4,skin);line(j['wrist'+side],j['hand'+side],5,skin)}
 if(j.head){c.beginPath();c.ellipse(...j.head,6,8,0,0,Math.PI*2);c.fillStyle=skin;c.fill()}
}
