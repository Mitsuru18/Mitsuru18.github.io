import {assertCupRuntimeState} from './battle-runtime-contract.js';
import{awardExperience,planExperience}from'./experience.js';
export const TOURNAMENT_GROWTH_KEY='wfj:tournament-career:main-linked-v2';
// Stable catalog identities are reward groups, never occurrence IDs or dates.
// Existing content and first awards remain unchanged.
export const CUP_EXPERIENCE=Object.freeze({series:600,hands:600,noelbow:600,grand:1200});
const mode=(name,rounds,ban,first,levels=null)=>Object.freeze({name,rounds,ban,first,repeat:first/4,levels:levels&&Object.freeze(levels)});
export const TOURNAMENT_CATALOG=Object.freeze({
 series:mode('3連戦',3,null,600),hands:mode('蹴り禁止杯',3,'kick',600),noelbow:mode('肘・膝禁止杯',3,'elbow-knee',600),grand:mode('天下一武闘会',4,null,1200),
 'ascent-100':mode('登竜杯 Lv100',3,null,3000,[70,85,100]),
 'ascent-150':mode('強豪杯 Lv150',3,null,4500,[120,135,150]),
 'ascent-200':mode('達人杯 Lv200',3,null,6000,[170,185,200]),
 'ascent-250':mode('覇者杯 Lv250',3,null,7500,[220,235,250]),
 'ascent-300':mode('頂点杯 Lv300',3,null,9000,[270,285,300])
});
export const freshTournamentGrowth=()=>({rule:2,baseline:null,claimed:[],paidGroups:[],lastReceipt:null});
const integer=n=>Number.isSafeInteger(n)&&n>=0,cupNumber=id=>{const m=typeof id==='string'&&id.match(/^cup-([1-9]\d*)$/),n=Number(m?.[1]);return m&&integer(n)?n:null;},known=id=>Object.hasOwn(TOURNAMENT_CATALOG,id);
export function validTournamentGrowth(g){return [1,2].includes(g?.rule)&&(g.baseline===null||integer(g.baseline))&&Array.isArray(g.claimed)&&g.claimed.every(x=>cupNumber(x)!==null)&&new Set(g.claimed).size===g.claimed.length&&(g.baseline!==null||!g.claimed.length)&&(g.lastReceipt===null||integer(g.lastReceipt?.xp)&&integer(g.lastReceipt?.points)&&integer(g.lastReceipt?.level))&&(g.rule===1||Array.isArray(g.paidGroups)&&g.paidGroups.every(known)&&new Set(g.paidGroups).size===g.paidGroups.length);}
export function readTournamentGrowthSource(raw){let preflight;try{preflight=typeof raw==='string'?JSON.parse(raw):raw;}catch{return null;}if(preflight)assertCupRuntimeState(preflight);try{const s=typeof raw==='string'?JSON.parse(raw):raw;return [2,3].includes(s?.schema)&&s.mainLinked===true&&integer(s.serial)&&s.serial>=1&&integer(s.completed)&&Array.isArray(s.history)&&s.history.every(h=>h&&typeof h==='object'&&!Array.isArray(h))&&Array.isArray(s.settled)&&s.settled.every(x=>typeof x==='string')&&new Set(s.settled).size===s.settled.length?s:null;}catch{return null;}}
function champion(h,source,settled){const n=cupNumber(h?.id),m=known(h?.mode)?TOURNAMENT_CATALOG[h.mode]:null;return n!==null&&n<source.serial&&m&&(h.rewardGroup===undefined||h.rewardGroup===h.mode)&&h.champion==='you'&&h.wins===m.rounds&&integer(h.completed)&&h.completed<=source.completed&&Array.from({length:m.rounds},(_,i)=>`${h.id}:${i}`).every(id=>settled.has(id));}
function ledger(g,source){
 if(!validTournamentGrowth(g))return null;
 const groups=new Set(g.rule===2?g.paidGroups:[]),history=new Map(),ambiguous=new Set(),settled=new Set(source.settled);
 for(const h of source.history){if(history.has(h?.id)&&JSON.stringify(history.get(h.id))!==JSON.stringify(h))ambiguous.add(h.id);else history.set(h?.id,h);}
 // Every historical receipt must still be explained. Do not erase unknown
 // history to manufacture a new first award; preserve the main save and stop.
 for(const id of g.claimed){const h=history.get(id);if(!h||ambiguous.has(id)||!champion(h,source,settled)||cupNumber(id)<=g.baseline)return null;groups.add(h.mode);}
 return {...g,rule:2,paidGroups:[...groups]};
}
// Validate the whole history once per UI render, then share all nine previews.
export function tournamentRewardPreviews(s,raw){const source=readTournamentGrowthSource(raw),q=tournamentGrowthQuote(s,source),g=s.tournamentGrowth??freshTournamentGrowth(),paid=new Set(q.ledger?.paidGroups??[]),received=new Set(g.claimed),awaiting=q.cups?.find(c=>c.id===source?.run?.id)??null;return Object.fromEntries(Object.entries(TOURNAMENT_CATALOG).map(([id,m])=>[id,!q.ledger?{ok:false,reason:q.reason}:{ok:true,linked:!q.initialize,first:m.first,repeat:m.repeat,xp:q.initialize?null:paid.has(id)?m.repeat:m.first,kind:paid.has(id)?'repeat':'first',awaiting:awaiting?.group===id?awaiting:null,received:source?.run?.mode===id&&received.has(source.run.id)}]));}
export function tournamentRewardPreview(s,mode,raw){return known(mode)?tournamentRewardPreviews(s,raw)[mode]:{ok:false,reason:'source'};}

