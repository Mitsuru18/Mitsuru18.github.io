import {approvedBodyOperations} from './approved-body.js';
import {punchTouchesSurface} from './body-uppercut-contact.js';
export const FIST_SEGMENTS=256;
export const FIST_BOUND_ERROR=3.4*(1-Math.cos(Math.PI/FIST_SEGMENTS));
// Exact common painter fills at scale .5, not center/radius combat proxies.
export function backfistHeadSurfaces(j,headTilt=0){const ops=approvedBodyOperations(j,1,false,null,headTilt),head=[];let on=false;for(const op of ops){if(op[0]==='region'){on=op[1]==='head';continue;}if(on)head.push(op);}const e=head.find(op=>op[0]==='oval'),nose=head.filter(op=>op[0]==='poly').at(-1);return [{kind:'ellipse',center:e[1].map(x=>x/2),rx:e[2]/2,ry:e[3]/2,...(headTilt?{angle:e[5]}:{})},{kind:'polygon',points:nose[1].map(p=>p.map(x=>x/2))}];}
export function backfistFist(j,n=FIST_SEGMENTS,outer=false){const op=approvedBodyOperations(j).filter(o=>o[0]==='oval').at(-1),[cx,cy]=op[1].map(x=>x/2),rx=op[2]/2,ry=op[3]/2,a=op[5],scale=outer?1/Math.cos(Math.PI/n):1;return Array.from({length:n},(_,i)=>{const t=2*Math.PI*i/n,x=rx*Math.cos(t)*scale,y=ry*Math.sin(t)*scale;return[cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)];});}
export function transformSurface(s,face=1,dx=0){return s.kind==='polygon'?{...s,points:s.points.map(p=>[dx+face*p[0],p[1]])}:{...s,center:[dx+face*s.center[0],s.center[1]],...(s.angle===undefined?{}:{angle:s.angle*face})};}
export function backfistSurfaceContact(j,surfaces,af=1,df=-1,offset=0,target='head'){const project=p=>[offset+af*p[0],p[1]],punch=backfistFist(j).map(project),outer=backfistFist(j,FIST_SEGMENTS,true).map(project),receiver=surfaces.map(s=>transformSurface(s,df)),reaches=receiver.some(s=>backfistPunchTouchesSurface(punch,s)),outerReaches=receiver.some(s=>backfistPunchTouchesSurface(outer,s));return{reaches,outerReaches,boundaryAmbiguous:reaches!==outerReaches,punch,surfaces:receiver,target,surface:'v70 near-fist ellipse inscribed polygon',maxInwardError:FIST_BOUND_ERROR,coordinateSystem:'logical draw pixels relative to receiver root, +y down'};}

// Rotation is local to backfist KO head surfaces. Other receiver policies are unchanged.
export function backfistPunchTouchesSurface(poly,s){if(s.kind!=='ellipse'||!s.angle)return punchTouchesSurface(poly,s);const c=Math.cos(s.angle),n=Math.sin(s.angle),points=poly.map(p=>{const x=p[0]-s.center[0],y=p[1]-s.center[1];return[x*c+y*n,-x*n+y*c]});return punchTouchesSurface(points,{kind:'ellipse',center:[0,0],rx:s.rx,ry:s.ry});}

// R11 comparison only. Common painter torso and rounded pelvis fill, excluding
// neck, head, arms, legs and cosmetic shading. No common painter edit.
export function backfistBodySurfaces(j){const ops=approvedBodyOperations(j),polys=[];let body=false;for(const o of ops){if(o[0]==='region'){body=o[1]==='body';continue;}if(body&&o[0]==='poly')polys.push(o[1]);}if(polys.length<4)throw Error('Common torso/waist painter structure changed');return [polys[0],polys[3]].map(points=>({kind:'polygon',points:points.map(p=>p.map(v=>v/2))}));}

// R11 separate side-change: verbatim geometry of ordinary legacy torso/waist,
// read from frozen renderer torso(). Painter remains unchanged and tested below.
export function backfistLegacyBodySurfaces(o){const h=[o.hip.x,o.hip.y],s=[o.chest.x,o.chest.y],v=[s[0]-h[0],s[1]-h[1]],l=Math.hypot(...v)||1,n=[-v[1]/l,v[0]/l],turn=o.bodyTurn||0,spin=o.spinWeight||0,yaw=o.spinYaw||0,width=(1-Math.abs(turn)*.25)*(1-spin+spin*(.55+.45*Math.abs(Math.cos(yaw)))),at=(p,w)=>[p[0]+n[0]*w*width,p[1]+n[1]*w*width],mix=(a,b,q)=>a.map((x,i)=>x+(b[i]-x)*q);return[{kind:'polygon',points:[at(s,-7),[s[0]-3,s[1]-3],at(s,9),at(mix(s,h,.32),9),at(h,6),[h[0],h[1]+5],at(h,-6),at(mix(s,h,.3),-8)]},{kind:'polygon',points:[[-7,-3],[7,-3],[7.7,-1.5],[8,.4],[7.4,2.9],[5.5,5.1],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(p=>[h[0]+p[0],h[1]+p[1]])}];}
