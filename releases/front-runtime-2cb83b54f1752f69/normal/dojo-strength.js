import{venueKind}from'./course-layout.js';
// Fixed curriculum difficulty, never the player's level, points or visit order.
export const DOJO_STRENGTH_RULES=Object.freeze({ratio:.15,minimumBonus:1});
export function dojoPointBonus(index,baseTotal){return venueKind(index)==='dojo'?Math.max(DOJO_STRENGTH_RULES.minimumBonus,Math.floor(baseTotal*DOJO_STRENGTH_RULES.ratio)):0;}
export function dojoAbilityPoints(base,index,countryIndex){
 const keys=['power','speed','stamina'],oldTotal=keys.reduce((n,k)=>n+base[k],0),extra=dojoPointBonus(index,oldTotal);if(!extra)return base;
 const total=oldTotal+extra,out=Object.fromEntries(keys.map(k=>[k,Math.floor(total*base[k]/oldTotal)]));
 const left=total-keys.reduce((n,k)=>n+out[k],0),remainders=keys.map((k,i)=>({k,i,r:total*base[k]/oldTotal-out[k]})).sort((a,b)=>b.r-a.r||a.i-b.i);
 for(let i=0;i<left;i++)out[remainders[i].k]++;
 return out;
}
