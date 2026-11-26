import{commonDutchFrame,frameFrom2D,blendDutchFrames}from'./dutchlow-r19-join.js';import{dutchHeadAngles}from'./dutchlow-r19-painter.js';
import{sampleDutch}from'./dutchlow-r19-sample.js';
import FRAMES from './dutchlow-r19-data.js';
import{applyDutchReturn}from'./dutchlow-r22-return.js';
import{swapLegs,specialSurfaces,shinSegment,specialContact}from'./leg-strike-motion.js';
import{capsuleNearX}from'./contact-motion.js';
const launchPlans=new Map();
const mode='clock',near=true;
const sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,q)=>a.map(x=>x*q),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1));
function knee(hip,ankle,pole){let v=sub(ankle,hip),d=len(v),u=unit(v),x=(26*26-25*25+d*d)/(2*d),h=Math.sqrt(Math.max(0,26*26-x*x)),p=sub(pole,hip);p=sub(p,mul(u,dot(p,u)));if(len(p)<1e-9)p=[0,0,1];return add(add(hip,mul(u,x)),mul(unit(p),h));}
export function dutchlowSourceIndex(t){
 const knots=mode==='R17'?[[0,0],[.32,26],[.5,31],[.9,47]]:[[.04,0],[.12,14],[.18,21],[.32,29],[.365,29],[.70,47]];
 let k=knots.findIndex(x=>x[0]>=t);k=Math.max(1,k<0?knots.length-1:k);let slopes=knots.slice(0,-1).map((x,i)=>(knots[i+1][1]-x[1])/(knots[i+1][0]-x[0])),d=knots.map((x,i)=>{if(!i)return slopes[0];if(i===knots.length-1)return mode==='R17'?slopes.at(-1):0;let h0=x[0]-knots[i-1][0],h1=knots[i+1][0]-x[0],w1=2*h1+h0,w2=h1+2*h0;return(w1+w2)/(w1/slopes[i-1]+w2/slopes[i]);}),[a,b]=[knots[k-1],knots[k]],h=b[0]-a[0],u=Math.max(0,Math.min(1,(t-a[0])/h)),index=Math.max(0,Math.min(47,(2*u**3-3*u*u+1)*a[1]+(u**3-2*u*u+u)*h*d[k-1]+(-2*u**3+3*u*u)*b[1]+(u**3-u*u)*h*d[k]));return index;
}
function atSource(n){let lo=.04,hi=.7;for(let k=0;k<48;k++){let t=(lo+hi)/2;if(dutchlowSourceIndex(t)>=n)hi=t;else lo=t;}return(lo+hi)/2;}
const RETURN_START=atSource(30),RETURN_LAND=atSource(41);
function dutchCore(t,ctx=null,baseOnly=false){
 let index=dutchlowSourceIndex(t),f=sampleDutch(index),j3=structuredClone(f.joints3D),feet=structuredClone(f.footVertices3D),step=mode==='R17'?0:(ctx?.stepApplied??0)*.41;
 for(let v of Object.values(j3))v[0]-=step;for(let list of Object.values(feet))for(let v of list)v[0]-=step;
 let placement={back:0,drop:0,clear:true};
 if(near&&ctx&&mode!=='R17'){
  const entry=ctx.entry??ctx,base=structuredClone(j3),bf=structuredClone(feet),surfaces=specialSurfaces(entry,'dutchlow'),plannedStep=(entry.plannedStep??12)*.41;
  const peak=structuredClone(FRAMES[29].joints);for(let p of Object.values(peak))p[0]-=plannedStep;
  // Solve the NEAR boundary of the existing exact shin/thigh test, not
  // independent capsule slices that can choose an unrelated, farther leg.
  // A finite extension plateau covers the existing active-window quarter
  // sample; this is shared pose/contact clocking, not a forced-hit branch.
  const key=JSON.stringify([entry.joints,entry.gap,entry.face,entry.defFace,entry.plannedStep]);let planned=launchPlans.get(key);
  if(planned===undefined){
  const probe=dx=>{const q=structuredClone(peak);for(let p of Object.values(q))p[0]-=dx;return specialContact('dutchlow',q,entry)};
  let initial=probe(0);planned=0;
  if(initial.distance<7.3||initial.point[0]>=initial.receiverPoint[0]){
   let best={x:0,d:initial.distance};for(let x=.5;x<=60;x+=.5){let d=probe(x).distance;if(d<best.d)best={x,d};}
   if(best.d<=7.3){
    // Aim inside the EXISTING exact legal shin/thigh interval. Both endpoints
    // use unchanged radius7.3; no future target query or active-phase retarget.
    // An outer tangent has zero allowance for ordinary receiver movement.
    let lower=0;if(initial.distance>=7.3){let lo=0,hi=best.x;for(let n=0;n<30;n++){let mid=(lo+hi)/2;if(probe(mid).distance<7.3)hi=mid;else lo=mid;}lower=(lo+hi)/2;}
    let lo=best.x,hi=60;for(let n=0;n<30;n++){let mid=(lo+hi)/2;if(probe(mid).distance<7.3)lo=mid;else hi=mid;}let upper=(lo+hi)/2;
    planned=(lower+upper)/2;
   }
  }
   if(launchPlans.size>=32)launchPlans.delete(launchPlans.keys().next().value);launchPlans.set(key,planned);
  }

  const ss=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x))};
  const origin=FRAMES[0].joints.center[0],advance=FRAMES[29].joints.center[0]-origin,ratio=Math.max(0,Math.min(1,(f.joints.center[0]-origin)/advance)),dx=planned*ratio;
  // Shorten only the observed front-foot airborne step (native463..466).
  // Once it lands, its endpoint is fixed; no post-hit target re-query.
  const landingRatio=Math.max(0,Math.min(1,(FRAMES[21].joints.center[0]-origin)/advance)),frontOffset=planned*ss((index-18)/3),air=ss(Math.min(...bf.A.map(p=>p[1]))/4),rearLandingRatio=Math.max(0,Math.min(1,(FRAMES[41].joints.center[0]-origin)/advance)),rearOffset=index>=41?planned*rearLandingRatio:dx*ss((index-18)/3);
  let drop=0,reach=[];
  function place(d){let z=structuredClone(base),foot=structuredClone(bf);
   for(let p of Object.values(z)){p[0]-=dx;p[1]-=d;}
   for(let[s,side,amount,w]of[['A','strike',rearOffset,air],['B','support',frontOffset,0]]){
    let up=Math.max(0,d*w-Math.min(...bf[s].map(p=>p[1])));
    for(let p of foot[s]){p[0]-=amount;p[1]+=-d*w+up;}
    for(let k of['ankle','heel','toe']){let p=base[side+'_'+k];z[side+'_'+k]=[p[0]-amount,p[1]-d*w+up,p[2]];}
   }return{z,foot};}
  // Respect BOTH legs' reachable volumes. Never clamp sqrt of an impossible
  // endpoint and then claim a fixed-bone solution.
  for(let pass=0;pass<4;pass++){
   let p=place(drop),needed=drop;for(let side of['strike','support']){let h=p.z[side+'_hip'],a=p.z[side+'_ankle'],horizontal=(h[0]-a[0])**2+(h[2]-a[2])**2;if(horizontal>50.99**2)throw Error('R19 horizontal leg reach');let allowed=Math.sqrt(50.99**2-horizontal),deficit=h[1]-a[1]-allowed,w=side==='strike'?air:0;if(deficit>1e-10&&w<1-1e-8)needed=Math.max(needed,drop+deficit/(1-w));else if(deficit>1e-6)throw Error('R19 airborne source reach');}drop=needed;
  }
  let p=place(drop);j3=p.z;feet=p.foot;
  for(let side of['strike','support']){let h=j3[side+'_hip'],a=j3[side+'_ankle'],distance=len(sub(a,h));if(distance>51+1e-7||distance<1-1e-7)throw Error('R19 unreachable endpoint '+distance);let pole=base[side+'_knee'].map((x,k)=>x-(k===0?dx:k===1?drop:0));j3[side+'_knee']=knee(h,a,pole);reach.push(distance);}
  placement={back:dx,planned,ratio,frontOffset,rearOffset,drop,air,reach,clear:null,footMin:Math.min(...feet.A.map(p=>p[1]),...feet.B.map(p=>p[1])),meaning:'generated near short-step adaptation from actual initial receiver; immutable own-motion plan, translated knee poles, both fixed-bone reach volumes'};
 }

 // A wall-only, rigid yaw of the AIRBORNE leg preserves its knee angle,
 // lengths, foot mesh and height. It changes no source row or active contact
 // pose. The same result is used by drawing and the contact query.
 let wallYaw=0;
 const range=ctx?.entry?.wallRangeStart??ctx?.wallRangeStart;
 if(range&&Math.min(...feet.A.map(p=>p[1]))>1e-7){
  const h=j3.strike_hip,rot=(p,a)=>{let x=p[0]-h[0],z=p[2]-h[2];return[h[0]+x*Math.cos(a)+z*Math.sin(a),p[1],h[2]+z*Math.cos(a)-x*Math.sin(a)];},bounds=a=>{let points=feet.A.map(p=>rot(p,a));for(let[k,r]of[['hip',5.5],['knee',3.6],['ankle',2.1]]){let p=rot(j3['strike_'+k],a);points.push([p[0]-r,p[1],p[2]],[p[0]+r,p[1],p[2]])}return[Math.min(...points.map(p=>p[0]+step)),Math.max(...points.map(p=>p[0]+step))];},valid=a=>{let [lo,hi]=bounds(a);return lo>=range[0]-1e-7&&hi<=range[1]+1e-7;};
  if(!valid(0)){let found=null,prev=0;for(let n=1;n<=90;n++){let a=n*Math.PI/180;if(valid(a)){let lo=prev,hi=a;for(let k=0;k<24;k++){let m=(lo+hi)/2;if(valid(m))hi=m;else lo=m}found=hi;break}prev=a;}if(found===null)throw Error('R19 no rigid airborne wall space');wallYaw=found;for(let k of['knee','ankle','heel','toe'])j3['strike_'+k]=rot(j3['strike_'+k],found);feet.A=feet.A.map(p=>rot(p,found));}
 }
 placement.wallYaw=wallYaw;
 // Generated own-motion return, not an observation or receiver retarget.
 // Initial contact plateau stays exact. Corrected geometry is shared by paint,
 // shin contact and all receiving shape readers; no invisible legacy proxy.
 if(!baseOnly&&index>30){
  const from=dutchCore(RETURN_START,ctx,true),before=dutchCore(RETURN_START-1e-5,ctx,true),land=dutchCore(RETURN_LAND,ctx,true);
  const changed=applyDutchReturn({joints3D:j3,footVertices3D:feet},t,from,before,land,RETURN_START,RETURN_LAND);
  j3=changed.joints3D;feet=changed.footVertices3D;placement.generatedReturn=changed.returnEvidence;
 }

 let joints=Object.fromEntries(Object.entries(j3).map(([k,v])=>[k,v.slice(0,2)]));return{joints:swapLegs(joints),rawJoints:joints,joints3D:j3,footVertices3D:feet,total:.9,coreDuration:.9,sourceNative:445+index,sourceElapsed:index/30,stage:'source48-fixed3d-r19',placement};
}

