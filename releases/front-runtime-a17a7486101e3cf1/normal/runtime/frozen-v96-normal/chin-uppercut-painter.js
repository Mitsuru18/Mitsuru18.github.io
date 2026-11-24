// Local isolated character rendering. Existing legacy Canvas palette/capsules/cloth retained.
import {characterPalettes,leg,arm,torso,head,segment,hand,line,lerp,pt,path as drawPath,oval} from './chin-uppercut-art.js';
function createPainter(initialPalette){let P=initialPalette;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
function legSurface(c,a,b,r1,r2,skin,light,weight){if(weight<1)segment(c,a,b,r1,r2,skin,light,P.shade);if(weight>0){c.save();c.globalAlpha*=weight;posteriorSegment(c,a,b,r1,r2,skin,light);c.restore();}}
function drawTorsoSurface(c,p,yaw){
 const h=p.pelvis,s=p.chest,dx=s.x-h.x,dy=s.y-h.y,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,width=.55+.45*Math.abs(Math.cos(yaw));const at=(p,w)=>pt(p.x+nx*w*width,p.y+ny*w*width),back=ease((yaw-1.4)/.55);
 drawPath(c,[at(s,-7),pt(s.x-3,s.y-3),at(s,9),at(lerp(s,h,.32),9),at(h,6),pt(h.x,h.y+5),at(h,-6),at(lerp(s,h,.3),-8)],P.outfit&&P.outfit!=='shorts'?P.bright:P.skin);
 const side=-Math.cos(yaw);drawPath(c,[at(s,7*side),at(lerp(s,h,.5),6*side),at(h,6*side),at(h,side),at(lerp(s,h,.55),2*side),at(s,2*side)],P.outfit&&P.outfit!=='shorts'?P.cloth:P.shade,null);
 if(P.outfit&&P.outfit!=='shorts'){line(c,pt(s.x-4,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);line(c,pt(s.x+5,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);}else if(back>0){c.save();c.globalAlpha*=back;line(c,pt(s.x,s.y+4),pt(h.x,h.y-8),P.shade,.7);line(c,pt(s.x-5,s.y+5),pt(s.x-2,s.y+12),P.shade,.65);line(c,pt(s.x+5,s.y+5),pt(s.x+2,s.y+12),P.shade,.65);c.restore();}
 if(back<1&&(!P.outfit||P.outfit==='shorts')){c.save();c.globalAlpha*=1-back;line(c,pt(s.x+2,s.y+7),pt(s.x+6,s.y+8),P.shade,.7);line(c,pt(s.x+2,s.y+8),pt(h.x+2,h.y-9),'#b37a58',.6);line(c,pt(h.x+2,h.y-8),pt(h.x+5,h.y-7),P.shade,.5);c.restore();}
}
function drawHeadSurface(c,h,s,back,pitch,finishTilt=null){
 if(finishTilt!==null)pitch=finishTilt-(1-back)*Math.atan2(s.x-h.x,Math.abs(s.y-h.y))*.25;
 // Head center stays fixed. Shape morph controls only appearance between the
 // existing right-profile and rear glyphs. No measured camera/anatomical yaw.
 if(back<1e-9&&Math.abs(pitch)<1e-9)return head(c,h,s,P,0);
 if(back>1-1e-9&&Math.abs(pitch)<1e-9)return head(c,h,s,P,0,2.65,1);
 segment(c,pt(s.x,s.y+1),pt(h.x-1,h.y+5),3.1,2.8,P.skin,P.light);
 const mixPoly=(a,b)=>a.map((p,i)=>pt(p[0]*(1-back)+b[i][0]*back,p[1]*(1-back)+b[i][1]*back));
 c.save();c.translate(h.x,h.y);c.rotate(pitch+(1-back)*Math.atan2(s.x-h.x,Math.abs(s.y-h.y))*.25);
 const faceA=[[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]],faceB=[[-5,-5],[0,-8],[5,-5],[6,2],[6.1,3],[5,4.2],[3,7],[0,7],[-3,7],[-6,2]];
 drawPath(c,mixPoly(faceA,faceB),P.skin);
 const hairA=[[-5,2],[-6,-2],[-5,-6],[-1,-8],[3,-7],[5,-4],[1,-4],[-1,-2],[-3,-2],[-3,2]],hairB=[[-6,2],[-6,-3],[-3,-7],[2,-8],[5,-6],[6,-4],[6,3],[3,5],[0,3],[-3,5]];
 drawPath(c,mixPoly(hairA,hairB),P.hair);
 // Rear-oblique view exposes only a narrow right ear/cheek edge. Eye and mouth
 // disappear while the head is still predominantly rear-facing.
 const earAlpha=back<.6?1:clamp((1-back)/.4);if(earAlpha>0){c.save();c.globalAlpha*=earAlpha;oval(c,-2+7.4*back,1.2+back,1.5*(1-.3*back),2*(1-.05*back),P.light);c.restore();}
 const faceAlpha=clamp((.60-back)/.60);if(faceAlpha>0){c.save();c.globalAlpha*=faceAlpha;line(c,pt(2,-1),pt(4,-.6),'#343036',.8);line(c,pt(3,4),pt(5,4),P.shade,.6);line(c,pt(0,6),pt(3,6),P.shade,.7);c.restore();}
 if(back>.35){c.save();c.globalAlpha*=clamp((back-.35)/.65);line(c,pt(-3,6),pt(3,6),P.shade,.7);c.restore();}
 c.restore();
}

function drawFoot(c,row,s){const far=s==='left',pts=row.foot_surface.projected_outline[s].map(v=>pt(...v)),a=pt(...row.game_fit.points[s+'_ankle']);segment(c,a,lerp(pts[0],pts.at(-1),.5),2,2,far?P.shade:P.skin,far?P.skin:P.light,P.shade);const curve=row.foot_surface.continuous_render_outline[s].map(v=>pt(...v));c.beginPath();c.moveTo(curve[0].x,curve[0].y);for(const v of curve.slice(1))c.lineTo(v.x,v.y);c.closePath();c.fillStyle=far?P.shade:P.skin;c.fill();c.strokeStyle='#253039';c.lineWidth=.55;c.stroke();
 // One surface mark follows the visible outer/upper envelope, not an invented foot axis.
 if(s==='right'){line(c,pt(...row.foot_surface.right_surface_highlight[0]),pt(...row.foot_surface.right_surface_highlight[1]),P.light,.65);}else line(c,lerp(pts[7],pts[6],.25),lerp(pts[6],pts[5],.55),P.skin,.65);
}
// Reuses the existing straight-preview posterolateral capsule shading.
function posteriorSegment(c,a,b,r1,r2,skin,light){segment(c,a,b,r1,r2,skin,skin,P.shade);const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;const p=lerp(a,b,.23),q=lerp(a,b,.58);c.save();c.globalAlpha=.38;line(c,pt(p.x+nx*r2*.43,p.y+ny*r2*.43),pt(q.x+nx*r2*.43,q.y+ny*r2*.43),light,r2*.82);c.restore();}
function drawPelvis(c,h,yaw){
 // Reuse the historic rounded shorts and belt geometry; pelvis surface selection
 // is independent of torso and head parameters. No measured 3D angle is implied.
 const back=Math.cos(yaw)<-.2;
 drawPath(c,[[-7,-3],[7,-3],[7.7,-1.5],[8,.4],[7.4,2.9],[5.5,5.1],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),P.bright,null);
 drawPath(c,[[-7,-3],[-5.6,-2.3],[-5.2,1.1],[-3.4,5.9],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),P.cloth,null);
 line(c,pt(h.x-7,h.y-2),pt(h.x+7,h.y-2),P.wrap,2);
 const frontAlpha=1-ease((yaw-1.35)/.6);if(frontAlpha>0){c.save();c.globalAlpha*=frontAlpha;line(c,pt(h.x+2,h.y-1),pt(h.x+3,h.y+5),P.wrap,1);c.restore();}
}
function paint(c,row,diagnostic=false,tint=()=>initialPalette){const p=Object.fromEntries(Object.entries(row.game_fit.points).map(([k,v])=>[k,pt(...v)])),surf=row.surface_application;
 const limb=(s,type)=>{c.contactPart=s+(type==='leg'?'Leg':'Arm');P=tint(type==='leg'?'leg':null);const far=s==='left',skin=P.outfit==='gi'?(far?P.cloth:P.bright):(far?P.shade:P.skin),light=P.outfit==='gi'?P.bright:(far?P.skin:P.light);
 if(type==='leg'){const a=p[s+'_hip'],b=p[s+'_knee'],e=p[s+'_ankle'],posterior=s==='right'?surf.right_leg_posterior_weight:0;
 legSurface(c,a,b,5.5,3.6,skin,light,posterior);legSurface(c,b,e,3.5,2.1,skin,light,posterior);
 segment(c,a,lerp(a,b,.53),6,5.1,far?P.cloth:P.bright,P.cloth);segment(c,lerp(b,e,.88),e,2.3,2.1,P.wrap,'#fff5de');drawFoot(c,row,s);
 if(posterior){const v={x:e.x-b.x,y:e.y-b.y},L=Math.hypot(v.x,v.y),n={x:-v.y/L,y:v.x/L};c.save();c.globalAlpha*=posterior;line(c,pt(b.x-n.x*1.4,b.y-n.y*1.4),pt(b.x+n.x*1.1,b.y+n.y*1.1),P.shade,.45);c.restore();}}
 else{const a=p[s+'_shoulder'],b=p[s+'_elbow'],w=p[s+'_wrist'],f=p[s+'_fist'];segment(c,a,b,3.8,2.7,skin,light,P.shade);if(['tee','gi'].includes(P.outfit))segment(c,a,lerp(a,b,P.outfit==='gi'?1:.48),3.85,3,far?P.cloth:P.bright,P.bright,P.cloth);segment(c,b,w,2.9,1.8,skin,light,P.shade);segment(c,lerp(b,w,.72),w,2.2,2.2,P.wrap,'#fff4dd');hand(c,f,row.r3_fit?.fist_orientation_reference_elbow?.[s]?pt(...row.r3_fit.fist_orientation_reference_elbow[s]):b,P,far);}};
 limb('left','leg');limb('left','arm');limb('right','leg');c.contactPart='body';P=tint('body');drawTorsoSurface(c,p,surf.torso_yaw);drawPelvis(c,p.pelvis,surf.pelvis_yaw);c.contactPart='head';P=tint('head');drawHeadSurface(c,p.head,p.chest,surf.head_back_weight,surf.head_pitch_display_radians,row.finishHeadTilt??null);limb('right','arm');
 if(diagnostic){c.save();c.globalAlpha=.8;for(const s of ['left','right'])for(const[a,b]of[['hip','knee'],['knee','ankle'],['shoulder','elbow'],['elbow','fist']])line(c,p[s+'_'+a],p[s+'_'+b],s==='right'?'#ffdf8a':'#8fd8ff',.5);for(const[k,v]of Object.entries(p)){if(['chest','pelvis','head'].includes(k)||k.endsWith('_hip')||k.endsWith('_knee')){c.beginPath();c.arc(v.x,v.y,1,0,Math.PI*2);c.fillStyle=(row.completion[k]||k==='pelvis')?'#f49fe6':'#b0f1c3';c.fill();}}c.restore();}
}

return paint;
}
export function paintChinUppercutR3(c,row,P=characterPalettes[0],flashes=[]){const tint=(target)=>{const f=flashes.find(v=>v.target===target);return !f?P:Object.fromEntries(Object.entries(P).map(([k,v])=>[k,typeof v==='string'&&/^#[a-fA-F0-9]{6}$/.test(v)?'#'+v.slice(1).match(/../g).map((n,i)=>Math.round(parseInt(n,16)*(1-f.alpha)+[255,38,56][i]*f.alpha).toString(16).padStart(2,'0')).join(''):v]));};createPainter(P)(c,row,false,tint);}

// Geometric floor bound for the off-core KO adapter. This records only filled
// outlines, with exact transformed ellipses and conservative Bezier controls.
// It never changes approved motion rows and does not read Canvas pixels.
export function chinUppercutFloorBound(row){let m=[1,0,0,1,0,0],alpha=1,stack=[],path=-Infinity,bound=-Infinity;const y=(x,y)=>m[1]*x+m[3]*y+m[5],point=(x,z)=>{path=Math.max(path,y(x,z));},matrix=(a,b,c,d,e,f)=>{const q=m;m=[q[0]*a+q[2]*b,q[1]*a+q[3]*b,q[0]*c+q[2]*d,q[1]*c+q[3]*d,q[0]*e+q[2]*f+q[4],q[1]*e+q[3]*f+q[5]]};const c={save(){stack.push([m.slice(),alpha])},restore(){[m,alpha]=stack.pop()},translate(x,z){matrix(1,0,0,1,x,z)},scale(x,z){matrix(x,0,0,z,0,0)},rotate(a){matrix(Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0)},beginPath(){path=-Infinity},moveTo:point,lineTo:point,closePath(){},quadraticCurveTo(a,b,x,z){point(a,b);point(x,z)},bezierCurveTo(a,b,d,e,x,z){point(a,b);point(d,e);point(x,z)},ellipse(x,z,rx,ry,a){const uy=m[1]*Math.cos(a)+m[3]*Math.sin(a),vy=-m[1]*Math.sin(a)+m[3]*Math.cos(a);path=Math.max(path,y(x,z)+Math.hypot(rx*uy,ry*vy))},fill(){if(alpha>0)bound=Math.max(bound,path)},stroke(){},get globalAlpha(){return alpha},set globalAlpha(a){alpha=a}};paintChinUppercutR3(c,row);return Math.max(0,bound);}
