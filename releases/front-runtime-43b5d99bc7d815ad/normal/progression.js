import {assertMainRuntimeState,resolveBattleRuntime,BATTLE_REVISIONS} from './battle-runtime-contract.js';
import{freshTournamentGrowth,validTournamentGrowth,freshTournamentEvents,validTournamentEvents,TOURNAMENT_CATALOG,validTournamentEventEntries}from'./tournament-growth.js';
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
import {COURSE_COUNT,courseCount,EXTRA_LESSONS,COURSE_REVISION,LESSON_INDICES,venueKind,COURSE_ROLES,DEFENSE_REWARD,courseId,courseIds,courseIndex} from './course-layout.js';
export{COURSE_COUNT,courseCount,courseId,courseIds,courseIndex};
import {FIRST_DOJO} from './first-dojo.js';
import {TUTORIAL_FIGHT2_ID,TUTORIAL_RIVAL_ID,normalizeTutorial,tutorialActive,tutorialOpponents,tutorialOpponentUnlocked} from './tutorial.js';
import {TECHNIQUES,SKILL_LIMITS,skillCategory,limitLoadout,availableIn2D} from './engine.js';
export const COUNTRIES=[{id:'jp',name:'日本',city:'京都',color:'#e9bb7b',places:['東京・下町道場','大阪・河岸の道場','沖縄・海辺の道場'],moves:['cross','sidekick','lowkick']},{id:'th',name:'タイ',city:'バンコク',color:'#e89863',places:['バンコク・路地のジム','チェンマイ・山の道場','プーケット・浜辺の道場'],moves:['knee','lowkick','cross']},{id:'br',name:'ブラジル',city:'リオ',color:'#89bc95',places:['リオ・丘の道場','サンパウロ・街の道場','サルヴァドール・海の道場'],moves:['knee','crouchpunch','crouchlowkick']},{id:'kr',name:'韓国',city:'ソウル',color:'#8cb5d3',places:['ソウル・古都の道場','釜山・港の道場','済州・島の道場'],moves:['sidekick','jumpkick','frontkick']},{id:'fr',name:'フランス',city:'パリ',color:'#b6a1ce',places:['パリ・路地のジム','リヨン・川辺のジム','マルセイユ・港のジム'],moves:['cross','sidekick','crouchpunch']},{id:'us',name:'アメリカ',city:'ニューヨーク',color:'#df987b',places:['ニューヨーク・街のジム','シカゴ・倉庫のジム','ロサンゼルス・海のジム'],moves:['cross','crouchpunch','forwardjumpkick']}];
COUNTRIES.push(...EXTRA_COUNTRIES);
export const totalCourseCount=()=>COUNTRIES.length*COURSE_COUNT+Object.keys(EXTRA_LESSONS).length;
// World35 (rig20): designated learn sources, added-country ability tables and the final-technique gate.
const WORLD35_REWARDS={'jp-stage-2':'guard','jp-dojo-1':'cross','jp-stage-10':'crouch','th-stage-3':'lowkick','in-dojo-1':'pushkick','my-stage-2':'dutchlow','kz-stage-10':'elbow','kh-dojo-2':'bolopunch','tr-stage-8':'spear','ie-stage-8':'jumpkick','es-dojo-2':'horizontalelbow','eg-dojo-0':'bodyuppercut','tn-stage-5':'backfist','mx-stage-10':'axekick','cl-dojo-1':'uppercut','nz-stage-11':'forwardjumpkick'};
const WORLD35_FINAL_REQUIRES=['guard','cross','crouch','lowkick','sway','sidekick','jump','knee','hook','midguard','lowguard','crouchpunch','crouchlowkick','pushkick','dutchlow','elbow','bolopunch','spear','jumpkick','horizontalelbow','bodyuppercut','backfist','axekick','uppercut'];
const WORLD35_POINTS={in:[{power:48,speed:29,stamina:28},{power:29,speed:29,stamina:48},{power:29,speed:49,stamina:29},{power:49,speed:29,stamina:29},{power:30,speed:29,stamina:49},{power:29,speed:50,stamina:30},{power:50,speed:30,stamina:30},{power:30,speed:30,stamina:50},{power:30,speed:50,stamina:31},{power:51,speed:31,stamina:30},{power:31,speed:30,stamina:51},{power:31,speed:51,stamina:31}],id:[{power:52,speed:31,stamina:31},{power:31,speed:31,stamina:52},{power:31,speed:52,stamina:32},{power:53,speed:32,stamina:31},{power:32,speed:32,stamina:53},{power:32,speed:53,stamina:32},{power:54,speed:32,stamina:32},{power:33,speed:32,stamina:54},{power:32,speed:54,stamina:33},{power:54,speed:33,stamina:33},{power:33,speed:33,stamina:55},{power:33,speed:55,stamina:34}],my:[{power:55,speed:34,stamina:33},{power:34,speed:33,stamina:56},{power:34,speed:56,stamina:34},{power:56,speed:34,stamina:34},{power:34,speed:34,stamina:57},{power:34,speed:57,stamina:35},{power:57,speed:35,stamina:34},{power:35,speed:34,stamina:58},{power:35,speed:58,stamina:35},{power:59,speed:35,stamina:35},{power:35,speed:35,stamina:59},{power:35,speed:59,stamina:36}],kz:[{power:59,speed:36,stamina:36},{power:36,speed:36,stamina:59},{power:36,speed:60,stamina:36},{power:60,speed:37,stamina:36},{power:37,speed:36,stamina:60},{power:36,speed:61,stamina:37},{power:61,speed:37,stamina:37},{power:37,speed:37,stamina:62},{power:37,speed:62,stamina:37},{power:62,speed:38,stamina:37},{power:38,speed:37,stamina:63},{power:37,speed:63,stamina:38}],uz:[{power:63,speed:38,stamina:38},{power:39,speed:38,stamina:63},{power:38,speed:64,stamina:39},{power:64,speed:39,stamina:38},{power:39,speed:39,stamina:64},{power:39,speed:65,stamina:39},{power:65,speed:39,stamina:39},{power:40,speed:39,stamina:65},{power:39,speed:66,stamina:40},{power:66,speed:40,stamina:39},{power:40,speed:40,stamina:66},{power:40,speed:67,stamina:40}],kh:[{power:67,speed:41,stamina:40},{power:41,speed:40,stamina:67},{power:40,speed:68,stamina:41},{power:68,speed:41,stamina:41},{power:41,speed:41,stamina:68},{power:41,speed:68,stamina:42},{power:69,speed:42,stamina:41},{power:42,speed:42,stamina:69},{power:42,speed:69,stamina:42},{power:70,speed:42,stamina:42},{power:43,speed:42,stamina:70},{power:42,speed:70,stamina:43}],ir:[{power:71,speed:43,stamina:42},{power:43,speed:43,stamina:71},{power:43,speed:71,stamina:43},{power:72,speed:43,stamina:43},{power:44,speed:43,stamina:72},{power:44,speed:72,stamina:44},{power:72,speed:44,stamina:44},{power:44,speed:44,stamina:73},{power:44,speed:73,stamina:45},{power:73,speed:45,stamina:44},{power:45,speed:44,stamina:74},{power:45,speed:74,stamina:45}],tr:[{power:74,speed:45,stamina:45},{power:45,speed:45,stamina:75},{power:45,speed:75,stamina:46},{power:76,speed:46,stamina:45},{power:46,speed:45,stamina:76},{power:46,speed:76,stamina:46},{power:77,speed:46,stamina:46},{power:46,speed:46,stamina:77},{power:46,speed:77,stamina:47},{power:77,speed:47,stamina:47},{power:47,speed:47,stamina:78},{power:47,speed:78,stamina:47}],gb:[{power:78,speed:48,stamina:47},{power:48,speed:47,stamina:79},{power:47,speed:79,stamina:48},{power:79,speed:48,stamina:48},{power:48,speed:48,stamina:80},{power:48,speed:80,stamina:48},{power:80,speed:49,stamina:48},{power:49,speed:48,stamina:81},{power:49,speed:81,stamina:49},{power:81,speed:49,stamina:49},{power:50,speed:49,stamina:81},{power:49,speed:82,stamina:50}],ie:[{power:82,speed:50,stamina:49},{power:50,speed:50,stamina:82},{power:50,speed:83,stamina:50},{power:83,speed:51,stamina:50},{power:51,speed:50,stamina:83},{power:50,speed:84,stamina:51},{power:84,speed:51,stamina:51},{power:51,speed:51,stamina:84},{power:51,speed:85,stamina:51},{power:85,speed:52,stamina:51},{power:52,speed:51,stamina:85},{power:51,speed:86,stamina:52}],de:[{power:86,speed:52,stamina:52},{power:53,speed:52,stamina:86},{power:52,speed:86,stamina:53},{power:87,speed:53,stamina:52},{power:53,speed:53,stamina:87},{power:53,speed:87,stamina:53},{power:88,speed:53,stamina:53},{power:54,speed:53,stamina:88},{power:53,speed:88,stamina:54},{power:89,speed:54,stamina:53},{power:54,speed:54,stamina:89},{power:54,speed:90,stamina:54}],es:[{power:90,speed:54,stamina:54},{power:55,speed:54,stamina:90},{power:55,speed:90,stamina:55},{power:90,speed:55,stamina:55},{power:55,speed:55,stamina:91},{power:55,speed:91,stamina:56},{power:92,speed:56,stamina:55},{power:56,speed:55,stamina:92},{power:56,speed:92,stamina:56},{power:93,speed:56,stamina:56},{power:56,speed:56,stamina:93},{power:56,speed:93,stamina:57}],it:[{power:94,speed:57,stamina:56},{power:57,speed:56,stamina:94},{power:57,speed:94,stamina:57},{power:95,speed:57,stamina:57},{power:58,speed:57,stamina:95},{power:57,speed:95,stamina:58},{power:95,speed:58,stamina:58},{power:58,speed:58,stamina:96},{power:58,speed:96,stamina:58},{power:96,speed:59,stamina:58},{power:59,speed:58,stamina:97},{power:59,speed:97,stamina:59}],gh:[{power:97,speed:59,stamina:59},{power:59,speed:59,stamina:98},{power:59,speed:98,stamina:60},{power:98,speed:60,stamina:59},{power:60,speed:59,stamina:99},{power:60,speed:99,stamina:60},{power:99,speed:60,stamina:60},{power:61,speed:60,stamina:99},{power:60,speed:100,stamina:61},{power:100,speed:61,stamina:61},{power:61,speed:61,stamina:100},{power:61,speed:101,stamina:61}],eg:[{power:101,speed:62,stamina:61},{power:62,speed:61,stamina:101},{power:61,speed:102,stamina:62},{power:102,speed:62,stamina:62},{power:62,speed:62,stamina:102},{power:62,speed:103,stamina:62},{power:103,speed:63,stamina:62},{power:63,speed:62,stamina:104},{power:62,speed:104,stamina:63},{power:104,speed:63,stamina:63},{power:64,speed:63,stamina:104},{power:63,speed:104,stamina:64}],ci:[{power:105,speed:64,stamina:63},{power:64,speed:64,stamina:105},{power:64,speed:106,stamina:64},{power:106,speed:64,stamina:64},{power:65,speed:64,stamina:106},{power:64,speed:107,stamina:65},{power:107,speed:65,stamina:64},{power:65,speed:65,stamina:107},{power:65,speed:108,stamina:65},{power:108,speed:65,stamina:65},{power:66,speed:65,stamina:108},{power:66,speed:108,stamina:66}],tn:[{power:109,speed:66,stamina:66},{power:66,speed:66,stamina:109},{power:66,speed:109,stamina:67},{power:110,speed:67,stamina:66},{power:67,speed:66,stamina:110},{power:67,speed:110,stamina:67},{power:111,speed:67,stamina:67},{power:68,speed:67,stamina:111},{power:67,speed:111,stamina:68},{power:112,speed:68,stamina:67},{power:68,speed:68,stamina:112},{power:68,speed:112,stamina:68}],ca:[{power:113,speed:68,stamina:68},{power:69,speed:68,stamina:113},{power:68,speed:113,stamina:69},{power:113,speed:69,stamina:69},{power:69,speed:69,stamina:114},{power:69,speed:114,stamina:70},{power:114,speed:70,stamina:69},{power:70,speed:69,stamina:115},{power:70,speed:115,stamina:70},{power:115,speed:70,stamina:70},{power:70,speed:70,stamina:116},{power:70,speed:116,stamina:71}],mx:[{power:116,speed:71,stamina:70},{power:71,speed:70,stamina:117},{power:71,speed:117,stamina:71},{power:117,speed:72,stamina:71},{power:72,speed:71,stamina:117},{power:71,speed:118,stamina:72},{power:118,speed:72,stamina:72},{power:72,speed:72,stamina:118},{power:72,speed:119,stamina:72},{power:119,speed:73,stamina:72},{power:73,speed:72,stamina:120},{power:72,speed:120,stamina:73}],cu:[{power:120,speed:73,stamina:73},{power:73,speed:73,stamina:121},{power:73,speed:121,stamina:73},{power:121,speed:74,stamina:73},{power:74,speed:73,stamina:122},{power:73,speed:122,stamina:74},{power:122,speed:74,stamina:74},{power:75,speed:74,stamina:122},{power:74,speed:123,stamina:75},{power:123,speed:75,stamina:74},{power:75,speed:75,stamina:123},{power:75,speed:124,stamina:75}],ar:[{power:124,speed:75,stamina:75},{power:76,speed:75,stamina:124},{power:75,speed:125,stamina:76},{power:125,speed:76,stamina:76},{power:76,speed:76,stamina:125},{power:76,speed:126,stamina:76},{power:126,speed:77,stamina:76},{power:77,speed:76,stamina:126},{power:77,speed:126,stamina:77},{power:127,speed:77,stamina:77},{power:77,speed:77,stamina:127},{power:77,speed:127,stamina:78}],cl:[{power:128,speed:78,stamina:77},{power:78,speed:78,stamina:128},{power:78,speed:128,stamina:78},{power:129,speed:78,stamina:78},{power:79,speed:78,stamina:129},{power:78,speed:129,stamina:79},{power:130,speed:79,stamina:78},{power:79,speed:79,stamina:130},{power:79,speed:130,stamina:79},{power:131,speed:79,stamina:79},{power:80,speed:79,stamina:131},{power:80,speed:131,stamina:80}],au:[{power:131,speed:80,stamina:80},{power:80,speed:80,stamina:132},{power:80,speed:132,stamina:81},{power:132,speed:81,stamina:80},{power:81,speed:80,stamina:133},{power:81,speed:133,stamina:81},{power:134,speed:81,stamina:81},{power:81,speed:81,stamina:134},{power:81,speed:134,stamina:82},{power:135,speed:82,stamina:81},{power:82,speed:81,stamina:135},{power:82,speed:135,stamina:82}],nz:[{power:135,speed:83,stamina:82},{power:83,speed:82,stamina:135},{power:82,speed:136,stamina:83},{power:136,speed:83,stamina:83},{power:83,speed:83,stamina:137},{power:83,speed:137,stamina:83},{power:137,speed:84,stamina:83},{power:84,speed:83,stamina:138},{power:83,speed:138,stamina:84},{power:138,speed:84,stamina:84},{power:84,speed:84,stamina:139},{power:84,speed:140,stamina:85}]};
const WORLD35_TYPES={in:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],id:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],my:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],kz:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],uz:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],kh:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],ir:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],tr:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],gb:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],ie:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],de:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],es:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],it:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],gh:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],eg:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],ci:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],tn:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],ca:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],mx:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],cu:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],ar:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],cl:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],au:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型'],nz:['強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型','強打型','速攻型','持久型']};

