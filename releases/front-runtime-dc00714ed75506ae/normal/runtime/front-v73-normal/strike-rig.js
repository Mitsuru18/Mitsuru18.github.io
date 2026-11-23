import {POSTURE_REFERENCE} from './posture-rig.js';
import {STRIKE_REFERENCE} from './strike-reference.js';
import {compileObservedClip,sampleObservedClip} from './observed-motion.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;
const point=(x,y)=>({x,y});
const jumpKick=compileObservedClip(POSTURE_REFERENCE,'jumpKick',{impactFrameIndex:14,gameStartTime:.12,gameContactTime:.4,gameEndTime:.98,gameKeyTimes:[.12,.25,.4,.68,.84,.98]});
// This is shadowboxing: F006 marks maximum extension, not physical impact.
// Aligning it with the existing .20s damage tick is an authored game choice.
const cross=compileObservedClip(STRIKE_REFERENCE,'cross',{impactFrameIndex:6,gameContactTime:.2,gameEndTime:.64,gameKeyTimes:[0,.035,.06,.085,.11,.14,.2,.26,.36,.50,.64]});
const blendPose=(a,b,t)=>Object.fromEntries(Object.keys(a).map(k=>[k,typeof a[k]==='number'?mix(a[k],b[k],t):point(mix(a[k].x,b[k].x,t),mix(a[k].y,b[k].y,t))]));
const kickTimes={highkick:[.09,.18,.25,.35,.38,.44,.54,.64],roundkick:[.08,.13,.20,.28,.31,.37,.46,.56]};
const kickReference={...STRIKE_REFERENCE,motions:{core:{frameIndices:[17,18,19,20,21,22,23,24]}}};
const kickClips=Object.fromEntries(Object.entries(kickTimes).map(([id,times])=>[id,compileObservedClip(kickReference,'core',{impactFrameIndex:21,gameStartTime:times[0],gameContactTime:times[4],gameEndTime:times.at(-1),gameKeyTimes:times})]));
const rawPoint=(frame,key)=>frame.points[key]?.xy;
// Continuous display-only bridges across unobserved ankle/knee samples. All
// raw nulls remain in STRIKE_REFERENCE and sampleObservedClip. The completed
// coordinates are never exposed as observations or certified hidden joints.
const kickDisplayFrames=kickClips.highkick.frames.map((frame,index,frames)=>Object.fromEntries(Object.keys(frame.points).map(key=>{
 const direct=rawPoint(frame,key);if(direct)return [key,[...direct]];
 let a=index-1,b=index+1;while(a>=0&&!rawPoint(frames[a],key))a--;while(b<frames.length&&!rawPoint(frames[b],key))b++;
 if(a<0)a=b;if(b>=frames.length)b=a;if(a<0||a>=frames.length)return [key,null];
 const pa=rawPoint(frames[a],key),pb=rawPoint(frames[b],key),root=rawPoint(frame,'pelvis'),ra=rawPoint(frames[a],'pelvis'),rb=rawPoint(frames[b],'pelvis');
 const q=a===b?0:(frame.sourceTimeSeconds-frames[a].sourceTimeSeconds)/(frames[b].sourceTimeSeconds-frames[a].sourceTimeSeconds);
 return [key,pa.map((v,j)=>mix(v-ra[j],pb[j]-rb[j],q)+root[j])];
})));
function kickSample(id,elapsed){
 const raw=sampleObservedClip(kickClips[id],elapsed),i=raw.frameIndex-17,j=raw.nextFrameIndex-17;
 return {...raw,displayPoints:Object.fromEntries(Object.keys(kickDisplayFrames[i]).map(key=>{const a=kickDisplayFrames[i][key],b=kickDisplayFrames[j][key];return [key,a&&b?a.map((v,n)=>mix(v,b[n],raw.fraction)):a];})),
  inferred:Object.keys(raw.points).filter(key=>!raw.points[key])};
}
const sourceLength=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const maxima={};for(const [name,a,b]of [['thigh','rightHip','rightKnee'],['shin','rightKnee','rightAnkle'],['leftUpper','leftShoulder','leftElbow'],['leftFore','leftElbow','leftHand'],['rightUpper','rightShoulder','rightElbow'],['rightFore','rightElbow','rightHand']])maxima[name]=Math.max(...kickClips.highkick.frames.map(f=>rawPoint(f,a)&&rawPoint(f,b)?sourceLength(rawPoint(f,a),rawPoint(f,b)):0));
const vector=(a,b,scale)=>point(-(b[0]-a[0])*scale,(b[1]-a[1])*scale);
const normalized=(a,b,length)=>vector(a,b,length/(sourceLength(a,b)||1));
function legVector(p){const a=vector(p.rightHip,p.rightKnee,26/maxima.thigh),b=vector(p.rightKnee,p.rightAnkle,25/maxima.shin);return point(a.x+b.x,a.y+b.y);}
const observedContactLeg=legVector(kickDisplayFrames[4]);
// This completion is character-only, not a recovered source ankle. Interpolate
// a connected shin's angle/length, not an unknown ankle through its known knee.
// The actual displayed endpoint chains are retained at F017 and F020.
function localKickChain(p,scale){
 const a=point(0,0),v=legVector(p),c=point(v.x*scale,v.y*scale),thigh=vector(p.rightHip,p.rightKnee,26/maxima.thigh);let b=point(thigh.x*scale,thigh.y*scale);
 for(let n=0;n<24;n++)for(const [center,limit]of [[a,26],[c,25]]){const dx=b.x-center.x,dy=b.y-center.y,d=Math.hypot(dx,dy);if(d>limit)b=point(center.x+dx*limit/d,center.y+dy*limit/d);}
 return {a,b,c};
}
const hiddenDepth=(elapsed,times)=>{const u=(elapsed-times[0])/(times[3]-times[0]);return smooth((u-.03)/.32)*(1-smooth((u-.75)/.25));};
function completedHiddenKickChain(p,scale,elapsed,times){
 if(elapsed<=times[0]||elapsed>=times[3])return null;
 const first=localKickChain(kickDisplayFrames[0],scale),last=localKickChain(kickDisplayFrames[3],scale),a=point(first.c.x-first.b.x,first.c.y-first.b.y),b=point(last.c.x-last.b.x,last.c.y-last.b.y);
 const q=smooth((elapsed-times[0])/(times[3]-times[0])),start=Math.atan2(a.y,a.x),end=Math.atan2(b.y,b.x),delta=Math.atan2(Math.sin(end-start),Math.cos(end-start));
 // Moderate, explicit depth projection during the hidden chamber. Neither a
 // zero-length shin nor a full-length forward/backward sweep is evidence-backed.
 // Keep half the smaller endpoint projection and foreshorten the foot with it.
 const angle=start+delta*q,firstLength=Math.hypot(a.x,a.y),lastLength=Math.hypot(b.x,b.y),length=mix(mix(firstLength,lastLength,q),Math.min(firstLength,lastLength)*.5,hiddenDepth(elapsed,times));
 const v=vector(p.rightHip,p.rightKnee,26/maxima.thigh),initial=vector(kickDisplayFrames[0].rightHip,kickDisplayFrames[0].rightKnee,26/maxima.thigh),w=1-smooth((elapsed-times[0])/(times[1]-times[0]));
 let knee=point(v.x*scale+(first.b.x-initial.x*scale)*w,v.y*scale+(first.b.y-initial.y*scale)*w);const d=Math.hypot(knee.x,knee.y);if(d>26)knee=point(knee.x*26/d,knee.y*26/d);
 return {knee,ankle:point(knee.x+Math.cos(angle)*length,knee.y+Math.sin(angle)*length)};
}

