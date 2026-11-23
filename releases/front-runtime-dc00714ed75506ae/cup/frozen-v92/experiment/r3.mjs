// Independent R3 hypotheses. Does not change approved input or any engine state.
import{makeCandidate,join,shift,ease,mapNative,timing}from'./candidate.mjs';
import{samplePose}from'./core-sampler.mjs';import{approvedBodyOperations}from'./reference/approved-body.js';import{fallenPose}from'./reference/finish-motion.js';
export function renderedFloor(j){let max=-Infinity;for(const o of approvedBodyOperations(j)){const [k,...a]=o;if(k==='region')continue;const color=k==='poly'?a[1]:k==='oval'?a[3]:a[3];if(color==='#314c4650')continue; // decorative shadow is not anatomy
 if(k==='poly')max=Math.max(max,...a[0].map(p=>p[1]));if(k==='line')max=Math.max(max,a[0][1]+a[2]/2,a[1][1]+a[2]/2);if(k==='oval'){const angle=a[4]||0;max=Math.max(max,a[0][1]+Math.hypot(a[1]*Math.sin(angle),a[2]*Math.cos(angle)));}}
 return-max/2;}
export function registerFloor(j){const lift=Math.max(0,-.5-renderedFloor(j));return{joints:shift(j,0,lift),lift,preFloor:renderedFloor(j),postFloor:renderedFloor(shift(j,0,lift))};}
export function makeR3(frames,native){const base=makeCandidate(frames,native),neutral=mapNative(native),first=frames[0].candidate_joints,last=frames.at(-1).candidate_joints,entryShift=base.start.support_toe[0]-first.support_toe[0],coreEnd=timing.entry+timing.core;
 function sample(seconds){const raw=base.sample(seconds);let dx;if(seconds<timing.entry)dx=base.start.support_toe[0]-raw.support_toe[0];else if(seconds<coreEnd)dx=entryShift;else dx=entryShift+last.support_toe[0]-raw.support_toe[0];return{...registerFloor(shift(raw,dx)),rootCorrection:[dx,0],assumption:'Authored rear-toe anchor during connectors; other foot not planted. Constant correction through source core.'};}
 function reaction(index,kind='hurt'){const initial=samplePose(frames,index),previous=samplePose(frames,Math.max(890,index-1)),dt=1001/30000,velocity=initial.center.map((x,i)=>(x-previous.center[i])/dt),gap=Math.max(0,renderedFloor(initial)+.5),g=800,T=gap>1e-7?(velocity[1]+Math.sqrt(velocity[1]**2+2*g*gap))/g:0;
 const landingNeutral=shift(neutral,initial.center[0]-neutral.center[0]),landingTarget=join(initial,kind==='ko'?fallenPose(initial,1.1):landingNeutral,kind==='ko'?.2:.65,{floor:kind==='ko'?'all':'feet'});
 // Articulation finishes over measured-by-hypothesis air time, not forced .2s.
 // Root follows authored ballistic vertical displacement; floor hull is registered only if necessary.
 const air=t=>{const q=T?Math.min(1,t/T):1,shape=join(initial,landingTarget,q),dy=velocity[1]*t-.5*g*t*t,dx=velocity[0]*(t-(T?t*t/(2*T):0));return registerFloor(shift(shape,initial.center[0]+dx-shape.center[0],renderedFloor(initial)+dy-renderedFloor(shape)));};
 const land=T?air(T).joints:initial,target=kind==='ko'?fallenPose(land,1.1):shift(neutral,land.center[0]-neutral.center[0]),after=kind==='ko'?Math.max(.01,1.1-T):.2,total=T+after;
 return{index,kind,airSeconds:T,total,after,velocity,gravityHypothesis:g,gap,
 sample(t){if(t<=0)return registerFloor(initial);if(T&&t<T)return air(t);return registerFloor(join(land,target,(t-T)/after,{floor:kind==='ko'?'all':'feet'}));}};
 }
 return{sample,reaction,entryShift,base};}

// Optional inferred swing-foot layer, only outside the unchanged101-frame core.
export function makeSteppedR3(frames,native){const r=makeR3(frames,native);return{...r,sample(t){const p=r.sample(t),entry=t<timing.entry,exit=t>=timing.entry+timing.core,q=entry?t/timing.entry:exit?(t-timing.entry-timing.core)/timing.exit:0;if(!(entry||exit)||q<=0||q>=1)return{...p,swingLift:0};const lift=6*Math.sin(Math.PI*q)**2,j=structuredClone(p.joints),h=j.strike_hip,oldA=j.strike_ankle,oldK=j.strike_knee,a=[oldA[0],oldA[1]+lift],v=a.map((x,i)=>x-h[i]),d=Math.hypot(...v),u=v.map(x=>x/d),along=(26**2-25**2+d*d)/(2*d);if(d>51+1e-8||d<1-1e-8)throw Error('swing ankle unreachable '+d);const height=Math.sqrt(Math.max(0,26**2-along**2)),cross=(oldA[0]-h[0])*(oldK[1]-h[1])-(oldA[1]-h[1])*(oldK[0]-h[0]),sign=Math.sign(cross)||1;j.strike_knee=[h[0]+u[0]*along-u[1]*height*sign,h[1]+u[1]*along+u[0]*height*sign];for(const key of ['strike_ankle','strike_heel','strike_toe'])j[key][1]+=lift;return{...p,...registerFloor(j),swingLift:lift,assumption:'Authored rear-toe support plus6model front-foot swing lift and fixed-length IK outside source core. Not observed stepping.'};}};}