export function tournamentGrowthQuote(s,raw){
 const source=readTournamentGrowthSource(raw),g=s.tournamentGrowth??freshTournamentGrowth(),empty={xp:0,cups:[]};
 if(!source||!validTournamentGrowth(g)||s.pendingResult)return{ok:false,reason:s.pendingResult?'battle':'source',...empty};
 const next=ledger(g,source);if(!next)return{ok:false,reason:'migration',...empty};
 if(g.baseline===null)return{ok:true,initialize:true,baseline:source.serial-1,ledger:next,...empty};
 if(source.serial-1<g.baseline)return{ok:false,reason:'source',...empty};
 const seen=new Set(g.claimed),groups=new Set(next.paidGroups),cups=[],ids=new Map(),settled=new Set(source.settled);
 for(const h of [...source.history].sort((a,b)=>(cupNumber(a?.id)??0)-(cupNumber(b?.id)??0))){const n=cupNumber(h?.id);
  // Old history before activation is retained, never paid retrospectively.
  if(n!==null&&n<=g.baseline)continue;
  if(n===null||n>=source.serial||ids.has(h.id)&&ids.get(h.id)!==JSON.stringify(h)||!known(h.mode)||h.rewardGroup!==undefined&&h.rewardGroup!==h.mode||!integer(h.completed)||h.completed>source.completed||!integer(h.wins)||h.wins>TOURNAMENT_CATALOG[h.mode].rounds)return{ok:false,reason:'history',...empty};
  if(ids.has(h.id))continue;ids.set(h.id,JSON.stringify(h));if(seen.has(h.id)||h.champion!=='you')continue;
  if(!champion(h,source,settled))return{ok:false,reason:'history',...empty};
  const m=TOURNAMENT_CATALOG[h.mode],first=!groups.has(h.mode);groups.add(h.mode);seen.add(h.id);cups.push({id:h.id,group:h.mode,kind:first?'first':'repeat',xp:first?m.first:m.repeat});
 }
 const xp=cups.reduce((n,c)=>n+c.xp,0),migrate=g.rule===1||next.paidGroups.length!==g.paidGroups?.length;
 return{ok:(xp>0&&!!planExperience(s,xp))||(!xp&&migrate),initialize:false,migrate,xp,cups,ledger:{...next,paidGroups:[...groups]},reason:xp?'arithmetic':migrate?'migration-ready':'empty'};
}
export function claimTournamentGrowth(s,raw){const q=tournamentGrowthQuote(s,raw);if(!q.ok)return null;if(q.initialize){s.tournamentGrowth={...q.ledger,baseline:q.baseline};return{initialized:true,xp:0,points:0};}if(!q.xp){s.tournamentGrowth=q.ledger;return{migrated:true,xp:0,points:0};}const award=awardExperience(s,q.xp);if(!award)return null;const receipt={...award,cups:q.cups.map(c=>c.id),rewards:q.cups};s.tournamentGrowth={...q.ledger,claimed:[...q.ledger.claimed,...receipt.cups],lastReceipt:receipt};return receipt;}
// MAIN Web Lock + guarded generation comparison + one atomic candidate save.
// Neither tournament gold nor tournament points are imported.
export function purchaseTournamentGrowth(s,raw,save){const next=structuredClone(s),receipt=claimTournamentGrowth(next,raw);if(!receipt)return null;try{if(!save(next))return null;}catch{return null;}return{state:next,receipt};}


