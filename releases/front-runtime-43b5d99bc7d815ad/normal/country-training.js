import{trainingExperienceUnit,foundationExperience,awardExperience,planExperience,experienceRequired}from'./experience.js';
import{ABILITY_RULES,validAbilities,awardAbilityProgress}from'./attributes.js';
// Culture-inspired game activities; neither meals nor traditions imply real stat gains.
export const TRAINING_RULES=Object.freeze({cost:40,xp:1,fightsBetween:3,xpPerLevel:ABILITY_RULES.fightsPerLevel});
export const TRAINING_RANKS=Object.freeze([
 Object.freeze({id:'foundation',name:'基礎修行',cost:20,unlock:1,outcomes:Object.freeze([{xp:1,percent:100}]),expected:1}),
 Object.freeze({id:'light',name:'気軽な修行',cost:40,unlock:2,outcomes:Object.freeze([{xp:1,percent:80},{xp:2,percent:20}]),expected:1.2}),
 Object.freeze({id:'standard',name:'じっくり修行',cost:80,unlock:3,outcomes:Object.freeze([{xp:1,percent:20},{xp:2,percent:60},{xp:3,percent:20}]),expected:2}),
 Object.freeze({id:'intense',name:'本格的な修行',cost:120,unlock:4,outcomes:Object.freeze([{xp:1,percent:10},{xp:2,percent:30},{xp:3,percent:40},{xp:4,percent:20}]),expected:2.7})
]);
export const COUNTRY_TRAINING=Object.freeze({
 jp:{practice:'滝で心身を整える',meal:'そば',meals:['そば','おにぎり','天ぷら']},
 th:{practice:'ミットで蹴りを磨く',meal:'パッタイ',meals:['パッタイ','トムヤムクン','カオパット']},
 br:{practice:'カポエイラのローダに参加',meal:'フェイジョアーダ',meals:['フェイジョアーダ','ムケッカ','コシーニャ']},
 kr:{practice:'テコンドーの蹴り練習',meal:'ビビンバ',meals:['ビビンバ','チャプチェ','トックク']},
 fr:{practice:'サバットの足運び練習',meal:'ラタトゥイユ',meals:['ラタトゥイユ','キッシュ','クレープ']},
 us:{practice:'ボクシングのバッグ練習',meal:'ハンバーガー',meals:['ハンバーガー','ジャンバラヤ','アップルパイ']},
 cn:{practice:'散打の踏込みを練習',meal:'餃子',meals:['餃子','麻婆豆腐','小籠包']},
 nl:{practice:'パンチとローのミット連係',meal:'ストロープワッフル',meals:['ストロープワッフル','エルテンスープ','ポッフェルチェ']},
 mm:{practice:'ラウェイの基本打撃を磨く',meal:'モヒンガー',meals:['モヒンガー','シャンヌードル','ラペットゥ']},
 ph:{practice:'ヤウヤンの足運び練習',meal:'アドボ',meals:['アドボ','パンシット','ハロハロ']},
 ng:{practice:'ダンベのシャドー練習',meal:'ジョロフライス',meals:['ジョロフライス','スヤ','アカラ']},
  in:{practice:'カラリパヤットの型稽古',meal:'ビリヤニ',meals:['ビリヤニ','バターチキン','ドーサ']},
  id:{practice:'シラットの舞型稽古',meal:'ナシゴレン',meals:['ナシゴレン','サテ','ルンダン']},
  my:{practice:'シラットの足さばき稽古',meal:'ナシレマッ',meals:['ナシレマッ','ラクサ','チャークイティオ']},
  kz:{practice:'ステップワークと影打ち',meal:'ベシュバルマク',meals:['ベシュバルマク','プロフ','シャシュリク']},
  uz:{practice:'クラッシュの組み手稽古',meal:'プロフ',meals:['プロフ','シャシュリク','サムサ']},
  kh:{practice:'クン・クメールの肘膝稽古',meal:'アモック',meals:['アモック','ロックラック','ノンバンチョック']},
  ir:{practice:'ズールハーネの伝統稽古',meal:'チェロケバブ',meals:['チェロケバブ','ゴルメサブジ','タフチーン']},
  tr:{practice:'ミット打ちと蹴りの稽古',meal:'ケバブ',meals:['ケバブ','ピデ','メネメン']},
  gb:{practice:'フットワークと影打ち',meal:'フィッシュアンドチップス',meals:['フィッシュアンドチップス','シェパーズパイ','フルブレックファスト']},
  ie:{practice:'ガードとカウンターの稽古',meal:'アイリッシュシチュー',meals:['アイリッシュシチュー','コルカノン','ボクスティ']},
  de:{practice:'コンビネーションの反復稽古',meal:'シュニッツェル',meals:['シュニッツェル','ブラートヴルスト','ザワークラウト']},
  es:{practice:'距離感を養うスパーリング',meal:'パエリア',meals:['パエリア','トルティージャ','ガンバス']},
  it:{practice:'インターセプトの稽古',meal:'パスタ',meals:['パスタ','リゾット','オッソブーコ']},
  gh:{practice:'リズムに乗る影打ち',meal:'ジョロフライス',meals:['ジョロフライス','ワーチェ','フフ']},
  eg:{practice:'砂地でのフットワーク稽古',meal:'コシャリ',meals:['コシャリ','ファラフェル','モロヘイヤ']},
  ci:{practice:'アクロバティックな影打ち',meal:'アチェケ',meals:['アチェケ','ケジェヌ','マフェ']},
  tn:{practice:'地中海の風の中で走り込み',meal:'クスクス',meals:['クスクス','ブリク','メルゲーズ']},
  ca:{practice:'冬の体育館でミット打ち',meal:'プーティン',meals:['プーティン','ツーリエール','バタータルト']},
  mx:{practice:'メキシコ式の接近戦稽古',meal:'タコス',meals:['タコス','ポソレ','チラキレス']},
  cu:{practice:'リズムとステップの稽古',meal:'ロパビエハ',meals:['ロパビエハ','モロス','トストーネス']},
  ar:{practice:'タンゴのリズムでステップ稽古',meal:'アサード',meals:['アサード','エンパナーダ','ミラネーサ']},
  cl:{practice:'アンデスの高地で走り込み',meal:'エンパナーダ',meals:['エンパナーダ','カスエラ','パステルデチョクロ']},
  au:{practice:'ビーチでのシャドー稽古',meal:'ミートパイ',meals:['ミートパイ','ベジマイトトースト','バラマンディ']},
  nz:{practice:'マウ・ラカウの武器術稽古',meal:'ハンギ',meals:['ハンギ','ホキのフライ','パブロワ']}
});
const rankFor=id=>TRAINING_RANKS.find(r=>r.id===id);
export const trainingXpForRoll=(rank,roll)=>{let n=0;return rank.outcomes.find(o=>(n+=o.percent*100)>roll)?.xp??rank.outcomes.at(-1).xp};
export const freshLocalTraining=(fights=0)=>({rule:1,lastFight:fights,sessions:0,lastReceipt:null});
export function normalizeLocalTraining(s){
 const t=s.localTraining,valid=t?.rule===1&&Number.isSafeInteger(t.lastFight)&&t.lastFight>=0&&t.lastFight<=s.fights&&Number.isSafeInteger(t.sessions)&&t.sessions>=0;
 if(!valid)return freshLocalTraining(s.fights);
 const r=t.lastReceipt,c=COUNTRY_TRAINING[r?.country],rank=rankFor(r?.rank),base=t.sessions>0&&r?.id===t.sessions&&c&&Number.isSafeInteger(r.level)&&r.level>=1&&typeof r.levelUp==='boolean'&&Number.isInteger(r.points)&&r.points>=0&&r.points<=2&&r.atFight===t.lastFight;
 let receipt=null;
 if(base&&r.experienceRevision===1&&rank&&r.cost===rank.cost&&Number.isSafeInteger(r.xp)&&r.xp>0&&Number.isSafeInteger(r.unit)&&r.unit>0&&Number.isInteger(r.xpRoll)&&r.xpRoll>=0&&r.xpRoll<10000&&r.xp===r.unit*trainingXpForRoll(rank,r.xpRoll)&&Number.isInteger(r.mealIndex)&&r.mealIndex>=0&&r.mealIndex<c.meals.length)receipt={...r,practice:c.practice,meal:c.meals[r.mealIndex]};
 // Keep old paid40G/1XP receipts byte-compatible; never redraw or award on load.
 if(base&&!r.rank&&r.cost===40&&r.xp===1&&r.points<=1)receipt={id:r.id,country:r.country,practice:c.practice,meal:c.meal,cost:r.cost,xp:r.xp,level:r.level,levelUp:r.levelUp,points:r.points,atFight:r.atFight};
 if(base&&!r.experienceRevision&&rank&&r.cost===rank.cost&&Number.isInteger(r.xpRoll)&&r.xpRoll>=0&&r.xpRoll<10000&&r.xp===trainingXpForRoll(rank,r.xpRoll)&&Number.isInteger(r.mealIndex)&&r.mealIndex>=0&&r.mealIndex<c.meals.length)receipt={id:r.id,country:r.country,practice:c.practice,meal:c.meals[r.mealIndex],rank:rank.id,mealIndex:r.mealIndex,xpRoll:r.xpRoll,cost:r.cost,xp:r.xp,level:r.level,levelUp:r.levelUp,points:r.points,atFight:r.atFight};
 return{rule:1,lastFight:t.lastFight,sessions:t.sessions,lastReceipt:receipt};
}
export function localTrainingQuote(s,{inBattle=false,rankId='light'}={}){
 const rank=rankFor(rankId),t=normalizeLocalTraining(s),remaining=Math.max(0,TRAINING_RULES.fightsBetween-(s.fights-t.lastFight)),country=s.country,unit=rankId==='foundation'?foundationExperience(s.abilities.level):trainingExperienceUnit(s.abilities.level),maxXp=(rank?.outcomes.at(-1).xp??0)*unit,levels=planExperience(s,maxXp)?.points;
 let reason=null;
 if(!rank)reason='rank';else if(!Number.isSafeInteger(s.money)||s.money<0||!Number.isSafeInteger(s.fights)||s.fights<0)reason='arithmetic';else if(!Object.hasOwn(COUNTRY_TRAINING,country))reason='country';else if(inBattle||s.pendingResult)reason='battle';else if(!validAbilities(s.abilities)||s.abilities.rule!==2||!s.abilities.confirmed)reason='abilities';else if(s.abilities.level<(rank.unlock??1))reason='locked';else if(remaining)reason='fights';else if(s.money<rank.cost)reason='money';else if(!Number.isSafeInteger(t.sessions+1)||levels===undefined||!Number.isSafeInteger(s.abilities.earned+levels)||!Number.isSafeInteger(s.abilities.level+levels))reason='arithmetic';
 return{ok:!reason,reason,remaining,country,sessions:t.sessions,fights:s.fights,rankId:rank?.id??null,rankName:rank?.name??'',cost:rank?.cost??0,balanceAfter:s.money-(rank?.cost??0),experienceRevision:1,unit,level:s.abilities.level,progress:s.experience?.progress??null,xp:(rank?.outcomes[0].xp??0)*unit,xpMin:(rank?.outcomes[0].xp??0)*unit,xpMax:maxXp,expected:(rank?.expected??0)*unit,outcomes:(rank?.outcomes??[]).map(o=>({...o,xp:o.xp*unit})),...COUNTRY_TRAINING[country]};
}
function randomUnit(){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);globalThis.crypto.getRandomValues(a);return a[0]/4294967296}return Math.random()}
export function completeLocalTraining(s,quote,options={}){
 const now=localTrainingQuote(s,{...options,rankId:quote?.rankId??'light'});
 if(!now.ok||!quote||quote.country!==now.country||quote.sessions!==now.sessions||quote.fights!==now.fights||quote.cost!==now.cost||quote.rankId!==now.rankId||quote.level!==now.level||quote.progress!==now.progress||quote.unit!==now.unit)return null;
 const random=options.random??randomUnit,x=random(),m=random();if(!Number.isFinite(x)||x<0||x>=1||!Number.isFinite(m)||m<0||m>=1)return null;
 const rank=rankFor(now.rankId),xpRoll=Math.floor(x*10000),xp=trainingXpForRoll(rank,xpRoll)*now.unit,mealIndex=Math.floor(m*now.meals.length),before=s.abilities.level,t=normalizeLocalTraining(s);let points=0;
 const growth=awardExperience(s,xp);if(!growth)return null;points=growth.points;
 const receipt={experienceRevision:1,unit:now.unit,id:t.sessions+1,country:s.country,practice:now.practice,meal:now.meals[mealIndex],rank:rank.id,mealIndex,xpRoll,cost:now.cost,xp,level:s.abilities.level,levelUp:s.abilities.level>before,points,atFight:s.fights};
 s.money-=now.cost;s.localTraining={rule:1,lastFight:s.fights,sessions:receipt.id,lastReceipt:receipt};return receipt;
}
// The private draw is exposed only after the complete debit/XP/receipt is saved.
export function purchaseLocalTraining(s,quote,save,options={}){const next=structuredClone(s),receipt=completeLocalTraining(next,quote,options);if(!receipt)return null;try{if(!save(next))return null}catch{return null}return{state:next,receipt};}

