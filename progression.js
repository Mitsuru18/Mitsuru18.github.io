import{freshTournamentGrowth,validTournamentGrowth,freshTournamentEvents,validTournamentEvents}from'./tournament-growth.js';
import{freshExperience,validExperience,awardExperience,fightExperience,planExperience,legacyFightExperience}from'./experience.js';
import{parseRival,countryRivals,opponentLevel,rivalLessons,createCountryRival,ADVANCED_LESSONS}from'./country-rivals.js';
import{freshLocalTraining,normalizeLocalTraining}from'./country-training.js';
import{dojoAbilityPoints}from'./dojo-strength.js';
import{freshFightRecords,normalizeFightRecords,recordFinishedFight}from'./fight-records.js';
import{normalizeAppearance,opponentAppearance}from'./appearance.js';
import{EXTRA_COUNTRIES,EXTRA_DEFENSE,countryKit,WORLD_ROSTER_REVISION,countryTacticalKit,countryTacticalProfile}from'./world-countries.js';
import {opponentName} from './opponent-names.js';
import{freshAbilities,validAbilities,abilityStats,enemyAbilities,migrateAbilities}from'./attributes.js';
export{allocateAbilities}from'./attributes.js';
import {COURSE_COUNT,courseCount,totalCourseCount,EXTRA_LESSONS,COURSE_REVISION,LESSON_INDICES,venueKind,COURSE_ROLES,DEFENSE_REWARD,courseId,courseIds,courseIndex} from './course-layout.js';
export{COURSE_COUNT,courseCount,totalCourseCount,courseId,courseIds,courseIndex};
import {FIRST_DOJO} from './first-dojo.js';
import {TECHNIQUES,SKILL_LIMITS,skillCategory,limitLoadout,availableIn2D} from './engine.js';
export const COUNTRIES=[{id:'jp',name:'日本',city:'京都',color:'#e9bb7b',places:['東京・下町道場','大阪・河岸の道場','沖縄・海辺の道場'],moves:['cross','sidekick','lowkick']},{id:'th',name:'タイ',city:'バンコク',color:'#e89863',places:['バンコク・路地のジム','チェンマイ・山の道場','プーケット・浜辺の道場'],moves:['knee','lowkick','cross']},{id:'br',name:'ブラジル',city:'リオ',color:'#89bc95',places:['リオ・丘の道場','サンパウロ・街の道場','サルヴァドール・海の道場'],moves:['knee','crouchpunch','crouchlowkick']},{id:'kr',name:'韓国',city:'ソウル',color:'#8cb5d3',places:['ソウル・古都の道場','釜山・港の道場','済州・島の道場'],moves:['sidekick','jumpkick','frontkick']},{id:'fr',name:'フランス',city:'パリ',color:'#b6a1ce',places:['パリ・路地のジム','リヨン・川辺のジム','マルセイユ・港のジム'],moves:['cross','sidekick','crouchpunch']},{id:'us',name:'アメリカ',city:'ニューヨーク',color:'#df987b',places:['ニューヨーク・街のジム','シカゴ・倉庫のジム','ロサンゼルス・海のジム'],moves:['cross','crouchpunch','jumpkick']}];
COUNTRIES.push(...EXTRA_COUNTRIES);
import{ACTIVE_SAVE_KEY}from'./save-profile.js';
export const SAVE_KEY=ACTIVE_SAVE_KEY;
export const GROWTH_RULES=Object.freeze({hpPerFirstWin:0,powerPerFirstWin:0,defensePerFirstWin:0,speedPerFirstWin:0});
const freshGrowth=()=>({rule:3});
export function newGame(country='jp'){return {version:9,tournamentEvents:freshTournamentEvents(),tournamentGrowth:freshTournamentGrowth(),experience:freshExperience(),localTraining:freshLocalTraining(),records:freshFightRecords(),rosterTravelRights:[],rosterRevision:WORLD_ROSTER_REVISION,fightStyle:'balanced',journeyStart:country,growth:freshGrowth(),abilities:freshAbilities(),courseRevision:COURSE_REVISION,legacyClears:[],legacyRankFloor:0,legacyFreeTravel:false,retiredSkills:[],pendingResult:null,country,visited:[country],money:0,mastery:0,known:['jab','frontkick'],equipped:['jab','frontkick'],pendingDemos:[],wins:[],titles:[],fights:0,nextId:1,rewarded:[],name:'旅する拳士',migrated:false,appearance:null};}
export const canonicalDojo=id=>typeof id==='string'?id.replace(/^([a-z]{2})-([0-2])$/,'$1-dojo-$2'):null;
export function hasWon(s,id){if(typeof id!=='string')return false;const canonical=canonicalDojo(id);if(s.wins.includes(canonical))return true;const alias=canonical.match(/^([a-z]{2})-dojo-([0-2])$/);return!!alias&&s.wins.includes(`${alias[1]}-${alias[2]}`);}
const growthWinCount=s=>COUNTRIES.reduce((n,c)=>n+(s.legacyClears?.includes(c.id)?COURSE_COUNT:courseIds(c.id).filter(id=>hasWon(s,id)).length),0);
export function legacyPlayerStats(s){return {hp:115+Math.min(100,Math.floor(s.mastery*2.5)),power:1+Math.min(.9,s.mastery*.02),defense:1+Math.min(.5,s.mastery*.01),speed:1+Math.min(.3,s.mastery*.006)};}
function ensureGrowth(s){return s.growth=freshGrowth();}
function validGrowth(g){return g?.rule===3||g?.rule===2||g?.rule===1&&Number.isSafeInteger(g.baselineWins)&&g.baselineWins>=0&&g.baselineWins<=COUNTRY_LIMIT&&[['hp',115,215],['power',1,1.9],['defense',1,1.5],['speed',1,1.3]].every(([key,min,max])=>Number.isFinite(g[key])&&g[key]>=min&&g[key]<=max);}
const COUNTRY_LIMIT=COUNTRIES.length*COURSE_COUNT;
export function dojoRewards(tier,move){return [move,...(tier===0?['guard','crouch']:tier===1?['sway','jump']:[])].filter(id=>TECHNIQUES.some(t=>t.id===id));}
// Historical IDs exist only here to migrate earned ownership, never as skills.
const RETIRED_REWARDS=[
 {dojo:'br-dojo-0',old:'hipthrow',replacement:'knee'},
 {dojo:'br-dojo-1',old:'takedown',replacement:'roundkick'},
 {dojo:'fr-dojo-2',old:'hipthrow',replacement:'lowkick'},
 {dojo:'us-dojo-0',old:'takedown',replacement:'cross'}
];
const POSTURE_REWARDS=COUNTRIES.flatMap(c=>[
 {dojo:`${c.id}-dojo-0`,skill:'crouch'},
 {dojo:`${c.id}-dojo-1`,skill:'jump'},
 ...(['br','kr','fr'].includes(c.id)?[{dojo:`${c.id}-dojo-2`,skill:({br:'crouchlowkick',kr:'jumpkick',fr:'crouchpunch'})[c.id]}]:[])
]);
const NEW_POSTURE_SKILLS=new Set(POSTURE_REWARDS.map(r=>r.skill));
function rewardsForDojo(id,revision=COURSE_REVISION,roster=WORLD_ROSTER_REVISION){const rival=parseRival(id);if(rival&&COUNTRIES.some(c=>c.id===rival.country))return !ADVANCED_LESSONS.length?[]:rivalLessons(rival.country,createCountryRival(COUNTRIES.find(c=>c.id===rival.country),rival.ordinal,baseOpponents({country:rival.country,journeyStart:'jp',wins:[]})).level);const canonical=canonicalDojo(id),index=courseIndex(canonical),c=COUNTRIES.find(c=>canonical?.startsWith(c.id+'-'));if(!c||index<0)return null;if(index===12)return[EXTRA_LESSONS[c.id].skill];const lesson=(revision===1?[0,3,6,9]:LESSON_INDICES).indexOf(index);return lesson<0?[]:[c.moves[0],DEFENSE_REWARD[c.id]??EXTRA_DEFENSE[c.id],c.moves[1],c.id==='kr'&&roster===2?'axekick':c.moves[2]].slice(lesson,lesson+1);}
export function nextDojoRewards(s,id){return(rewardsForDojo(id)||[]).filter(x=>!s.known.includes(x));}
const baseComplete=(s,id)=>s.legacyClears?.includes(id)||courseIds(id).slice(0,COURSE_COUNT).every(x=>hasWon(s,x));
export const countryComplete=(s,id)=>baseComplete(s,id)&&courseIds(id).slice(COURSE_COUNT).filter(x=>x!=='us-stage-12').every(x=>hasWon(s,x));
export function dojoUnlocked(s,id){const rival=parseRival(id);if(rival)return COUNTRIES.some(c=>c.id===rival.country)&&countryComplete(s,rival.country)&&(rival.ordinal===1||hasWon(s,`${rival.country}-rival-${rival.ordinal-1}`));const canonical=canonicalDojo(id),i=courseIndex(canonical),c=COUNTRIES.find(c=>canonical?.startsWith(c.id+'-'));return!!c&&i>=0&&(hasWon(s,canonical)||(i<COURSE_COUNT&&s.legacyClears?.includes(c.id))||courseIds(c.id).slice(0,i).every(x=>hasWon(s,x)||(s.legacyClears?.includes(c.id)&&courseIndex(x)<COURSE_COUNT)));}
export const courseWonCount=(s,id)=>courseIds(id).filter(x=>hasWon(s,x)||(s.legacyClears?.includes(id)&&courseIndex(x)<COURSE_COUNT)).length;
function learn(s,ids,{autoEquip=true}={}){
 const learned=[];
 for(const id of Array.isArray(ids)?ids:[])if(TECHNIQUES.some(t=>t.id===id)&&!s.known.includes(id)){
  s.known.push(id);learned.push(id);if(!s.pendingDemos.includes(id))s.pendingDemos.push(id);
  const cat=skillCategory(id);if(autoEquip&&!TECHNIQUES.find(t=>t.id===id)?.manualEquip&&availableIn2D(id)&&s.equipped.filter(i=>skillCategory(i)===cat).length<SKILL_LIMITS[cat])s.equipped.push(id);
 }
 return learned;
}
export function loadSave(raw){try{
 const s=JSON.parse(raw);
 if(!s||![1,2,3,4,5,6,7,8,9].includes(s.version)||!COUNTRIES.some(c=>c.id===s.country)||!Number.isFinite(s.money)||s.money<0||!Number.isFinite(s.mastery)||s.mastery<0||!['visited','known','wins','titles','rewarded'].every(k=>Array.isArray(s[k]))||!Number.isSafeInteger(s.fights)||s.fights<0||!Number.isSafeInteger(s.nextId)||s.nextId<1)return null;
 if(s.rosterRevision!==undefined&&![1,2,WORLD_ROSTER_REVISION].includes(s.rosterRevision))return null;
 if(s.courseRevision!==undefined&&![1,COURSE_REVISION].includes(s.courseRevision))return null;
 const rosterUpgrade=s.rosterRevision!==WORLD_ROSTER_REVISION,previousVersion=s.version,courseUpgrade=s.courseRevision!==COURSE_REVISION,growthUpgrade=s.growth?.rule!==3||s.version<7,old=s.version<3,retiredUpgrade=s.version<4,upgrade=s.version<5,removed=s.known.filter(id=>RETIRED_REWARDS.some(r=>r.old===id));s.version=9;
 s.retiredSkills=[...new Set([...(Array.isArray(s.retiredSkills)?s.retiredSkills:[]),...(s.known.includes('hook')||s.equipped?.includes('hook')?['hook']:[])])];
 s.known=[...new Set(['jab','frontkick',...s.known.filter(id=>id!=='hook'&&TECHNIQUES.some(t=>t.id===id))])];
 // v1 equipment used a different budget; v2 had no equipment. Fill from known
 // once on upgrade, while v3/v4 preserve deliberate selections and empty slots.
 s.equipped=limitLoadout(old?s.known.filter(id=>!NEW_POSTURE_SKILLS.has(id)):s.equipped,s.known);
 s.pendingDemos=[...new Set((Array.isArray(s.pendingDemos)?s.pendingDemos:[]).filter(id=>s.known.includes(id)))];
 s.visited=s.visited.filter(id=>COUNTRIES.some(c=>c.id===id));if(!s.visited.includes(s.country))s.visited.push(s.country);
 s.wins=s.wins.filter(id=>typeof id==='string');
 s.records=normalizeFightRecords(s,COUNTRIES.map(c=>c.id),s.wins.map(canonicalDojo).filter(id=>rewardsForDojo(id)!==null));
 if(old)for(const c of COUNTRIES)for(const tier of [0,1])if(hasWon(s,`${c.id}-dojo-${tier}`))learn(s,[tier===0?'guard':'sway']);
 if(retiredUpgrade){
  const replacements=RETIRED_REWARDS.filter(r=>hasWon(s,r.dojo)).map(r=>r.replacement);
  // Early saves could earn a removed move outside a dojo. Preserve that unlock
  // with one existing strike, without manufacturing another victory or payout.
  for(const id of new Set(removed))if(!RETIRED_REWARDS.some(r=>r.old===id&&hasWon(s,r.dojo)))replacements.push(RETIRED_REWARDS.find(r=>r.old===id).replacement);
  learn(s,replacements,{autoEquip:old});
 }
 // New posture rewards are earned immediately, but never alter an existing
 // save's chosen equipment, including the established v1/v2 legacy autofill.
 if(upgrade)for(const r of POSTURE_REWARDS)if(hasWon(s,r.dojo))learn(s,[r.skill],{autoEquip:false});
 if(previousVersion<6){s.legacyFreeTravel=true;const valid=new Set(COUNTRIES.flatMap(c=>[0,1,2].map(i=>`${c.id}-dojo-${i}`))),oldCount=new Set(s.wins.map(canonicalDojo).filter(x=>valid.has(x))).size;s.legacyRankFloor=Math.min(5,Math.floor(oldCount/3));s.legacyClears=COUNTRIES.filter(c=>[0,1,2].every(i=>hasWon(s,`${c.id}-dojo-${i}`))).map(c=>c.id);}else{s.legacyFreeTravel=!!s.legacyFreeTravel;s.legacyRankFloor=Math.max(0,Math.min(5,Number(s.legacyRankFloor)||0));s.legacyClears=(s.legacyClears||[]).filter(id=>COUNTRIES.some(c=>c.id===id));}
 const pending=s.pendingResult,bt=pending?.battle,tk=pending?.ticket;s.pendingResult=bt?.done&&['player','opponent','draw'].includes(bt.winner)&&Array.isArray(bt.fighters)&&bt.fighters.length===2&&bt.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.maxHp)&&Array.isArray(f.techniques))&&Number.isFinite(bt.tick)&&Number.isFinite(bt.time)&&Number.isSafeInteger(tk?.id)&&tk.id===s.nextId-1&&!s.rewarded.includes(tk.id)&&rewardsForDojo(tk.opponent?.id)!==null&&(tk.country??canonicalDojo(tk.opponent.id).split('-')[0])===s.country&&COUNTRIES.some(c=>c.id===(tk.country??canonicalDojo(tk.opponent.id).split('-')[0]))&&canonicalDojo(tk.opponent.id).startsWith((tk.country??canonicalDojo(tk.opponent.id).split('-')[0])+'-')?pending:null;
 // Only an already-finished old battle retains the old promised lesson/reward.
 // Ignore arbitrary embedded reward payloads; resolve the old official schedule.
 if(s.pendingResult&&courseUpgrade)tk.legacyCourseReward=true;
 if(s.growth!==undefined&&!validGrowth(s.growth))return null;
 if(s.abilities!==undefined&&!validAbilities(s.abilities))return null;
 const abilityUpgrade=migrateAbilities(s);
 if(s.experience===undefined)s.experience=freshExperience(s.abilities);
 if(!validExperience(s.experience,s.abilities.level))return null;
 if(s.tournamentGrowth!==undefined&&!validTournamentGrowth(s.tournamentGrowth))return null;
 s.tournamentGrowth??=freshTournamentGrowth();
 // Historical fights are not retroactively consumed. New events begin after migration.
 s.tournamentEvents??=freshTournamentEvents(s.fights,`legacy-${s.fights}-${s.nextId}`);
 if(!validTournamentEvents(s.tournamentEvents,s.fights))return null;
 ensureGrowth(s);
 s.rosterTravelRights=[...new Set([...(Array.isArray(s.rosterTravelRights)?s.rosterTravelRights:[]),...(rosterUpgrade?COUNTRIES.filter(c=>baseComplete(s,c.id)).map(c=>c.id):[])])].filter(id=>COUNTRIES.some(c=>c.id===id));
 s.courseRevision=COURSE_REVISION;s.rosterRevision=WORLD_ROSTER_REVISION;
 s.appearance=s.appearance==null?null:normalizeAppearance(s.appearance);
 s.localTraining=normalizeLocalTraining(s);
 s.migrated=rosterUpgrade||abilityUpgrade||previousVersion<6||upgrade||growthUpgrade||courseUpgrade||!!s.migrated;s.name=typeof s.name==='string'&&s.name.trim()?s.name:'旅する拳士';s.journeyStart=COUNTRIES.some(c=>c.id===s.journeyStart)?s.journeyStart:(s.visited[0]||s.country);s.fightStyle=['balanced','pressure','counter','outside'].includes(s.fightStyle)?s.fightStyle:'balanced';delete s.observed;delete s.strategy;delete s.practiceAt;
 return Object.fromEntries(Object.keys(newGame()).map(key=>[key,s[key]]));
 }catch{return null;}}
