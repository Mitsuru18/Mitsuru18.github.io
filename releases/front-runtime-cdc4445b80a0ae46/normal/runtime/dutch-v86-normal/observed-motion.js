/* Evidence-only sampling shared by observed strike adapters. This module does
 * not generate anatomy, solve IK or claim an interpolated point was observed.
 * Character retargeting and any hidden-point completion belong in a separately
 * documented presentation adapter; the source object is never modified. */
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finitePoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
const coordinates=p=>finitePoint(p)?p:finitePoint(p?.xy)?p.xy:null;
const timeOf=f=>f.sourceTimeSeconds;

/** Validate a delivered motion and author an explicit two-phase time mapping.
 * Pre-contact and post-contact source intervals are retimed independently so
 * a visual-only revision can retain the game's existing damage tick and total
 * action duration. This is gameplay retiming, not measured performance speed.
 * An explicit source extension/contact reference must be supplied; it is never
 * guessed by height and does not establish physical contact in shadowboxing. */
export function compileObservedClip(reference,motionId,{impactFrameIndex,gameContactTime,gameEndTime,gameStartTime=0,gameKeyTimes=null}={}){
 const motion=reference?.motions&&Object.hasOwn(reference.motions,motionId)?reference.motions[motionId]:null;
 if(!motion||!Array.isArray(motion.frameIndices)||motion.frameIndices.length<3)throw new TypeError('Observed clip needs at least three explicitly indexed source frames');
 if(!Array.isArray(reference.frames))throw new TypeError('Observed reference needs a frame array');
 const byIndex=new Map(reference.frames.map(f=>[f.frameIndex,f]));
 if(byIndex.size!==reference.frames.length)throw new TypeError('Source frame indices must be unique');
 const frames=motion.frameIndices.map(i=>byIndex.get(i));
 if(frames.some(f=>!f||!Number.isFinite(timeOf(f))||!f.points))throw new TypeError('Source frames need finite times and landmark records');
 if(frames.some((f,i)=>i&&timeOf(f)<=timeOf(frames[i-1])))throw new TypeError('Source frame times must increase in delivered order');
 if(new Set(frames.map(f=>f.sourceId)).size!==1)throw new TypeError('A clip cannot interpolate across different performances');
 if(![gameStartTime,gameContactTime,gameEndTime].every(Number.isFinite)||!(gameStartTime<gameContactTime&&gameContactTime<gameEndTime))throw new TypeError('Game start/contact/end must be explicit increasing finite times');
 const contact=frames.find(f=>f.frameIndex===impactFrameIndex);
 if(!contact||contact===frames[0]||contact===frames.at(-1))throw new TypeError('Impact must identify an interior source frame');
 for(const f of frames)for(const [name,p]of Object.entries(f.points)){
  const value=p&&Object.hasOwn(p,'xy')?p.xy:p;
  if(value!==null&&!finitePoint(value))throw new TypeError(`Invalid landmark ${name} in source frame ${f.frameIndex}`);
 }
 const sourceStart=timeOf(frames[0]),sourceContact=timeOf(contact),sourceEnd=timeOf(frames.at(-1));
 if(gameKeyTimes!==null&&(!Array.isArray(gameKeyTimes)||gameKeyTimes.length!==frames.length||gameKeyTimes.some((t,i)=>!Number.isFinite(t)||(i&&t<=gameKeyTimes[i-1]))||gameKeyTimes[0]!==gameStartTime||gameKeyTimes.at(-1)!==gameEndTime||gameKeyTimes[frames.indexOf(contact)]!==gameContactTime))throw new TypeError('Authored key times must preserve ordered samples and the explicit contact');
 return Object.freeze({motionId,frames:Object.freeze([...frames]),sourceId:frames[0].sourceId,
  timing:Object.freeze({sourceStart,sourceContact,sourceEnd,gameStartTime,gameContactTime,gameEndTime,impactFrameIndex,
   preContactRate:(sourceContact-sourceStart)/(gameContactTime-gameStartTime),
   postContactRate:(sourceEnd-sourceContact)/(gameEndTime-gameContactTime),
   gameKeyTimes:gameKeyTimes&&Object.freeze([...gameKeyTimes]),classification:'authored_phase_retiming'})});
}

export function observedSourceTime(clip,elapsed){
 const t=clip.timing,e=clamp(Number.isFinite(elapsed)?elapsed:t.gameStartTime,t.gameStartTime,t.gameEndTime);
 if(t.gameKeyTimes){let i=0;while(i<t.gameKeyTimes.length-2&&e>t.gameKeyTimes[i+1])i++;const a=t.gameKeyTimes[i],b=t.gameKeyTimes[i+1],sourceA=timeOf(clip.frames[i]),sourceB=timeOf(clip.frames[i+1]);return sourceA+(sourceB-sourceA)*(e-a)/(b-a);}
 return e<=t.gameContactTime?t.sourceStart+(e-t.gameStartTime)*t.preContactRate:t.sourceContact+(e-t.gameContactTime)*t.postContactRate;
}

/** Return exact keyframe coordinates at their times and linear projected
 * interpolation between samples. Unknown coordinates remain null, including
 * an interval where only one endpoint is known. Metadata stays attached to
 * the previous observed frame; adapters may transition paint order separately.
 * No symmetry inference, source-frame replacement or mutation occurs here. */
export function sampleObservedClip(clip,elapsed){
 const sourceTime=observedSourceTime(clip,elapsed),frames=clip.frames;
 let index=0;while(index<frames.length-1&&sourceTime>=timeOf(frames[index+1])-1e-10)index++;
 const a=frames[index],b=frames[Math.min(index+1,frames.length-1)],span=timeOf(b)-timeOf(a);
 const fraction=span?clamp((sourceTime-timeOf(a))/span,0,1):0;
 const keys=new Set([...Object.keys(a.points),...Object.keys(b.points)]),points={},status={};
 for(const key of keys){
  const pa=coordinates(a.points[key]),pb=coordinates(b.points[key]);
  points[key]=fraction<1e-10?(pa?[...pa]:null):pa&&pb?pa.map((n,j)=>n+(pb[j]-n)*fraction):null;
  status[key]=points[key]?(fraction<1e-10?'source_sample':'interpolated_visible_endpoints'):'unobserved';
 }
 return {points,status,sourceTime,frameIndex:a.frameIndex,nextFrameIndex:b.frameIndex,fraction,raw:a,nextRaw:b};
}
