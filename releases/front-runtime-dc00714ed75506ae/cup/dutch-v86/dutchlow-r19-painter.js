import{approvedBodyOperations,paintApprovedOperations}from'./approved-body.js';
import{appearancePalette,hairShape}from'./appearance.js';
import TRACK from'./dutchlow-r19-head-track.js';
const tag=(o,part)=>{Object.defineProperty(o,'contactPart',{value:part});return o},clamp=x=>Math.max(0,Math.min(1,x));
function palette(alt,appearance){return appearancePalette(appearance,alt?{skin:'#aa7458',light:'#d69a76',shade:'#794f41',cloth:'#773e43',bright:'#a95b58'}:{skin:'#ce956b',light:'#f0bb81',shade:'#9c684c',cloth:'#255660',bright:'#3f7d83'},alt?1:0);}
const delta=(c,a,b)=>'#'+c.slice(1).match(/../g).map((v,i)=>Math.max(0,Math.min(255,parseInt(v,16)+parseInt(b.slice(i*2+1,i*2+3),16)-parseInt(a.slice(i*2+1,i*2+3),16))).toString(16).padStart(2,'0')).join('');
export function dutchHeadAngles(p){if(p.headAngles)return p.headAngles;let n=Math.max(0,Math.min(47,(p.sourceNative??445)-445)),i=Math.floor(n),j=Math.min(47,i+1),q=n-i;return Object.fromEntries(['direction','roll','pitch'].map(k=>[k,TRACK[i][k]+(TRACK[j][k]-TRACK[i][k])*q]));}
export function dutchHeadOperations(p,{alt=false,appearance=null}={}){
 const C=palette(alt,appearance),t=dutchHeadAngles(p),h=[p.rawJoints.head[0]*2,-p.rawJoints.head[1]*2],rot=v=>{let[x,y]=v;return[h[0]+x*Math.cos(t.roll)-y*Math.sin(t.roll),h[1]+x*Math.sin(t.roll)+y*Math.cos(t.roll)]},d=clamp(t.direction),py=t.pitch*9;
 const poly=(v,c,hurt=false)=>{let o=tag(['poly',v.map(rot),c],'head');if(hurt)Object.defineProperty(o,'hurt',{value:true});return o},oval=(v,rx,ry,c,hurt=false)=>{let o=tag(['oval',rot(v),rx,ry,c,t.roll],'head');if(hurt)Object.defineProperty(o,'hurt',{value:true});return o};
 let hair=hairShape(C.hairStyle)?.map(v=>v.map(x=>x*1.9))??[[-11,0],[-11,-9],[-6,-15],[5,-15],[11,-8],[8,-4],[-3,-5],[-6,1]],ops=[oval([0,0],11,15.2,C.skin,true),poly(hair,'#293b40')],far=clamp((.95-d)/.10);
 if(far>0)ops.push(oval([-3.8+5*d,-2+py],1.1*far,1.1*far,'#253b40'));ops.push(oval([3.8+4.2*d,-2+py],1.3,1.1,'#253b40'));
 ops.push(poly([[10*d-1.2*(1-d),-1+py],[14*d+1.5*(1-d),3+py],[10*d+1.2*(1-d),4+py]],C.skin,true));
 if(d<1)ops.push(tag(['line',rot([-1.6*(1-d),4+py]),rot([1.6*(1-d),4+py]),.65*(1-d),C.shade],'head'));
 ops.push(tag(['line',rot([6*d-2.6*(1-d),8+py]),rot([10*d+2.6*(1-d),8+py]),1.2,C.shade],'head'));return ops;
}
export function dutchHeadSurfaces(p,options={}){return dutchHeadOperations(p,options).filter(o=>o.hurt).map(([kind,...a])=>kind==='poly'?{kind:'polygon',points:a[0].map(p=>p.map(x=>x/2))}:{kind:'ellipse',center:a[0].map(x=>x/2),rx:a[1]/2,ry:a[2]/2,angle:a[4]||0});}
function hull(a){a=a.map(p=>p.slice()).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lo=[],hi=[];for(let p of a){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p)}for(let p of a.toReversed()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p)}return lo.slice(0,-1).concat(hi.slice(0,-1));}
function foot(p,s,C){let v=p.footVertices3D[s],xy=p=>[2*p[0],-2*p[1]],skin=s==='A'?C.skin:C.shade,shade=s==='A'?C.shade:delta(C.shade,'#9c684c','#795940'),part=s==='A'?'supportFoot':'strikeFoot',out=[tag(['poly',hull(v.map(xy)),skin],part)],faces=[];
 for(let i=0;i<32;i++){let ids=[i,(i+1)%32,(i+1)%32+32,i+32];faces.push({ids,z:ids.reduce((sum,n)=>sum+v[n][2],0)/4})}faces.push({ids:Array.from({length:32},(_,i)=>i+32),z:v.slice(32).reduce((sum,p)=>sum+p[2],0)/32,top:true});faces.sort((a,b)=>a.z-b.z);for(let f of faces)out.push(tag(['poly',f.ids.map(i=>xy(v[i])),f.top?skin:shade],part));let w=clamp(1-Math.abs((p.sourceNative??445)-471));w=w*w*(3-2*w)*(p.artWeight??1);if(s==='A'&&w>0)out.push(tag(['oval',xy(p.rawJoints.strike_toe),4.8*w,4.8*w,skin,0],part));return out;
}
export function dutchOperations(p,{alt=false,appearance=null}={}){if(p.atRest)return approvedBodyOperations(p.joints,1,alt,appearance);
 const native=approvedBodyOperations(p.rawJoints,1,alt,appearance),C=palette(alt,appearance),out=[],done=new Set();let region=null;for(let op of native){if(op[0]==='region'){region=op[1];out.push(op);if(region==='head')out.push(...dutchHeadOperations(p,{alt,appearance}));continue}if(region==='head')continue;let s=op.contactPart==='strikeFoot'?'A':op.contactPart==='supportFoot'?'B':null;if(s){if(!done.has(s)){out.push(...foot(p,s,C));done.add(s)}continue}out.push(op)}return out;
}
export function paintDutch(c,p,alt=false,flashes=[],appearance=null){paintApprovedOperations(c,dutchOperations(p,{alt,appearance}),flashes);}
