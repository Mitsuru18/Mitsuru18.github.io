import{AXE_REFERENCE}from'./axe-reference-data.js';
import{params,fromParams,receiverPose,blendParams,clamp,angle,sub,add,mul,len,vec}from'./approved-2d-core.js';
// Nine manually specified source frames. Between them: angular interpolation.
// Source forward travel and final yaw are not measured game root motion.
// Only the axe uses this source; no changes to the other five world strikes.
const angleOf=(a,b)=>Math.atan2(a[1]-b[1],a[0]-b[0]); // source faces screen-left; y-up
const base=params(receiverPose()),first=AXE_REFERENCE.frames[0].t,last=AXE_REFERENCE.frames.at(-1).t;
function fitArm(p,side,f){const shoulder=f.nearShoulder??[f.chest[0]-10,f.chest[1]-25],target=f.nearWrist;if(!target)return;const scale=35/170,v=[(shoulder[0]-target[0])*scale,(shoulder[1]-target[1])*scale],d=clamp(len(v),2,34.8),theta=angle(v),alpha=Math.acos(clamp((18*18+d*d-17*17)/(36*d),-1,1));p[side+'u']=theta-alpha;const elbow=mul(vec(p[side+'u']),18),w=mul(v,d/(len(v)||1));p[side+'f']=angle(sub(w,elbow));p[side+'h']=p[side+'f'];}
const nodes=AXE_REFERENCE.frames.map(f=>{const p={...base,sa:[...base.sa]};p.ss=angleOf(f.supportAnkle,f.supportKnee);p.st=angleOf(f.supportKnee,f.pelvis);p.spine=angleOf(f.pelvis,f.chest);p.head=angleOf(f.chest,f.head);p.kt=angleOf(f.pelvis,f.strikeKnee);p.ks=angleOf(f.strikeKnee,f.strikeAnkle);
 // Avoid clothing/blur noise switching knee bend across straight extension.
 let bend=Math.atan2(Math.sin(p.ks-p.kt),Math.cos(p.ks-p.kt));p.ks=p.kt-Math.max(.045,Math.min(1.8,Math.abs(bend)));
 // Foot pixels rotate out of plane at entry/landing. Keep a coherent local
 // ankle, not a 180-degree branch flip. Peak/heel descent remains dorsiflexed.
 const q=(f.t-first)/(last-first);p.kf=q<.15?0:q<.5?.6:q<.76?1.0:.25;
 if(q>.12&&q<.55){const lift=Math.min(1,(q-.12)/.12,(.55-q)/.10);p.kt+=.24*lift;p.ks+=.24*lift;p.ss=p.ss*(1-lift)+1.35*lift;p.st=p.st*(1-lift)+1.35*lift;}
 fitArm(p,'near',f); // other arm is partly hidden: conservative inferred balance arm
 p.faru=-.4+Math.sin(q*Math.PI)*.6;p.farf=1.7;p.farh=1.7;
 return{q,p};});
export const AXE_RETARGET_LIMITS=Object.freeze({manualFrames:9,sourceStart:first,sourceEnd:last,interpolation:'angular between specified frames',pelvisAndKnees:'clothing estimates',farArm:'occluded estimate',rootAndFinalYaw:'source travel compressed; final yaw omitted for fixed2D',foot:'blur/out-of-plane local-axis estimate; continuous dorsiflexion',body:'fixed accepted proportions; lift adapted up to0.24rad and support extended to clear taller game head, not performer proportions',boundary:'common-stance blends outside central source path'});
export function axeReferencePose(q){q=clamp(q);if(q===0||q===1)return fromParams(base);let i=Math.max(1,nodes.findIndex(n=>n.q>=q));if(i<1)i=nodes.length-1;const a=nodes[i-1],b=nodes[i],u=clamp((q-a.q)/(b.q-a.q)),p=blendParams(a.p,b.p,u);p.sa=[...base.sa];const weight=Math.min(1,q/.15,(1-q)/.18);return fromParams(blendParams(base,p,weight*weight*(3-2*weight)));}
