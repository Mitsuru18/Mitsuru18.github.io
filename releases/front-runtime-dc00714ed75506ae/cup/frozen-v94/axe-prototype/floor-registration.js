// UNADOPTED inferred registration, not observed points. Keep original centered
// outline and all rigid lengths. One translation reaches paint AND receiver joints.
// Native arena is 3 pixels/unit. 1/3 unit is an explicit raster margin, not an
// antialiasing claim. This must be checked against actual alpha>0 screen pixels.
export const RASTER_MARGIN=1/3;
const BASE=[[-3,-2],[2,-2],[4,0],[9,1],[10,3],[-4,3]],FRONT=[[-3,-2],[2,-2],[5,-.5],[9,.6],[10,3],[-4,3]];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=(a,b)=>a.map((v,i)=>v-b[i]);
function outline(poly,w=.325){const area=poly.reduce((a,p,i)=>a+cross(p,poly[(i+1)%poly.length]),0),sgn=area>0?1:-1;return poly.map((p,i)=>{const prev=poly[(i+poly.length-1)%poly.length],next=poly[(i+1)%poly.length],a=sub(p,prev),b=sub(next,p),la=Math.hypot(...a),lb=Math.hypot(...b),n=[sgn*a[1]/la,-sgn*a[0]/la],m=[sgn*b[1]/lb,-sgn*b[0]/lb],den=1+n[0]*m[0]+n[1]*m[1];return[p[0]+w*(n[0]+m[0])/den,p[1]+w*(n[1]+m[1])/den];});}
const FOOT_OUTLINES=[outline(BASE),outline(FRONT)];
export function footEnvelope(j,side){const h=j[side+'_heel'],t=j[side+'_toe'],a=j[side+'_ankle'],u=sub(t,h).map(x=>x/14),v=sub(h,a).map((x,i)=>(x+4*u[i])/3);return FOOT_OUTLINES.flatMap(poly=>poly.map(([x,y])=>[a[0]+u[0]*x+v[0]*y,a[1]+u[1]*x+v[1]*y]));}
export function registerFloor(j,weight=1){const min=Math.min(...['strike','support'].flatMap(s=>footEnvelope(j,s).map(p=>p[1]))),lift=Math.max(0,RASTER_MARGIN-min)*Math.max(0,Math.min(1,weight));return{joints:Object.fromEntries(Object.entries(j).map(([k,p])=>[k,[p[0],p[1]+lift]])),floorRegistration:{kind:'inferred whole-pose centered-outline registration',lift,rawFootOutlineMinY:min,registeredFootOutlineMinY:min+lift,rasterMargin:RASTER_MARGIN,artToJointOffset:0,horizontalRootDelta:0}};}