import{ACTIVE_SAVE_KEY}from'./save-profile.js';
export const SAVE_KEY=ACTIVE_SAVE_KEY;
export const GROWTH_RULES=Object.freeze({hpPerFirstWin:0,powerPerFirstWin:0,defensePerFirstWin:0,speedPerFirstWin:0});
const freshGrowth=()=>({rule:3});
// In-page cups (rig22): career counters and the active run live in the main
// save; the former standalone cup page is no longer the source of truth.
const freshCupCareer=()=>({completed:0,nextGrandAt:0,serial:1,champions:[],eventEntries:[]});
function validCupCareer(c){return c&&Number.isSafeInteger(c.completed)&&c.completed>=0&&Number.isSafeInteger(c.nextGrandAt)&&c.nextGrandAt>=0&&Number.isSafeInteger(c.serial)&&c.serial>=1&&Array.isArray(c.champions)&&c.champions.every(id=>Object.hasOwn(TOURNAMENT_CATALOG,id))&&validTournamentEventEntries(c.eventEntries??[]);}
const validCupEntrant=e=>e&&typeof e.id==='string'&&typeof e.name==='string'&&e.points&&['power','speed','stamina'].every(k=>Number.isSafeInteger(e.points[k])&&e.points[k]>=0)&&Array.isArray(e.equipped)&&e.equipped.every(x=>typeof x==='string')&&typeof e.style==='string';
function validCupRun(r){if(r==null)return true;return typeof r==='object'&&/^cup-\d+$/.test(r.id??'')&&Object.hasOwn(TOURNAMENT_CATALOG,r.mode)&&Number.isSafeInteger(r.round)&&r.round>=0&&r.round<=(r.mode==='grand'?3:2)&&Number.isSafeInteger(r.wins)&&r.wins>=0&&r.wins<=4&&['prepare','between','battle','finished'].includes(r.status)&&Array.isArray(r.entrants)&&(r.mode==='grand'?r.entrants.length===16:r.entrants.length===4)&&r.entrants.every(validCupEntrant)&&(r.mode!=='grand'||(Array.isArray(r.ids)&&r.ids.length>=1&&r.ids.every(id=>r.entrants.some(e=>e.id===id))))&&Array.isArray(r.results);}
export function newGame(country='jp'){return {version:9,tournamentEvents:freshTournamentEvents(),tournamentGrowth:freshTournamentGrowth(),cupCareer:freshCupCareer(),cupRun:null,experience:freshExperience(),localTraining:freshLocalTraining(),records:freshFightRecords(),rosterTravelRights:[],rosterRevision:WORLD_ROSTER_REVISION,fightStyle:'balanced',journeyStart:country,growth:freshGrowth(),abilities:freshAbilities(),courseRevision:COURSE_REVISION,legacyClears:[],legacyRankFloor:0,legacyFreeTravel:false,retiredSkills:[],pendingResult:null,country,visited:[country],money:0,mastery:0,known:['jab','frontkick'],equipped:['jab','frontkick'],pendingDemos:[],wins:[],titles:[],fights:0,nextId:1,rewarded:[],name:'旅する拳士',migrated:false,appearance:null,tutorial:null};}
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
function baseRewardsForDojo(id,revision=COURSE_REVISION,roster=WORLD_ROSTER_REVISION,split=true){if(id===TUTORIAL_FIGHT2_ID)return[];if(id===TUTORIAL_RIVAL_ID)return['cross'];const rival=parseRival(id);if(rival&&COUNTRIES.some(c=>c.id===rival.country))return !ADVANCED_LESSONS.length?[]:rivalLessons(rival.country,createCountryRival(COUNTRIES.find(c=>c.id===rival.country),rival.ordinal,baseOpponents({country:rival.country,journeyStart:'jp',wins:[]})).level);const canonical=canonicalDojo(id),index=courseIndex(canonical),c=COUNTRIES.find(c=>canonical?.startsWith(c.id+'-'));if(!c||index<0)return null;if(revision!==1)return WORLD35_REWARDS[canonical]?[WORLD35_REWARDS[canonical]]:[];if(index===12)return[EXTRA_LESSONS[c.id].skill];const lesson=[0,3,6,9].indexOf(index);return lesson<0?[]:[c.moves[0],DEFENSE_REWARD[c.id]??EXTRA_DEFENSE[c.id],c.moves[1],c.id==='kr'&&roster===2?'axekick':c.id==='us'&&!split?'jumpkick':c.moves[2]].slice(lesson,lesson+1);}
// Restore the three historical hook lessons without replacing current rewards.
const HOOK_LESSONS=[{country:'th',current:'th-stage-11',legacy:'th-dojo-2'},{country:'fr',current:'fr-stage-8',legacy:'fr-dojo-1'},{country:'us',current:'us-stage-8',legacy:'us-dojo-1'}];
function rewardsForDojo(id,revision=COURSE_REVISION,roster=WORLD_ROSTER_REVISION,split=true,hookEnabled=true){return baseRewardsForDojo(id,revision,roster,split);}
function earnedHistoricalHook(s,previousVersion=s.version){return HOOK_LESSONS.some(r=>hasWon(s,r.current)||(s.courseRevision===undefined||s.courseRevision===1||previousVersion<6||s.legacyFreeTravel===true)&&hasWon(s,r.legacy)||s.legacyClears?.includes(r.country));}
export function nextDojoRewards(s,id){return(rewardsForDojo(id)||[]).filter(x=>!s.known.includes(x));}
const baseComplete=(s,id)=>s.legacyClears?.includes(id)||courseIds(id).slice(0,COURSE_COUNT).every(x=>hasWon(s,x));
export const countryComplete=(s,id)=>baseComplete(s,id)&&courseIds(id).slice(COURSE_COUNT).filter(x=>x!=='us-stage-12').every(x=>hasWon(s,x));
export function dojoUnlocked(s,id){const rival=parseRival(id);if(rival)return COUNTRIES.some(c=>c.id===rival.country)&&countryComplete(s,rival.country)&&(rival.ordinal===1||hasWon(s,`${rival.country}-rival-${rival.ordinal-1}`));if(id===TUTORIAL_FIGHT2_ID||id===TUTORIAL_RIVAL_ID)return tutorialOpponentUnlocked(s,id);const canonical=canonicalDojo(id),i=courseIndex(canonical),c=COUNTRIES.find(c=>canonical?.startsWith(c.id+'-'));if(tutorialActive(s)&&s.country==='jp'&&c?.id==='jp'&&i>=0)return s.tutorial.step==='fight1'&&canonical==='jp-dojo-0';return!!c&&i>=0&&(hasWon(s,canonical)||(i<COURSE_COUNT&&s.legacyClears?.includes(c.id))||courseIds(c.id).slice(0,i).every(x=>hasWon(s,x)||(s.legacyClears?.includes(c.id)&&courseIndex(x)<COURSE_COUNT)));}
export const courseWonCount=(s,id)=>courseIds(id).filter(x=>hasWon(s,x)||(s.legacyClears?.includes(id)&&courseIndex(x)<COURSE_COUNT)).length;
function learn(s,ids,{autoEquip=true}={}){
 const learned=[];
 for(const id of Array.isArray(ids)?ids:[])if(TECHNIQUES.some(t=>t.id===id)&&!s.known.includes(id)){
  s.known.push(id);if(['jumpkick','forwardjumpkick'].includes(id))s.version=11;learned.push(id);if(!s.pendingDemos.includes(id))s.pendingDemos.push(id);
  const cat=skillCategory(id);if(autoEquip&&id!=='hook'&&!TECHNIQUES.find(t=>t.id===id)?.manualEquip&&availableIn2D(id)&&s.equipped.filter(i=>skillCategory(i)===cat).length<SKILL_LIMITS[cat])s.equipped.push(id);
 }
 return learned;
}
export function loadSave(raw){try{
 const s=JSON.parse(raw);assertMainRuntimeState(s,{bindPublic:true});
 if(!s||![1,2,3,4,5,6,7,8,9,10,11].includes(s.version)||!COUNTRIES.some(c=>c.id===s.country)||!Number.isFinite(s.money)||s.money<0||!Number.isFinite(s.mastery)||s.mastery<0||!['visited','known','wins','titles','rewarded'].every(k=>Array.isArray(s[k]))||!Number.isSafeInteger(s.fights)||s.fights<0||!Number.isSafeInteger(s.nextId)||s.nextId<1)return null;
 if(s.rosterRevision!==undefined&&![1,2,WORLD_ROSTER_REVISION].includes(s.rosterRevision))return null;
 if(s.courseRevision!==undefined&&![1,COURSE_REVISION].includes(s.courseRevision))return null;
 const rosterUpgrade=s.rosterRevision!==WORLD_ROSTER_REVISION,previousVersion=s.version,courseUpgrade=s.courseRevision!==COURSE_REVISION,growthUpgrade=s.growth?.rule!==3||s.version<7,old=s.version<3,retiredUpgrade=s.version<4,upgrade=s.version<5,removed=s.known.filter(id=>RETIRED_REWARDS.some(r=>r.old===id));if(previousVersion<11&&s.known.includes('jumpkick')){if(!s.known.includes('forwardjumpkick'))s.known.push('forwardjumpkick');s.migrated=true;}s.version=previousVersion===11||s.known.some(id=>['jumpkick','forwardjumpkick'].includes(id))?11:previousVersion===10||s.known.includes('backfist')?10:9;
 // Restore earned hook ownership after reactivation without changing chosen equipment.
 const restoredHook=Array.isArray(s.retiredSkills)&&s.retiredSkills.includes('hook')||earnedHistoricalHook(s,previousVersion);
 s.retiredSkills=[...new Set((Array.isArray(s.retiredSkills)?s.retiredSkills:[]).filter(id=>id!=='hook'))];
 s.known=[...new Set(['jab','frontkick',...s.known.filter(id=>TECHNIQUES.some(t=>t.id===id)),...(restoredHook?['hook']:[])])];
 // v1 equipment used a different budget; v2 had no equipment. Fill from known
 // once on upgrade, while v3/v4 preserve deliberate selections and empty slots.
 s.equipped=limitLoadout(old?s.known.filter(id=>!NEW_POSTURE_SKILLS.has(id)&&(id!=='hook'||s.equipped?.includes('hook'))):s.equipped,s.known);
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
 if(s.cupCareer!==undefined&&!validCupCareer(s.cupCareer))return null;
 s.cupCareer??=freshCupCareer();
 s.cupRun??=null;
 if(!validCupRun(s.cupRun))s.cupRun=null;
 if(s.cupRun?.status==='battle')s.cupRun.status='prepare';
 // Historical fights are not retroactively consumed. New events begin after migration.
 s.tournamentEvents??=freshTournamentEvents(s.fights,`legacy-${s.fights}-${s.nextId}`);
 if(!validTournamentEvents(s.tournamentEvents,s.fights))return null;
 ensureGrowth(s);
 s.rosterTravelRights=[...new Set([...(Array.isArray(s.rosterTravelRights)?s.rosterTravelRights:[]),...(rosterUpgrade?COUNTRIES.filter(c=>baseComplete(s,c.id)).map(c=>c.id):[])])].filter(id=>COUNTRIES.some(c=>c.id===id));
 s.courseRevision=COURSE_REVISION;s.rosterRevision=WORLD_ROSTER_REVISION;
 s.appearance=s.appearance==null?null:normalizeAppearance(s.appearance);
 s.localTraining=normalizeLocalTraining(s);
 s.tutorial=normalizeTutorial(s.tutorial);
 s.migrated=rosterUpgrade||abilityUpgrade||previousVersion<6||upgrade||growthUpgrade||courseUpgrade||!!s.migrated;s.name=typeof s.name==='string'&&s.name.trim()?s.name:'旅する拳士';s.journeyStart=COUNTRIES.some(c=>c.id===s.journeyStart)?s.journeyStart:(s.visited[0]||s.country);s.fightStyle=['balanced','pressure','counter','outside'].includes(s.fightStyle)?s.fightStyle:'balanced';delete s.observed;delete s.strategy;delete s.practiceAt;
 return Object.fromEntries(Object.keys(newGame()).map(key=>[key,s[key]]));
 }catch(e){if(e?.unsupportedBattleRuntime)throw e;return null;}}
