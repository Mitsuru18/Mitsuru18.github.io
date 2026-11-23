// R13 single inferred support-transfer schedule, never observed motion/force.
// Original CORE and36-frame generated total duration remain unchanged.
import{alignGeneratedRecovery}from'./recovery-alignment.js';
import{TAIL}from'./data.js';
const clamp=q=>Math.max(0,Math.min(1,q)),ease=q=>{q=clamp(q);return q*q*q*(10+q*(-15+6*q))};
export const recoveryTailIndex=n=>Math.min(36,Math.max(0,n)*1.5);
function knee(h,a,old,L=26,M=25){const dx=a[0]-h[0],dy=a[1]-h[1],d=Math.hypot(dx,dy),u=[dx/d,dy/d],along=(L*L-M*M+d*d)/(2*d),height=Math.sqrt(Math.max(0,L*L-along*along)),sign=Math.sign(dx*(old[1]-h[1])-dy*(old[0]-h[0]))||1;return[h[0]+u[0]*along-u[1]*height*sign,h[1]+u[1]*along+u[0]*height*sign];}
export function alignSupportTransfer(raw,m,n){
 const base=alignGeneratedRecovery(raw,m),j=base.joints,oldDrop=base.alignment?.pelvisDrop||0;
 const frontLift=4*ease((n-24)/3)*(1-ease((n-33)/3)),frontDx=-5.6*ease((n-27)/6),desiredRaise=oldDrop*ease((n-24)/3);
 // Anchor to the actual initial/landed endpoints, not the fractional-frame
 // whole-leg interpolant, which already drifts by up to.0054 native.
 for(const k of['ankle','heel','toe']){j['support_'+k]=[TAIL[0]['support_'+k][0]+frontDx,TAIL[0]['support_'+k][1]+frontLift];if(n>=22)j['strike_'+k]=[TAIL[36]['strike_'+k][0]-5.6,TAIL[36]['strike_'+k][1]];}
 for(const[k,p]of Object.entries(j))if(!/_(ankle|heel|toe)$/.test(k))p[1]+=desiredRaise;
 const reach=Math.sqrt(26*26+25*25-2*26*25*Math.cos(175*Math.PI/180));let extraDrop=0;
 for(const s of['strike','support']){const h=j[s+'_hip'],a=j[s+'_ankle'],dx=h[0]-a[0];if(Math.abs(dx)>=reach)throw Error('R13 support transfer endpoint unreachable');extraDrop=Math.max(extraDrop,h[1]-a[1]-Math.sqrt(Math.max(0,reach*reach-dx*dx)));}
 extraDrop=Math.max(0,extraDrop);for(const[k,p]of Object.entries(j))if(!/_(ankle|heel|toe)$/.test(k))p[1]-=extraDrop;
 for(const s of['strike','support'])j[s+'_knee']=knee(j[s+'_hip'],j[s+'_ankle'],j[s+'_knee']);
 return{joints:j,alignment:{kind:'GENERATED_RECOVERY_SUPPORT_TRANSFER',sourceObserved:false,tailIndex:n,sampledPriorTailIndex:m,phase:n<22?'original-support':n<=24?'authored-double-support':n<36?'returned-leg-support':'authored-common-stance',bodyDx:base.alignment?.bodyDx||0,returningFootDx:base.alignment?.airFootDx||0,frontDx,frontLift,pelvisDrop:oldDrop-desiredRaise+extraDrop,physicalRootDelta:0,forceMeasured:false}};
}
