// Axe-only, current-state geometry plan. Not a future-AI/safety oracle.
// Reads actual painter contours at three fixed active source times. No RNG,
// actor mutations, extra root writes, widened shapes, or simulated opponent.
import{axePlanningSurfaces}from'./contour-contact.js';
import{intersectionWitness}from'./path-geometry.js';
import{AXE_TIMING}from'./runtime.js';
import{motionRate,movementRate,predictObservedWalk,STRATEGIES,STAMINA_RULES,TECHNIQUES}from'./../engine.js';
const cache=new WeakMap(),SCALE=.41;
// Same world-unit arrival width as existing ordinary walk steering.
const ARRIVAL=7;
const bounds=ps=>{const p=ps.flat();return[Math.min(...p.map(q=>q[0])),Math.min(...p.map(q=>q[1])),Math.max(...p.map(q=>q[0])),Math.max(...p.map(q=>q[1]))]};
export function axeLaunchPlan(b,f){
 const index=b.fighters.indexOf(f),enemy=b.fighters[1-index];
 if(index<0||!enemy||f.action||f.hp<=0||enemy.hp<=0||b.done)return{supported:false,ready:false,reason:'not a live available actor'};
 const key=JSON.stringify([b.time,b.tick,b.done,b.spaceVelocity,b.events,f,enemy]),previous=cache.get(f);if(previous?.key===key)return previous.result;
 const gap=Math.abs(enemy.x-f.x),face=f.facing??1,rows=[];let unsupported=null;
 const planned=TECHNIQUES.find(t=>t.id===enemy.plan),vx=b.spaceVelocity?.[1-index]||0,closing=-face*vx,walkEligible=enemy.pose==='walk'&&!enemy.action&&!enemy.backstep&&!enemy.interruptedStrike&&!enemy.recoil&&!enemy.curriculum&&!enemy.openingSpacing&&planned?.id==='cross'&&['balanced','outside'].includes(enemy.strategy)&&planned.cost+STAMINA_RULES.attackReserve<=enemy.stamina&&closing>0&&closing<=90*movementRate(enemy)+1e-7;
 const walkTarget=walkEligible?Math.max(40,Math.min(STRATEGIES[enemy.strategy].distance,planned.range-enemy.approachMargin)):null,attackSpacing=walkEligible?planned.range-enemy.attackMargin:null;
 if(face*(enemy.x-f.x)<=0)return{supported:false,ready:false,reason:'actor faces away from opponent'};
 for(const q of[.5,0,1-1e-9]){
  const elapsed=AXE_TIMING.windup+AXE_TIMING.active*q,seconds=(elapsed+Math.max(0,f.cooldown||0))/motionRate(f),att={...f,axePrototype:true,axeDisplay:null,axeFinish:null,action:{technique:'axekick',elapsed,phase:'active',facing:face}};
  let target=enemy,queryTime=b.time,advance=0,walkProof=null;
  if(walkEligible){const projectedGap=gap-closing*seconds,stop=walkTarget+ARRIVAL,step=closing/(60*Math.max(1,Math.min(128,Math.ceil(Math.max(...b.fighters.map(motionRate))/1.1))));target={...enemy,x:f.x+face*Math.max(stop,projectedGap)};predictObservedWalk(enemy,target,seconds);queryTime+=seconds;advance=closing*seconds;walkProof={observedVx:vx,knownPlan:enemy.plan,seconds,ordinaryTarget:walkTarget,stopBand:[stop-step,stop],attackSpacing,projectedGap,continuesBeforeStrikeEligibility:projectedGap>attackSpacing+step,assumption:'only current observed walk and cross plan; no later choice or RNG'};}
  const view={...b,time:queryTime,fighters:b.fighters.map((a,i)=>i===index?att:target)},g=axePlanningSurfaces(att,target,queryTime,view);
  if(!g.supported){unsupported=g.reason;continue;}
  if(Math.abs(g.attShownRoot-f.x)>1e-8||Math.abs(g.defShownRoot-target.x)>1e-8){unsupported='shown/physical root transition not planned';continue;}
  if(!g.foot.length||!g.face.length)continue;
  const F=bounds(g.foot),H=bounds(g.face),shift=(F[0]+F[2]-H[0]-H[2])/2,impactGap=Math.abs(target.x-f.x),desired=impactGap+face*shift/SCALE+advance,moved=g.face.map(p=>p.map(v=>[v[0]+shift,v[1]]));
  // A bounding rectangle alone cannot approve a launch or desired distance.
  if(desired<=0||!intersectionWitness(g.foot,moved))continue;
  const limits=[impactGap+face*(F[0]-H[2])/SCALE+advance,impactGap+face*(F[2]-H[0])/SCALE+advance].sort((a,b)=>a-b);
  rows.push({q,elapsed,sourceElapsed:g.sourceElapsed,receiverKind:g.receiverKind,desired,approachDesired:desired-advance,min:Math.max(0,limits[0]),max:limits[1],currentIntersects:(!walkProof||walkProof.continuesBeforeStrikeEligibility)&&!!intersectionWitness(g.foot,g.face),walkProof});
 }
 const result=rows.length?{supported:true,ready:Math.abs(gap-rows[0].desired)<=ARRIVAL&&rows[0].currentIntersects,desired:rows[0].desired,approachDesired:rows[0].approachDesired,observedClosingWalk:walkEligible,min:Math.min(...rows.map(r=>r.min)),max:Math.max(...rows.map(r=>r.max)),gap,rows,reason:walkEligible?'known ongoing cross walk projected before its possible strike; later choices may invalidate':'current receiver and exact three-source-time surfaces; future movement may miss'}:{supported:false,ready:false,reason:unsupported||'no current anatomical face intersection at fixed active samples'};
 cache.set(f,{key,result});return result;
}
