// Local contact adjustment only. Raw approved motion data remain untouched.
import {clamp,add,sub,mul,len} from './approved-2d-core.js';
export const RECOIL=Object.freeze({seconds:.30,punch:12,kick:22});
export const recoilEase=q=>{q=clamp(q);return q*q*(3-2*q)};
export function surfaceLimit(j,def,gap,face=1,defFace=-1){
 const kind=j.kind,point=kind==='knee'?j.joints.strike_knee:[j.joints.strike_heel,j.joints.strike_toe,j.joints.strike_ankle].sort((a,b)=>b[0]-a[0])[0];
 const a=[gap+def.center[0]*defFace*face,def.center[1]],b=[gap+def.chest[0]*defFace*face,def.chest[1]];
 const q=clamp((point[1]-a[1])/(b[1]-a[1]||1)),y=a[1]+(b[1]-a[1])*q;
 // Capsule near surface, with a small visual skin margin. Not the torso centre.
 const radius=8+(kind==='knee'?3.6:2.3),dy=Math.abs(y-point[1]);return a[0]+(b[0]-a[0])*q-Math.sqrt(Math.max(0,radius*radius-dy*dy))+.01;
}
function twoLink(hip,target,old,oldAnkle){
 const v=sub(target,hip),d=clamp(len(v),1.01,50.99999),u=mul(v,1/(len(v)||1)),along=(26*26-25*25+d*d)/(2*d),h=Math.sqrt(Math.max(0,26*26-along*along)),n=[-u[1],u[0]],sign=(oldAnkle[0]-hip[0])*(old[1]-hip[1])-(oldAnkle[1]-hip[1])*(old[0]-hip[0])>=0?1:-1;
 return {knee:add(add(hip,mul(u,along)),mul(n,h*sign)),ankle:add(hip,mul(u,d))};
}
export function constrainStrike(j,kind,limit){
 if(!Number.isFinite(limit))return j;
 const lead=kind==='knee'?j.strike_knee[0]:Math.max(j.strike_heel[0],j.strike_toe[0],j.strike_ankle[0]);
 if(lead<=limit)return j;
 // Absorb only excess forward drive at contact; a pinned knee must stop the full hip drive, not an arbitrary12-unit part. The planted support foot is
 // unchanged; torso/hip/arms/striking-leg ratios and their internal angles stay fixed.
 const shift=kind==='knee'?lead-limit:Math.min(12,lead-limit),out=Object.fromEntries(Object.entries(j).map(([k,v])=>[k,[v[0]-(/^support_(knee|ankle|heel|toe)$/.test(k)?0:shift),v[1]]]));
 let hip=out.support_hip,ankle=out.support_ankle,dx=hip[0]-ankle[0],drop=Math.max(0,hip[1]-ankle[1]-Math.sqrt(Math.max(0,50.99999**2-dx*dx)));
 if(drop)for(const k in out)if(!/^support_(knee|ankle|heel|toe)$/.test(k))out[k][1]-=drop;
 const h=j.support_hip,k=j.support_knee,a=j.support_ankle,bend=(a[0]-h[0])*(k[1]-h[1])-(a[1]-h[1])*(k[0]-h[0])>=0?1:-1,v=sub(out.support_ankle,out.support_hip),d=clamp(len(v),1.01,50.99999),u=mul(v,1/(len(v)||1)),along=(26**2-25**2+d*d)/(2*d),height=Math.sqrt(Math.max(0,26**2-along**2));
 out.support_knee=add(add(out.support_hip,mul(u,along)),mul([-u[1],u[0]],height*bend));
 // At unreachable synthetic overlaps only, retain a conservative limb limit.
 const remaining=(kind==='knee'?out.strike_knee[0]:Math.max(out.strike_heel[0],out.strike_toe[0],out.strike_ankle[0]))-limit;
 if(remaining>1e-6&&kind==='sidekick'){const h=out.strike_hip,a=out.strike_ankle,offset=Math.max(out.strike_heel[0]-a[0],out.strike_toe[0]-a[0],0),r=twoLink(h,[limit-offset,a[1]],out.strike_knee,a);out.strike_knee=r.knee;out.strike_ankle=r.ankle;for(const n of['heel','toe'])out['strike_'+n]=add(r.ankle,sub(out['strike_'+n],a));}
 return out;
}

// Exact horizontal slice of the same torso capsule, used by the legacy kick foot polygon.
export function capsuleNearX(y,a,b,radius=10.3){
 const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);let q=Math.abs(dy)>1e-9?(y-a[1]-radius*dx*Math.sign(dy)/(length||1))/dy:(dx<0?1:0);q=Math.max(0,Math.min(1,q));
 const cy=a[1]+dy*q,vertical=y-cy;if(Math.abs(vertical)>radius+1e-8)return Infinity;
 return a[0]+dx*q-Math.sqrt(Math.max(0,radius*radius-vertical*vertical));
}
