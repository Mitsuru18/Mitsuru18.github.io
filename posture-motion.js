import {POSTURE_REFERENCE} from './posture-rig.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const p=(x,y)=>({x,y}),lerp=(a,b,t)=>p(mix(a.x,b.x,t),mix(a.y,b.y,t));
const base={hip:p(-2,-50),chest:p(-5,-80),head:p(-2,-94),rearFoot:p(-18,-3),frontFoot:p(17,-3),rearHand:p(3,-82),frontHand:p(17,-79),turn:0,bodyTurn:0,rearPivot:0,frontPivot:0,spinYaw:0,spinWeight:0,hookAngle:0,hookWeight:0,footPoint:0,footAngle:0};
const frames=POSTURE_REFERENCE.frames;
const xy=(frame,key)=>frame.points[key]?.xy;
const unit=(a,b,len)=>{const dx=-(b[0]-a[0]),dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;return p(dx/d*len,dy/d*len);};
/** Retarget observed torso lean, leg extension and landing absorption to the
 * existing character's proportions and planted fighting stance. Guard arms,
 * stance-width IK, extra hop height, phase timing and neutral return are game
 * adaptations, not measurements or a claim of a full source trace. */
function observedJump(index,{air=false,shallow=false}={}){
 const f=frames[index],hipRaw=xy(f,'pelvis'),chestRaw=xy(f,'chest'),headRaw=xy(f,'head');
 const ankle=xy(f,'leftAnkle'),hip=xy(f,'leftHip'),floorX=(633+547)/2;
 let hipY=Math.max(-49,-3-(ankle[1]-hip[1])*.18);if(shallow)hipY=Math.min(-44,hipY);else hipY=Math.min(-32,hipY);
 const hipX=clamp(-(hipRaw[0]-floorX)*.18,-7,5);
 const o={...base,hip:p(hipX,air?-72:hipY),rearFoot:p(air?-8:-18,air?-39:-3),frontFoot:p(17,air?-43:-3)};
 const spine=unit(hipRaw,chestRaw,30),neck=unit(chestRaw,headRaw,14);
 if(shallow){spine.x=mix(-3,spine.x,.45);spine.y=mix(-30,spine.y,.45);}
 o.chest=p(o.hip.x+spine.x,o.hip.y+spine.y);o.head=p(o.chest.x+neck.x,o.chest.y+neck.y);
 o.frontHand=p(o.head.x+15,o.head.y+5);o.rearHand=p(o.head.x+4,o.head.y+3);
 if(air){const heel=xy(f,'leftHeel'),toe=xy(f,'leftToe');o.footAngle=Math.atan2(toe[1]-heel[1],-(toe[0]-heel[0]));}
 return o;
}
const blend=(a,b,q)=>Object.fromEntries(Object.keys(base).map(k=>[k,typeof base[k]==='number'?mix(a[k],b[k],q):lerp(a[k],b[k],q)]));
const lifted=(pose,lift)=>Object.fromEntries(Object.entries(pose).map(([k,v])=>[k,typeof v==='number'?v:p(v.x,v.y-lift)]));
const jumpKeys=[{time:0,pose:base},{time:.03,pose:observedJump(0,{shallow:true})},{time:.045,pose:observedJump(1,{shallow:true})},{time:.055,pose:observedJump(2)},{time:.14,pose:observedJump(3,{air:true})},{time:.27,pose:lifted(observedJump(3,{air:true}),8)},{time:.40,pose:observedJump(3,{air:true})},{time:.52,pose:observedJump(4)},{time:.61,pose:observedJump(5)},{time:.82,pose:base}];

