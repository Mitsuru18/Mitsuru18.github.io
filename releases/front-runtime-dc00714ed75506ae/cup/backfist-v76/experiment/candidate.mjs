// UNADOPTED fixed-body hypothesis. No engine, storage or clock changes.
import {samplePose} from './core-sampler.mjs';
import {fallenPose} from './reference/finish-motion.js';
export const timing={entry:.22,core:101101/30000,exit:.30,hurt:.2,ko:1.1};
const A=(a,b)=>a.map((v,i)=>v+b[i]),S=(a,b)=>a.map((v,i)=>v-b[i]),M=(a,q)=>a.map(v=>v*q),ang=v=>Math.atan2(v[1],v[0]),V=t=>[Math.cos(t),Math.sin(t)],mix=(a,b,q)=>a.map((v,i)=>v+(b[i]-v)*q),am=(a,b,q)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*q;
export const ease=q=>{q=Math.max(0,Math.min(1,q));return q*q*q*(10+q*(-15+6*q))};
export const shift=(j,dx,dy=0)=>Object.fromEntries(Object.entries(j).map(([k,p])=>[k,[p[0]+dx,p[1]+dy]]));
export const soleMin=j=>Math.min(...['support','strike'].flatMap(s=>[j[s+'_heel'][1],j[s+'_toe'][1]]));
export function mapNative(native){const j=structuredClone(native);for(const k of ['shoulder','elbow','wrist','hand'])[j['near_'+k],j['far_'+k]]=[j['far_'+k],j['near_'+k]];return j;}
// Continuous angular FK, no nearest-IK branch changes. Floor registration is authored;
// feet are NOT planted: measured slip must be reviewed before adoption.
export function join(a,b,q,{floor='feet'}={}){
 if(q<=0)return structuredClone(a);if(q>=1)return structuredClone(b);
 const t=ease(q),dir=(p,k)=>V(am(ang(S(a[k],a[p])),ang(S(b[k],b[p])),t)),j={center:mix(a.center,b.center,t)};
 j.chest=A(j.center,M(dir('center','chest'),30));j.head=A(j.chest,M(dir('chest','head'),14));
 for(const [s,sign] of [['support',-1],['strike',1]])j[s+'_hip']=A(j.center,M(dir('support_hip','strike_hip'),4*sign));
 for(const [s,sign] of [['near',-1],['far',1]]){j[s+'_shoulder']=A(j.chest,M(dir('near_shoulder','far_shoulder'),4*sign));for(const [p,k,l] of [['shoulder','elbow',18],['elbow','wrist',17],['wrist','hand',3.5]])j[s+'_'+k]=A(j[s+'_'+p],M(dir(s+'_'+p,s+'_'+k),l));}
 for(const s of ['support','strike']){j[s+'_knee']=A(j[s+'_hip'],M(dir(s+'_hip',s+'_knee'),26));j[s+'_ankle']=A(j[s+'_knee'],M(dir(s+'_knee',s+'_ankle'),25));const u=dir(s+'_heel',s+'_toe'),n=[-u[1],u[0]];j[s+'_heel']=A(A(j[s+'_ankle'],M(u,-4)),M(n,-3));j[s+'_toe']=A(A(j[s+'_ankle'],M(u,6.9)),M(n,-3));}
 const low=p=>floor==='all'?Math.min(...Object.values(p).map(v=>v[1])):soleMin(p),desired=low(a)*(1-t)+low(b)*t;
 return shift(j,0,desired-low(j));
}
export function makeCandidate(frames,native){const neutral=mapNative(native),first=frames[0].candidate_joints,last=frames.at(-1).candidate_joints,start=shift(neutral,first.strike_toe[0]-neutral.strike_toe[0]),end=shift(neutral,last.strike_toe[0]-neutral.strike_toe[0]);return{start,end,
 sample(seconds){if(seconds<timing.entry)return join(start,first,seconds/timing.entry);if(seconds<timing.entry+timing.core)return samplePose(frames,890+(seconds-timing.entry)*30000/1001);return join(last,end,(seconds-timing.entry-timing.core)/timing.exit)},
 reaction(sourceIndex,seconds,kind='hurt'){const a=samplePose(frames,sourceIndex);let b=kind==='ko'?fallenPose(a,timing.ko):shift(neutral,a.center[0]-neutral.center[0]);return join(a,b,seconds/timing[kind],{floor:kind==='ko'?'all':'feet'});}
 };}