const attachment=(o,near,arm=false)=>arm?point(o.chest.x+(near?4-8*o.bodyTurn:-4+9.5*o.bodyTurn),o.chest.y+(near?2:2-6*o.bodyTurn)):point(o.hip.x+(near?3-6*o.bodyTurn:-3+6*o.bodyTurn),o.hip.y+(near?0:1));

/** Observed high-roundhouse preparation/contact/rechamber, fitted to this
 * character. The game's short return replaces source F025–029's long turning
 * recovery, and the BODY variant lowers the contact path. Neither adaptation
 * is represented as a measured performance or as the approved spinning kick. */
export function observedKickPose(action,base,loaded,extended){
 const id=action?.technique;if(!Object.hasOwn(kickClips,id))return null;
 const total=id==='highkick'?1.02:.89,contact=id==='highkick'?.38:.31,active=.12;
 const elapsed=Number.isFinite(action.elapsed)?action.elapsed:action.phase==='windup'?contact*(action.phaseProgress||0):action.phase==='active'?contact+active*(action.phaseProgress||0):contact+active+(total-contact-active)*(action.phaseProgress||0);
 const sample=kickSample(id,elapsed),p=sample.displayPoints,times=kickTimes[id],entry=smooth(elapsed/times[0]),exit=1-smooth((elapsed-times.at(-1))/(total-times.at(-1))),weight=entry*exit;
 const q=clamp((sample.sourceTime-40.036131)/(40.636128-40.036131)),drive=smooth(q);
 const hipTurn=clamp((30-(p.rightHip[0]-p.leftHip[0]))/51),turn=mix(-.30,1.05,hipTurn),rootShift=6*(1.05-(extended.bodyTurn||0)),hip=point(mix(loaded.hip.x,extended.hip.x+rootShift,drive),mix(loaded.hip.y,extended.hip.y,drive));
 const spine=normalized(p.pelvis,p.chest,30),neck=normalized(p.chest,p.head,14);
 const o={...base,hip,chest:point(hip.x+spine.x,hip.y+spine.y),head:point(hip.x+spine.x+neck.x,hip.y+spine.y+neck.y),bodyTurn:turn,turn:drive*.8,shoulderFit:1};
 const contactPose={...extended,hip:point(extended.hip.x+rootShift,extended.hip.y),bodyTurn:1.05},root=attachment(o,true),contactRoot=attachment(contactPose,true),desired=point(extended.frontFoot.x-contactRoot.x,extended.frontFoot.y-contactRoot.y);
 const angle=Math.atan2(desired.y,desired.x)-Math.atan2(observedContactLeg.y,observedContactLeg.x),scale=Math.min(1,50.3/Math.hypot(observedContactLeg.x,observedContactLeg.y),Math.hypot(desired.x,desired.y)/Math.hypot(observedContactLeg.x,observedContactLeg.y)),v=legVector(p);
 o.frontFoot=point(root.x+(v.x*Math.cos(angle)-v.y*Math.sin(angle))*scale,root.y+(v.x*Math.sin(angle)+v.y*Math.cos(angle))*scale);
 // Carry the calibrated observed thigh itself into the renderer. A full-length
 // IK bow would swing rapidly around an ankle passing near its hip even when
 // the observed projected knee barely moves. Hidden points remain declared
 // display completion, and entry/return blend to the ordinary character knee.
 const thigh=vector(p.rightHip,p.rightKnee,26/maxima.thigh);
 o.observedFrontKnee=point(root.x+(thigh.x*Math.cos(angle)-thigh.y*Math.sin(angle))*scale,root.y+(thigh.x*Math.sin(angle)+thigh.y*Math.cos(angle))*scale);
 // Source clothes and completed hidden anchors can overestimate projected
 // segment length. Fit that display knee into the two character-length discs,
 // never choosing a different IK side just because the ankle crosses the hip.
 for(let n=0;n<24;n++)for(const [center,limit]of [[root,26],[o.frontFoot,25]]){const dx=o.observedFrontKnee.x-center.x,dy=o.observedFrontKnee.y-center.y,d=Math.hypot(dx,dy);if(d>limit)o.observedFrontKnee=point(center.x+dx*limit/d,center.y+dy*limit/d);}
 const hidden=completedHiddenKickChain(p,scale,elapsed,times);
 if(hidden){const place=v=>point(root.x+v.x*Math.cos(angle)-v.y*Math.sin(angle),root.y+v.x*Math.sin(angle)+v.y*Math.cos(angle));o.observedFrontKnee=place(hidden.knee);o.frontFoot=place(hidden.ankle);}
 o.footPoint=id==='highkick'?1:0;o.footAngle=id==='roundkick'?.15:0;
 // Arm directions are observed; normalized body proportions and fighting
 // attachment roots are the character adaptation. Right arm stays behind
 // torso, left guard arm in front, as in the source's per-part depth order.
 for(const [side,key,near]of [['left','frontHand',true],['right','rearHand',false]]){
  const shoulder=attachment(o,near,true),a=vector(p[side+'Shoulder'],p[side+'Elbow'],18/maxima[side+'Upper']),b=vector(p[side+'Elbow'],p[side+'Hand'],17/maxima[side+'Fore']);
  o[key]=point(shoulder.x+a.x+b.x,shoulder.y+a.y+b.y);
 }
 // The measured support foot turns away from the kick. Its continuous signed
 // projection crosses edge-on without the old sprite's minimum-width flip.
 const projectedWidth=-Math.max(.2,Math.min(1,(p.leftToe[0]-p.leftHeel[0])/43));
 o.rearPivot=(1-projectedWidth)/2;const pose=blendPose(base,o,weight),footScale=mix(1,projectedWidth,weight),finalAngle=.16*footScale*weight;pose.rearPivot=(1-footScale)/2;
 pose.rearFoot=point(-8-(10*footScale*Math.cos(finalAngle)-3*Math.sin(finalAngle)),-(10*footScale*Math.sin(finalAngle)+3*Math.cos(finalAngle)));
 return {pose,rearFootAngle:finalAngle,sample,weight,provenance:{observedFrames:[17,18,19,20,21,22,23,24],inferred:sample.inferred,
  adapted:['authored constrained hidden-chain angle/length through F017–020; not observed ankle motion','character proportions and sparse interpolation','toe-fixed support registration','existing head/body contact endpoint','conservative hidden-ankle/knee display bridges','short authored return instead of source continuing turn F025–029',...(id==='roundkick'?['BODY-height trajectory from HEAD-height source']:[])],exactPhysicalContactTime:false}};
}

