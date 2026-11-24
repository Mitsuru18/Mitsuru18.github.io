import {characterPalettes,segment,hand,torso,head,spinHead,foot,pt,lerp,path as artPath,line,oval} from './legacy-art.js';
const P=characterPalettes[0];
function geo(row){return Object.fromEntries(Object.entries(row.rig_application.character_points).map(([k,v])=>[k,pt(...v)]));}
function blend(c,w,back,front){if(w<1)back();if(w>0){c.save();c.globalAlpha*=w;front();c.restore();}}
function morphHead(c,p,w,roll=0){
 // Rendering-only morph between the existing left-facing and front-facing v58 glyph contours.
 // Never changes the source head center or any limb point; no cross-fade double face.
 if(w<=0)return head(c,p.head,p.chest,roll?{...P,axeHeadRoll:roll}:P,2);
 const a=Math.atan2(p.chest.x-p.head.x,Math.abs(p.chest.y-p.head.y))*.25;
 const lf=([x,y])=>pt(-(x*Math.cos(a)-y*Math.sin(a)),x*Math.sin(a)+y*Math.cos(a));
 const interp=(xy,to)=>lerp(lf(xy),pt(...to),w);
 segment(c,pt(p.chest.x,p.chest.y+1),pt(p.head.x-1+w,p.head.y+5),3.1,2.8,P.skin,P.light);
 c.save();c.translate(p.head.x,p.head.y);if(roll)c.rotate(roll);
 const face=[[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]],front=[[5,-5],[0,-7],[-5,-5],[-6,1],[-5,4],[-4,6],[-2,7],[0,8],[4,6],[6,1]];
 artPath(c,face.map((v,i)=>interp(v,front[i])),P.skin);
 const hair=[[-5,2],[-6,-2],[-5,-6],[-1,-8],[3,-7],[5,-4],[1,-4],[-1,-2],[-3,-2],[-3,2]],fh=[[6,2],[6,-3],[3,-7],[-1,-8],[-5,-5],[-6,1],[-3,-3],[0,-2],[3,-3],[3,2]];
 artPath(c,hair.map((v,i)=>interp(v,fh[i])),P.hair);
 c.save();c.globalAlpha*=1-w;const ear=lf([-2,1]);oval(c,ear.x,ear.y,1.5,2,P.light);line(c,lf([0,6]),lf([3,6]),P.shade,.7);c.restore();
 line(c,interp([2,-1],[-3,-.5]),interp([4,-.6],[-1,-.4]),'#343036',.8);line(c,interp([3,4],[-1,5]),interp([5,4],[2,5]),P.shade,.6);
 c.save();c.globalAlpha*=w;line(c,pt(1,-.4),pt(3,-.5),'#343036',.8);line(c,pt(0,0),pt(1,3),P.shade,.6);c.restore();c.restore();
}
function colorMix(a,b,t){const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));return '#'+h(a).map((x,i)=>Math.round(x+(h(b)[i]-x)*t).toString(16).padStart(2,'0')).join('');}
function kneeSurface(c,p,side,w,skin,light){if(w<=0)return;const a=p[side+'_knee'],b=p[side+'_ankle'],v=lerp(a,b,.13);c.save();c.globalAlpha*=w;oval(c,a.x,a.y+.2,2.5,2.1,skin);line(c,pt(a.x-1.5,a.y+.8),pt(a.x+.9,a.y+1.4),light,.9);line(c,v,lerp(a,b,.72),light,.85);c.restore();}
function footSurface(c,f,P,far,w){
 c.save();c.transform(...f.applied_affine_u,...f.applied_affine_v,...f.applied_origin);foot(c,pt(0,0),0,P,far);
 if(w>0){c.save();c.globalAlpha*=w;artPath(c,[pt(-3,-2),pt(2,-2),pt(5,-.5),pt(9,.6),pt(10,3),pt(-4,3)],far?P.shade:P.skin);line(c,pt(0,-.7),pt(6,1),P.light,.8);for(let x=6.8;x<9.1;x+=.9)line(c,pt(x,.8+(x-6.8)*.2),pt(x-.2,2.6),P.shade,.35);c.restore();}c.restore();
}
function paintPart(c,row,p,part){
 if(part==='torso'){
 const h=p.hip,t=p.chest,w=row.rig_application.surface_view.torso_front_weight,dx=t.x-h.x,dy=t.y-h.y,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,at=(q,z)=>pt(q.x+nx*z,q.y+ny*z);
 // Same legacy outline/palette, single opaque surface. Front/back markings blend, not duplicate torso shells.
 artPath(c,[at(t,-7),pt(t.x-3,t.y-3),at(t,9),at(lerp(t,h,.32),9),at(h,6),pt(h.x,h.y+5),at(h,-6),at(lerp(t,h,.3),-8)],P.skin);
 const side=1-2*w;artPath(c,[at(t,7*side),at(lerp(t,h,.5),6*side),at(h,6*side),at(h,side),at(lerp(t,h,.55),2*side),at(t,2*side)],P.shade,null);
 c.save();c.globalAlpha*=1-w;line(c,lerp(t,h,.18),lerp(t,h,.74),P.shade,.7);line(c,at(lerp(t,h,.2),-5),at(lerp(t,h,.43),-2),P.shade,.65);line(c,at(lerp(t,h,.2),5),at(lerp(t,h,.43),2),P.shade,.65);c.restore();
 c.save();c.globalAlpha*=w;line(c,at(lerp(t,h,.24),-4),at(lerp(t,h,.28),-.5),P.shade,.65);line(c,at(lerp(t,h,.28),.8),at(lerp(t,h,.25),5),P.shade,.65);line(c,at(lerp(t,h,.35),1),at(lerp(t,h,.74),1),P.shade,.55);line(c,at(lerp(t,h,.78),1),at(lerp(t,h,.8),4),P.shade,.5);c.restore();
 artPath(c,[[-7,-3],[7,-3],[7.7,-1.5],[8,.4],[7.4,2.9],[5.5,5.1],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),P.bright,null);
 artPath(c,[[-7,-3],[-5.6,-2.3],[-5.2,1.1],[-3.4,5.9],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),colorMix(P.cloth,P.bright,w*.4),null);
 line(c,pt(h.x-7,h.y-2),pt(h.x+7,h.y-2),P.wrap,2);
 if(w>0){c.save();c.globalAlpha*=w;line(c,pt(h.x-.7,h.y),pt(h.x-.6,h.y+4.8),P.cloth,.6);line(c,pt(h.x-.7,h.y-1),pt(h.x-1.7,h.y+2),P.wrap,.8);line(c,pt(h.x-.7,h.y-1),pt(h.x+.8,h.y+2),P.wrap,.8);c.restore();}return;}
 if(part==='head'){morphHead(c,p,row.rig_application.surface_view.head_front_weight,row.rig_application.head_roll??0);return;}
 if(part==='pelvisConnections'){for(const side of ['right','left']){const hip=p[side+'_hip'];segment(c,p.hip,hip,5.6,5.6,side==='right'?colorMix(P.cloth,P.bright,row.rig_application.surface_view.pelvis_front_weight*.7):P.bright,P.cloth);}return;}
 const side=part.startsWith('left')?'left':'right',far=side==='right',w=row.rig_application.surface_view.leg_front_weight,skin=far?colorMix(P.shade,P.skin,w*.75):P.skin,light=far?colorMix(P.skin,P.light,w*.75):P.light,partP={...P,shade:skin};
 if(part.endsWith('Thigh')){const a=p[side+'_hip'],b=p[side+'_knee'];segment(c,a,b,5.5,3.6,skin,light,P.shade);segment(c,a,lerp(a,b,.53),6,5.1,far?colorMix(P.cloth,P.bright,w*.7):P.bright,P.cloth);}
 else if(part.endsWith('Shin')){const a=p[side+'_knee'],b=p[side+'_ankle'];segment(c,a,b,3.5,2.1,skin,light,P.shade);segment(c,lerp(a,b,.88),b,2.3,2.1,P.wrap,'#fff5de');kneeSurface(c,p,side,w,skin,light);}
 else if(part.endsWith('Foot')){const f=row.rig_application.foot_surface_projection[side],a=p[side+'_ankle'],o=pt(...f.applied_origin);segment(c,a,o,1.8,1.8,skin,light,P.shade);footSurface(c,f,partP,far,w);}
 else if(part.endsWith('UpperArm')){const shoulder=p[side+'_shoulder'],dx=p.chest.x-p.hip.x,dy=p.chest.y-p.hip.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;const sign=(shoulder.x-p.chest.x)*nx+(shoulder.y-p.chest.y)*ny>=0?1:-1;const surface=pt(p.chest.x+nx*5.5*sign,p.chest.y+ny*5.5*sign);segment(c,surface,shoulder,3.8,3.8,skin,light,P.shade);segment(c,shoulder,p[side+'_elbow'],3.8,2.7,skin,light,P.shade);}
 else if(part.endsWith('Forearm')){const a=p[side+'_elbow'],b=p[side+'_wrist'];segment(c,a,b,2.9,1.8,skin,light,P.shade);segment(c,lerp(a,b,.72),b,2.2,2.2,P.wrap,'#fff4dd');}
 else if(part.endsWith('Hand')){const a=p[side+'_wrist'],b=p[side+'_fist'];segment(c,a,b,1.8,2.2,skin,light,P.shade);hand(c,b,a,P,far);}
}
function paint(c,row){const p=geo(row);for(const part of row.rig_application.draw_order)paintPart(c,row,p,part);}

export {paint,paintPart,geo,P};
