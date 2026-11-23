// Independent R10 candidate: do not change native KO playback or combat clocks.
// Fixed true 3D lengths; interpolation is on directions, never joint positions.
import{fallenPose,backfistKOTarget,fallHeadTilt}from'./finish-motion.js';
import{approvedBodyOperations}from'./approved-body.js';
import{JOINT_MAP}from'./backfist-r5-frozen.mjs';
const X=360/4.3,Y=605/4.3,add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,t)=>a.map(v=>v*t),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),norm=a=>Math.hypot(...a),unit=a=>mul(a,1/(norm(a)||1)),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
function slerp(a,b,t){a=unit(a);b=unit(b);const d=Math.max(-1,Math.min(1,dot(a,b)));if(d>.999999)return unit(mix(a,b,t));if(d<-.999999){let axis=Math.abs(a[0])<.8?[1,0,0]:[0,1,0];axis=unit(sub(axis,mul(a,dot(a,axis))));return add(mul(a,Math.cos(Math.PI*t)),mul(axis,Math.sin(Math.PI*t)));}const theta=Math.acos(d);return add(mul(a,Math.sin((1-t)*theta)/Math.sin(theta)),mul(b,Math.sin(t*theta)/Math.sin(theta)));}
const local=p=>Object.fromEntries(Object.entries(JOINT_MAP).map(([k,s])=>[k,[p[s][0]-X,Y-p[s][1],p[s][2]]]));
const raw=p=>Object.fromEntries(Object.entries(JOINT_MAP).map(([k,s])=>[s,[p[k][0]+X,Y-p[k][1],p[k][2]]]));
const projection=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v.slice(0,2)]));
export function painterFloor(j,headTilt=0,appearance=null){const ops=approvedBodyOperations(j,1,false,appearance,headTilt);let maximum=-Infinity,part=null,region=null;for(let index=1;index<ops.length;index++){const o=ops[index];if(o[0]==='region'){region=o[1];continue;}let y;if(o[0]==='poly')y=Math.max(...o[1].map(v=>v[1]));else if(o[0]==='oval')y=o[1][1]+Math.hypot(o[2]*Math.sin(o[5]),o[3]*Math.cos(o[5]));else continue;if(y>maximum){maximum=y;part={op:index,kind:o[0],region};}}return{height:-maximum/2,part};}
export function backfistKOPose(entry,seconds,{minX=-Infinity,maxX=Infinity,appearance=null,groundMode='auto'}={}){
 if(!entry?.pose?.rig3D)throw Error('R10 requires the actual captured 3D rig');
 const t=Math.max(0,Math.min(1.1,seconds)),a=local(entry.pose.rig3D),tilt=fallHeadTilt(t),entryFloor=painterFloor(entry.pose.joints,0,appearance),entrySupport=entryFloor.height>1e-6?'airborne':entryFloor.height>=-1e-6?'grounded':'invalid-penetrating';
 if(entrySupport==='invalid-penetrating')throw Error('Captured entry already penetrates painter floor: no silent correction');
 const appliedGroundMode=groundMode==='auto'?(entrySupport==='grounded'?'contact':'penetration-only'):groundMode;
 if(t===0)return{...entry.pose,headTilt:0,stage:'generated-3d-ko-entry',floor:painterFloor(entry.pose.joints,0,appearance),floorCorrection:0,weight:0,seconds:t,entrySupport,entryFloor,groundMode:appliedGroundMode};
 const target=(entry.koTargetMode==='raw-before-entry-v1'?backfistKOTarget:fallenPose)(entry.pose.joints,t,{minX,maxX}),b=Object.fromEntries(Object.entries(target).map(([k,p])=>[k,[...p,0]])),q=ease(t/.26),p={support_ankle:mix(a.support_ankle,b.support_ankle,q)},dir=(x,y)=>slerp(sub(a[y],a[x]),sub(b[y],b[x]),q),edge=(x,y,l)=>p[y]=add(p[x],mul(dir(x,y),l));
 edge('support_ankle','support_knee',25);edge('support_knee','support_hip',26);edge('support_hip','strike_hip',8);p.center=mul(add(p.support_hip,p.strike_hip),.5);edge('center','chest',30);edge('chest','head',14);edge('strike_hip','strike_knee',26);edge('strike_knee','strike_ankle',25);
 const sh=dir('far_shoulder','near_shoulder');p.near_shoulder=add(p.chest,mul(sh,4));p.far_shoulder=add(p.chest,mul(sh,-4));
 for(const s of['near','far'])for(const[x,y,l]of[['shoulder','elbow',18],['elbow','wrist',17],['wrist','hand',3.5]])edge(s+'_'+x,s+'_'+y,l);
 for(const s of['support','strike']){const u=dir(s+'_heel',s+'_toe'),normal=o=>unit(sub(sub(o[s+'_ankle'],o[s+'_heel']),mul(unit(sub(o[s+'_toe'],o[s+'_heel'])),4))),rawNormal=slerp(normal(a),normal(b),q),n=unit(sub(rawNormal,mul(u,dot(rawNormal,u))));p[s+'_heel']=sub(sub(p[s+'_ankle'],mul(u,4)),mul(n,3));p[s+'_toe']=sub(add(p[s+'_ankle'],mul(u,6.9)),mul(n,3));}
 let j=projection(p),floorBefore=painterFloor(j,tilt,appearance),floorCorrection=appliedGroundMode==='contact'?-floorBefore.height:Math.max(0,-floorBefore.height);for(const v of Object.values(p))v[1]+=floorCorrection;j=projection(p);
 return{joints:j,rig3D:raw(p),key:entry.pose.key+'-ko3d',stage:'generated-fixed-3d-ko',generated:true,sourceIndex:null,headTilt:tilt,seconds:t,weight:q,floor:painterFloor(j,tilt,appearance),floorBefore,floorCorrection,groundMode:appliedGroundMode,entrySupport,entryFloor,targetJoints:target,policy:'unchanged native time; .26s direction-space join; fixed 3D bones; one whole-body floor translation; not original recovery'};
}
