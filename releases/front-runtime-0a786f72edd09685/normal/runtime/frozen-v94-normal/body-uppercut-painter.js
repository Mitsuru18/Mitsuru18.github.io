import {segment,hand,torso,head,spinFoot as legacySpinFoot,spinFootProjection,pt,lerp,line} from './body-uppercut-art.js';
function geo(row){const p=Object.fromEntries(Object.entries(row.points).map(([k,v])=>[k,pt(...v)]));for(const side of ['right','left'])for(const key of ['Shoulder','Elbow','Wrist','Hip','Knee','Ankle','Heel','Toe'])p[side+key]=p[side+'_'+key.toLowerCase()];p.leftHand=p.left_fist;p.rightHand=p.right_fist;return p;}
function paintPart(c,row,p,part,P){c.contactPart=part;
 if(part==='torso'){torso(c,{hip:p.pelvis,chest:p.chest,bodyTurn:0,spinWeight:0},P);return;}
 if(part==='head'){head(c,p.head,p.chest,P,0);return;}
 const side=part.startsWith('left')?'left':'right',far=side==='left',skin=far?P.shade:P.skin,light=far?P.skin:P.light;
 if(part.endsWith('Thigh')){const a=p[side+'Hip'],b=p[side+'Knee'];segment(c,a,b,5.5,3.6,P.outfit==='gi'?(far?P.cloth:P.bright):skin,P.outfit==='gi'?P.bright:light,P.shade);segment(c,a,lerp(a,b,.53),6,5.1,far?P.cloth:P.bright,P.cloth);}
 else if(part.endsWith('Shin')){const a=p[side+'Knee'],b=p[side+'Ankle'];segment(c,a,b,3.5,2.1,P.outfit==='gi'?(far?P.cloth:P.bright):skin,P.outfit==='gi'?P.bright:light,P.shade);segment(c,lerp(a,b,.88),b,2.3,2.1,P.wrap,'#fff5de');}
 else if(part.endsWith('Foot'))spinFoot(c,p,side,P,far);
 else if(part.endsWith('UpperArm')){
  const shoulder=p[side+'Shoulder'],dx=p.chest.x-p.pelvis.x,dy=p.chest.y-p.pelvis.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  const sign=((shoulder.x-p.chest.x)*nx+(shoulder.y-p.chest.y)*ny)>=0?1:-1;
  const surface=pt(p.chest.x+nx*6*sign,p.chest.y+ny*6*sign);
  segment(c,surface,shoulder,3.8,3.8,skin,light,P.shade);
  segment(c,shoulder,p[side+'Elbow'],3.8,2.7,skin,light,P.shade);
  if(['tee','gi'].includes(P.outfit))segment(c,shoulder,lerp(shoulder,p[side+'Elbow'],P.outfit==='gi'?1:.48),3.85,3,far?P.cloth:P.bright,P.bright,P.cloth);
 }
 else if(part.endsWith('Forearm')){const a=p[side+'Elbow'],b=p[side+'Wrist'];segment(c,a,b,2.9,1.8,P.outfit==='gi'?(far?P.cloth:P.bright):skin,P.outfit==='gi'?P.bright:light,P.shade);segment(c,lerp(a,b,.72),b,2.2,2.2,P.wrap,'#fff4dd');}
 else if(part.endsWith('Hand')){const a=p[side+'Wrist'],b=p[side+'Hand'];segment(c,a,b,1.8,2.2,skin,light,P.shade);hand(c,b,a,P,far);}
}
export function paintBodyUppercutR3(c,row,P,flashes=[]){const p=geo(row);for(const part of row.draw_order){
 const target=part==='head'?'head':part==='torso'?'body':/(Thigh|Shin|Foot)$/.test(part)?'leg':null,flash=flashes.find(f=>f.target===target);
 const palette=!flash?P:Object.fromEntries(Object.entries(P).map(([k,v])=>[k,typeof v==='string'&&/^#[a-fA-F0-9]{6}$/.test(v)?'#'+v.slice(1).match(/../g).map((n,i)=>Math.round(parseInt(n,16)*(1-flash.alpha)+[255,38,56][i]*flash.alpha).toString(16).padStart(2,'0')).join(''):v]));
 paintPart(c,row,p,part,palette);
}}
function spinFoot(c,p,side,P,far){
 if(side!=='right'){legacySpinFoot(c,p,side,P,far);return;}
 const ankle=p[side+'Ankle'],heel=p[side+'Heel'],toe=p[side+'Toe'],f=spinFootProjection(ankle,heel,toe);
 segment(c,ankle,pt(f.x,f.y),1.8,1.8,far?P.shade:P.skin,P.light,P.shade);
 if(f.roundness>.001){c.save();c.globalAlpha*=f.roundness;segment(c,pt(f.x,f.y),lerp(f.heel,f.toe,.45),2,1.8,far?P.shade:P.skin,P.light,P.shade);segment(c,f.heel,f.toe,2,1.7,far?P.shade:P.skin,P.light,P.shade);c.restore();}
 if(Math.abs(f.ux*f.vy-f.uy*f.vx)>1e-7){
  c.save();c.transform(f.ux,f.uy,f.vx,f.vy,f.x,f.y);c.beginPath();
  c.moveTo(-3,-2);c.lineTo(2,-2);c.quadraticCurveTo(4,-1.8,4.3,-.15);
  c.bezierCurveTo(6.5,-.3,9.3,-.1,9.75,1.1);c.quadraticCurveTo(10,1.8,10,3);
  {c.quadraticCurveTo(9.4,5.2,7,5.3);c.quadraticCurveTo(2,5.2,-.5,3.5);c.quadraticCurveTo(-3.2,4,-4,3);}
  c.closePath();c.fillStyle=far?P.shade:P.skin;c.fill();c.strokeStyle='#253039';c.lineWidth=.55;c.stroke();line(c,pt(3,1),pt(8,2),P.light,.7);c.restore();
 }
}