function observedCrouch(index){
 const f=frames[index],hipRaw=xy(f,'pelvis'),chestRaw=xy(f,'chest'),headRaw=xy(f,'head');
 const depth=clamp((hipRaw[1]-309)/(438-309)),hip=p(-2-5*depth,-50+22*depth),spine=unit(hipRaw,chestRaw,30),neck=unit(chestRaw,headRaw,14);
 const o={...base,hip,chest:p(hip.x+spine.x,hip.y+spine.y)};o.head=p(o.chest.x+neck.x,o.chest.y+neck.y);
 o.frontHand=p(o.head.x+13,o.head.y+4);o.rearHand=p(o.head.x+2,o.head.y+2);return o;
}
function observedJumpKick(index){
 const f=frames[index],hipRaw=xy(f,'pelvis'),chestRaw=xy(f,'chest'),headRaw=xy(f,'head'),spine=unit(hipRaw,chestRaw,30),neck=unit(chestRaw,headRaw,14);
 // Source right leg is the kicking leg. In the regular game rig this is the
 // front leg; the left leg drives first and receives the landing. Its foot
 // axes are occluded at pad contact, so the existing front-kick foot is used.
 const specs={12:[-3,-49,p(17,-3),p(16,-29)],13:[-3,-75,p(26,-40),p(25,-77)],14:[-2,-86,p(48,-94),p(12,-41)],15:[-4,-50,p(43,-50),p(-18,-3)],16:[-5,-48,p(18,-12),p(-18,-3)],17:[-2,-50,p(17,-3),p(-18,-3)]};
 const [x,y,frontFoot,rearFoot]=specs[index],o={...base,hip:p(x,y),frontFoot,rearFoot};o.chest=p(x+spine.x,y+spine.y);o.head=p(o.chest.x+neck.x,o.chest.y+neck.y);
 o.frontHand=p(o.head.x+13,o.head.y+5);o.rearHand=p(o.head.x+2,o.head.y+2);o.footAngle=index===14||index===15?-1.15:index===13?.7:0;return o;
}
const low=observedCrouch(8),mid=observedCrouch(7);
const crouchKeys=[{time:0,pose:base},{time:.06,pose:observedCrouch(6)},{time:.12,pose:mid},{time:.18,pose:low},{time:.46,pose:low},{time:.55,pose:observedCrouch(9)},{time:.64,pose:observedCrouch(10)},{time:.71,pose:base}];
const lowPunch={...low,hip:p(-8,-28),chest:p(0,-55),head:p(5,-68),frontHand:p(37,-60),rearHand:p(7,-66)};
const crouchPunchKeys=[{time:0,pose:base},{time:.10,pose:mid},{time:.18,pose:low},{time:.25,pose:lowPunch},{time:.37,pose:{...lowPunch,frontHand:p(36,-59)}},{time:.49,pose:low},{time:.60,pose:observedCrouch(9)},{time:.73,pose:base}];
const lowKickChamber={...low,frontFoot:p(11,-28),footAngle:.7},lowKick={...low,hip:p(-15,-29),chest:p(low.chest.x-8,low.chest.y),head:p(low.head.x-8,low.head.y),frontHand:p(low.frontHand.x-8,low.frontHand.y),rearHand:p(low.rearHand.x-8,low.rearHand.y),frontFoot:p(37,-27),footAngle:.2};
const crouchKickKeys=[{time:0,pose:base},{time:.12,pose:mid},{time:.22,pose:lowKickChamber},{time:.30,pose:lowKick},{time:.42,pose:lowKick},{time:.55,pose:lowKickChamber},{time:.68,pose:observedCrouch(9)},{time:.85,pose:base}];
const jumpKickKeys=[{time:0,pose:base},{time:.12,pose:observedJumpKick(12)},{time:.25,pose:observedJumpKick(13)},{time:.40,pose:observedJumpKick(14)},{time:.46,pose:lifted(observedJumpKick(14),2)},{time:.52,pose:lifted(observedJumpKick(14),-2)},{time:.68,pose:observedJumpKick(15)},{time:.84,pose:observedJumpKick(16)},{time:.98,pose:observedJumpKick(17)},{time:1.08,pose:base}];
const clips={jump:{keys:jumpKeys,total:.82,returnStart:.61},crouch:{keys:crouchKeys,total:.71,returnStart:.64},crouchpunch:{keys:crouchPunchKeys,total:.73,returnStart:.60},crouchlowkick:{keys:crouchKickKeys,total:.85,returnStart:.68},jumpkick:{keys:jumpKickKeys,total:1.08,returnStart:.98}};