// Event time is settled main-journey fights, never wall-clock time or cup fights.
export const TOURNAMENT_EVENT_RULES=Object.freeze({revision:1,interval:30,entryWindow:3});
export const TOURNAMENT_EVENT_ROTATION=Object.freeze(Object.keys(TOURNAMENT_CATALOG));
export function freshTournamentEvents(baselineFights=0,journeyId=null){
 const id=journeyId??'journey-'+Array.from({length:4},()=>Math.floor(Math.random()*0x100000000).toString(16).padStart(8,'0')).join('');
 return{rule:1,journeyId:id,baselineFights};
}
export function validTournamentEvents(e,fights){return e?.rule===1&&typeof e.journeyId==='string'&&/^(journey-[a-f0-9]{32}|legacy-\d+-\d+)$/.test(e.journeyId)&&integer(e.baselineFights)&&integer(fights)&&e.baselineFights<=fights;}
export function validTournamentEventEntries(entries){return Array.isArray(entries)&&new Set(entries.map(e=>e?.id)).size===entries.length&&entries.every(e=>e&&typeof e.id==='string'&&typeof e.journeyId==='string'&&/^(journey-[a-f0-9]{32}|legacy-\d+-\d+)$/.test(e.journeyId)&&Number.isSafeInteger(e.sequence)&&e.sequence>=1&&e.id===e.journeyId+':'+e.sequence&&e.mode===TOURNAMENT_EVENT_ROTATION[(e.sequence-1)%TOURNAMENT_EVENT_ROTATION.length]&&cupNumber(e.runId)!==null);}
export function tournamentEventStatus(main,source=null){
 if(!main||!validTournamentEvents(main.tournamentEvents,main.fights))return{status:'unavailable'};
 if(source!==null&&(!source||typeof source!=='object'||!validTournamentEventEntries(source.eventEntries??[])||source.run&&(!known(source.run.mode)||!['prepare','between','battle','finished'].includes(source.run.status))))return{status:'blocked'};
 // Every already-entered run, including a legacy run, survives expiry and reload.
 if(source?.run)return{status:'resume',mode:source.run.mode,runId:source.run.id,finished:source.run.status==='finished'};
 const schedule=main.tournamentEvents,elapsed=main.fights-schedule.baselineFights,sequence=Math.floor(elapsed/TOURNAMENT_EVENT_RULES.interval),untilNext=TOURNAMENT_EVENT_RULES.interval-elapsed%TOURNAMENT_EVENT_RULES.interval;
 if(sequence<1)return{status:'waiting',untilNext};
 const id=schedule.journeyId+':'+sequence,mode=TOURNAMENT_EVENT_ROTATION[(sequence-1)%TOURNAMENT_EVENT_ROTATION.length],age=elapsed%TOURNAMENT_EVENT_RULES.interval,remaining=Math.max(0,TOURNAMENT_EVENT_RULES.entryWindow-age),entry=source?.eventEntries?.find(e=>e.id===id);
 return{status:entry?'entered':remaining?'open':'expired',id,journeyId:schedule.journeyId,sequence,mode,remaining,untilNext};
}
