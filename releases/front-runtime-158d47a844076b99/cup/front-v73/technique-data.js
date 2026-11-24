import {applyThreeTiming} from './approved-three-combat.js';
import{CHIN_UPPERCUT_TIMING}from'./chin-uppercut-motion.js';
import{EXPANSION_STRIKES}from'./expansion-strikes.js';
import{BODY_UPPERCUT_TIMING}from'./body-uppercut-motion.js';
import{FOUR_TRACE_GAME_RANGE,isFourTrace}from'./four-trace-motion.js';
import{WORLD_STRIKES}from'./world-strikes.js';
import {SPIN_TIMING} from './spin-timing.js';
import{ACCEPTED_TIMING}from'./accepted-motion.js';
export const TECHNIQUES = [
 {id:'jab',target:'body',swayable:true,name:'パンチ',style:'ボクシング',type:'punch',power:8,range:85,cost:6,windup:.13,recovery:.28,learnCost:0},
 {id:'frontkick',target:'body',swayable:false,name:'キック',style:'空手',type:'kick',power:12,range:128,cost:10,windup:.24,recovery:.4,learnCost:0},
 {id:'cross',target:'head',swayable:true,name:'ストレート',style:'ボクシング',type:'punch',power:15,range:95,cost:11,windup:.2,recovery:.4,learnCost:60},
 {id:'hook',target:'head',swayable:true,name:'フック',style:'ボクシング',type:'punch',power:19,range:75,cost:14,windup:.26,recovery:.45,learnCost:80},
 {id:'roundkick',target:'body',swayable:false,name:'回し蹴り',style:'空手',type:'kick',power:20,range:137,cost:15,windup:.31,recovery:.46,learnCost:75},
 {id:'sidekick',target:'body',swayable:false,name:'横蹴り',style:'空手',type:'kick',power:22,range:145,cost:17,...ACCEPTED_TIMING.sidekick,learnCost:95},
 {id:'lowkick',target:'leg',swayable:false,name:'ローキック',style:'ムエタイ',type:'kick',power:14,range:116,cost:10,windup:.2,recovery:.35,learnCost:60},
 {id:'knee',target:'body',swayable:false,name:'膝蹴り',style:'ムエタイ',type:'kick',power:24,range:65,cost:17,...ACCEPTED_TIMING.knee,learnCost:95},
 {id:'highkick',target:'head',swayable:true,name:'上段蹴り',style:'テコンドー',type:'kick',power:25,range:85,cost:19,windup:.38,recovery:.52,learnCost:110},
 {id:'spinkick',target:'body',swayable:false,name:'後ろ回し蹴り',style:'テコンドー',type:'kick',power:27,range:152,cost:22,windup:SPIN_TIMING.windup,active:SPIN_TIMING.active,recovery:SPIN_TIMING.recovery,learnCost:130},
 {id:'jumpkick',target:'head',swayable:true,postureKind:'jump',name:'ジャンプキック',style:'テコンドー',type:'kick',power:24,range:135,cost:21,windup:.40,active:.12,recovery:.56,learnCost:135,description:'跳び上がって頭部を蹴る。空中の攻撃中は脚部を回避するが、離陸と着地は無防備。'},
 {id:'crouchpunch',target:'body',swayable:false,postureKind:'crouch',name:'しゃがみボディーパンチ',style:'ボクシング',type:'punch',power:13,range:78,cost:10,windup:.25,active:.12,recovery:.36,learnCost:85,description:'低い姿勢から胴体へパンチ。攻撃中だけ頭部を回避する。胴体・脚部は守れない。'},
 {id:'crouchlowkick',target:'leg',swayable:false,postureKind:'crouch',name:'しゃがみ下段キック',style:'カポエイラ',type:'kick',power:16,range:112,cost:13,windup:.30,active:.12,recovery:.43,learnCost:95,description:'しゃがんで脚部を蹴る。攻撃中だけ頭部を回避する。立ち戻る間は無防備。'},
 {id:'crouch',postureKind:'crouch',name:'しゃがみ',style:'姿勢・回避',type:'evasion',power:0,range:0,cost:0,windup:.18,active:.28,recovery:.25,defenseCooldown:1.25,description:'頭を低くして頭部への打撃だけを回避。低くなる間と立ち戻り、胴体・脚部への攻撃には無防備。'},
 {id:'jump',postureKind:'jump',name:'ジャンプ',style:'姿勢・回避',type:'evasion',power:0,range:0,cost:0,windup:.14,active:.26,recovery:.42,defenseCooldown:1.45,description:'跳んで脚部への打撃だけを回避。離陸と着地、頭部・胴体への攻撃には無防備。'},
 {id:'guard',name:'上段ガード',style:'守備',type:'defense',power:0,range:0,cost:0,windup:.10,active:.42,recovery:.22,defenseCooldown:1.2,description:'頭部への打撃を両腕で受け、ダメージを約7割減らす。胴体・脚部への攻撃は防げない。'},
 {id:'sway',name:'スウェイ',style:'守備',type:'defense',power:0,range:0,cost:0,windup:.12,active:.30,recovery:.28,defenseCooldown:1.35,description:'上体を引いてパンチと上段蹴りを避ける。胴体・脚部への蹴りは避けられない。'}
];

