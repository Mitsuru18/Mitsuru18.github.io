import{worldDemo}from'./world-demo.js';
import {integratedStudy as approvedStudy} from './integrated-study.js';
/** A deterministic, replayable illustration, independent of the saved fight. */
import {postureContactFor} from './posture-motion.js';
import {TECHNIQUES,currentTechnique,defenseOutcome,isReactive} from './engine.js';
const INDEX=Object.assign(Object.create(null),Object.fromEntries(TECHNIQUES.map(t=>[t.id,t])));
export const DEMO_DURATION=3.6;
function actionAt(f,tech,time,start){
 const elapsed=time-start,active=tech.active??.12,total=tech.windup+active+tech.recovery;
 if(elapsed<0||elapsed>=total)return;
 const phase=elapsed<tech.windup?'windup':elapsed<tech.windup+active?'active':'recovery';
 const phaseProgress=phase==='windup'?elapsed/tech.windup:phase==='active'?(elapsed-tech.windup)/active:(elapsed-tech.windup-active)/tech.recovery;
 f.action={technique:tech.id,phase,phaseProgress,elapsed,startedTick:Math.round(start*60)};
 f.lastAction={...f.action,type:tech.type,name:tech.name,phaseStartedTick:Math.round((phase==='windup'?start:phase==='active'?start+tech.windup:start+tech.windup+active)*60),expiresTick:Math.ceil((start+total)*60)};
 f.pose=phase==='active'?(isReactive(tech)?tech.id:tech.type):'idle';
}
export function createSkillDemoFrame(id,seconds=0,{guardTarget}={}){
 const world=worldDemo(id,Math.max(0,Number(seconds)||0)%DEMO_DURATION);if(world)return world;
 const tech=(typeof id==='string'&&INDEX[id])||INDEX.jab,time=Math.max(0,Number(seconds)||0)%DEMO_DURATION,tick=Math.floor(time*60),defense=isReactive(tech);
 const gap=defense?(id==='jump'?80:90):tech.range;
 const fighters=[{name:'あなた',x:400-gap/2,facing:1,pose:'idle',action:null,lastAction:null},{name:'稽古相手',x:400+gap/2,facing:-1,pose:'idle',action:null,lastAction:null}];
 const region=tech.id==='midguard'?'body':tech.id==='lowguard'?'leg':['head','body','leg'].includes(guardTarget)?guardTarget:tech.id==='jump'?'leg':'head';
 const guardAttack=region==='body'?(id==='jump'?'jab':'frontkick'):region==='leg'?'lowkick':'cross';
 const start=.65,attacker=defense?1:0,receiver=1-attacker,attack=defense?INDEX[id==='sway'?'cross':guardAttack]:tech,impact=defense?start+tech.windup+.14:start+tech.windup;
 actionAt(fighters[0],tech,time,start);
 if(defense)actionAt(fighters[1],attack,time,impact-attack.windup);
 const study=approvedStudy(id,time);if(study)return{fighters,events:[],tick,time,done:false,demo:true,skill:tech.id,target:tech.target,phase:study.phase,approvedStudy:study};
 const events=[];
 if(time>=impact&&time-impact<.75){
  // Resolve once at the impact pose, never against the later recovery pose.
  // Replaying a demo frame must not move or resurrect an old damage event.
  const impactReceiver={action:null};if(defense)actionAt(impactReceiver,tech,impact,start);
  let outcome=impactReceiver.action?.phase==='active'?defenseOutcome(attack,id):'hit';
  const poseContact=postureContactFor(attack,impactReceiver.action);if(outcome==='hit'&&poseContact&&!poseContact.reaches)outcome='miss';
  events.push({type:outcome,technique:attack.id,target:attack.target,defenseTechnique:outcome==='hit'?null:id,attacker,receiver,fighter:receiver,attackerX:fighters[attacker].x,receiverX:fighters[receiver].x,facing:fighters[attacker].facing,distance:gap,...(poseContact||{}),...(outcome==='miss'?{reason:'height'}:{}),damage:outcome==='block'?Math.max(1,Math.round(attack.power*.28)):['dodge','miss'].includes(outcome)?0:attack.power,tick:Math.floor(impact*60)});
  if(outcome==='hit'&&time-impact<.22)fighters[receiver].pose='hit';
 }
 const label=currentTechnique(fighters[0],tick);
 return {fighters,events,tick,time,done:false,demo:true,skill:tech.id,target:attack.target,phase:label?.phase??(time<start?'ready':'finished')};
}
