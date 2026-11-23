import{swapLegs}from'./leg-strike-motion.js';
// New, local-only choreography. Manual reference interpretation, not captured motion.
import{params,fromParams,receiverPose,blendParams,clamp,add,sub,mul,len,vec}from'./approved-2d-core.js';
export const EXPANSION_STRIKES=Object.freeze({
 uppercut:{name:'アッパー',style:'ボクシング',target:'head',type:'punch',point:'near_hand',radius:2.5,power:18,range:68,cost:13,windup:.27,active:.16,recovery:.37,description:'膝と腰を使い、畳んだ手前の拳を下から頭へ突き上げる。短い間合い向き。'},
 backfist:{name:'返し裏拳',style:'プンチャック・シラット',target:'head',type:'punch',point:'near_hand',radius:2.5,power:13,range:92,cost:10,windup:.20,active:.14,recovery:.34,description:'肘を畳んだ位置から拳の甲側を返して頭へ当て、素早く引く。シラット章で学ぶゲーム用の手技。'},
 hammerfist:{name:'振り下ろし鉄槌',style:'プンチャック・シラット',target:'head',type:'punch',point:'near_hand',radius:2.7,power:20,range:83,cost:15,windup:.38,active:.18,recovery:.43,description:'頭の横へ上げた拳を、小指側から振り下ろす。肘で当てる技とは別の手技。'},
 backkick:{name:'後ろ蹴り',style:'テコンドー',target:'body',type:'kick',point:'support_heel',radius:2.3,power:27,range:144,cost:19,windup:.48,active:.18,recovery:.48,description:'相手を肩越しに見て腰を返し、畳んだ脚の踵を胴へ押し出す。回し蹴りとは異なる直線の蹴り。'},
 flyingknee:{postureKind:'jump',name:'飛び膝蹴り',style:'ムエタイ',target:'body',type:'kick',point:'strike_knee',radius:3.6,power:25,range:104,cost:22,windup:.44,active:.18,recovery:.50,description:'支持脚で跳び、畳んだ膝を胴へ運ぶ。膝を戻して支持脚、蹴り脚の順で着地。空中の攻撃中だけ脚部を回避。頭・胴、離陸と着地は無防備。'},
 horizontalelbow:{name:'横肘',style:'ラウェイ',target:'head',type:'punch',point:'near_elbow',radius:3,power:19,range:67,cost:15,windup:.29,active:.18,recovery:.36,description:'手前の腕を畳んで肘を肩の高さへ上げ、腰と肩の回転で横へ打つ。縦肘と異なる短い横の軌道。'}
});
const ease=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x))},mix=(a,b,u)=>a+(b-a)*u;
const stance=()=>fromParams(params(receiverPose()));
function chain(a,c,l1,l2,bend=-1){let v=sub(c,a),d=clamp(len(v),Math.abs(l1-l2)+.01,l1+l2-.01),u=mul(v,1/(len(v)||1)),k=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-k*k));return{joint:add(add(a,mul(u,k)),mul([-u[1],u[0]],bend*h)),end:add(a,mul(u,d))}}
function hand(j,side,target){const r=chain(j[side+'_shoulder'],target,18,20.5,-1);j[side+'_elbow']=r.joint;j[side+'_wrist']=add(r.joint,mul(sub(r.end,r.joint),17/20.5));j[side+'_hand']=r.end}
function foot(j,a,theta){const u=vec(theta),n=[-u[1],u[0]];j.strike_ankle=a;j.strike_heel=add(add(a,mul(u,-4)),mul(n,-3));j.strike_toe=add(add(a,mul(u,6.9)),mul(n,-3))}
function leg(j,target,theta){const r=chain(j.strike_hip,target,26,25,1);j.strike_knee=r.joint;foot(j,r.end,theta)}
function elbow(j,theta){const sh=j.near_shoulder;j.near_elbow=add(sh,mul(vec(theta),18));j.near_wrist=add(j.near_elbow,mul(vec(theta+2.2),17));j.near_hand=add(j.near_wrist,mul(vec(theta+2.2),3.5))}
function nodesAt(nodes,q){const i=Math.max(1,nodes.findIndex(n=>n[0]>=q)),a=nodes[i-1],b=nodes[i],u=ease((q-a[0])/(b[0]-a[0]));return a.slice(1).map((x,k)=>mix(x,b[k+1],u))}
function raw(id,q){
 const neutral=id==='backkick'?swapLegs(stance()):stance(),p=params(neutral),d=Math.sin(Math.PI*q),v=EXPANSION_STRIKES[id];if(q<=0||q>=1)return stance();
 p.ss+=.06*d;p.st-=.06*d;
 // Evolve uppercut: load with bent knees/torso, then drive hip and shoulder up.
 // near is the visible foreground chain, not a universal anatomical label.
 if(id==='uppercut'){
  const [load,drive]=nodesAt([[0,0,0],[.22,1,0],[.42,.10,1],[.55,0,1],[.75,.2,.25],[1,0,0]],q);
  p.ss-=.23*load-.03*drive;p.st+=.18*load-.03*drive;
  p.spine+=.22*load-.20*drive;p.hip+=.13*load-.09*drive;
  p.shoulders-=.30*load-.28*drive;
 }

 p.spine+=id==='backkick'?nodesAt([[0,0],[.18,.10],[.32,.48],[.45,.92],[.60,.92],[.78,.50],[1,0]],q)[0]:id==='flyingknee'?-.12*d:id==='horizontalelbow'?-.45*d:-.06*d;
 p.shoulders+=id==='backkick'?nodesAt([[0,0],[.18,-.45],[.32,-.65],[.48,-.22],[.63,-.22],[.80,-.50],[1,0]],q)[0]:.10*d;
 if(id==='backkick'){
  const turn=nodesAt([[0,0],[.18,1],[.72,1],[1,0]],q)[0];
  p.nearu=mix(p.nearu,-2.25,turn);p.nearf=mix(p.nearf,1.80,turn);p.nearh=p.nearf;
  p.faru=mix(p.faru,-2.05,turn);p.farf=mix(p.farf,1.70,turn);p.farh=p.farf;
 }
 let j=fromParams(p);
 if(id==='backkick'){
  const a=nodesAt([[0,17,3,0],[.16,6,5,.25],[.29,-10,25,1.25],[.36,-6,38,1.5],[.48,46,57,1.5],[.58,47,57,1.5],[.73,-7,32,1.3],[.87,6,6,.2],[1,17,3,0]],q);
  leg(j,[a[0],a[1]],a[2]);
  // Compact arms are interpolated in joint angles above, avoiding IK branch flips.
 }else if(id==='flyingknee'){
  const lift=q<.22?0:q<.46?8*ease((q-.22)/.24):q<.60?8:q<.85?8*(1-ease((q-.60)/.25)):0;
  for(const k of Object.keys(j))j[k]=add(j[k],[0,lift]);
  const a=nodesAt([[0,-1.28,-1.45,0],[.22,-.6,-2.8,-.3],[.44,.65,-1.95,-.4],[.60,.68,-1.95,-.4],[.78,-.8,-2.6,-.2],[1,-1.28,-1.45,0]],q);
  j.strike_knee=add(j.strike_hip,mul(vec(a[0]),26));
  foot(j,add(j.strike_knee,mul(vec(a[1]),25)),a[2]);
 }else if(id==='horizontalelbow'){
  const a=nodesAt([[0,-1.4],[.23,1.4],[.40,.65],[.58,.60],[.74,1.05],[1,-1.4]],q);elbow(j,a[0]);
 }else{
  const path={uppercut:[[0,17,79],[.22,6,65],[.33,15,72],[.43,25,92],[.54,25,94],[.70,17,85],[1,17,79]],backfist:[[0,17,79],[.23,-1,93],[.43,33,93],[.55,34,92],[.72,8,91],[1,17,79]],hammerfist:[[0,17,79],[.24,3,110],[.36,11,112],[.48,31,94],[.58,32,91],[.74,17,91],[1,17,79]]}[id];
  const a=nodesAt(path,q);hand(j,'near',a);
 }
 // Common-stance joins interpolate bone angles, never independent joint positions.
 const boundary=ease(Math.min(q/.12,(1-q)/.12,1));
 const flight=id==='flyingknee'?j.support_ankle[1]-3:0;
 const out=fromParams(blendParams(params(neutral),params(j),boundary));
 if(flight>0)for(const k of Object.keys(out))out[k]=add(out[k],[0,flight*boundary]);
 return id==='backkick'?swapLegs(out):out;
}
function segments(ctx){const d=ctx.joints,tf=p=>[ctx.gap+p[0]*ctx.defFace*ctx.face,p[1]];return[[tf(d.head??add(d.chest,[0,14])),tf(d.head??add(d.chest,[0,14])),7],[tf(d.center),tf(d.chest),8]]}
function near(p,[a,b,r],radius){const q=clamp((p[1]-a[1])/(b[1]-a[1]||1)),y=a[1]+q*(b[1]-a[1]),dy=Math.abs(y-p[1]),rr=r+radius;return dy<=rr?a[0]+q*(b[0]-a[0])-Math.sqrt(Math.max(0,rr*rr-dy*dy)):Infinity}
export function expansionPose(id,elapsed,ctx=null){
 const m=EXPANSION_STRIKES[id];if(!m)return null;
 const total=m.windup+m.active+m.recovery,q=clamp(elapsed/total),j=raw(id,q);
 if(ctx&&q>0&&q<1){
  const p=j[m.point],all=segments(ctx),cap=Math.min(...all.map(s=>near(p,s,m.radius)));
  if(Number.isFinite(cap)&&p[0]>cap+.01){
   if(id==='backkick'){
    const delta=cap-p[0]+.01,k=swapLegs(j);leg(k,add(k.strike_ankle,[delta,0]),Math.atan2(k.strike_toe[1]-k.strike_heel[1],k.strike_toe[0]-k.strike_heel[0]));Object.assign(j,swapLegs(k));
   }else if(id==='flyingknee'){
    // During flight a contact-limited body translation keeps the knee height and all bone lengths.
    const dx=cap-p[0]+.01;for(const key of Object.keys(j))j[key]=add(j[key],[dx,0]);
   }else if(id==='horizontalelbow'){
    const sh=j.near_shoulder,theta=Math.acos(clamp((cap+.01-sh[0])/18,-1,1));elbow(j,theta);
   }else hand(j,'near',[cap+.01,p[1]]);
  }
 }
 return{joints:j,total,coreDuration:total,stage:'independent-new-strike-local-candidate',approvedDuration:null,sourceElapsed:null};
}