const joinEase=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x))};
function ready(p,meta={}){let raw=p.rawJoints??Object.fromEntries(Object.entries(p.joints3D).map(([k,p])=>[k,p.slice(0,2)]));return{...p,...meta,rawJoints:raw,joints:swapLegs(raw),total:.9,coreDuration:.66};}
export function dutchlowPose(t,ctx=null){
 if(t<.04){let end=dutchCore(.04,ctx),q=Math.max(0,t/.04),u=joinEase(q),head=dutchHeadAngles(end);return ready(blendDutchFrames(commonDutchFrame(),end,q),{stage:'generated-entry',sourceNative:445,sourceElapsed:0,headAngles:{direction:1+(head.direction-1)*u,roll:head.roll*u,pitch:head.pitch*u},artWeight:u,atRest:q<=0,placement:end.placement});}
 if(t>.70){let from=dutchCore(.70,ctx),q=Math.max(0,Math.min(1,(t-.70)/.20)),u=joinEase(q),head=dutchHeadAngles(from);return ready(blendDutchFrames(from,commonDutchFrame(),q,{stepping:true}),{stage:'generated-return',sourceNative:492,sourceElapsed:47/30,headAngles:{direction:head.direction+(1-head.direction)*u,roll:head.roll*(1-u),pitch:head.pitch*(1-u)},artWeight:1-u,atRest:q>=1,placement:from.placement});}
 return dutchCore(t,ctx);
}
export function dutchlowInterrupted(s,elapsed){let from=dutchlowPose(s.action.elapsed,s.action.contactLimit),q=Math.max(0,Math.min(1,elapsed/(s.duration||.2))),u=joinEase(q),head=dutchHeadAngles(from),end=frameFrom2D(s.neutral);return ready(blendDutchFrames(from,end,q),{stage:'generated-interruption',sourceNative:from.sourceNative,sourceElapsed:from.sourceElapsed,headAngles:{direction:head.direction+(1-head.direction)*u,roll:head.roll*(1-u),pitch:head.pitch*(1-u)},artWeight:1-u,atRest:q>=1,placement:from.placement});}

export function dutchlowKO(snapshot,target,seconds,headTilt=0){
 const source=dutchlowPose(snapshot.action.elapsed,snapshot.action.contactLimit),q=Math.max(0,Math.min(1,seconds/.26)),u=joinEase(q),angles=dutchHeadAngles(source),p=q===0?structuredClone(source):blendDutchFrames(source,frameFrom2D(target),q);
 return ready(p,{sourceNative:source.sourceNative,sourceElapsed:source.sourceElapsed,headAngles:{direction:angles.direction,roll:angles.roll*(1-u)+headTilt,pitch:angles.pitch*(1-u)},artWeight:1-u,stage:'generated-KO-entry'});
}
