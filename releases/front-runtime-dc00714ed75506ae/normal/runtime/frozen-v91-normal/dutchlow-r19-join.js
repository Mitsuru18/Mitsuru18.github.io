import F from'./dutchlow-r19-data.js';
import{params,fromParams,receiverPose}from'./approved-2d-core.js';
import{swapLegs}from'./leg-strike-motion.js';
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>Math.hypot(...a),unit=a=>mul(a,1/(norm(a)||1)),lerp=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x))};
function basis(f,side){let j=f.joints3D,u=unit(sub(j[side+'_toe'],j[side+'_heel'])),v=sub(j[side+'_ankle'],j[side+'_heel']);v=unit(sub(v,mul(u,dot(u,v))));return[u,v,cross(u,v)];}
function quat(b){let m=Array.from({length:3},(_,i)=>b.map(v=>v[i])),tr=m[0][0]+m[1][1]+m[2][2],q;if(tr>0){let s=Math.sqrt(tr+1)*2;q=[(m[2][1]-m[1][2])/s,(m[0][2]-m[2][0])/s,(m[1][0]-m[0][1])/s,s/4];}else{let i=[0,1,2].sort((a,b)=>m[b][b]-m[a][a])[0],j=(i+1)%3,k=(i+2)%3,s=Math.sqrt(1+m[i][i]-m[j][j]-m[k][k])*2;q=[0,0,0,0];q[i]=s/4;q[j]=(m[i][j]+m[j][i])/s;q[k]=(m[i][k]+m[k][i])/s;q[3]=(m[k][j]-m[j][k])/s;}return unit(q);}
const spin=(q,p)=>{let u=q.slice(0,3),t=mul(cross(u,p),2);return add(p,add(mul(t,q[3]),cross(u,t)));},local={};for(let[s,side]of[['A','strike'],['B','support']]){let b=basis(F[0],side),a=F[0].joints3D[side+'_ankle'];local[s]=F[0].footVertices3D[s].map(p=>b.map(v=>dot(sub(p,a),v)));}
export function frameFrom2D(engineJoints){
 const raw=swapLegs(engineJoints),j3=Object.fromEntries(Object.entries(raw).map(([k,p])=>[k,[...p,0]])),feet={};
 for(let[s,side]of[['A','strike'],['B','support']]){let a=j3[side+'_ankle'],h=j3[side+'_heel'],t=j3[side+'_toe'],u=unit(sub(t,h)),v=sub(sub(a,h),mul(u,4));v=mul(v,1/3);let xy=Math.hypot(v[0],v[1]);if(xy>1+1e-6)throw Error('non-rigid 2D foot target');v[2]=Math.sqrt(Math.max(0,1-xy*xy));v=unit(v);let w=cross(u,v);j3[side+'_heel']=sub(sub(a,mul(u,4)),mul(v,3));j3[side+'_toe']=sub(add(a,mul(u,6.9)),mul(v,3));feet[s]=local[s].map(p=>add(a,add(add(mul(u,p[0]),mul(v,p[1])),mul(w,p[2]))));}
 return{joints3D:j3,footVertices3D:feet,rawJoints:Object.fromEntries(Object.entries(j3).map(([k,p])=>[k,p.slice(0,2)])),sourceNative:445};
}
export const commonDutchFrame=()=>frameFrom2D(fromParams(params(receiverPose())));
function knee(h,a,pole){let v=sub(a,h),d=norm(v);if(d>51+1e-6||d<1-1e-6)throw Error('generated Dutch unreachable fixed leg '+d);let u=unit(v),x=(26*26-25*25+d*d)/(2*d),r=Math.sqrt(Math.max(0,26*26-x*x)),p=sub(pole,h);p=sub(p,mul(u,dot(p,u)));if(norm(p)<1e-9)p=cross(u,[1,0,0]);if(norm(p)<1e-9)p=cross(u,[0,0,1]);return add(add(h,mul(u,x)),mul(unit(p),r));}
export function blendDutchFrames(A,B,q,{stepping=false}={}){
 q=clamp(q);if(q===0)return structuredClone(A);if(q===1)return structuredClone(B);let u=smooth(q),a=A.joints3D,b=B.joints3D,z=Object.fromEntries(Object.keys(a).map(k=>[k,lerp(a[k],b[k],u)])),feet={},projection=[0,0,0];
 for(let[parent,child,L]of[['center','chest',30],['chest','head',14],['center','strike_hip',4],['center','support_hip',4],['chest','near_shoulder',4],['chest','far_shoulder',4]]){let v=unit(lerp(unit(sub(a[child],a[parent])),unit(sub(b[child],b[parent])),u));z[child]=add(z[parent],mul(v,L));}
 let moved=['strike','support'].map(side=>norm(sub(a[side+'_ankle'],b[side+'_ankle']))>1),phases=stepping&&moved.every(Boolean)?[clamp(2*q),clamp(2*q-1)]:[q,q];
 for(let[s,side,k]of[['A','strike',0],['B','support',1]]){let phase=phases[k],f=smooth(phase),qa=quat(basis(A,side)),qb=quat(basis(B,side));if(dot(qa,qb)<0)qb=mul(qb,-1);let rot=unit(lerp(qa,qb,f)),ankle=lerp(a[side+'_ankle'],b[side+'_ankle'],f);if(stepping&&moved[k])ankle[1]+=4*Math.sin(Math.PI*phase)**2;feet[s]=local[s].map(p=>add(ankle,spin(rot,p)));let up=Math.max(0,-Math.min(...feet[s].map(p=>p[1])));if(up){ankle[1]+=up;for(let p of feet[s])p[1]+=up;}z[side+'_ankle']=ankle;z[side+'_heel']=add(ankle,spin(rot,[-4,-3,0]));z[side+'_toe']=add(ankle,spin(rot,[6.9,-3,0]));}
 // Project the single pelvis root into BOTH reachable leg volumes. No bone
 // clipping or endpoint clamping, and no independent body stretching.
 for(let pass=0;pass<16;pass++){let changed=false;for(let side of['strike','support']){let v=sub(z[side+'_ankle'],z[side+'_hip']),d=norm(v);if(d>50.99999){let move=mul(v,(d-50.99999)/d);projection=add(projection,move);for(let[k,p]of Object.entries(z))if(!/_(ankle|heel|toe)$/.test(k))z[k]=add(p,move);changed=true;}}if(!changed)break;}
 for(let side of['strike','support'])z[side+'_knee']=knee(z[side+'_hip'],z[side+'_ankle'],add(lerp(a[side+'_knee'],b[side+'_knee'],u),projection));
 for(let side of['near','far'])for(let[parent,child,L]of[['shoulder','elbow',18],['elbow','wrist',17],['wrist','hand',3.5]]){let v=unit(lerp(unit(sub(a[side+'_'+child],a[side+'_'+parent])),unit(sub(b[side+'_'+child],b[side+'_'+parent])),u));z[side+'_'+child]=add(z[side+'_'+parent],mul(v,L));}
 return{joints3D:z,footVertices3D:feet,rawJoints:Object.fromEntries(Object.entries(z).map(([k,p])=>[k,p.slice(0,2)])),sourceNative:A.sourceNative,generatedRootCorrection:projection};
}