export const saveGame=s=>{if(s.known?.some(id=>['jumpkick','forwardjumpkick'].includes(id)))s.version=11;else if(s.known?.includes('backfist')&&s.version!==11)s.version=10;assertMainRuntimeState(s);return JSON.stringify(s);};
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
 return [...COURSE_ROLES,...(EXTRA_LESSONS[c.id]?['extra-defense-or-strike']:[])].map((role,index)=>{const id=courseId(c.id,index),rewardMoves=rewardsForDojo(id),lesson=LESSON_INDICES.indexOf(index),kind=venueKind(index),place=index===12?EXTRA_LESSONS[c.id].place:kind==='dojo'?(lesson===0?c.places[0].replace(/ジム$/,'道場'):lesson===1?`${c.city}・守りの道場`:lesson===2?c.places[1].replace(/ジム$/,'道場'):c.places[2].replace(/ジム$/,'道場')):`${c.city}・${names[index]}`;const countryIndex=[s.journeyStart??s.visited?.[0]??s.country,...COUNTRIES.map(x=>x.id).filter(id=>id!==(s.journeyStart??s.visited?.[0]??s.country))].indexOf(c.id),allocation=enemyAbilities(index,countryIndex),points=WORLD35_POINTS[c.id]?.[index]??dojoAbilityPoints(allocation.points,index,countryIndex),a=abilityStats(points);return{appearance:opponentAppearance(id),abilityType:WORLD35_TYPES[c.id]?.[index]??allocation.label,abilityPoints:points,id,name:index===12?EXTRA_LESSONS[c.id].name:opponentName(id),place,tier:index,index,rank:0,rankName:RANKS[0],role,venueKind:kind,practice:kind==='street',rewardMove:rewardMoves[0]??null,rewardMoves,hp:a.maxHp,maxHp:a.maxHp,power:a.power*(index===0?FIRST_DOJO.power:1),defense:index===0?FIRST_DOJO.defense:1,speed:a.speed,maxStamina:a.maxStamina,initialStamina:a.maxStamina,openingLesson:index===0,strategy:index===0?'pressure':index%4===0?'counter':index%4===1?'pressure':index%4===2?'outside':'balanced',...(c.theme?{martialArt:c.martialArt,combatTheme:c.theme}:{}),...countryTacticalProfile(c,index,kind),techniques:limitLoadout(countryTacticalKit(c,index,countryKit(c,index,sets[index]),rewardMoves).filter(availableIn2D)),reward:kind==='dojo'?35:20};});
}
export function opponents(s){const base=baseOpponents(s),country=COUNTRIES.find(c=>c.id===s.country);return [...base.map(o=>({...o,level:opponentLevel(o)})),...tutorialOpponents(s).map(o=>({...o,level:opponentLevel(o)})),...countryRivals(s,country,baseOpponents({country:s.country,journeyStart:'jp',wins:[]}))];}
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
 resolveBattleRuntime(battle,'normal');
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
 const officialRewards=rewardsForDojo(ticket.opponent.id,oldPending?1:COURSE_REVISION,s.pendingResult?.ticket?.id===ticket.id?(ticket.rosterRevision??1):WORLD_ROSTER_REVISION,battle.battleRuntimeRevision===BATTLE_REVISIONS.CURRENT,battle.battleRuntimeRevision===BATTLE_REVISIONS.CURRENT);
 const promised=battle.battleRuntimeRevision!==BATTLE_REVISIONS.CURRENT&&officialRewards.includes('jumpkick')?[...officialRewards,'forwardjumpkick']:officialRewards;
 const learnedSkills=win?learn(s,promised.filter(id=>!s.known.includes(id)&&(id!=='forwardjumpkick'||canonicalDojo(ticket.opponent.id)!=='nz-stage-11'||WORLD35_FINAL_REQUIRES.every(x=>s.known.includes(x))))):[];
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
