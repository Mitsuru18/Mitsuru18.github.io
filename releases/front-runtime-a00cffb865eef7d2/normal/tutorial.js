// Tutorial for new journeys only (WFJ tutorial rebuild, 2026-11-22).
// State lives in the main save's `tutorial` field; activation happens only in
// the mobile app's 'start' action. Invalid shapes normalize to null so a
// broken tutorial never traps the player: normal play resumes instead.
import {abilityStats,pointTotal,validPoints} from './attributes.js';
import {opponentAppearance} from './appearance.js';

export const TUTORIAL_FIGHT2_ID='jp-tutorial-2';
export const TUTORIAL_RIVAL_ID='jp-tutorial-3';
export const TUTORIAL_STEPS=Object.freeze(['intro','fight1','fight2','allocate','fight3','style','rematch','skill','training','done']);

export const freshTutorial=()=>({rule:1,step:'intro',bonusGranted:false,allocateBase:null,rivalFreeze:null,skillVisitedEquip:false});

const validFreeze=f=>f===null||(typeof f==='object'&&validPoints(f.points)&&pointTotal(f.points)>=3);
export function normalizeTutorial(t){
 if(t===null||t===undefined)return null;
 if(typeof t!=='object'||t.rule!==1||!TUTORIAL_STEPS.includes(t.step)||typeof t.bonusGranted!=='boolean'||typeof t.skillVisitedEquip!=='boolean')return null;
 if(!(t.allocateBase===null||Number.isSafeInteger(t.allocateBase)&&t.allocateBase>=0))return null;
 if(!validFreeze(t.rivalFreeze))return null;
 return {rule:1,step:t.step,bonusGranted:t.bonusGranted,allocateBase:t.allocateBase,rivalFreeze:t.rivalFreeze?{points:{...t.rivalFreeze.points}}:null,skillVisitedEquip:t.skillVisitedEquip};
}
export const tutorialActive=s=>{const t=s?.tutorial;return !!t&&typeof t==='object'&&t.rule===1&&TUTORIAL_STEPS.includes(t.step)&&t.step!=='done';};

// --- Dedicated tutorial opponents -------------------------------------------
// Fight 1 reuses the course opener jp-dojo-0 (guaranteed by its own design
// and proof test). Fights 2 and 3 use dedicated opponents so the normal
// course numbers stay untouched.
export const FIGHT2_POINTS=Object.freeze({power:0,speed:1,stamina:1});
// Rival strength follows the player's own build: total = player total +
// RIVAL_BONUS, stamina-leaning split. The rival's stats alone do not decide
// the tutorial outcomes: every tutorial match is a fixed race (see the
// "Fixed tutorial outcomes" section below), so the frozen rival only shapes
// how the decided fight looks.
export const RIVAL_BONUS=1;
export const RIVAL_STAMINA_SHARE=.5;
export const RIVAL_SPEED_SHARE=.25;

export function rivalPointsFor(spent){
 const total=pointTotal(spent);if(total===null)return null;
 const target=total+RIVAL_BONUS;
 let stamina=Math.max(1,Math.round(target*RIVAL_STAMINA_SHARE));
 let speed=Math.max(1,Math.round(target*RIVAL_SPEED_SHARE));
 let power=target-stamina-speed;
 if(power<1){stamina-=1-power;power=1;}
 return {power,speed,stamina};
}
export function rivalFreezeFor(spent){const points=rivalPointsFor(spent);return points?{points}:null;}

const typeLabel=points=>{const top=Math.max(points.power,points.speed,points.stamina);return points.stamina===top?'持久型':points.power===top?'強打型':'速攻型';};
function buildOpponent({id,name,place,points,strategy,techniques,abilityType,tacticalHint,index,rewardMoves}){
 const a=abilityStats(points);
 return {appearance:opponentAppearance(id),abilityType:abilityType??typeLabel(points),abilityPoints:{...points},id,name,place,tier:index,index,rank:0,rankName:'入門',role:'tutorial',venueKind:'dojo',practice:false,rewardMove:rewardMoves[0]??null,rewardMoves:[...rewardMoves],hp:a.maxHp,maxHp:a.maxHp,power:a.power,defense:1,speed:a.speed,maxStamina:a.maxStamina,initialStamina:a.maxStamina,openingLesson:false,strategy,techniques:[...techniques],reward:rewardMoves.length?35:20,...(tacticalHint?{tacticalHint}:{})};
}
export const fight2Opponent=()=>buildOpponent({id:TUTORIAL_FIGHT2_ID,name:'篠原 駿',place:'京都・下町道場',points:FIGHT2_POINTS,strategy:'counter',techniques:['jab'],index:1,rewardMoves:[]});
export const rivalOpponent=freeze=>buildOpponent({id:TUTORIAL_RIVAL_ID,name:'岩倉 剛志',place:'京都・守りの道場',points:freeze.points,strategy:'outside',techniques:['jab','frontkick','guard'],index:2,rewardMoves:['cross'],tacticalHint:'守りを固めて粘る相手。間合いを詰めて攻め切る戦い方が効く。'});

