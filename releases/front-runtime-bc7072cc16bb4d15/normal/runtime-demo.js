import {createSkillDemoFrame as create,DEMO_DURATION} from './demo.js';
import {stampBattleRuntime} from './battle-runtime-contract.js';
import {createBattle,stepBattle,startSweepFixture} from './engine.js';
export {DEMO_DURATION};
export const skillDemoDuration=id=>id==='forwardjumpkick'?4.6:DEMO_DURATION;
let forwardFrames=null;
function forwardDemo(seconds){if(!forwardFrames){const b=createBattle({seed:17,player:{hp:10000,maxHp:10000,speed:2,techniques:['forwardjumpkick']},opponent:{hp:10000,maxHp:10000,speed:2,techniques:['jab']}}),[a,d]=b.fighters;a.x=290;d.x=480;a.facing=1;d.facing=-1;for(const f of b.fighters){f.prototypeHold=true;f.cooldown=f.defenseCooldown=100;}forwardFrames=[];for(let n=0;n<Math.ceil(skillDemoDuration('forwardjumpkick')*60);n++){if(n===24&&!startSweepFixture(b,0,'forwardjumpkick'))throw Error('Forward demo requires valid native entry');if(n>0)stepBattle(b,1/60);forwardFrames.push(structuredClone({...b,demo:true,skill:'forwardjumpkick',target:'head',phase:n<24?'ready':a.action?.phase??'finished'}));}}return structuredClone(forwardFrames[Math.min(forwardFrames.length-1,Math.floor((Math.max(0,Number(seconds)||0)%skillDemoDuration('forwardjumpkick'))*60))]);}

let sweepFrames=null,dutchFrames=null;
// New illustrations only; saved battles never enter this factory.
function sweepDemo(seconds,id='crouchlowkick'){
 if(id==='dutchlow'){const old=sweepFrames;sweepFrames=dutchFrames;const out=sweepDemoBuild(seconds,id);dutchFrames=sweepFrames;sweepFrames=old;return out;}return sweepDemoBuild(seconds,id);
}
function sweepDemoBuild(seconds,id){
 if(!sweepFrames){
  const b=createBattle({seed:17,player:{hp:10000,maxHp:10000,speed:1,techniques:[id]},opponent:{hp:10000,maxHp:10000,techniques:['sidekick']}}),[a,d]=b.fighters;
  a.x=300;d.x=id==='dutchlow'?395:378;a.facing=1;d.facing=-1;
  for(const f of b.fighters){f.prototypeHold=true;f.cooldown=f.defenseCooldown=100;}
  sweepFrames=[];
  for(let n=0;n<Math.ceil(DEMO_DURATION*60);n++){
   if(n===39&&!startSweepFixture(b,0,id))throw Error('Sweep demonstration requires a legal native start');
   if(n>0)stepBattle(b);
   sweepFrames.push(structuredClone({...b,demo:true,skill:id,target:'leg',phase:n<39?'ready':a.action?.phase??'finished'}));
  }
 }
 return structuredClone(sweepFrames[Math.min(sweepFrames.length-1,Math.floor((Math.max(0,Number(seconds)||0)%DEMO_DURATION)*60))]);
}
let frontkickFrames=null;
// Recorded from a real battle: the frontkick now has a single in-place
// motion at any range, so its demo must come from the engine, not the
// synthetic illustration (which still knew the removed step-in motion).
function frontkickDemo(seconds){
 if(!frontkickFrames){
  const b=createBattle({seed:17,player:{hp:10000,maxHp:10000,speed:1,techniques:['frontkick']},opponent:{hp:10000,maxHp:10000,techniques:['jab']}}),[a,d]=b.fighters;
  a.x=340;d.x=410;a.facing=1;d.facing=-1;
  for(const f of b.fighters){f.prototypeHold=true;f.cooldown=f.defenseCooldown=100;}
  frontkickFrames=[];
  for(let n=0;n<Math.ceil(DEMO_DURATION*60);n++){
   if(n===39&&!startSweepFixture(b,0,'frontkick'))throw Error('Frontkick demonstration requires a legal native start');
   if(n>0)stepBattle(b,1/60);
   frontkickFrames.push(structuredClone({...b,demo:true,skill:'frontkick',target:'body',phase:n<39?'ready':a.action?.phase??'finished'}));
  }
 }
 return structuredClone(frontkickFrames[Math.min(frontkickFrames.length-1,Math.floor((Math.max(0,Number(seconds)||0)%DEMO_DURATION)*60))]);
}
export function createSkillDemoFrame(id,seconds=0,options){
 const b=id==='forwardjumpkick'?forwardDemo(seconds):['crouchlowkick','dutchlow'].includes(id)?sweepDemo(seconds,id):id==='frontkick'?frontkickDemo(seconds):create(id,seconds,options);
 // Legacy pure illustrations are newly created views, not imported or resumed saves.
 // The pure vertical illustration must declare its real selected skill before the strict current reader runs.
 if(id==='jumpkick'&&b.demo===true)for(const [index,f]of b.fighters.entries())if(!Array.isArray(f.techniques))f.techniques=index===0?['jumpkick']:[];
 if(b.sweepEnabled!==true){b.sweepEnabled=true;b.sweepRuntimeRevision='sweep-fixed3d-r49-v1';for(const f of b.fighters)f.sweepEnabled=true;}
 return stampBattleRuntime(b,'normal');
}