TECHNIQUES.push(...Object.entries(WORLD_STRIKES).map(([id,m])=>({...(EXPANSION_STRIKES[id]??{}),id,name:m.name,target:m.target,type:EXPANSION_STRIKES[id]?.type??(['pushkick','dutchlow','axekick'].includes(id)?'kick':'punch'),style:EXPANSION_STRIKES[id]?.style??({pushkick:'散打',dutchlow:'ダッチキックボクシング',elbow:'ラウェイ',bolopunch:'ヤウヤン',spear:'ダンベ',axekick:'テコンドー'})[id],power:EXPANSION_STRIKES[id]?.power??({pushkick:18,dutchlow:15,elbow:18,bolopunch:17,spear:19,axekick:25})[id],range:EXPANSION_STRIKES[id]?.range??({pushkick:150,dutchlow:100,elbow:60,bolopunch:96,spear:94,axekick:80})[id],cost:EXPANSION_STRIKES[id]?.cost??({pushkick:14,dutchlow:12,elbow:14,bolopunch:13,spear:15,axekick:20})[id],windup:m.windup,active:m.active,recovery:m.recovery,swayable:m.target==='head'&&id!=='axekick',manualEquip:true,description:EXPANSION_STRIKES[id]?.description??({pushkick:'膝を畳んで足裏で胴体を押す。散打の打撃部分を横視点用に表現。投げは行わない。',dutchlow:'小さく踏み込んで脚部を蹴る。パンチ・ストレートと装備すると拳からローへつなぐ選択が増える。各技の消費・間合いは通常通り。',elbow:'腕を折り、肘を上から頭部へ振り下ろす近距離打撃。掴みや拘束は行わない。',bolopunch:'腕を下から斜めに振り上げる。ヤウヤンの角度のある腕技を横視点向けに簡略化したゲーム用表現。',spear:'後ろの主攻撃手を突き出し、反対手を前に残す。盾手は見た目の構えで、追加の自動防御はない。',axekick:'脚を高く上げ、踵を頭部へ上から落とす。上段ガードとしゃがみが有効。'})[id]})));
for(const t of TECHNIQUES)if(t.id==='sidekick')t.range=178;else if(t.id==='knee')t.range=175;

TECHNIQUES.push(
{id:'midguard',name:'中段ガード',style:'守備',type:'defense',power:0,range:0,cost:0,windup:.10,active:.42,recovery:.22,defenseCooldown:1.2,manualEquip:true,description:'両腕を胴体に寄せ、中段打撃のダメージを約7割軽減。頭部・脚部は守れない。'},
{id:'lowguard',name:'下段ガード',style:'守備',type:'defense',power:0,range:0,cost:0,windup:.10,active:.42,recovery:.22,defenseCooldown:1.2,manualEquip:true,description:'手前の脚を上げ、成立中だけ下段打撃を回避する。腕で脚をブロックしない。頭部・胴体、上げる途中と戻りは無防備。'});

// Provisional balance for independent R3 candidate; see BODY-UPPERCUT-R3.md.
TECHNIQUES.push({id:'bodyuppercut',target:'body',swayable:false,name:'ボディアッパー',style:'ボクシング',type:'punch',power:18,range:105,cost:14,...BODY_UPPERCUT_TIMING,learnCost:95,manualEquip:true,description:'沈み込みから胴体へ拳を打ち上げる。中段ガードで軽減。上段を狙う別技とは独立。承認済みR3の全65姿勢を使用。'});

// Approved chin R3 replaces this one old local expansion definition only.
{const t=TECHNIQUES.find(t=>t.id==='uppercut');Object.assign(t,{...CHIN_UPPERCUT_TIMING,description:'腰と肩の回旋で右拳を顎の高さへ打ち上げる。上段ガードで軽減。中段のボディアッパーとは別技。承認済みR3の全43姿勢を使用。'});}
// Four accepted-motion candidate ranges, root-gap geometry; power/cost/target/timing untouched.
for(const t of TECHNIQUES)if(isFourTrace(t.id))t.range=FOUR_TRACE_GAME_RANGE[t.id];

applyThreeTiming(TECHNIQUES);

// Internal motion variant only; never a purchasable/equippable second skill.
export const FRONTKICK_LEGACY=Object.freeze({...TECHNIQUES.find(t=>t.id==='frontkick'),id:'frontkickLegacy',range:128,skillId:'frontkick',motionVariant:'legacy-close'});
