/** View-only fatigue. No fighter, combat, AI or save fields are written. */
export const FATIGUE_MOTION=Object.freeze({period:.9,entrySeconds:.3,settleSeconds:.3,shoulderTravel:3.2,headTravel:2.4});
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export function fatigueEligible(f,battle,staminaResting){
 return !!f&&!battle?.done&&f.hp>0&&!f.action&&!f.interruptedStrike&&['idle','walk'].includes(f.pose)&&!!staminaResting;
}
/** Each rendered fighter owns a private envelope, not a serialized state field.
 * Remaining recovery time tapers the last breath before attacks become affordable.
 * This also makes the first attack after recovery meet the unchanged stance. */
export function createFatigueSampler(){
 const tracks=new WeakMap();
 return (f,time,eligible,remainingSeconds,readOnly=false)=>{
  if(!f||!Number.isFinite(time))return 0;
  let s=tracks.get(f);
  if(!eligible){if(!readOnly)tracks.delete(f);return 0}
  if(!s||time<s.last){s={start:time,last:time};if(!readOnly)tracks.set(f,s)}
  if(!readOnly)s.last=time;
  const age=Math.max(0,time-s.start),entry=ease(age/FATIGUE_MOTION.entrySeconds),exit=ease(remainingSeconds/FATIGUE_MOTION.settleSeconds);
  return entry*exit*(.5-.5*Math.cos(age*2*Math.PI/FATIGUE_MOTION.period));
 };
}
export function fatigueLegacyPose(p,weight){
 if(!(weight>0))return p;
 const o={...p};
 for(const key of ['chest','frontHand','rearHand'])o[key]={...p[key],y:p[key].y-FATIGUE_MOTION.shoulderTravel*weight};
 o.head={...p.head,y:p.head.y-FATIGUE_MOTION.headTravel*weight};
 return o;
}
export function fatigueApprovedPose(j,weight){
 if(!(weight>0))return j;
 const out={...j};
 for(const key of ['chest','near_shoulder','near_elbow','near_wrist','near_hand','far_shoulder','far_elbow','far_wrist','far_hand'])out[key]=[j[key][0],j[key][1]+FATIGUE_MOTION.shoulderTravel*weight];
 out.head=[j.head[0],j.head[1]+FATIGUE_MOTION.headTravel*weight];
 return out;
}
