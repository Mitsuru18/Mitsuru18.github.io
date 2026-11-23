// R9 DISPLAY HYPOTHESIS ONLY. No recovered/observed depth, 3D anatomy or new hitbox.
// Raw source, every projected joint, clock, palette, outline and line width stay unchanged.
// A smooth scalar depth along each limb is compared with an inferred convex
// torso surface bounded by the exact pre-existing 2D torso polygon.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,q)=>a+(b-a)*q,smooth=q=>{q=clamp(q);return q*q*(3-2*q)},p=(x,y)=>({x,y}),lerp=(a,b,q)=>p(mix(a.x,b.x,q),mix(a.y,b.y,q));
const keys={rightUpperArm:['rightShoulder','rightElbow'],rightForearm:['rightElbow','rightWrist'],rightHand:['rightWrist','rightHand']};
const curves={rightShoulder:[[0,-1],[2,-.75],[5,.05],[8,.8],[11,1.35]],rightElbow:[[0,-1],[2,-.7],[4,.1],[8,1.25],[11,1.35]],rightWrist:[[0,-1],[1,-.6],[2,.1],[4,.65],[7,1.25],[11,1.35]],rightHand:[[0,-1],[1,-.6],[2,.2],[4,.9],[6,1.25],[11,1.35]]};
function value(nodes,t){if(t<=nodes[0][0])return nodes[0][1];for(let i=1;i<nodes.length;i++)if(t<=nodes[i][0])return mix(nodes[i-1][1],nodes[i][1],smooth((t-nodes[i-1][0])/(nodes[i][0]-nodes[i-1][0])));return nodes.at(-1)[1];}
export function inferFrontArmDepth(rig,sourcePosition){if(Object.isFrozen(rig))rig=structuredClone(rig);if(sourcePosition>=11){delete rig.frontArmDepth;return rig;}rig.frontArmDepth={hypothesis:'R9 continuous inferred limb depth against exact torso outline',sourcePosition,notObserved:true,jointDepth:Object.fromEntries(Object.entries(curves).map(([k,n])=>[k,value(n,sourcePosition)]))};return rig;}
export function frontDepthTorsoPolygon(o){const h=o.hip,s=o.chest,dx=s.x-h.x,dy=s.y-h.y,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,turn=o.bodyTurn||0,spin=o.spinWeight||0,yaw=o.spinYaw||0,width=(1-Math.abs(turn)*.25)*mix(1,.55+.45*Math.abs(Math.cos(yaw)),spin),at=(q,w)=>p(q.x+nx*w*width,q.y+ny*w*width);return[at(s,-7),p(s.x-3,s.y-3),at(s,9),at(lerp(s,h,.32),9),at(h,6),p(h.x,h.y+5),at(h,-6),at(lerp(s,h,.3),-8)];}
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),area=q=>q.reduce((s,a,i)=>{let b=q[(i+1)%q.length];return s+a.x*b.y-a.y*b.x},0)/2;
function triangulate(poly){let v=poly.map(p=>({...p}));if(area(v)<0)v.reverse();const out=[];while(v.length>3){let found=false;for(let i=0;i<v.length;i++){const a=v[(i+v.length-1)%v.length],b=v[i],c=v[(i+1)%v.length];if(cross(a,b,c)<=1e-9)continue;if(v.some(q=>q!==a&&q!==b&&q!==c&&cross(a,b,q)>=-1e-9&&cross(b,c,q)>=-1e-9&&cross(c,a,q)>=-1e-9))continue;out.push([a,b,c]);v.splice(i,1);found=true;break;}if(!found)throw Error('Torso polygon triangulation failed');}out.push(v);return out;}
function torsoZ(poly,q){const xs=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if((q.y>=a.y&&q.y<b.y)||(q.y>=b.y&&q.y<a.y))xs.push(a.x+(b.x-a.x)*(q.y-a.y)/(b.y-a.y));}if(xs.length<2)return 0;const lo=Math.min(...xs),hi=Math.max(...xs),u=(2*q.x-lo-hi)/(hi-lo||1);return Math.sqrt(Math.max(0,1-u*u));}
function clipPositive(poly,fn){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],u=fn(a),v=fn(b);if(u>0)out.push(a);if((u>0)!==(v>0))out.push(lerp(a,b,u/(u-v)));}return out;}
function split(tri,depth,visit){if(!depth){visit(tri);return;}const[a,b,c]=tri,x=lerp(a,b,.5),y=lerp(b,c,.5),z=lerp(c,a,.5);for(const t of[[a,x,z],[x,b,y],[z,y,c],[x,y,z]])split(t,depth-1,visit);}
export function frontArmOcclusionPolygons(o,part){if(!o.frontArmDepth||!keys[part])return[];const[aKey,bKey]=keys[part],a=o.points[aKey],b=o.points[bKey],za=o.frontArmDepth.jointDepth[aKey],zb=o.frontArmDepth.jointDepth[bKey];if(Math.min(za,zb)>=1)return[];const body=frontDepthTorsoPolygon(o),dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy||1,field=q=>torsoZ(body,q)-mix(za,zb,clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/len2)),out=[];for(const t of triangulate(body))split(t,3,tri=>{const hole=clipPositive(tri,field);if(hole.length>=3&&Math.abs(area(hole))>1e-12)out.push(area(hole)>0?hole.reverse():hole);});return out;}
export function clipInferredFrontArm(c,o,part){const holes=frontArmOcclusionPolygons(o,part);if(!holes.length)return false;c.save();c.beginPath();c.moveTo(-1000,-1000);c.lineTo(1000,-1000);c.lineTo(1000,1000);c.lineTo(-1000,1000);c.closePath();for(const hole of holes){c.moveTo(hole[0].x,hole[0].y);for(const q of hole.slice(1))c.lineTo(q.x,q.y);c.closePath();}c.clip();return true;}

// R9r1: game-authored joins end in the ordinary visible-arm display state.
// No depth hypothesis survives a completed return or KO entry. This changes
// display visibility only, never projected joints, null readings or clocks.
const frontParts=['rightUpperArm','rightForearm','rightHand'];
export function finishFrontArmDepth(r){if(!r.frontArmDepth)return r;delete r.frontArmDepth;r.visibility={...r.visibility};for(const k of frontParts)r.visibility[k]='visible';return r;}
export function interpolateFrontArmDepth(a,b,q,r){
 const A=a.frontArmDepth,B=b.frontArmDepth;if(!A&&!B)return r;
 if(q<=0){if(A)r.frontArmDepth=structuredClone(A);else delete r.frontArmDepth;return r;}
 if(q>=1){if(B)r.frontArmDepth=structuredClone(B);else delete r.frontArmDepth;r.visibility={...r.visibility};for(const k of frontParts)r.visibility[k]=b.visibility[k];r.partOrder=[...b.partOrder];return r;}
 r.frontArmDepth={...(B||A),hypothesis:'R9r1 finite game-authored depth join; not observed',notObserved:true,jointDepth:Object.fromEntries(Object.keys(curves).map(k=>[k,mix(A?.jointDepth[k]??1.35,B?.jointDepth[k]??1.35,q)]))};return r;
}
