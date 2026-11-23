import{fulltracePushPose}from'./pushkick-fulltrace-motion.js';
// Independent low-kick and sole-push choreography. No approved trace is edited.
import{capsuleNearX}from'./contact-motion.js';
import{receiverPose,params,fromParams,blendParams,clamp,add,sub,mul,len,vec,pointSegmentDistance}from'./approved-2d-core.js';
const ease=t=>{t=clamp(t);return t*t*t*(10+t*(-15+6*t));};
export const DUTCH_STEP=Object.freeze({distance:12,until:.18,minimumGap:72});
function ik(a,c,l1=26,l2=25,bend=1){const v=sub(c,a),d=clamp(len(v),Math.abs(l1-l2)+.01,l1+l2-.05),u=mul(v,1/(len(v)||1)),along=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-along*along));return{joint:add(add(a,mul(u,along)),mul([-u[1],u[0]],bend*h)),end:add(a,mul(u,d))};}
function sole(j,side,a,theta){const u=vec(theta),n=[-u[1],u[0]];j[side+'_ankle']=a;j[side+'_heel']=add(add(a,mul(u,-4)),mul(n,-3));j[side+'_toe']=add(add(a,mul(u,6.9)),mul(n,-3));}
function leg(j,side,a,theta,bend=1){const r=ik(j[side+'_hip'],a,26,25,bend);j[side+'_knee']=r.joint;sole(j,side,r.end,theta);}
function arm(j,side,target){const r=ik(j[side+'_shoulder'],target,18,17,-1);j[side+'_elbow']=r.joint;j[side+'_wrist']=r.end;j[side+'_hand']=add(r.end,mul(sub(r.end,r.joint),3.5/17));}
function sample(nodes,q){let k=nodes.findIndex(n=>n[0]>=q);k=Math.max(1,k<0?nodes.length-1:k);const a=nodes[k-1],b=nodes[k],u=ease((q-a[0])/(b[0]-a[0]));return a.slice(1).map((x,i)=>x+(b[i+1]-x)*u);}
export function swapLegs(j){j=structuredClone(j);for(const n of['hip','knee','ankle','heel','toe'])[j['support_'+n],j['strike_'+n]]=[j['strike_'+n],j['support_'+n]];return j;}
export function lowKickBase(){const j=fromParams(params(receiverPose()));for(const n of['hip','knee','ankle','heel','toe'])[j['support_'+n],j['strike_'+n]]=[j['strike_'+n],j['support_'+n]];return j;}
export function rawLowKick(q,stepApplied=null){
 q=clamp(q);const base=lowKickBase();if(q===0||q===1)return base;
 const p=params(base),turn=Math.sin(Math.PI*q),theta=-.34*turn*ease((q-.20)/.15),anchor=base.support_toe[0];p.sf=theta;p.sa=[anchor-6.9*Math.cos(theta)-3*Math.sin(theta),3];p.spine+=.085*turn;p.st-=.035*turn;p.ss+=.035*turn;let j=fromParams(p);
 const stepQ=clamp(q*.9/DUTCH_STEP.until),step=stepApplied??DUTCH_STEP.distance*ease(stepQ);
 if(stepQ<1){leg(j,'support',[base.support_ankle[0],3+Math.sin(Math.PI*stepQ)*4],0);leg(j,'strike',[base.strike_ankle[0]-step*.41,3],0);return j;}
 const v=sample([[0,-18,3,0],[.20,-18-step*.41,3,0],[.30,12,15,-.8],[.40,36,23,-1.35],[.49,38,24,-1.35],[.56,40,22,-1.35],[.72,3,13,-.65],[.88,-15,4,-.1],[1,-18,3,0]],q);
 leg(j,'strike',[v[0],v[1]],v[2]);const swing=turn*ease((q-.20)/.25),pre=params(j);arm(j,'near',[17-27*swing,79-24*swing]);j=fromParams(blendParams(pre,params(j),ease((q-.20)/.15)));
 const edge=Math.min(q/.12,(1-q)/.12,1);j=fromParams(blendParams(params(base),params(j),ease(edge)));const w=ease((q-.30)/.10)*(1-ease((q-.61)/.18)),a=j.strike_ankle,k=j.strike_knee,oldAngle=Math.atan2(j.strike_toe[1]-j.strike_heel[1],j.strike_toe[0]-j.strike_heel[0]),shin=Math.atan2(a[1]-k[1],a[0]-k[0]);sole(j,'strike',a,oldAngle+Math.atan2(Math.sin(shin-oldAngle),Math.cos(shin-oldAngle))*w);return j;
}
export function rawSolePush(q){return fulltracePushPose(q);}

