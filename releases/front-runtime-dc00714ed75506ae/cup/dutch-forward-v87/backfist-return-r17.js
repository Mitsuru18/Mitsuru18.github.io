// R17 single inferred connector. Source observations and held source clock stay unchanged.
import {CORE,JOINS} from './backfist-foot4-data.js';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.hypot(...a),unit=a=>mul(a,1/norm(a)),clamp=t=>Math.max(0,Math.min(1,t)),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t)),ease=t=>t*t*t*(10+t*(-15+6*t));
function log(a,b){a=unit(a);b=unit(b);const d=Math.max(-1,Math.min(1,dot(a,b))),ang=Math.acos(d),v=sub(b,mul(a,d));return norm(v)<1e-10?[0,0,0]:mul(v,ang/norm(v));}
function exp(a,v){a=unit(a);const n=norm(v);return n<1e-12?a:add(mul(a,Math.cos(n)),mul(v,Math.sin(n)/n));}
function slerp(a,b,t){return exp(a,mul(log(a,b),t));}
function curve(a,b,prev,t,duration){const h=3*t*t-2*t*t*t,hv=t*t*t-2*t*t+t;return add(mix(a,b,h),mul(sub(a,prev),72*duration*hv));}
function direction(a,b,prev,t,duration){const h=3*t*t-2*t*t*t,hv=t*t*t-2*t*t+t;return exp(a,add(mul(log(a,b),h),mul(log(a,prev),-72*duration*hv)));}
function ik(hip,ankle,pole){const v=sub(ankle,hip),D=norm(v);if(!(D>1+1e-8&&D<51-1e-8))throw Error('R17 unreachable fixed-length leg '+D);const u=mul(v,1/D),along=(26*26-25*25+D*D)/(2*D),h=Math.sqrt(Math.max(0,26*26-along*along)),vPole=sub(pole,hip),p=sub(vPole,mul(u,dot(vPole,u)));if(norm(p)<1e-6)throw Error('R17 undefined knee pole');return add(add(hip,mul(u,along)),mul(unit(p),h));}
const common=JOINS.suffix[30];
export function generatedReturn(a,t,{previous=null,duration=.5}={}){
 t=clamp(t);if(t===0)return structuredClone(a);if(t===1)return structuredClone(common);
 const b=common,e=ease(t),q={},pos=(x,y,z)=>previous?curve(x,y,z,t,duration):mix(x,y,e),dir=(x,y,z)=>previous?direction(x,y,z,t,duration):slerp(x,y,e);
 q.pelvis=pos(a.pelvis,b.pelvis,previous?.pelvis);
 for(const [center,point,length]of[['pelvis','neck',30],['neck','head',14]])q[point]=add(q[center],mul(dir(sub(a[point],a[center]),sub(b[point],b[center]),previous&&sub(previous[point],previous[center])),length));
 for(const [center,part]of[['pelvis','hip'],['neck','shoulder']]){const axis=mul(dir(sub(a[part+'A'],a[part+'B']),sub(b[part+'A'],b[part+'B']),previous&&sub(previous[part+'A'],previous[part+'B'])),4);q[part+'A']=add(q[center],axis);q[part+'B']=sub(q[center],axis);}
 const first=605/4.3-a.toeB[1]>1e-9?'B':'A';
 for(const s of['A','B']){
  for(const [x,y,l]of[['shoulder','elbow',18],['elbow','wrist',17],['wrist','hand',3.5]])q[y+s]=add(q[x+s],mul(dir(sub(a[y+s],a[x+s]),sub(b[y+s],b[x+s]),previous&&sub(previous[y+s],previous[x+s])),l));
  let phase=s===first?clamp(t/.65):clamp((t-.65)/.35);if(Math.max(...['heel','toe','ankle'].map(k=>norm(sub(a[k+s],b[k+s]))))<1e-10)phase=0;
  const w=ease(phase),orient=s===first?w:e,u=slerp(sub(a['toe'+s],a['heel'+s]),sub(b['toe'+s],b['heel'+s]),orient),normal=r=>unit(sub(sub(r['ankle'+s],r['heel'+s]),mul(unit(sub(r['toe'+s],r['heel'+s])),4)));let n=slerp(normal(a),normal(b),orient);n=unit(sub(n,mul(u,dot(n,u))));
  if(s==='A'){q.heelA=mix(a.heelA,b.heelA,w);q.heelA[1]-=6*Math.sin(Math.PI*phase)**2;q.toeA=add(q.heelA,mul(u,10.9));}else{q.toeB=mix(a.toeB,b.toeB,w);q.toeB[1]-=2*Math.sin(Math.PI*phase)**2;q.heelB=sub(q.toeB,mul(u,10.9));}
  q['ankle'+s]=add(add(q['heel'+s],mul(u,4)),mul(n,3));q['knee'+s]=ik(q['hip'+s],q['ankle'+s],pos(a['knee'+s],b['knee'+s],previous?.['knee'+s]));
 }
 return q;
}
export const r17Return=t=>generatedReturn(CORE[144],t,{previous:CORE[143],duration:.5});
export const R17_CONNECTION_POLICY=Object.freeze({duration:.5,sourceChanged:false,mode:'continuous generated sphere-Hermite; tangent estimated from d143 to d144 at72positions/s; zero end tangent',footPolicy:'unchanged R16 two-stage foot placement and support',sourceDerivative:'original source holds are not C1; nonzero incoming secant is an estimate, not an observed velocity'});
