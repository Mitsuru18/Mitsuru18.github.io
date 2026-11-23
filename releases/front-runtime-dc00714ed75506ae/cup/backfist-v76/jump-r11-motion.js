// UNADOPTED R10 native display/geometry adapter. Raw101 and base motion untouched.
import * as B from'./jump-base-motion.js';import{nativeLabels,nativeFoot,hybridRetarget,sourceContact,supportRetarget,footBottom}from'./native-retarget.js';import{snapshotJoin}from'./snapshot-join.js';import{punchTouchesSurface}from'./body-uppercut-contact.js';import{recorder}from'./native-recorder.js';
export const jumpKick=B.jumpKick,JUMP_TIMING=B.JUMP_TIMING,JUMP_GAME_RULES=B.JUMP_GAME_RULES;
const entry=.22,coreEnd=.22+101101/30000,total=coreEnd+.30;
function coreAt(t){const p=B.jumpPose(t);return{...p,...hybridRetarget(nativeLabels(p.joints),p.sourcePosition)};}
export function jumpPose(t=0,context=null){const p=B.jumpPose(t);let out=coreAt(t),j=out.joints;const c=context?.jumpContext;if(t<entry&&c?.entrySnapshot)j=supportRetarget(snapshotJoin(c.entrySnapshot,coreAt(entry).joints,t/entry),{support:true,strike:true},'ik').joints;else if(t>=coreEnd&&c?.exitSnapshot)j=supportRetarget(snapshotJoin(coreAt(coreEnd).joints,c.exitSnapshot,(t-coreEnd)/.30),{support:true,strike:true},'ik').joints;return{...p,...out,joints:j,contact:p.contact,stage:p.stage+'-native-retarget',retargetLayer:'support IK plus local preparation root/planted-foot IK; original labels unchanged',nativeCanonical:true};}
export const jumpIdlePose=()=>jumpPose(0).joints;
function reactionJoin(snapshot,p,seconds){const target=nativeLabels(p.joints),j=seconds<=0?structuredClone(snapshot.joints):snapshotJoin(snapshot.joints,target,Math.min(1,seconds/.08));return{...p,joints:j,nativeCanonical:true};}
// R11: authored hurt transition only. Register a penetrating native foot fill
// against the floor using the same ankle and 26/25 IK chain used by drawing
// and incoming-strike geometry. Airborne reactions adjust only penetrating
// legs. Zero-airtime reactions use rigid root registration to avoid a straight
// knee branch singularity; their entire body moves only while a fill penetrates.
// Raw observations, labels, timing, horizontal root travel, power, cost and KO
// remain unchanged. The new registration is an explicit inferred layer.
export function jumpInterrupted(snapshot,seconds){
 const p=reactionJoin(snapshot,B.jumpInterrupted(snapshot,seconds),seconds);
 const contact=Object.fromEntries(['support','strike'].map(s=>[s,footBottom(p.joints,s)>1e-12]));
 const mode=p.duration<=.200000001?'root':'ik';
 const r=supportRetarget(p.joints,contact,mode);
 return {...p,joints:r.joints,reactionClearance:{inferred:true,method:mode==='root'?'grounded reaction only: rigid root floor registration':'airborne reaction landing: ankle plus fixed-length IK',events:r.events,residual:r.maxFootFillPenetration,maxJointDelta:r.maxBaseRetargetJointDelta}};
}
export function jumpKOPose(snapshot,seconds){return reactionJoin(snapshot,B.jumpKOPose(snapshot,seconds),seconds);}
export function jumpStateFor(f,time=0){if(jumpKick(f.action?.technique))return jumpPose(f.action.elapsed,f.action.contactLimit);if(jumpKick(f.interruptedStrike?.action?.technique))return jumpInterrupted(f.interruptedStrike,Math.max(0,time-f.interruptedStrike.createdTime));return null;}
export function paintJump(c,s,{nativePainter}={}){if(!nativePainter)throw Error('R10 requires the native actor painter');nativePainter(c,s.joints);}
export const jumpFootPolygon=s=>nativeFoot(s.joints,'strike').map(([x,y])=>[x,-y]);
export function jumpContact(s,surfaces,gap,face=1,defFace=-1){const polygon=jumpFootPolygon(s).map(p=>[p[0]*face,p[1]]),receiver=surfaces.map(v=>v.kind==='ellipse'?{...v,center:[gap+v.center[0]*defFace,v.center[1]]}:{...v,points:v.points.map(p=>[gap+p[0]*defFace,p[1]])});return{reaches:receiver.some(v=>punchTouchesSurface(polygon,v)),polygon,receiver,target:'head',surface:'R10 actual native six-vertex foot fill; differs from R8',sourceIndex:s.sourceIndex,contactRecord:s.contact,geometryOnly:true};}
export function jumpPosture(action){const p=jumpPose(action.elapsed,action.contactLimit);return{kind:'jump',phase:action.phase,active:p.contact?.right===false&&p.contact?.left===false,evades:null,contact:p.contact,sourceIndex:p.sourceIndex,label:'未採用 native推定retarget・追加無敵なし'};}
export function jumpVisibleSurfaces(s,target,{nativePainter}={}){if(nativePainter&&target!=='head'){const r=recorder();nativePainter(r.canvas.getContext('2d'),s.joints);const tags=target==='head'?['head']:target==='body'?['torso']:['rightLeg','leftLeg'];return r.ops().filter(o=>o.kind==='fill'&&tags.includes(o.part)).flatMap(o=>o.paths.map(points=>({kind:'polygon',points})));}if(target==='head'){const h=[s.joints.head[0],-s.joints.head[1]],ch=[s.joints.chest[0],-s.joints.chest[1]],a=Math.atan2(ch[0]-h[0],Math.abs(ch[1]-h[1]))*.25;return[{kind:'polygon',points:[[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]].map(([x,y])=>[h[0]+x*Math.cos(a)-y*Math.sin(a),h[1]+x*Math.sin(a)+y*Math.cos(a)])}];}throw Error('Native surface needs same painter callback');}