export const soleSegment=j=>[j.strike_heel,j.strike_toe];
export const shinSegment=j=>[add(j.strike_knee,mul(sub(j.strike_ankle,j.strike_knee),.60)),add(j.strike_knee,mul(sub(j.strike_ankle,j.strike_knee),.95))];
function project(p,a,b){const v=sub(b,a),t=clamp((sub(p,a)[0]*v[0]+sub(p,a)[1]*v[1])/(v[0]*v[0]+v[1]*v[1]||1));return add(a,mul(v,t));}
export function closestSegments(a,b,c,d){const u=sub(b,a),v=sub(d,c),w=sub(c,a),cross=(x,y)=>x[0]*y[1]-x[1]*y[0],den=cross(u,v);if(Math.abs(den)>1e-9){const t=cross(w,v)/den,s=cross(w,u)/den;if(t>=0&&t<=1&&s>=0&&s<=1){const p=add(a,mul(u,t));return{distance:0,point:p,receiverPoint:p};}}const rows=[[a,project(a,c,d)],[b,project(b,c,d)],[project(c,a,b),c],[project(d,a,b),d]].map(([p,q])=>({point:p,receiverPoint:q,distance:len(sub(p,q))}));return rows.sort((x,y)=>x.distance-y.distance)[0];}
export function specialSurfaces(ctx,kind){const d=ctx.joints,tf=p=>[ctx.gap+p[0]*ctx.defFace*ctx.face,p[1]];return kind==='pushkick'?[[tf(d.center),tf(d.chest),8]]:['support','strike'].map(side=>[tf(d[side+'_hip']??add(d.center,[side==='support'?-4:4,0])),tf(add(d[side+'_hip']??add(d.center,[side==='support'?-4:4,0]),mul(sub(d[side+'_knee']??add(d.center,[side==='support'?-10:10,-24]),d[side+'_hip']??add(d.center,[side==='support'?-4:4,0])),.65))),5]);}
export function specialContact(id,j,ctx){const seg=id==='pushkick'?soleSegment(j):shinSegment(j),surfaces=specialSurfaces(ctx,id),rows=surfaces.map(([a,b,r])=>({...closestSegments(...seg,a,b),receiver:[a,b],receiverRadius:r})),c=rows.sort((a,b)=>a.distance-a.receiverRadius-(b.distance-b.receiverRadius))[0];return{...c,reaches:c.distance<=c.receiverRadius+2.3+.04&&(id!=='dutchlow'||j.strike_ankle[0]>=j.strike_knee[0]+8),radius:2.3,contactSurface:id==='pushkick'?'sole':'shin',target:id==='pushkick'?'body':'leg',attackerSegment:seg};}
function lowAt(q,ctx){
 const j=rawLowKick(q,ctx?.stepApplied);if(!ctx)return j;
 // Sink back over the planted support foot when a thigh is close. This is local
 // hip weight transfer, not root movement or a longer bone.
 const envelope=ease(Math.min(q/.30,(1-q)/.20,1)),shift=Math.max(0,Math.min(18,(46-ctx.gap)*.8))*envelope;
 if(!shift)return j;const fixed=j.support_ankle,ankle=[...j.strike_ankle],theta=Math.atan2(j.strike_toe[1]-j.strike_heel[1],j.strike_toe[0]-j.strike_heel[0]);
 for(const n in j)if(!/^support_(knee|ankle|heel|toe)$/.test(n))j[n][0]-=shift;
 const dx=j.support_hip[0]-fixed[0],drop=Math.max(0,j.support_hip[1]-fixed[1]-Math.sqrt(Math.max(0,50.9**2-dx*dx)));
 for(const n in j)if(!/^support_(knee|ankle|heel|toe)$/.test(n))j[n][1]-=drop;
 j.support_knee=ik(j.support_hip,fixed,26,25,1).joint;leg(j,'strike',[ankle[0],ankle[1]+8*Math.sin(Math.PI*q)*envelope],theta);return j;
}