// Opponents visible for the current step. The rival is rebuilt from the
// frozen points stored in the save; if the freeze is missing it is derived
// deterministically from the player's current abilities (identical while
// the step gates keep abilities unchanged).
export function tutorialOpponents(s){
 if(!tutorialActive(s)||s.country!=='jp')return [];
 const step=s.tutorial.step,out=[];
 if(step==='fight2'||step==='allocate')out.push(fight2Opponent());
 if(['fight3','style','rematch','skill'].includes(step)){
  const freeze=validFreeze(s.tutorial.rivalFreeze)&&s.tutorial.rivalFreeze?s.tutorial.rivalFreeze:rivalFreezeFor(s.abilities?.spent);
  if(freeze)out.push(rivalOpponent(freeze));
 }
 return out;
}
export function tutorialOpponentUnlocked(s,id){
 if(!tutorialActive(s))return false;
 if(id===TUTORIAL_FIGHT2_ID)return s.tutorial.step==='fight2';
 if(id===TUTORIAL_RIVAL_ID)return ['fight3','style','rematch','skill'].includes(s.tutorial.step);
 return false;
}

// --- Fixed tutorial outcomes --------------------------------------------------
// The four tutorial matches have decided outcomes — win, win, loss, then the
// rematch win — a fixed race approved by the user on 2026-11-22. The fight
// the player watches is still a genuine engine fight on the production
// battle runtime: at fight start we try seeds in order from the ticket's
// own seed and run the match with the first seed that produces the decided
// outcome for the player's actual build. Only when no seed in the search
// range produces it (extreme one-stat builds whose damage output cannot
// finish the frozen rival) does a director arm for that match only: as the
// fight progresses it gradually scales the decided winner's damage up and
// the loser's down, so the match converges to the decided outcome as a
// rally rather than a sudden turn. Player abilities, the opponents and all
// non-tutorial fights are untouched; a rematch loss (which the director
// makes unreachable in practice) still stays in the rematch step.
// 12 tries resolve any build whose decided outcome occurs for at least
// roughly a fifth of seeds with >95% probability; rarer builds are exactly
// the ones the director below exists for, and the cap keeps the search
// from ever stalling fight start. In practice the stock fights resolve
// on the first one or two seeds.
export const TUTORIAL_RIG_SEED_LIMIT=12;
const RIG_TARGET={
 fight1:{id:'jp-dojo-0',want:'player'},
 fight2:{id:TUTORIAL_FIGHT2_ID,want:'player'},
 fight3:{id:TUTORIAL_RIVAL_ID,want:'opponent'},
 rematch:{id:TUTORIAL_RIVAL_ID,want:'player'},
};
export function tutorialRigWant(s,ticket){
 if(!tutorialActive(s))return null;
 const target=RIG_TARGET[s.tutorial.step];
 return target&&ticket?.opponent?.id===target.id?target.want:null;
}
// Remaining-HP-fraction gap from the decided winner's perspective: negative
// when the decided winner already leads, so the minimum is the closest miss.
const rigMargin=(b,want)=>{
 const w=want==='player'?0:1,l=1-w,W=b.fighters[w],L=b.fighters[l];
 return (L.hp/Math.max(1,L.maxHp))-(W.hp/Math.max(1,W.maxHp));
};
// rt is the production battle runtime ({createBattle, finishBattle}),
// injected by the caller so this module keeps its v98 dependency graph.
export function rigTutorialTicket(s,ticket,rt){
 const want=tutorialRigWant(s,ticket);
 if(!want||!rt?.createBattle||!rt?.finishBattle)return ticket;
 // Fight 1 only: the stock 'balanced' AI keeps steering back to its planned
 // technique's preferred range, so against the ever-advancing opener the
 // player visibly retreats all fight long. Run the player's in-fight
 // movement as 'pressure' instead — it fights from the present range rather
 // than walking back to a preselected one. The save's fightStyle is NOT
 // changed (the style step later still teaches switching), and the seed
 // search below runs with this strategy, so the decided win is preserved.
 if(s.tutorial.step==='fight1')ticket.strategy='pressure';
 let best=null;
 for(let i=0;i<TUTORIAL_RIG_SEED_LIMIT;i++){
  const seed=ticket.seed+i,b=rt.finishBattle(rt.createBattle({...ticket,seed}));
  if(b.winner===want){ticket.seed=seed;ticket.rig={want,mode:'seed',seedsTried:i+1};return ticket;}
  const margin=rigMargin(b,want);
  if(!best||margin<best.margin)best={seed,margin};
 }
 ticket.seed=best.seed;
 ticket.rig={want,mode:'director',seedsTried:TUTORIAL_RIG_SEED_LIMIT};
 return ticket;
}
// Director correction: no correction for the first RIG_GRACE seconds of
// battle time, then a multiplier grows quadratically to RIG_MAX_MUL. The
// decided winner's power scales with mul and defence with sqrt(mul); the
// loser's power scales with 1/mul and defence with 1/sqrt(mul). Dealt
// damage therefore scales with mul^1.5 and taken damage with mul^-1.5:
// the winner both rallies and stops folding early (a no-damage build can
// otherwise be knocked out before a gentler correction matters). Applied
// per step from the app loop / the director-aware finish below; a no-op
// for seed-decided and normal fights.
const RIG_GRACE=5,RIG_RATE=.006,RIG_MAX_MUL=4;
export function applyTutorialDirector(battle,ticket){
 const rig=ticket?.rig;
 if(!rig||rig.mode!=='director'||!battle||battle.done)return;
 const w=rig.want==='player'?0:1,l=1-w,W=battle.fighters?.[w],L=battle.fighters?.[l];
 if(!W||!L)return;
 if(!battle.rigBase)battle.rigBase={wPower:W.power,wDefense:W.defense,lPower:L.power,lDefense:L.defense};
 const base=battle.rigBase,t=Math.max(0,(battle.time??0)-RIG_GRACE);
 const mul=Math.min(RIG_MAX_MUL,1+RIG_RATE*t*t),damp=Math.sqrt(mul);
 W.power=base.wPower*mul;
 W.defense=base.wDefense*damp;
 L.defense=Math.max(.4,base.lDefense/damp);
 L.power=base.lPower/mul;
}
export function finishTutorialBattle(battle,ticket,stepBattle){
 let guard=0;
 while(battle&&!battle.done&&guard++<60*60*4){applyTutorialDirector(battle,ticket);stepBattle(battle,1/60);}
 return battle;
}