export const saveGame=s=>JSON.stringify(s);
/** Explicit slot selection; a full category never silently evicts a skill. */
export function equipSkill(s,id,replaceId=null){
 if(!s.known.includes(id)||!TECHNIQUES.some(t=>t.id===id))return {ok:false,reason:'unknown'};
 if(!availableIn2D(id))return {ok:false,reason:'unavailable-2d'};
 s.equipped=limitLoadout(s.equipped,s.known);
 if(s.equipped.includes(id))return {ok:true};
 const cat=skillCategory(id),selected=s.equipped.filter(i=>skillCategory(i)===cat);
 if(replaceId){if(!selected.includes(replaceId))return {ok:false,reason:'replacement'};s.equipped[s.equipped.indexOf(replaceId)]=id;return {ok:true};}
 if(selected.length>=SKILL_LIMITS[cat])return {ok:false,reason:'full'};
 s.equipped.push(id);return {ok:true};
}
export function unequipSkill(s,id){const at=s.equipped.indexOf(id);if(at<0)return false;s.equipped.splice(at,1);return true;}
export const acknowledgeDemo=(s,id)=>{s.pendingDemos=s.pendingDemos.filter(t=>t!==id);};
// Opponents are fixed by dojo, independent of every player's progress.
export const RANKS=['入門','初級','中級','上級','師範','達人'];
export function journeyRank(s){const effective=COUNTRIES.reduce((n,c)=>n+courseWonCount(s,c.id),0);return Math.min(RANKS.length-1,Math.max(s.legacyRankFloor||0,Math.floor(effective/COURSE_COUNT)));}
const STYLES={
 jp:['balanced','outside','counter'],th:['balanced','pressure','counter'],
 br:['balanced','pressure','counter'],kr:['balanced','outside','counter'],
 fr:['balanced','pressure','counter'],us:['balanced','pressure','counter']
};
export function baseOpponents(s){
 const c=COUNTRIES.find(c=>c.id===s.country),utility=DEFENSE_REWARD[c.id]??EXTRA_DEFENSE[c.id];const sets=[['jab','frontkick'],['jab','frontkick'],['jab','frontkick',c.moves[0],'guard'],['cross','jab'],['lowkick','frontkick'],['cross','frontkick',utility],['cross','frontkick','guard'],['sidekick','frontkick'],['jab','frontkick',c.moves[1],'guard','sway'],['jab','cross','sway'],['cross','lowkick','jumpkick'],[c.moves[2],c.moves[0],c.moves[1],'jab','guard','sway','jump','crouch'],[EXTRA_LESSONS[c.id]?.skill,'jab','frontkick',c.moves[0],'guard']];
 const names=['夕暮れの路地','広場の挑戦者','','橋のたもと','市場の腕試し','','石畳の通り','街角の間合い','','駅前の手数','広場の総仕上げ',''];
 return [...COURSE_ROLES,...(EXTRA_LESSONS[c.id]?['extra-defense-or-strike']:[])].map((role,index)=>{const id=courseId(c.id,index),rewardMoves=rewardsForDojo(id),lesson=LESSON_INDICES.indexOf(index),kind=venueKind(index),place=index===12?EXTRA_LESSONS[c.id].place:kind==='dojo'?(lesson===0?c.places[0].replace(/ジム$/,'道場'):lesson===1?`${c.city}・守りの道場`:lesson===2?c.places[1].replace(/ジム$/,'道場'):c.places[2].replace(/ジム$/,'道場')):`${c.city}・${names[index]}`;const countryIndex=[s.journeyStart??s.visited?.[0]??s.country,...COUNTRIES.map(x=>x.id).filter(id=>id!==(s.journeyStart??s.visited?.[0]??s.country))].indexOf(c.id),allocation=enemyAbilities(index,countryIndex),points=dojoAbilityPoints(allocation.points,index,countryIndex),a=abilityStats(points);return{appearance:opponentAppearance(id),abilityType:allocation.label,abilityPoints:points,id,name:index===12?EXTRA_LESSONS[c.id].name:opponentName(id),place,tier:index,index,rank:0,rankName:RANKS[0],role,venueKind:kind,practice:kind==='street',rewardMove:rewardMoves[0]??null,rewardMoves,hp:a.maxHp,maxHp:a.maxHp,power:a.power*(index===0?FIRST_DOJO.power:1),defense:index===0?FIRST_DOJO.defense:1,speed:a.speed,maxStamina:a.maxStamina,initialStamina:a.maxStamina,openingLesson:index===0,strategy:index===0?'pressure':index%4===0?'counter':index%4===1?'pressure':index%4===2?'outside':'balanced',...(c.theme?{martialArt:c.martialArt,combatTheme:c.theme}:{}),...countryTacticalProfile(c,index,kind),techniques:limitLoadout(countryTacticalKit(c,index,countryKit(c,index,sets[index]),rewardMoves).filter(availableIn2D)),reward:kind==='dojo'?35:20};});
}
export function opponents(s){const base=baseOpponents(s),country=COUNTRIES.find(c=>c.id===s.country);return [...base.map(o=>({...o,level:opponentLevel(o)})),...countryRivals(s,country,baseOpponents({country:s.country,journeyStart:'jp',wins:[]}))];}
export function player(s){
 // HP follows allocated stamina points; SP use never changes maximum HP.
 // Victories/mastery no longer add hidden HP or defense bonuses.
 const a=abilityStats(s.abilities?.spent??freshAbilities().spent);
 return {appearance:s.appearance??null,fightStyle:s.fightStyle??'balanced',name:s.name,hp:a.maxHp,maxHp:a.maxHp,power:a.power,maxStamina:a.maxStamina,
  defense:1,speed:a.speed,techniques:limitLoadout(s.equipped??s.known,s.known).filter(availableIn2D)};
}
export function prepareFight(s,opponent){
 opponent=opponents(s).find(o=>canonicalDojo(o.id)===canonicalDojo(opponent?.id));if(!opponent)return null;
 if(!dojoUnlocked(s,opponent?.id)||!rewardsForDojo(opponent?.id)||!canonicalDojo(opponent.id).startsWith(s.country+'-')||!Number.isSafeInteger(s.nextId)||s.nextId<1||s.nextId===Number.MAX_SAFE_INTEGER)return null;
 return {id:s.nextId++,experienceRevision:1,country:s.country,rosterRevision:WORLD_ROSTER_REVISION,courseRevision:COURSE_REVISION,opponent,seed:521+s.nextId*317,strategy:s.fightStyle??'balanced',player:player(s)};
}
export function settleFight(s,ticket,battle){
 const fightCountry=ticket?.country??canonicalDojo(ticket?.opponent?.id)?.split('-')[0];
 if(!battle?.done||!['player','opponent','draw'].includes(battle.winner)||!Number.isSafeInteger(ticket?.id)||ticket.id<1||ticket.id!==s.nextId-1||s.rewarded.includes(ticket.id)||!rewardsForDojo(ticket.opponent?.id)||!COUNTRIES.some(c=>c.id===fightCountry)||fightCountry!==s.country||!canonicalDojo(ticket.opponent.id).startsWith(fightCountry+'-'))return null;
 s.records=normalizeFightRecords(s,COUNTRIES.map(c=>c.id),s.wins.map(canonicalDojo).filter(id=>rewardsForDojo(id)!==null));
 const official=opponents({...s,country:fightCountry}).find(o=>canonicalDojo(o.id)===canonicalDojo(ticket.opponent.id));if(!official)return null;
 const freshWin=battle.winner==='player'&&!hasWon(s,official.id),xp=ticket.experienceRevision===1?fightExperience(opponentLevel(official),battle.winner,freshWin):legacyFightExperience(s);
 if(!planExperience(s,xp)||!recordFinishedFight(s.records,ticket.id,fightCountry,battle.winner))return null;
 ensureGrowth(s);const before=player(s);
 s.rewarded.push(ticket.id);s.fights++;
 const win=battle.winner==='player',fresh=win&&!hasWon(s,ticket.opponent.id);
 const oldPending=!!s.pendingResult&&s.pendingResult.ticket?.id===ticket.id&&s.pendingResult.ticket.legacyCourseReward===true&&ticket.courseRevision!==COURSE_REVISION;
 const officialRewards=rewardsForDojo(ticket.opponent.id,oldPending?1:COURSE_REVISION,s.pendingResult?.ticket?.id===ticket.id?(ticket.rosterRevision??1):WORLD_ROSTER_REVISION);
 const learnedSkills=win?learn(s,officialRewards.filter(id=>!s.known.includes(id))):[];
 const learned=learnedSkills[0]??null;
 const reward=win?(fresh?(parseRival(official.id)?official.reward:officialRewards.length?35:20):10):10;s.money+=reward;
 // Keep historical mastery without allowing losses/replays to farm attributes.
 s.mastery+=win?(fresh?3:1):2;
 if(fresh)s.wins.push(ticket.opponent.id);
 const growth=awardExperience(s,xp),abilityPoints=growth.points,levelUp=growth.levelUp;
 if((ticket.rosterRevision??1)<3&&baseComplete(s,fightCountry)&&!s.rosterTravelRights.includes(fightCountry))s.rosterTravelRights.push(fightCountry);
 const completed=countryComplete(s,fightCountry);
 if(countryComplete(s,fightCountry)&&!s.titles.includes(fightCountry))s.titles.push(fightCountry);
 const after=player(s),improved=['maxHp','power','defense','speed'].some(k=>after[k]>before[k]);
 return {xp,win,draw:battle.winner==='draw',country:fightCountry,fresh,reward,abilityPoints,levelUp,level:s.abilities.level,abilityCap:false,abilityProgress:s.abilities.progress,learned,learnedSkills,autoEquipped:learnedSkills.filter(id=>s.equipped.includes(id)),waitingEquip:learnedSkills.filter(id=>!s.equipped.includes(id)),completed,improved};
}
export function travelEligibility(s,id){if(id===s.country||!COUNTRIES.some(c=>c.id===id))return{ok:false,reason:'current'};const visited=s.visited.includes(id),cost=visited?0:45;if(s.pendingResult)return{ok:false,cost,reason:'battle'};return{ok:s.money>=cost,cost,reason:s.money>=cost?null:'money'};}
export function travel(s,id){const x=travelEligibility(s,id);if(!x.ok)return false;s.money-=x.cost;s.country=id;if(!s.visited.includes(id))s.visited.push(id);return true;}
