// Additive XP ledger. abilities rule 2 stays readable by the linked tournament.
// Its progress (0..2) is a compatibility projection; this ledger is authoritative.
export const EXPERIENCE_RULES=Object.freeze({revision:1,base:100,linear:12,quadraticDivisor:20,winBase:20,winPerLevel:4,replayRatio:.75,loss:8,draw:12});
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function experienceRequired(level){const n=level-1,x=100+12*n+Math.floor(n*n/20);return Number.isSafeInteger(level)&&level>=1&&Number.isSafeInteger(x)?x:null;}
export function freshExperience(abilities){return{rule:1,progress:Math.floor((abilities?.progress??0)*experienceRequired(abilities?.level??1)/3),total:0,legacyProgress:abilities?.progress??0};}
export function validExperience(x,level){const required=experienceRequired(level);return x?.rule===1&&integer(x.progress)&&required!==null&&x.progress<required&&integer(x.total)&&[0,1,2].includes(x.legacyProgress);}
export function experienceStatus(s){const x=s.experience??freshExperience(s.abilities),required=experienceRequired(s.abilities.level);return{progress:x.progress,required,remaining:required-x.progress,level:s.abilities.level};}
export function planExperience(s,amount){
 const a=s.abilities,x=s.experience??freshExperience(a);
 if(!integer(amount)||amount>10000000||!validExperience(x,a.level)||!integer(x.total+amount)||!integer(x.progress+amount))return null;
 let progress=x.progress+amount,level=a.level,points=0,required=experienceRequired(level);
 while(progress>=required){progress-=required;level++;points++;required=experienceRequired(level);if(required===null||!integer(a.earned+points))return null;}
 return{experience:{...x,progress,total:x.total+amount},level,earned:a.earned+points,points,compatibilityProgress:Math.min(2,Math.round(progress*3/required))};
}
export function awardExperience(s,amount){const p=planExperience(s,amount);if(!p)return null;s.experience=p.experience;Object.assign(s.abilities,{level:p.level,earned:p.earned,progress:p.compatibilityProgress});return{xp:amount,points:p.points,level:p.level,levelUp:p.points>0};}
export function fightExperience(level,winner,fresh=true){if(!Number.isSafeInteger(level)||level<1)return null;if(winner!=='player')return winner==='draw'?12:8;return Math.floor((20+4*level)*(fresh?1:.75));}
export const trainingExperienceUnit=level=>Math.max(1,Math.floor(experienceRequired(level)*.18));
export const foundationExperience=level=>Math.max(1,Math.floor(experienceRequired(level)*.08));

export function legacyFightExperience(s){const status=experienceStatus(s);return s.abilities.progress===2?status.remaining:Math.max(1,Math.floor((s.abilities.progress+1)*status.required/3)-status.progress);}
