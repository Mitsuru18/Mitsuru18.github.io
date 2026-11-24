// Local authored KO connection, not source-traced motion. Input is the exact
// interrupted projected skeleton. Segment lengths and body proportions stay fixed.
// No common standing pose, neutral-size fit, damage, or actor-root reset is used.
const clone=structuredClone,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),rot=(v,a)=>[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a)],angle=v=>Math.atan2(v[1],v[0]);
function turn(v,to,q){return rot(v,Math.atan2(Math.sin(to-angle(v)),Math.cos(to-angle(v)))*q);}
function clearance(j){return Math.min(j.head[1]-9,j.chest[1]-9,j.center[1]-7,...['support','strike'].flatMap(s=>[j[s+'_hip'][1]-5.5,j[s+'_knee'][1]-3.6,j[s+'_ankle'][1]-2.4,j[s+'_heel'][1],j[s+'_toe'][1]]),...['near','far'].flatMap(s=>[j[s+'_elbow'][1]-3,j[s+'_wrist'][1]-2.6,j[s+'_hand'][1]-3.5]));}
export function axeDirectKO(initial,seconds,{minX=-Infinity,maxX=Infinity}={}){
 const t=Math.max(0,Math.min(1.1,seconds)),p=clone(initial),pivot=[...initial.support_toe],rotation=Math.PI/2*ease(t/1.0),release=ease((t-.04)/.82);
 for(const [s,aa,bb]of[['support',-1.55,-1.65],['strike',-1.30,-1.92]]){p[s+'_knee']=add(p[s+'_hip'],turn(sub(initial[s+'_knee'],initial[s+'_hip']),aa,release));p[s+'_ankle']=add(p[s+'_knee'],turn(sub(initial[s+'_ankle'],initial[s+'_knee']),bb,release));const oldAngle=angle(sub(initial[s+'_toe'],initial[s+'_heel'])),delta=Math.atan2(Math.sin(-Math.PI/2-oldAngle),Math.cos(-Math.PI/2-oldAngle))*release;for(const k of['heel','toe'])p[s+'_'+k]=add(p[s+'_ankle'],rot(sub(initial[s+'_'+k],initial[s+'_ankle']),delta));}
 for(const[s,a]of[['near',-1.25],['far',-1.45]]){p[s+'_elbow']=add(p[s+'_shoulder'],turn(sub(initial[s+'_elbow'],initial[s+'_shoulder']),a,release));p[s+'_wrist']=add(p[s+'_elbow'],turn(sub(initial[s+'_wrist'],initial[s+'_elbow']),a-.05,release));p[s+'_hand']=add(p[s+'_wrist'],turn(sub(initial[s+'_hand'],initial[s+'_wrist']),a-.05,release));}
 const world=Object.fromEntries(Object.entries(p).map(([k,v])=>[k,add(pivot,rot(sub(v,pivot),rotation))]));
 // Ground the single body envelope continuously. The inherited initial projected
 // sole/fill residual is not hidden by an instant first-frame translation.
 const floor=clearance(world),shiftY=-floor*ease(t/.18),xs=Object.values(world).map(v=>v[0]),desiredX=Math.max(0,minX-(Math.min(...xs)-9))-Math.max(0,(Math.max(...xs)+9)-maxX),shiftX=desiredX*ease(t/.25);
 for(const v of Object.values(world)){v[0]+=shiftX;v[1]+=shiftY;}
 if(t===0)return{joints:clone(initial),drawJoints:clone(initial),pivot,rotation:0,shift:[0,0],clearance:clearance(initial)};
 return{joints:world,drawJoints:p,pivot,rotation,shift:[shiftX,shiftY],clearance:clearance(world)};
}
