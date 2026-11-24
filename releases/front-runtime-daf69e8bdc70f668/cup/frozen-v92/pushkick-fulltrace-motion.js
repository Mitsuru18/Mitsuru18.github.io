// Unpublished image-backed full-body trace candidate. See provenance in data.
import{PUSHKICK_FULLTRACE as D}from'./pushkick-fulltrace-data.js';
import{freeFK,blendFreeParams}from'./pushkick-free-fk.js';
import{receiverPose,params,fromParams,clamp,add,sub,mul,len,vec}from'./approved-2d-core.js';
const rows=D.frames,base=fromParams(params(receiverPose())),bp=params(base),smooth=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x))};
function hermite(a,b,ma,mb,t,h){const t2=t*t,t3=t2*t;return(2*t3-3*t2+1)*a+(t3-2*t2+t)*h*ma+(-2*t3+3*t2)*b+(t3-t2)*h*mb}
export function tracedPushParams(q){q=clamp(q);let lo=0,hi=rows.length-1;while(hi-lo>1){let m=(lo+hi)>>1;if(rows[m].q<=q)lo=m;else hi=m}const a=rows[lo],b=rows[hi],h=b.q-a.q,t=(q-a.q)/h,p={sn:1,kn:1,sa:[0,0]};for(const k of Object.keys(a.slopes)){const av=k==='sax'?a.params.sa[0]:k==='say'?a.params.sa[1]:a.params[k],bv=k==='sax'?b.params.sa[0]:k==='say'?b.params.sa[1]:b.params[k],v=hermite(av,bv,a.slopes[k],b.slopes[k],t,h);if(k==='sax')p.sa[0]=v;else if(k==='say')p.sa[1]=v;else p[k]=v}return p}
function setFoot(j,side,a,theta){const u=vec(theta),n=[-u[1],u[0]];j[side+'_ankle']=a;j[side+'_heel']=add(add(a,mul(u,-4)),mul(n,-3));j[side+'_toe']=add(add(a,mul(u,6.9)),mul(n,-3));}
function targetLeg(j,side,c,theta){const a=j[side+'_hip'],old=sub(j[side+'_knee'],a),v=sub(c,a),dl=len(v),d=clamp(dl,1.01,50.999),u=mul(v,1/(dl||1)),along=(26**2-25**2+d*d)/(2*d),h=Math.sqrt(Math.max(0,26**2-along**2)),bend=1;j[side+'_knee']=add(add(a,mul(u,along)),mul([-u[1],u[0]],h*bend));setFoot(j,side,add(a,mul(u,d)),theta)}
export function fulltracePushPose(q,{neutralJoin=true,floorProtection=true}={}){
 q=clamp(q);let p=tracedPushParams(q);const traceP=structuredClone(p);if(neutralJoin){const w=smooth(Math.min(q/.08,(1-q)/.12,1));p=blendFreeParams(bp,p,w)}
 let j=freeFK(p);if(floorProtection){
  // Source far foot occupies a different floor-depth plane. Explicit game grounding for the observed planted preparatory phase.
  if(q<31/131||q>88/131){
   const w=q<31/131?1-smooth((q-27/131)/(4/131)):smooth((q-88/131)/(8/131)),a=j.strike_ankle,theta=Math.atan2(j.strike_toe[1]-j.strike_heel[1],j.strike_toe[0]-j.strike_heel[0]),target=[a[0]+(base.strike_ankle[0]-a[0])*w,a[1]+(3-a[1])*w],support=[...j.support_ankle],supportTheta=Math.atan2(j.support_toe[1]-j.support_heel[1],j.support_toe[0]-j.support_heel[0]);
   // Fixed-bone double-support adaptation: lower the pelvis only as much as a planted target requires. Never float both soles to hide mismatch.
   const dx=target[0]-j.strike_hip[0],available=Math.sqrt(Math.max(0,50.5**2-dx*dx)),drop=Math.max(0,j.strike_hip[1]-target[1]-available);
   if(drop>0){for(const k in j)if(!/^(strike|support)_(knee|ankle|heel|toe)$/.test(k))j[k][1]-=drop;targetLeg(j,'support',support,supportTheta)}
   targetLeg(j,'strike',target,theta*(1-w));
  }
  for(let n=0;n<3;n++){const below=Math.min(j.strike_heel[1],j.strike_toe[1]);if(below>=-1e-6)break;targetLeg(j,'strike',add(j.strike_ankle,[0,-below+.001]),Math.atan2(j.strike_toe[1]-j.strike_heel[1],j.strike_toe[0]-j.strike_heel[0]))}
 }
 const below=Math.min(j.support_heel[1],j.support_toe[1]);if(floorProtection&&below<0)for(const k in j)j[k][1]-=below; if(neutralJoin&&(q===0||q===1))j=structuredClone(base);return j;
}
export function pushTraceProvenance(){return D.provenance}
