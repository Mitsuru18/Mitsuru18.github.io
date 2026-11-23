/** Lifetime results are cumulative; no bounded event history can erase them.
 * Old saves contain completed fights and unique first victories only. Never
 * infer a rematch outcome, a loss/draw split, or a country from mastery/money.
 */
const count=()=>({wins:0,losses:0,draws:0});
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export const completedCount=c=>c.wins+c.losses+c.draws;
export function freshFightRecords(){return{rule:1,baselineFights:0,baselineWins:{},overall:count(),countries:{},lastSettledId:0};}
function validCount(c){return c&&['wins','losses','draws'].every(k=>integer(c[k]))&&integer(completedCount(c));}
export function normalizeFightRecords(s,countryIds,validWinIds){
 const r=s.records,validCountries=new Set(countryIds);
 if(r?.rule===1&&integer(r.baselineFights)&&r.baselineWins&&typeof r.baselineWins==='object'&&!Array.isArray(r.baselineWins)&&Object.entries(r.baselineWins).every(([id,n])=>validCountries.has(id)&&integer(n))&&Object.values(r.baselineWins).reduce((a,b)=>a+b,0)<=r.baselineFights&&validCount(r.overall)&&r.countries&&typeof r.countries==='object'&&!Array.isArray(r.countries)&&Object.entries(r.countries).every(([id,c])=>validCountries.has(id)&&validCount(c))&&['wins','losses','draws'].every(k=>Object.values(r.countries).reduce((n,c)=>n+c[k],0)===r.overall[k])&&r.baselineFights+completedCount(r.overall)===s.fights&&integer(r.lastSettledId)&&r.lastSettledId<s.nextId)return r;
 const result=freshFightRecords();result.baselineFights=s.fights;
 const wins=[...new Set(validWinIds)];
 // An inconsistent old save cannot have more completed first wins than fights.
 // Keep its progress separately in s.wins, but do not fabricate match totals.
 if(wins.length<=s.fights)for(const id of wins){const country=id.split('-')[0];if(validCountries.has(country))result.baselineWins[country]=(result.baselineWins[country]||0)+1;}
 return result;
}
export function recordFinishedFight(r,id,country,winner){
 if(!Number.isSafeInteger(id)||id<=r.lastSettledId||!['player','opponent','draw'].includes(winner))return false;
 const key=winner==='player'?'wins':winner==='opponent'?'losses':'draws';
 r.countries[country]??=count();r.countries[country][key]++;r.overall[key]++;r.lastSettledId=id;return true;
}
export function fightRecordSummary(r,country=null){
 const tracked=country?(r.countries[country]||count()):r.overall;
 const firstWins=country?(r.baselineWins[country]||0):Object.values(r.baselineWins).reduce((a,b)=>a+b,0);
 const missing=r.baselineFights-Object.values(r.baselineWins).reduce((a,b)=>a+b,0);
 const played=completedCount(tracked)+firstWins+(country?0:missing);
 return{played,wins:tracked.wins+firstWins,losses:tracked.losses,draws:tracked.draws,missing,partial:country!==null&&missing>0,winRate:missing?null:played?100*(tracked.wins+firstWins)/played:null,tracked:{...tracked,played:completedCount(tracked),winRate:completedCount(tracked)?100*tracked.wins/completedCount(tracked):null},firstWins};
}
export const formatWinRate=rate=>rate===null?'—':`${rate.toFixed(1).replace(/\.0$/,'')}%`;