/** Front-oblique boxing footage cannot establish a side-view arm path. Use
 * its observed wrist/shoulder and toe-pivot progression to drive the
 * established side-view reach. The endpoint, hidden striking elbow and camera
 * conversion stay authored, rather than claiming a recovered 3D performance. */
export function observedCrossPose(action,base,loaded,extended){
 if(action?.technique!=='cross')return null;
 const elapsed=Number.isFinite(action.elapsed)?action.elapsed:action.phase==='windup'?.2*(action.phaseProgress||0):action.phase==='active'?.2+.12*(action.phaseProgress||0):.32+.4*(action.phaseProgress||0);
 const sample=sampleObservedClip(cross,elapsed),p=sample.points;
 // Rear shoe's projected heel→toe axis turns continuously from x=-56 to
 // x=+18 in this view. Use this observed pivot rather than interpreting the
 // foreshortened shoulder width as a recoverable 3D yaw angle.
 const rotation=clamp((p.rightToe[0]-p.rightHeel[0]+56)/74);
 const entry=smooth(elapsed/.035),exit=1-smooth((elapsed-.64)/.08),weight=entry*exit;
 // Wrist movement relative to its shoulder supplies extension progression;
 // converting that projected value into 45px of side-view reach is authored.
 // Camera-facing wrist motion is not side-view reach. Ease its authored
 // depth→side conversion so the last extension arrives at the damage tick,
 // rather than overlapping the jaw throughout the final third of windup.
 const drive=clamp((p.rightWrist[0]-p.rightShoulder[0]+14)/26)**3,loading=elapsed<.06?Math.sin(clamp(elapsed/.06)*Math.PI):0;
 const start=blendPose(base,loaded,loading*.65),out=blendPose(start,extended,drive);
 out.bodyTurn=mix(base.bodyTurn,extended.bodyTurn,rotation);out.turn=rotation;
 // The source guard hand remains near the cheek while the rear side rotates.
 out.frontHand=point(out.head.x+mix(base.frontHand.x-base.head.x,extended.frontHand.x-extended.head.x,entry),out.head.y+mix(base.frontHand.y-base.head.y,extended.frontHand.y-extended.head.y,entry));
 out.rearHand.y=mix(base.rearHand.y,extended.rearHand.y,entry);
 // The observed right heel rises around the forefoot. Keep that toe mark
 // fixed in arena space instead of sliding a flat planted ankle underneath it.
 const angle=.20*rotation,pivot=.30*rotation,scale=1-2*pivot;
 out.rearPivot=pivot;out.rearFoot=point(-8-(10*scale*Math.cos(angle)-3*Math.sin(angle)),-(10*scale*Math.sin(angle)+3*Math.cos(angle)));
 const posed=blendPose(base,out,weight);
 const finalAngle=angle*weight,finalScale=1-2*posed.rearPivot;
 posed.rearFoot=point(-8-(10*finalScale*Math.cos(finalAngle)-3*Math.sin(finalAngle)),-(10*finalScale*Math.sin(finalAngle)+3*Math.cos(finalAngle)));
 return {pose:posed,rearFootAngle:finalAngle,sample,weight,rotation,
  provenance:{observed:['right wrist relative to shoulder progression','lead-hand guard retention','rear projected foot-axis pivot and heel lift','extension and retraction order'],
   adapted:['front-oblique source to side-view character conversion','existing head-contact reach and target','hidden right elbow at F006–007 and continuous connected side-view arms','toe-fixed character foot rotation','game key times and idle return'],physicalSourceImpact:false}};
}

