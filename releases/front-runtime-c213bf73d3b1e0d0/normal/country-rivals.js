import{abilityStats}from'./attributes.js';
import{opponentAppearance}from'./appearance.js';
import{COUNTRY_TACTICS}from'./world-countries.js';
import{availableIn2D,limitLoadout,TECHNIQUES}from'./engine.js';
// Stable country/ordinal identity; never read player level, money or world wins.
export const RIVAL_RULES=Object.freeze({revision:1,targetLevel:300,step:5,tailWindow:12});
export const rivalId=(country,ordinal)=>`${country}-rival-${ordinal}`;
export function parseRival(id){const m=typeof id==='string'&&id.match(/^([a-z]{2})-rival-([1-9]\d*)$/),ordinal=Number(m?.[2]);return m&&Number.isSafeInteger(ordinal)&&ordinal<=1000000000?{country:m[1],ordinal}:null;}
export const opponentLevel=o=>o.level??Math.max(1,Object.values(o.abilityPoints).reduce((a,b)=>a+b,0)-9);
// New optional US lesson must not rebase historical generated rival IDs/stats.
const historicalRivalBase=base=>base.filter(o=>o.id!=='us-stage-12');
export const rivalAnchor=base=>Math.max(...historicalRivalBase(base).map(opponentLevel));
export const rivalsThrough300=base=>Math.ceil((300-rivalAnchor(base))/5);
export function rivalLevel(base,ordinal){const end=rivalsThrough300(base);return ordinal>=end?300+(ordinal-end)*5:rivalAnchor(base)+ordinal*5;}
// Approved content can be appended here without changing IDs or any old lesson.
// Empty until individual techniques and motions have been selected and accepted.
// Candidate placement only: US巡回稽古 Lv50以上. No retroactive grant or automatic equip.
export const ADVANCED_LESSONS=Object.freeze([Object.freeze({country:'us',minLevel:50,skill:'bodyuppercut',provisional:true}),Object.freeze({country:'mm',minLevel:50,skill:'horizontalelbow',provisional:true}),Object.freeze({country:'ph',minLevel:50,skill:'backfist',provisional:true})]);
// Existing canonical techniques retain their historical 2D eligibility. New IDs
// need separate, reviewed motion acceptance, even if availableIn2D defaults true.
export const BASE_LESSON_TECHNIQUE_IDS=Object.freeze(["jab","frontkick","cross","hook","roundkick","sidekick","lowkick","knee","highkick","spinkick","jumpkick","crouchpunch","crouchlowkick","crouch","jump","guard","sway","pushkick","dutchlow","elbow","bolopunch","spear","axekick","midguard","lowguard"]);
export const APPROVED_ADVANCED_2D=Object.freeze(['bodyuppercut','horizontalelbow','backfist']);
export function lessonTechniqueAvailable(id,{techniques=TECHNIQUES,approvedAdvanced2D=APPROVED_ADVANCED_2D}={}){return techniques.some(t=>t.id===id)&&availableIn2D(id)&&(BASE_LESSON_TECHNIQUE_IDS.includes(id)||approvedAdvanced2D.includes(id));}
export const TECHNIQUE_LEVEL_BANDS=Object.freeze([{from:1,to:50},{from:51,to:100},{from:101,to:200},{from:201,to:300}].map(Object.freeze));
export function rivalLessons(country,level,lessons=ADVANCED_LESSONS){return lessons.filter(x=>x.country===country&&Number.isSafeInteger(x.minLevel)&&x.minLevel>=1&&x.minLevel<=level&&lessonTechniqueAvailable(x.skill)).map(x=>x.skill);}
export function createCountryRival(country,ordinal,base){
 base=historicalRivalBase(base);
 if(!parseRival(rivalId(country.id,ordinal)))return null;
 const level=rivalLevel(base,ordinal),total=level+9,type=(ordinal+base.length)%3,major=Math.ceil(total*.45),second=Math.ceil((total-major)/2),third=total-major-second;
 const values=[major,second,third],abilityPoints=Object.fromEntries(['power','speed','stamina'].map((k,i)=>[k,values[(i+type)%3]])),stats=abilityStats(abilityPoints),p=COUNTRY_TACTICS[country.id],id=rivalId(country.id,ordinal),rewardMoves=rivalLessons(country.id,level),strategy=['balanced','pressure','counter','outside'][ordinal%4];
 return{id,level,ordinal,index:base.length+ordinal-1,tier:base.length+ordinal-1,name:`${country.city}の拳士 ${ordinal}`,place:`${country.city}・巡回稽古 第${ordinal}戦`,appearance:opponentAppearance(id),abilityType:['強打型','速攻型','持久型'][type],abilityPoints,hp:stats.maxHp,maxHp:stats.maxHp,power:stats.power,defense:1,speed:stats.speed,maxStamina:stats.maxStamina,initialStamina:stats.maxStamina,strategy,curriculum:true,combatTheme:p.theme,tacticalLabel:p.label,tacticalHint:p.hint,techniques:limitLoadout([...rewardMoves,...p.kit].filter(availableIn2D)),role:'country-rival',venueKind:'street',practice:true,rank:0,rankName:'巡回稽古',rewardMove:rewardMoves[0]??null,rewardMoves,reward:20+Math.floor(level/10)};
}
export function countryRivals(s,country,base){
 const won=s.wins.map(parseRival).filter(x=>x?.country===country.id),last=won.reduce((n,x)=>Math.max(n,x.ordinal),0);
 // Prebuild through 300; retain a bounded tail and the next rival beyond it.
 // All earned IDs stay in the save; old future rivals remain reproducible by ID.
 const end=rivalsThrough300(base),next=Math.min(1000000000,last+1),tailStart=Math.max(end+1,next-RIVAL_RULES.tailWindow+1);
 const ordinals=[...Array.from({length:end},(_,i)=>i+1),...Array.from({length:Math.max(0,next-tailStart+1)},(_,i)=>tailStart+i)];
 return ordinals.map(n=>createCountryRival(country,n,base));
}
