// R12 isolated inferred recovery registration. Original CORE/TAIL remain unchanged.
// Applies only after the last original-index C pose, inside the existing36-frame
// synthetic tail. This is not observed motion or a change to physical actor root.
const clamp=q=>Math.max(0,Math.min(1,q)),ease=q=>{q=clamp(q);return q*q*q*(10+q*(-15+6*q))};
const clone=structuredClone;
function knee(h,a,old,L=26,M=25){const dx=a[0]-h[0],dy=a[1]-h[1],d=Math.hypot(dx,dy),u=[dx/d,dy/d],along=(L*L-M*M+d*d)/(2*d),height=Math.sqrt(Math.max(0,L*L-along*along)),cross=dx*(old[1]-h[1])-dy*(old[0]-h[0]),sign=Math.sign(cross)||1;return[h[0]+u[0]*along-u[1]*height*sign,h[1]+u[1]*along+u[0]*height*sign];}
export function alignGeneratedRecovery(input,tailIndex){
 const n=Math.max(0,Math.min(36,tailIndex));if(n<=0)return{joints:input,alignment:null};
 const bodyDx=-5.6*ease(n/36),airFootDx=-5.6*ease((n-6)/22),j=clone(input);
 for(const p of Object.values(j))p[0]+=bodyDx;
 // C-support remains at its original planted anchors. C-strike gains its extra
 // horizontal return only inside the prior synthetic high-clearance interval6..28.
 for(const k of['ankle','heel','toe']){j['support_'+k]=clone(input['support_'+k]);j['strike_'+k]=[input['strike_'+k][0]+airFootDx,input['strike_'+k][1]];}
 // Fixed26/25 legs must not stretch to accommodate the unchanged planted foot.
 // Reuse the existing175-degree maximum-reach convention; lower the generated
 // upper pose only as much as its two fixed endpoints require, then solve knees.
 const reach=Math.sqrt(26*26+25*25-2*26*25*Math.cos(175*Math.PI/180));let drop=0;
 for(const s of['strike','support']){const h=j[s+'_hip'],a=j[s+'_ankle'],dx=h[0]-a[0];if(Math.abs(dx)>=reach)throw Error('R12 recovery cannot reach planted endpoint');drop=Math.max(drop,h[1]-a[1]-Math.sqrt(Math.max(0,reach*reach-dx*dx)));}
 drop=Math.max(0,drop);for(const[k,p]of Object.entries(j))if(!/_(ankle|heel|toe)$/.test(k))p[1]-=drop;
 for(const s of['strike','support'])j[s+'_knee']=knee(j[s+'_hip'],j[s+'_ankle'],j[s+'_knee']);
 return{joints:j,alignment:{kind:'GENERATED_RECOVERY_LOCAL_REGISTRATION',sourceObserved:false,tailIndex:n,bodyDx,airFootDx,pelvisDrop:drop,supportAnchorsPreserved:true,physicalRootDelta:0}};
}
