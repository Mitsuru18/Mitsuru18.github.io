// Local career facts only. No AI service, clocks, invented past, or combat effects.
const zero=()=>({hits:0,lowHits:0,blocks:0,dodges:0,counters:0,closeWins:0,wins:0,losses:0,draws:0});
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export const CAREER_TITLES=[
 {id:'low',name:'ローの使い手',test:t=>t.lowHits>=20&&t.lowHits>=t.hits*.5,rule:'記録開始後、ロー系直撃20回以上・全直撃の50%以上'},
 {id:'guard',name:'守りの巧者',test:t=>t.blocks+t.dodges>=20,rule:'記録開始後、ガード・回避成功20回以上'},
 {id:'counter',name:'反撃の名手',test:t=>t.counters>=10,rule:'記録開始後、反撃行動10回以上（命中保証ではない）'},
 {id:'close',name:'薄氷の勝負師',test:t=>t.closeWins>=3,rule:'残HP25%以下で3勝（逆転したとは推定しない）'}
];
export function freshCareer(base=0){return{rule:1,baseFights:base,tracked:0,lastSequence:0,totals:zero(),rivals:{},milestones:[],awarded:[],selected:null,cups:{entered:0,champions:0,bestWins:0,lastId:null}};}
export function normalizeCareer(value,fights){if(value?.rule===1&&integer(value.baseFights)&&integer(value.tracked)&&value.baseFights+value.tracked===fights&&integer(value.lastSequence)&&value.totals&&Object.keys(zero()).every(k=>integer(value.totals[k]))&&value.rivals&&typeof value.rivals==='object'&&!Array.isArray(value.rivals)&&Array.isArray(value.milestones)&&value.milestones.every(x=>x&&typeof x.text==='string'&&integer(x.sequence))&&Array.isArray(value.awarded)&&value.cups&&integer(value.cups.entered)&&integer(value.cups.champions)&&integer(value.cups.bestWins)){return structuredClone(value);}return freshCareer(fights);}
function note(c,sequence,kind,text){c.milestones.push({sequence,kind,text});if(c.milestones.length>32)c.milestones.splice(0,c.milestones.length-32);}
export function earnedTitles(c){return CAREER_TITLES.filter(x=>x.test(c?.totals??zero()));}
export function currentTitle(c){const a=earnedTitles(c);return a.find(x=>x.id===c.selected)?.name??a.at(-1)?.name??'異名はこれから';}
export function selectTitle(c,id){if(!earnedTitles(c).some(x=>x.id===id))return false;c.selected=id;return true;}
export function recordCareer(c,context,b){
 if(!b?.done||!['player','opponent','draw'].includes(b.winner)||!integer(context.sequence)||context.sequence<=c.lastSequence)return false;
 const seq=context.sequence,who=String(context.name??'対戦相手'),id=String(context.opponentId??'unknown'),t=c.totals;
 const result=b.winner==='player'?'wins':b.winner==='opponent'?'losses':'draws';t[result]++;c.tracked++;c.lastSequence=seq;
 const moves=b.report?.fighters?.[1]?.moves??{},safe=n=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
 for(const [id,m]of Object.entries(moves)){t.hits+=safe(m.hits);if(['lowkick','crouchlowkick','dutchlow'].includes(id))t.lowHits+=safe(m.hits);}
 const f=b.fighters?.[0];t.blocks+=safe(f?.stats?.blocked);t.dodges+=safe(f?.stats?.dodged);t.counters+=safe(f?.stats?.counterAttacks);
 if(result==='wins'&&Number.isFinite(f?.maxHp)&&f.maxHp>0&&f.hp/f.maxHp<=.25)t.closeWins++;
 const rival=c.rivals[id]??{wins:0,losses:0,draws:0,name:who};rival.name=who;
 if(result==='wins'&&!rival.wins&&rival.losses)note(c,seq,'rival',`${who}に記録開始後の初勝利。それまでに${rival.losses}敗を経験した。`);
 else if(c.tracked===1)note(c,seq,'start',`${who}との${result==='wins'?'勝利':result==='losses'?'敗戦':'引分'}から、詳しいキャリア記録が始まった。`);
 else note(c,seq,'fight',`${who}に${result==='wins'?'勝利':result==='losses'?'敗北':'引分'}。${context.mode==='grand'?'天下一武闘会':context.mode?'小大会':context.country??'旅先'}での第${seq}試合。`);
 rival[result]++;c.rivals[id]=rival;
 for(const title of earnedTitles(c))if(!c.awarded.includes(title.id)){c.awarded.push(title.id);note(c,seq,'title',`実際の試合内容から「${title.name}」の条件を満たした。`);}
 return true;
}
export function recordCup(c,run,sequence){if(!run||run.status!=='finished'||c.cups.lastId===run.id)return false;c.cups.lastId=run.id;c.cups.entered++;const champion=run.champion==='you',prior=c.cups.bestWins;c.cups.bestWins=Math.max(prior,run.wins);if(champion)c.cups.champions++;
 note(c,sequence,'cup',`${run.mode==='grand'?'天下一武闘会':'小大会'}を${champion?'優勝':run.wins===0?'初戦敗退':run.wins+'勝で終了'}。${run.wins>prior?'これまでの大会最多勝利を更新した。':''}`);return true;}