/** Retain the posed root/endpoint and this fighter's maximum segment lengths,
 * but use the observed joint's projected side and degree of foreshortening.
 * A continuous signed projection avoids an IK elbow/knee flip when a limb
 * crosses edge-on. This is character retargeting, not a copied source joint.
 * Null source anchors deliberately return the existing authored chain. */
export function retargetProjectedJoint(chain,sourceRoot,sourceJoint,sourceEnd,{mirrorX=1,weight=1}={}){
 if(![sourceRoot,sourceJoint,sourceEnd].every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)))return chain;
 const sx=(sourceEnd[0]-sourceRoot[0])*mirrorX,sy=sourceEnd[1]-sourceRoot[1],jx=(sourceJoint[0]-sourceRoot[0])*mirrorX,jy=sourceJoint[1]-sourceRoot[1];
 const sourceD2=sx*sx+sy*sy;if(sourceD2<1e-6)return chain;
 const dx=chain.c.x-chain.a.x,dy=chain.c.y-chain.a.y,d=Math.hypot(dx,dy);if(d<1e-6)return chain;
 const ux=dx/d,uy=dy/d,along=(chain.b.x-chain.a.x)*ux+(chain.b.y-chain.a.y)*uy;
 const maxHeight=Math.abs((chain.b.x-chain.a.x)*-uy+(chain.b.y-chain.a.y)*ux);
 // Source displacement perpendicular to its root→end line, normalized for
 // performer scale. The .06 transition is an authored edge-on volume range.
 const projection=Math.tanh(((sx*jy-sy*jx)/sourceD2)/.06),height=maxHeight*projection;
 const b=point(chain.a.x+ux*along-uy*height,chain.a.y+uy*along+ux*height),w=clamp(weight);
 return {a:chain.a,b:point(mix(chain.b.x,b.x,w),mix(chain.b.y,b.y,w)),c:chain.c};
}