// --- Step gates ---------------------------------------------------------------
// One place decides which views and actions a step allows. Anything not
// listed is ignored by the app while the tutorial is active.
const FIGHT_VIEWS=['home','hub','battle','pause','result','received'];
const FIGHT_ACTIONS=['back','home','hub','opponent','prefight','fight','pause','resume','speed','skip','result','received','received-page','result-next'];
const ABILITY_ACTIONS=['back','ability-plus','ability-minus','ability-confirm','ability-cancel','ability-back'];
const GATES={
 intro:{view:'abilities',views:['abilities'],actions:ABILITY_ACTIONS},
 fight1:{view:'hub',views:FIGHT_VIEWS,actions:FIGHT_ACTIONS},
 fight2:{view:'hub',views:FIGHT_VIEWS,actions:FIGHT_ACTIONS},
 allocate:{view:'abilities',views:['home','fighter-settings','abilities','result','received'],actions:['fighter-settings','abilities','home',...ABILITY_ACTIONS,'result','received','received-page','result-next']},
 fight3:{view:'hub',views:FIGHT_VIEWS,actions:FIGHT_ACTIONS},
 style:{view:'hub',views:['result','received','home','hub','styles'],actions:['back','result','received','received-page','result-next','retry','home','hub','opponent','prefight','styles','style-pick','style-save','style-cancel']},
 rematch:{view:'hub',views:FIGHT_VIEWS,actions:[...FIGHT_ACTIONS,'retry']},
 skill:{view:'hub',views:['result','received','demo','skill-detail','equipment','candidates','home','fighter-settings','hub'],actions:['back','result','received','received-page','result-next','pending-motions','demo-next','demo-replay','demo-pause','demo-info','detail-back','preview-skill','skill-tab','skill-info','equipment','equipment-done','slot','candidate-page','candidate-preview','choose-skill','clear-slot','home','fighter-settings','hub']},
 training:{view:'home',views:['home','hub','local-training','local-training-story'],actions:['back','home','local-training','training-rank','training-start','training-skip']},
};
export function tutorialGate(s){
 if(!tutorialActive(s))return null;
 const g=GATES[s.tutorial.step];if(!g)return null;
 return {step:s.tutorial.step,view:g.view,views:g.views,actions:new Set(g.actions)};
}

// Short in-game guidance, one line per step: just enough that the next
// action is unambiguous.
export const TUTORIAL_GUIDES=Object.freeze({
 intro:'まずは強さの決め方を覚えよう。10ポイントを3つの能力に振り分けて、「この配分で確定」を押そう。',
 fight2:'もう一勝しよう。相手に挑んで試合開始。勝てばレベルアップが見えてくる。',
 allocate:'レベルアップ！ 増えた1ポイントを好きな能力に振って、「この配分で確定」を押そう。',
 fight3:'次は手強い相手。まずは今の戦い方のまま挑んでみよう。',
 style:'力負けは戦い方の相性しだい。対戦準備で「あなた」を押し、ファイトスタイルをオフェンシブに変えてから再戦しよう。',
 rematch:'オフェンシブで再戦。同じ相手に、今度こそ勝とう。',
 skill:'新しい技「ストレート」を覚えた。見本で動きを見て、装備画面でセットを確認しよう。確認したら戻るボタンで完了。',
 training:'最後に修行を体験しよう。ホームの「修行に行く」から、「基礎修行」を選んで始めよう。',
});
export const tutorialGuideText=s=>tutorialActive(s)?TUTORIAL_GUIDES[s.tutorial.step]??'':'';
