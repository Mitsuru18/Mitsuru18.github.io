// R22 generated recovery of an already extended Dutch kick. Raw48 observations
// and clock remain untouched. Forward plant offset6 is a display/contact design
// approximation, not observed depth or a new range. No target/AI/RNG access.
import F from './dutchlow-r19-data.js';
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,q)=>a.map(x=>x*q),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],mix=(a,b,q)=>a.map((x,i)=>x+(b[i]-x)*q);
function basis(p){let j=p.joints3D,u=unit(sub(j.strike_toe,j.strike_heel)),v=sub(j.strike_ankle,j.strike_heel);v=unit(sub(v,mul(u,dot(v,u))));return[u,v,cross(u,v)];}
function quat(b){let m=Array.from({length:3},(_,i)=>b.map(v=>v[i])),tr=m[0][0]+m[1][1]+m[2][2],q;if(tr>0){let s=Math.sqrt(tr+1)*2;q=[(m[2][1]-m[1][2])/s,(m[0][2]-m[2][0])/s,(m[1][0]-m[0][1])/s,s/4];}else{let i=[0,1,2].sort((a,b)=>m[b][b]-m[a][a])[0],j=(i+1)%3,k=(i+2)%3,s=Math.sqrt(1+m[i][i]-m[j][j]-m[k][k])*2;q=[0,0,0,0];q[i]=s/4;q[j]=(m[i][j]+m[j][i])/s;q[k]=(m[i][k]+m[k][i])/s;q[3]=(m[k][j]-m[j][k])/s;}return unit(q);}
const spin=(q,p)=>{let u=q.slice(0,3),t=mul(cross(u,p),2);return add(p,add(mul(t,q[3]),cross(u,t)));};
const canonical=(()=>{let f=F[0],b=basis(f),a=f.joints3D.strike_ankle;return f.footVertices3D.A.map(p=>b.map(v=>dot(sub(p,a),v)));})();
function solve(hip,ankle,pole){let v=sub(ankle,hip),d=len(v);if(d>51+1e-7||d<1-1e-7)throw Error('R22 return unreachable '+d);let u=unit(v),x=(26*26-25*25+d*d)/(2*d),h=Math.sqrt(Math.max(0,26*26-x*x)),w=sub(pole,hip);w=sub(w,mul(u,dot(w,u)));if(len(w)<1e-8)throw Error('R22 ambiguous knee plane');return add(add(hip,mul(u,x)),mul(unit(w),h));}
export function applyDutchReturn(current,t,from,before,land,start,end){
 let j=current.joints3D,feet=current.footVertices3D,q=Math.max(0,Math.min(1,(t-start)/(end-start))),a=from.joints3D.strike_ankle,b=land.joints3D.strike_ankle.slice();
 // Local/world correspondence: root step has completed before source475;
 // plant remains stationary source486..492, body/support motion stays native.
 b[0]=land.joints3D.center[0]+6;
 let rb=basis(land),yaw=Math.atan2(rb[0][2],rb[0][0]),rotate=p=>[p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),p[1],p[2]*Math.cos(yaw)-p[0]*Math.sin(yaw)],qa=quat(basis(from)),qb=quat(rb.map(rotate));
 if(dot(qa,qb)<0)qb=mul(qb,-1);let ease=q*q*(3-2*q),rot=unit(mix(qa,qb,ease)),duration=end-start,velocity=mul(sub(a,before.joints3D.strike_ankle),1/1e-5),ankle=a.map((x,i)=>(2*q**3-3*q*q+1)*x+(q**3-2*q*q+q)*duration*velocity[i]+(-2*q**3+3*q*q)*b[i]);
 let mesh=canonical.map(v=>add(ankle,spin(rot,v))),up=Math.max(0,-Math.min(...mesh.map(p=>p[1])));if(up){ankle[1]+=up;mesh=mesh.map(p=>[p[0],p[1]+up,p[2]]);}
 j.strike_ankle=ankle;j.strike_heel=add(ankle,spin(rot,[-4,-3,0]));j.strike_toe=add(ankle,spin(rot,[6.9,-3,0]));
 let pole=add(j.strike_hip,sub(from.joints3D.strike_knee,from.joints3D.strike_hip));j.strike_knee=solve(j.strike_hip,ankle,pole);feet.A=mesh;
 return{joints3D:j,footVertices3D:feet,returnEvidence:{kind:'generated-forward-chamber-return',startNative:475,plantNative:486,progress:q,forwardPlantOffset:6,footFloorCorrection:up,approximation:true}};
}