/** Initial adapter proof uses only the already delivered v12 jump-kick source.
 * Its target-height/tuck/landing endpoints and fighting-guard arms remain the
 * explicitly authored v12 adaptation. No new performance is claimed here. */
export function observedStrikeRig(action,chains){
 if(Object.hasOwn(kickClips,action?.technique)){
  const total=action.technique==='highkick'?1.02:.89,contact=action.technique==='highkick'?.38:.31,elapsed=Number.isFinite(action.elapsed)?action.elapsed:action.phase==='windup'?contact*(action.phaseProgress||0):action.phase==='active'?contact+.12*(action.phaseProgress||0):contact+.12+(total-contact-.12)*(action.phaseProgress||0);
  const sample=kickSample(action.technique,elapsed),p=sample.displayPoints,times=kickTimes[action.technique],weight=Math.min(smooth(elapsed/times[0]),1-smooth((elapsed-times.at(-1))/(total-times.at(-1))));
  const fit=(chain,side,start,middle,end)=>retargetProjectedJoint(chain,p[side+start],p[side+middle],p[side+end],{mirrorX:-1,weight});
  return {frontLeg:chains.frontKnee?{a:chains.frontLeg.a,b:chains.frontKnee,c:chains.frontLeg.c,occludedShinWeight:smooth((elapsed-times[0])/.025)*(1-smooth((elapsed-(times[3]-.025))/.025)),footProjection:1-.6*hiddenDepth(elapsed,times)}:fit(chains.frontLeg,'right','Hip','Knee','Ankle'),rearLeg:fit(chains.rearLeg,'left','Hip','Knee','Ankle'),frontArm:chains.frontArm&&fit(chains.frontArm,'left','Shoulder','Elbow','Hand'),rearArm:chains.rearArm&&fit(chains.rearArm,'right','Shoulder','Elbow','Hand'),provenance:{inferred:sample.inferred,sourceFrame:sample.frameIndex}};
 }
 if(action?.technique!=='jumpkick')return null;
 const elapsed=Number.isFinite(action.elapsed)?action.elapsed:0,sample=sampleObservedClip(jumpKick,elapsed),p=sample.points;
 const weight=Math.min(smooth(elapsed/.12),1-smooth((elapsed-.98)/.10));
 const fit=(chain,side)=>retargetProjectedJoint(chain,p[side+'Hip'],p[side+'Knee'],p[side+'Ankle'],{mirrorX:-1,weight});
 return {frontLeg:fit(chains.frontLeg,'right'),rearLeg:fit(chains.rearLeg,'left'),
  provenance:{sourceId:sample.raw.sourceId,frameIndex:sample.frameIndex,nextFrameIndex:sample.nextFrameIndex,fraction:sample.fraction,weight,
   observed:['right kicking-leg and left landing-leg projected knee directions'],
   adapted:['existing v12 head-height foot/hip trajectories','existing fighting-guard arms','character proportions and continuous projected limb volume','authored game key times and idle return']}};
}