export function specialPose(id,elapsed,total,ctx){const q=clamp(elapsed/total);let raw=id==='pushkick'?rawSolePush(q):lowAt(q,ctx);if(!ctx)return raw;
 if(id==='pushkick'){
  for(let pass=0;pass<4;pass++){const [heel,toe]=soleSegment(raw),surfaces=specialSurfaces(ctx,id),cap=Math.min(...surfaces.flatMap(s=>Array.from({length:7},(_,i)=>capsuleNearX(clamp(add(heel,mul(sub(toe,heel),i/6))[1],Math.min(s[0][1],s[1][1]),Math.max(s[0][1],s[1][1])),s[0],s[1],s[2]+2.3)))),lead=Math.max(heel[0],toe[0]),a=raw.strike_ankle,theta=Math.atan2(toe[1]-heel[1],toe[0]-heel[0]),x=Number.isFinite(cap)?a[0]+Math.min(0,cap-lead+.01):a[0],y=Math.max(-Math.min(-4*Math.sin(theta)-3*Math.cos(theta),6.9*Math.sin(theta)-3*Math.cos(theta))+.001,Math.min(a[1],raw.strike_hip[1]+(x-raw.strike_hip[0]-16)*.65));leg(raw,'strike',[x,y],theta);}return raw;
 }
 // Constrain the shin to the near thigh surface through the swing. The foot
 // may pass outside/below the thigh; the knee is not the damaging point.
 const surfaces=specialSurfaces(ctx,id),clear=j=>Math.min(...surfaces.map(([a,b,r])=>closestSegments(...shinSegment(j),a,b).distance-r));
 if(clear(raw)<2.3){let lo=0,hi=30;const shifted=amount=>{const j=structuredClone(raw),fixed=j.support_ankle;for(const n in j)if(!/^support_(knee|ankle|heel|toe)$/.test(n))j[n][0]-=amount;const dx=j.support_hip[0]-fixed[0],drop=Math.max(0,j.support_hip[1]-fixed[1]-Math.sqrt(Math.max(0,50.9**2-dx*dx)));for(const n in j)if(!/^support_(knee|ankle|heel|toe)$/.test(n))j[n][1]-=drop;j.support_knee=ik(j.support_hip,fixed,26,25,1).joint;return j;};for(let n=0;n<16;n++){const m=(lo+hi)/2;if(clear(shifted(m))<2.3)lo=m;else hi=m;}raw=shifted(hi);}
 // A very close, pinned target must also remain on the near side during
 // recovery; distance-only tests cannot distinguish its far side after crossing.
 if(q>.20&&ctx.gap<30){
  const deficit=j=>{const[a,b]=shinSegment(j);let worst=-Infinity;for(let k=0;k<=8;k++){const p=add(a,mul(sub(b,a),k/8));for(const[c,d,r]of surfaces){const cap=capsuleNearX(p[1],c,d,r+2.3);if(Number.isFinite(cap))worst=Math.max(worst,p[0]-cap);}}return worst;};
  if(deficit(raw)>.01){const shifted=n=>{const j=structuredClone(raw),fixed=j.support_ankle;for(const k in j)if(!/^support_(knee|ankle|heel|toe)$/.test(k))j[k][0]-=n;const dx=j.support_hip[0]-fixed[0],drop=Math.max(0,j.support_hip[1]-fixed[1]-Math.sqrt(Math.max(0,50.9**2-dx*dx)));for(const k in j)if(!/^support_(knee|ankle|heel|toe)$/.test(k))j[k][1]-=drop;j.support_knee=ik(j.support_hip,fixed,26,25,1).joint;return j;};let lo=0,hi=30;for(let k=0;k<16;k++){const n=(lo+hi)/2;if(deficit(shifted(n))>.01)lo=n;else hi=n;}return shifted(hi);}
 }
 return raw;
}
