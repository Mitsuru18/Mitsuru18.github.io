export const ABILITY_RULES=Object.freeze({initial:10,basePower:.7,powerPerPoint:.10,speedPerPoint:.06,globalSpeedPoints:10,moveSpeedPerPoint:.12,staminaPerPoint:3,baseStamina:50,baseHp:50,hpPerStaminaPoint:7,tempo:.5,fightsPerLevel:3});
export const ABILITY_NAMES={power:'パワー',speed:'スピード',stamina:'スタミナ'};
export const freshAbilities=()=>({rule:2,spent:{power:0,speed:0,stamina:0},earned:10,progress:0,level:1,baseFights:0,confirmed:false});
export function pointTotal(points){if(!points||Object.values(points).length!==3||!Object.keys(ABILITY_NAMES).every(k=>Number.isSafeInteger(points[k])&&points[k]>=0))return null;const n=Object.values(points).reduce((a,b)=>a+b,0);return Number.isSafeInteger(n)?n:null;}
export function validPoints(points){return pointTotal(points)!==null&&Number.isSafeInteger(50+points.stamina*7)&&Number.isSafeInteger(50+points.stamina*3);}
export function validAbilities(a){const total=pointTotal(a?.spent);return [1,2].includes(a?.rule)&&Number.isSafeInteger(a.earned)&&a.earned>=10&&(a.rule===1||Number.isSafeInteger(a.level)&&a.level>=1&&Number.isSafeInteger(a.baseFights)&&a.baseFights>=0)&&Number.isInteger(a.progress)&&a.progress>=0&&a.progress<3&&typeof a.confirmed==='boolean'&&total!==null&&validPoints(a.spent)&&total<=a.earned;}
export const unspent=a=>a.earned-Object.values(a.spent).reduce((n,v)=>n+v,0);
export function abilityStats(points){if(!validPoints(points))throw new RangeError('Ability points must fit safe finite integer arithmetic');return{maxHp:ABILITY_RULES.baseHp+points.stamina*ABILITY_RULES.hpPerStaminaPoint,power:ABILITY_RULES.basePower+points.power*ABILITY_RULES.powerPerPoint,speed:1+effectiveSpeedPoints(points.speed)*ABILITY_RULES.speedPerPoint,maxStamina:50+points.stamina*3};}
export function allocateAbilities(s,add){const a=s.abilities;if(!validAbilities(a)||pointTotal(add)===null||pointTotal(add)>unspent(a))return false;const next=Object.fromEntries(Object.keys(ABILITY_NAMES).map(k=>[k,a.spent[k]+add[k]]));if(!validPoints(next))return false;a.spent=next;a.confirmed=true;return true;}
export function migrateAbilities(s){const old=s.abilities;if(old?.rule===2)return false;s.abilities=old?{...old,spent:{...old.spent},rule:2,progress:0,level:1,baseFights:s.fights}:freshAbilities();s.abilities.baseFights=s.fights;return true;}
export function awardAbilityProgress(s){const a=s.abilities;if(!validAbilities(a)||a.rule!==2)return 0;if(a.progress===2&&(!Number.isSafeInteger(a.level+1)||!Number.isSafeInteger(a.earned+1)))return 0;if(++a.progress===3){a.progress=0;a.level++;a.earned++;return 1}return 0;}
// Only the selected starting country gets the gentler first two fixed rivals.
export const STARTER_ENEMY_TOTALS=Object.freeze([6,8]);
export function enemyAbilities(index,countryIndex=0){
 const stage=countryIndex*12+index,total=countryIndex===0&&index<2?STARTER_ENEMY_TOTALS[index]:10+Math.floor(stage/3)+(index%3===2?1:0),type=(index+countryIndex)%3;
 const dominant=Math.ceil(total*.45),second=Math.ceil((total-dominant)/2),third=total-dominant-second;
 const points=type===0?{power:dominant,speed:second,stamina:third}:type===1?{power:third,speed:dominant,stamina:second}:{power:second,speed:third,stamina:dominant};
 return{label:index===0?'入門・軽い打撃':['強打型','速攻型','持久型'][type],points};
}

// Shared nonlinear allocation curve. Saved points are never rewritten.
export function effectiveSpeedPoints(points){if(!Number.isSafeInteger(points)||points<0)throw new RangeError('Invalid speed points');return points<=20?points:Math.sqrt(20*points);}
export function speedBonuses(points){const effective=effectiveSpeedPoints(points);return{effective,action:effective*ABILITY_RULES.speedPerPoint,movement:effective*ABILITY_RULES.moveSpeedPerPoint};}
