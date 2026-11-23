import{makeLocalProjection}from'./jump-local-r50.js';
import{ENTRY_SUPPORT_REVISION as R51_ENTRY_REVISION,footSupportedEntry}from'./jump-entry-r51.js';
import{rootCorrection}from'./jump-root-air-r54.js';
import{ENTRY_SUPPORT_REVISION as WALK_ENTRY_REVISION,walkSupportedEntry}from'./jump-entry-walk-r34.js';
import{ENTRY_SUPPORT_REVISION,frontSupportedEntry}from'./jump-entry-support-r31.js';
import{planHurt as planPushR18}from'./reaction-push-r18.js';
import{acceptedJumpSurfaces}from'./jump-receiving-surface-r16.js';
import{planHurt}from'./reaction-terminal-r16.js';
import{boundaryHurt}from'./reaction-boundary.js';
// UNADOPTED R10 native display/geometry adapter. Raw101 and base motion untouched.
import * as B from'./jump-base-motion.js';import{nativeLabels,nativeFoot,hybridRetarget,sourceContact,supportRetarget,footBottom}from'./native-retarget.js';import{snapshotJoin}from'./snapshot-join.js';import{punchTouchesSurface}from'./body-uppercut-contact.js';import{recorder}from'./native-recorder.js';
export const jumpKick=B.jumpKick,JUMP_TIMING=B.JUMP_TIMING,JUMP_GAME_RULES=B.JUMP_GAME_RULES;
const entry=.22,coreEnd=.22+101101/30000,total=coreEnd+.30;
function oldCoreAt(t){const p=B.jumpPose(t);return{...p,...hybridRetarget(nativeLabels(p.joints),p.sourcePosition)};}
const initialRoot=B.jumpPose(entry).rootDraw;const local=makeLocalProjection(position=>{const p=oldCoreAt(entry+(position-890)*1001/30000);return Object.fromEntries(Object.entries(p.joints).map(([k,v])=>[k,[v[0]+p.rootDraw-initialRoot,v[1]]]));});
function coreAt(t){const p=oldCoreAt(t);if(p.sourcePosition>=926)return p;const j=local(p.sourcePosition).joints;return{...p,joints:Object.fromEntries(Object.entries(j).map(([k,v])=>[k,[v[0]-(p.rootDraw-initialRoot),v[1]]]))};}
export function jumpPose(t=0,context=null){const p=B.jumpPose(t);let out=coreAt(t),j=out.joints;const c=context?.jumpContext,newEntry=c?.entrySupportRevision!==undefined;if(newEntry&&![ENTRY_SUPPORT_REVISION,WALK_ENTRY_REVISION,R51_ENTRY_REVISION].includes(c.entrySupportRevision))throw Error('Unknown jump entry revision');if(t<entry&&newEntry){const e=(c.entrySupportRevision===R51_ENTRY_REVISION?footSupportedEntry:c.entrySupportRevision===WALK_ENTRY_REVISION?walkSupportedEntry:frontSupportedEntry)(c.entrySnapshot,coreAt(entry).joints,t/entry);j=e.joints;out={...out,rootWorld:e.rootWorld,rootDraw:e.rootWorld*.41};}else{if(t<entry&&c?.entrySnapshot)j=supportRetarget(snapshotJoin(c.entrySnapshot,coreAt(entry).joints,t/entry),{support:true,strike:true},'ik').joints;else if(t>=coreEnd&&c?.exitSnapshot)j=supportRetarget(snapshotJoin(coreAt(coreEnd).joints,c.exitSnapshot,(t-coreEnd)/.30),{support:true,strike:true},'ik').joints;if(newEntry)out={...out,rootWorld:p.rootWorld+c.entryRootOffset,rootDraw:(p.rootWorld+c.entryRootOffset)*.41};}const correction=rootCorrection(t,c?.rootAdaptation);if(correction)out={...out,rootWorld:out.rootWorld-correction,rootDraw:(out.rootWorld-correction)*.41};return{...p,...out,joints:j,contact:p.contact,stage:p.stage+'-native-retarget',retargetLayer:'support IK plus local preparation root/planted-foot IK; original labels unchanged',nativeCanonical:true};}
export const jumpIdlePose=()=>jumpPose(0).joints;
function reactionJoin(snapshot,p,seconds){const target=nativeLabels(p.joints),j=seconds<=0?structuredClone(snapshot.joints):snapshotJoin(snapshot.joints,target,Math.min(1,seconds/.08));return{...p,joints:j,nativeCanonical:true};}
// R11: authored hurt transition only. Register a penetrating native foot fill
// against the floor using the same ankle and 26/25 IK chain used by drawing
// and incoming-strike geometry. Airborne reactions adjust only penetrating
// legs. Zero-airtime reactions use rigid root registration to avoid a straight
// knee branch singularity; their entire body moves only while a fill penetrates.
// Raw observations, labels, timing, horizontal root travel, power, cost and KO
// remain unchanged. The new registration is an explicit inferred layer.
export function jumpInterrupted(snapshot,seconds){if(snapshot.r16Plan)return{...B.jumpPose(snapshot.action.elapsed),...(snapshot.r17Push?planPushR18:planHurt)(snapshot.r16Plan,snapshot.r16Elapsed??seconds,snapshot.actualRootX??snapshot.r16Plan.initialRootX),nativeCanonical:true,stage:'r16-engine-recoil',style:snapshot.r16Plan.style};return boundaryHurt(snapshot,seconds);}
export function jumpKOPose(snapshot,seconds){return reactionJoin(snapshot,B.jumpKOPose(snapshot,seconds),seconds);}
export function jumpStateFor(f,time=0){if(jumpKick(f.action?.technique))return jumpPose(f.action.elapsed,f.action.contactLimit);if(jumpKick(f.interruptedStrike?.action?.technique))return jumpInterrupted({...f.interruptedStrike,...(f.interruptedStrike.r17Push?{r16Plan:{...f.interruptedStrike.r16Plan,terminalRootX:f.x}}:{}),actualRootX:f.x},Math.max(0,time-f.interruptedStrike.createdTime));return null;}
export function paintJump(c,s,{nativePainter}={}){if(!nativePainter)throw Error('R10 requires the native actor painter');nativePainter(c,s.joints);}
export const jumpFootPolygon=s=>nativeFoot(s.joints,'strike').map(([x,y])=>[x,-y]);
export function jumpContact(s,surfaces,gap,face=1,defFace=-1){const polygon=jumpFootPolygon(s).map(p=>[p[0]*face,p[1]]),receiver=surfaces.map(v=>v.kind==='ellipse'?{...v,center:[gap+v.center[0]*defFace,v.center[1]]}:{...v,points:v.points.map(p=>[gap+p[0]*defFace,p[1]])});return{reaches:receiver.some(v=>punchTouchesSurface(polygon,v)),polygon,receiver,target:'head',surface:'R10 actual native six-vertex foot fill; differs from R8',sourceIndex:s.sourceIndex,contactRecord:s.contact,geometryOnly:true};}
export function jumpPosture(action){const p=jumpPose(action.elapsed,action.contactLimit);return{kind:'jump',phase:action.phase,active:p.contact?.right===false&&p.contact?.left===false,evades:null,contact:p.contact,sourceIndex:p.sourceIndex,label:'未採用 native推定retarget・追加無敵なし'};}
export function jumpVisibleSurfaces(s,target,{nativePainter,appearance=null,alt=false}={}){if(s.style==='common')return acceptedJumpSurfaces(s.joints,target,{appearance,alt});if(nativePainter&&target!=='head'){const r=recorder();nativePainter(r.canvas.getContext('2d'),s.joints);const tags=target==='head'?['head']:target==='body'?['torso']:['rightLeg','leftLeg'];return r.ops().filter(o=>o.kind==='fill'&&tags.includes(o.part)).flatMap(o=>o.paths.map(points=>({kind:'polygon',points})));}if(target==='head'){const h=[s.joints.head[0],-s.joints.head[1]],ch=[s.joints.chest[0],-s.joints.chest[1]],a=Math.atan2(ch[0]-h[0],Math.abs(ch[1]-h[1]))*.25;return[{kind:'polygon',points:[[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]].map(([x,y])=>[h[0]+x*Math.cos(a)-y*Math.sin(a),h[1]+x*Math.sin(a)+y*Math.cos(a)])}];}throw Error('Native surface needs same painter callback');}
