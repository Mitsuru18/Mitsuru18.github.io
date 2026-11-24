// DWL R1f: attack arm always foreground, shield arm background. Standard wristbands reused.
// Legacy aliases far_* / right = ATTACK; near_* / left = SHIELD.
// These are compatibility labels, not fixed real-world handedness: screen-facing mirrors the attack.
// These aliases are NOT the view's near/far classification.
import{approvedBodyOperations,paintApprovedOperations}from'./approved-body.js';
import{appearancePalette}from'./appearance.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,n)=>a.map(v=>v*n);
export function spearArmView(face=1,bodyTurn=0){
 if(![1,-1].includes(face)||!Number.isFinite(bodyTurn))throw Error('Spear view requires explicit facing and finite inferred turn');
 // bodyTurn is an explicitly inferred view adaptation, not anatomical handedness.
 const yaw=(face===1?0:Math.PI)+bodyTurn,depth=Math.cos(yaw),rightFront=smooth((depth+.18)/.36);
 return {right:{anatomicalSide:'right',role:'attack',handForm:'bare-fist',frontWeight:1,legFrontWeight:rightFront},left:{anatomicalSide:'left',role:'shield',handForm:'open-palm',frontWeight:0,legFrontWeight:1-rightFront},yaw};
}
function armOps(j,side,C,face,wristbandOps){const alias=side==='right'?'far':'near',p=k=>j[alias+'_'+k].map((v,i)=>i?-v*2:v*2),s=p('shoulder'),e=p('elbow'),w=p('wrist'),h=p('hand'),o=[];
 const tag=(op,part)=>{Object.defineProperty(op,'contactPart',{value:'anatomical:'+side+':'+part});o.push(op)},oval=(p,rx,ry,color,a=0,part='arm')=>tag(['oval',p,rx,ry,color,a],part),line=(a,b,width,color,part='arm')=>tag(['line',a,b,width,color],part),poly=(points,color,part='arm')=>tag(['poly',points,color],part);
 function seg(a,b,r1,r2,col,part){const v=[b[0]-a[0],b[1]-a[1]],len=Math.hypot(...v)||1,n=[-v[1]/len,v[0]/len];poly([add(a,mul(n,r1)),add(b,mul(n,r2)),add(b,mul(n,-r2)),add(a,mul(n,-r1))],col,part);oval(a,r1,r1,col,0,part);oval(b,r2,r2,col,0,part);line(add(a,mul(n,-r1*.6)),add(b,mul(n,-r2*.6)),1.3,C.shade,part);}
 seg(s,e,7.6,5.4,C.skin,'upperArm');seg(e,w,5.8,3.6,C.skin,'forearm');
 if(['tee','gi'].includes(C.outfit))seg(s,add(s,mul([e[0]-s[0],e[1]-s[1]],C.outfit==='gi'?1:.48)),7.7,6,C.bright,'sleeve');
 // Exact standard operations, inserted before hands as in approved-body.js.
 o.push(...wristbandOps);
 const v=[h[0]-w[0],h[1]-w[1]],len=Math.hypot(...v)||1,u=v.map(x=>x/len),n=[-u[1],u[0]];
 if(side==='right'){
  seg(w,h,3.6,5.2,C.skin,'bareHand');oval(h,6.3,5.6,C.skin,Math.atan2(v[1],v[0]),'bareFist');
 }else{
  const palm=add(h,mul(u,-2));seg(w,palm,3.5,4.8,C.skin,'openPalm');oval(palm,5.5,4.2,C.light,Math.atan2(v[1],v[0]),'openPalm');
  for(let k=0;k<4;k++){const offset=(k-1.5)*2.35,a=add(palm,mul(n,offset)),b=add(add(a,mul(u,[7,10,9,7][k])),mul(n,(k-1.5)*1.05));line(a,b,2.1,C.light,'openFinger');}
  line(add(palm,mul(n,-3)),add(add(palm,mul(n,-8)),mul(u,3)),2.7,C.skin,'openThumb');
 }
 return o;
}
export function spearAnatomicalOperations(j,{face=1,bodyTurn=0,alt=false,appearance=null,headTilt=0}={}){
 const C=appearancePalette(appearance,alt?{skin:'#aa7458',light:'#d69a76',shade:'#794f41',cloth:'#773e43',bright:'#a95b58'}:{skin:'#ce956b',light:'#f0bb81',shade:'#9c684c',cloth:'#255660',bright:'#3f7d83'},alt?1:0),view=spearArmView(face,bodyTurn);
 const all=approvedBodyOperations(j,1,alt,appearance,headTilt),legParts=['supportLeg','supportFoot','strikeLeg','strikeFoot'],body=all.filter(o=>!['nearArm','farArm',...legParts].includes(o.contactPart)),legs={right:all.filter(o=>['supportLeg','supportFoot'].includes(o.contactPart)),left:all.filter(o=>['strikeLeg','strikeFoot'].includes(o.contactPart))},arms={right:armOps(j,'right',C,face,all.filter(o=>o.contactPart==='farArm'&&(o[0]==='poly'?o[2]:o[0]==='oval'?o[4]:null)==='#e8e7cc')),left:armOps(j,'left',C,face,all.filter(o=>o.contactPart==='nearArm'&&(o[0]==='poly'?o[2]:o[0]==='oval'?o[4]:null)==='#e8e7cc'))};
 return {body,legs,arms,view,identities:{attack:'right',shield:'left',compatibility:{far:'right',near:'left'}}};
}
export function paintSpearAnatomicalBody(c,j,options={},flashes=[]){const {body,legs,arms,view}=spearAnatomicalOperations(j,options),paint=(ops,w)=>{if(w<=0)return;c.save();c.globalAlpha*=w;paintApprovedOperations(c,ops,flashes);c.restore();};
 // Opaque underpass prevents background transparency outside torso during layer transition.
 for(const side of['right','left'])paint([['region','leg'],...legs[side]],1);
 for(const side of['right','left'])paint([['region','leg'],...legs[side]],view[side].legFrontWeight);
 for(const side of['right','left'])paint(arms[side],1);
 paint(body,1);
 for(const side of['right','left'])paint(arms[side],view[side].frontWeight);
}
