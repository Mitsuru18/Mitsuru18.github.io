// Explicit inferred-hurt receiving style. Public old jump switches painter at impact.
import{approvedBodyOperations}from'./approved-body.js';
import{nativeFoot}from'./native-retarget.js';
export function acceptedFoot(j,s){const a=j[s+'_ankle'],h=j[s+'_heel'],t=j[s+'_toe'],v=[t[0]-h[0],t[1]-h[1]],L=Math.hypot(...v)||1;let n=[-v[1]/L,v[0]/L];if(n[0]*(a[0]-h[0])+n[1]*(a[1]-h[1])<0)n=n.map(v=>-v);return[h,t,[t[0]+n[0]*2,t[1]+n[1]*2],[a[0],a[1]+2],[h[0]+n[0]*3.5,h[1]+n[1]*3.5]];}
export const jumpFootBottom=(j,s,style)=>Math.max(...(style==='common'?acceptedFoot(j,s):nativeFoot(j,s)).map(p=>-p[1]));
export function acceptedJumpSurfaces(j,target,{appearance=null,alt=false}={}){const out=[];let region=null;for(const [kind,...a]of approvedBodyOperations(j,1,alt,appearance)){if(kind==='region'){region=a[0];continue;}if(region!==target)continue;const color=kind==='poly'?a[1]:kind==='oval'?a[3]:null;if(color==='#293b40'||color==='#253b40')continue;if(kind==='poly')out.push({kind:'polygon',points:a[0].map(p=>p.map(v=>v/2))});if(kind==='oval')out.push({kind:'ellipse',center:a[0].map(v=>v/2),rx:a[1]/2,ry:a[2]/2,angle:a[4]||0});}return out;}