// Shape-preserving cubic Hermite interpolation: continuous velocity through
// takeoff/apex/landing, without sliding planted feet or overshooting the floor.
function curve(keys,time,get){
 let i=0;while(i<keys.length-2&&time>keys[i+1].time)i++;
 const slope=n=>{
  if(n===0||n===keys.length-1)return 0;
  const h0=keys[n].time-keys[n-1].time,h1=keys[n+1].time-keys[n].time,d0=(get(keys[n].pose)-get(keys[n-1].pose))/h0,d1=(get(keys[n+1].pose)-get(keys[n].pose))/h1;
  if(d0*d1<=0)return 0;const w0=2*h1+h0,w1=h1+2*h0;return (w0+w1)/(w0/d0+w1/d1);
 };
 const a=keys[i],b=keys[i+1],h=b.time-a.time,q=clamp((time-a.time)/h),q2=q*q,q3=q2*q;
 if(get(a.pose)===get(b.pose)&&slope(i)===0&&slope(i+1)===0)return get(a.pose);
 return (2*q3-3*q2+1)*get(a.pose)+(q3-2*q2+q)*h*slope(i)+(-2*q3+3*q2)*get(b.pose)+(q3-q2)*h*slope(i+1);
}
export function newPosturePose(id,elapsed,idle=base){
 const clip=Object.hasOwn(clips,id)?clips[id]:null;if(!clip)return null;const {keys,total,returnStart}=clip;
 const time=clamp(Number(elapsed)||0,0,total),result=Object.fromEntries(Object.keys(base).map(k=>[k,typeof base[k]==='number'?curve(keys,time,o=>o[k]):p(curve(keys,time,o=>o[k].x),curve(keys,time,o=>o[k].y))]));
 const idleWeight=time<.04?1-smooth(time/.04):time>returnStart?smooth((time-returnStart)/(total-returnStart)):0;
 if(idleWeight)for(const key of Object.keys(base)){const delta=typeof base[key]==='number'?idle[key]-base[key]:p(idle[key].x-base[key].x,idle[key].y-base[key].y);result[key]=typeof base[key]==='number'?result[key]+delta*idleWeight:p(result[key].x+delta.x*idleWeight,result[key].y+delta.y*idleWeight);}
 return result;
}
export const POSTURE_ADAPTATION={jump:{sourceFrameIndices:[0,1,2,3,4,5],authored:['existing guard arms','fighting-stance foot spacing, shallow quick preparation and fixed-length leg IK','airborne knee tuck and modest body lift for low-kick clearance','game phase retiming and interpolation','return from absorption to original idle'],active:[.14,.40],landed:.52,total:.82},crouch:{sourceFrameIndices:[6,7,8,9,10,11],authored:['fighting stance and guard arms','fixed-length character IK','active hold and game retiming','idle endpoint reuse'],active:[.18,.46],total:.71},jumpkick:{sourceFrameIndices:[12,13,14,15,16,17],contactSourceFrame:14,authored:['fighting guard arms','character proportions and fixed-length IK','head-target height and airborne clearance adaptation','occluded contact foot uses existing front-kick foot','game retiming and idle return'],active:[.40,.52],landed:.68,total:1.08},crouchpunch:{sourceFrameIndices:[6,7,8,9,10,11],authored:['observed crouch combined with existing body punch; not a measured combined performance'],active:[.25,.37],total:.73},crouchlowkick:{sourceFrameIndices:[6,7,8,9,10,11],authored:['observed crouch combined with existing low kick; not a measured combined performance'],active:[.30,.42],total:.85}};
/** Conservative local target envelopes from the very same posed anatomy.
 * They are evaluated only for the newly introduced postures, never to change
 * accepted standing-versus-standing reach. Head/leg evasion is resolved first. */
export function postureBounds(action){
 const o=newPosturePose(action?.technique,action?.elapsed);if(!o)return null;
 return {head:{minY:o.head.y-8,maxY:o.head.y+8,x:o.head.x},body:{minY:Math.min(o.chest.y-3,o.hip.y-3),maxY:o.hip.y+5,chest:o.chest,hip:o.hip},leg:{minY:o.hip.y-5,maxY:Math.max(o.frontFoot.y+10,o.rearFoot.y+4),x:o.frontFoot.x}};
}
const CONTACTS={jab:[-80,3,6],cross:[-86,3,0],hook:[-85.6,3,0],frontkick:[-54,8,6],roundkick:[-66,4,6],sidekick:[-57,8,6],knee:[-54.3,5,0],highkick:[-92,5,0],lowkick:[-27,4,0],spinkick:[-80,4,0],jumpkick:[-94,5,0],crouchpunch:[-60,3,6],crouchlowkick:[-27,4,0]};
export function postureContactFor(tech,receiverAction){
 const bounds=postureBounds(receiverAction),spec=CONTACTS[tech?.id],region=bounds?.[tech?.target];if(!region||!spec)return null;
 const [height,radius,allowance]=spec;
 const lowBody=['crouch','crouchpunch','crouchlowkick'].includes(receiverAction.technique)&&tech.target==='body'&&['frontkick','sidekick','roundkick','crouchpunch'].includes(tech.id);
 const preferred=lowBody?height+Math.min(6,allowance):height,wanted=clamp(preferred,region.minY-radius,region.maxY+radius)-height;
 const reaches=Math.abs(wanted)<=allowance+1e-8,aimY=reaches?wanted:0,y=clamp(height+aimY,region.minY,region.maxY);
 const x=tech.target==='body'?mix(region.chest.x,region.hip.x,clamp((y-region.chest.y)/(region.hip.y-region.chest.y||1))):region.x;
 return {reaches,aimY,contactY:height+aimY,receiverTarget:{x,y},receiverPosture:receiverAction.technique,whiffWeight:smooth(Math.max(0,Math.abs(wanted)-allowance)/18)};
}
