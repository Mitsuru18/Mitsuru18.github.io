import {bodyUppercut,bodyUppercutPose,bodyUppercutInterrupted,bodyUppercutEase} from './body-uppercut-motion.js';
// Anatomical fills, not hair/shadows. These R3 polygons are also used by its
// painter. Coordinates are logical draw pixels, +y down; no pose is re-fitted.
export const PUNCH_OUTLINE=[[-2,-2.7],[1.5,-3],[4,-1.8],[4,1.7],[1,3],[-2,2.2]];
export const R3_HEAD_OUTLINE=[[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]];
export const R3_PELVIS_OUTLINE=[[-7,-3],[7,-3],[7.7,-1.5],[8,.4],[7.4,2.9],[5.5,5.1],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mix=(a,b,q)=>a.map((v,i)=>v+(b[i]-v)*q),rotate=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
export function r3TorsoOutline(h,s){const dx=s[0]-h[0],dy=s[1]-h[1],L=Math.hypot(dx,dy)||1,n=[-dy/L,dx/L],at=(p,w)=>add(p,n.map(x=>x*w));return[at(s,-7),add(s,[-3,-3]),at(s,9),at(mix(s,h,.32),9),at(h,6),add(h,[0,5]),at(h,-6),at(mix(s,h,.3),-8)];}
export function r3ReceivingPose(f,time){
 if(bodyUppercut(f.action?.technique))return bodyUppercutPose(f.action.elapsed);
 const s=f.interruptedStrike;if(!bodyUppercut(s?.action?.technique))return null;
 const p=bodyUppercutPose(s.action.elapsed),age=Math.max(0,time-s.createdTime);
 return {...p,joints:bodyUppercutInterrupted(s,age),customWeight:p.customWeight*(1-bodyUppercutEase(age/(s.duration||.2))),stage:'interrupted'};
}
export function r3ReceivingSurfaces(p,target){
 const j=p.joints,h=[j.center[0],-j.center[1]],s=[j.chest[0],-j.chest[1]],head=[j.head[0],-j.head[1]],out=[];
 if(p.customWeight>0){
  if(target==='head'){const angle=Math.atan2(s[0]-head[0],Math.abs(s[1]-head[1]))*.25;out.push({kind:'polygon',points:R3_HEAD_OUTLINE.map(v=>add(head,rotate(v,angle))),style:'r3'});}
  if(target==='body')for(const points of[r3TorsoOutline(h,s),R3_PELVIS_OUTLINE.map(v=>add(h,v))])out.push({kind:'polygon',points,style:'r3'});
 }
 // During entry/return/recoil both character fills are actually painted with
 // complementary opacity. Use the union, including the exact ellipse. At the
 // endpoints only the visible style participates, so there is no hidden box.
 if(p.customWeight<1){
  if(target==='head'){out.push({kind:'ellipse',center:head,rx:5.5,ry:7.6,style:'common'});out.push({kind:'polygon',points:[[5,-.5],[7,1.5],[5,2]].map(v=>add(head,v)),style:'common'});}
  if(target==='body'){const dx=s[0]-h[0],dy=s[1]-h[1],L=Math.hypot(dx,dy)||1,n=[-dy/L,dx/L],at=(p,w)=>add(p,n.map(x=>x*w));out.push({kind:'polygon',points:[at(h,-6.5),at(s,-8.5),at(s,8.5),at(h,6.5)],style:'common'});out.push({kind:'polygon',points:[[-7,-2],[7,-2],[7.7,-.65],[8,1.05],[7.4,3.3],[5.5,5.2],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.9],[-8,1.7],[-7.8,-.4]].map(v=>add(h,v)),style:'common'});}
 }
 return out;
}
export function punchOutline(chain){const a=Math.atan2(chain.c.y-chain.b.y,chain.c.x-chain.b.x);return PUNCH_OUTLINE.map(p=>add([chain.c.x,chain.c.y],rotate(p,a)));}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const on=(a,b,p)=>Math.abs(cross(a,b,p))<1e-8&&p[0]>=Math.min(a[0],b[0])-1e-8&&p[0]<=Math.max(a[0],b[0])+1e-8&&p[1]>=Math.min(a[1],b[1])-1e-8&&p[1]<=Math.max(a[1],b[1])+1e-8;
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];if(on(a,b,p))return true;if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function intersects(a,b){if(inside(a[0],b)||inside(b[0],a))return true;for(let i=0;i<a.length;i++)for(let k=0;k<b.length;k++){const x=a[i],y=a[(i+1)%a.length],u=b[k],v=b[(k+1)%b.length],c=[cross(x,y,u),cross(x,y,v),cross(u,v,x),cross(u,v,y)];if((c[0]*c[1]<0&&c[2]*c[3]<0)||on(x,y,u)||on(x,y,v)||on(u,v,x)||on(u,v,y))return true;}return false;}
export function punchTouchesSurface(poly,s){
 if(s.kind==='polygon')return intersects(poly,s.points);
 const points=poly.map(p=>[(p[0]-s.center[0])/s.rx,(p[1]-s.center[1])/s.ry]);if(inside([0,0],points))return true;
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],v=[b[0]-a[0],b[1]-a[1]],q=Math.max(0,Math.min(1,-(a[0]*v[0]+a[1]*v[1])/(v[0]*v[0]+v[1]*v[1]||1)));if(Math.hypot(a[0]+v[0]*q,a[1]+v[1]*q)<=1+1e-9)return true;}return false;
}
