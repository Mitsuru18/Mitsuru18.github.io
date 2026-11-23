// Display-only Canvas2D vertical envelope. No pose, collision or source mutation.
// Bezier extrema are analytic. Stroke support includes affine pen radius and
// actual miter vertices; the curve + pen bound is conservative at butt ends.
export function paintBoundsContext(){
 let state={m:[1,0,0,1,0,0],lineWidth:1,lineCap:'butt',lineJoin:'miter',miterLimit:10,globalAlpha:1},stack=[],paths=[],path=null;
 let fillMax=-Infinity,strokeMax=-Infinity,draws=0;
 const tf=p=>[state.m[0]*p[0]+state.m[2]*p[1]+state.m[4],state.m[1]*p[0]+state.m[3]*p[1]+state.m[5]];
 const mul=(a,b,c,d,e,f)=>{const m=state.m;state.m=[m[0]*a+m[2]*b,m[1]*a+m[3]*b,m[0]*c+m[2]*d,m[1]*c+m[3]*d,m[0]*e+m[2]*f+m[4],m[1]*e+m[3]*f+m[5]];};
 const unit=v=>{const n=Math.hypot(...v);return n>1e-12?[v[0]/n,v[1]/n]:null;};
 const diff=(a,b)=>[a[0]-b[0],a[1]-b[1]];
 const tangent=(ps,reverse=false)=>{const a=reverse?ps.at(-1):ps[0];for(let i=1;i<ps.length;i++){const b=reverse?ps.at(-1-i):ps[i],d=reverse?diff(a,b):diff(b,a),u=unit(d);if(u)return u;}return null;};
 const qRoots=(a,b,c)=>{if(Math.abs(a)<1e-13)return Math.abs(b)<1e-13?[]:[-c/b];const d=b*b-4*a*c;if(d<0)return[];return[(-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a)];};
 function add(ps){
  const ys=ps.map(p=>tf(p)[1]);let bound=Math.max(ys[0],ys.at(-1)),roots=[];
  if(ps.length===3){const[a,b,c]=ys;roots=(Math.abs(a-2*b+c)<1e-13)?[]:[(a-b)/(a-2*b+c)];}
  if(ps.length===4){const[a,b,c,d]=ys;roots=qRoots(-a+3*b-3*c+d,2*(a-2*b+c),b-a);}
  for(const t of roots)if(t>0&&t<1){const u=1-t,y=ps.length===3?u*u*ys[0]+2*u*t*ys[1]+t*t*ys[2]:u**3*ys[0]+3*u*u*t*ys[1]+3*u*t*t*ys[2]+t**3*ys[3];bound=Math.max(bound,y);}
  path.max=Math.max(path.max,bound);path.segments.push({start:ps[0],end:ps.at(-1),a:tangent(ps),b:tangent(ps,true)});path.end=ps.at(-1);
 }
 const c={
  save(){stack.push({...state,m:[...state.m]});},restore(){state=stack.pop();},
  translate(x,y){mul(1,0,0,1,x,y);},scale(x,y){mul(x,0,0,y,0,0);},rotate(a){mul(Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0);},transform:mul,
  beginPath(){paths=[];path=null;},
  moveTo(x,y){path={first:[x,y],end:[x,y],max:tf([x,y])[1],segments:[],closed:false};paths.push(path);},
  lineTo(x,y){if(!path)this.moveTo(x,y);else add([path.end,[x,y]]);},
  quadraticCurveTo(x,y,a,b){add([path.end,[x,y],[a,b]]);},
  bezierCurveTo(x,y,a,b,d,e){add([path.end,[x,y],[a,b],[d,e]]);},
  closePath(){if(path){if(Math.hypot(...diff(path.end,path.first))>1e-12)add([path.end,path.first]);path.closed=true;}},
  ellipse(x,y,rx,ry,angle,start,end){
   if(Math.abs(end-start)<2*Math.PI-1e-9)throw Error('Only full painter ellipses supported');
   const m=state.m,co=Math.cos(angle),si=Math.sin(angle),cy=tf([x,y])[1],max=cy+Math.hypot(rx*(m[1]*co+m[3]*si),ry*(-m[1]*si+m[3]*co));
   path={max,segments:[],closed:true};paths.push(path);
  },
  fill(){if(state.globalAlpha>0){fillMax=Math.max(fillMax,...paths.map(p=>p.max));draws++;}},
  stroke(){
   if(state.globalAlpha<=0)return;const radius=state.lineWidth/2,affineRadius=radius*Math.hypot(state.m[1],state.m[3]);
   for(const p of paths){let bound=p.max+affineRadius;
    if(state.lineJoin==='miter')for(let i=0;i<p.segments.length;i++){
     if(!p.closed&&i===p.segments.length-1)continue;
     const a=p.segments[i],b=p.segments[(i+1)%p.segments.length];if(!a.b||!b.a)continue;
     const n1=[-a.b[1],a.b[0]],n2=[-b.a[1],b.a[0]],den=1+n1[0]*n2[0]+n1[1]*n2[1];if(den<1e-12)continue;
     const v=[radius*(n1[0]+n2[0])/den,radius*(n1[1]+n2[1])/den];
     if(Math.hypot(...v)<=radius*state.miterLimit+1e-10)for(const sign of[-1,1])bound=Math.max(bound,tf([a.end[0]+sign*v[0],a.end[1]+sign*v[1]])[1]);
    }
    if(state.lineCap==='square')bound=Math.max(bound,p.max+affineRadius*Math.SQRT2);
    strokeMax=Math.max(strokeMax,bound);
   }draws++;
  },
  createRadialGradient(){return{addColorStop(){}};},
  clip(){throw Error('Floor measurement must not mask body pixels');}
 };
 const context=new Proxy(c,{get:(o,k)=>k in o?o[k]:state[k],set:(o,k,v)=>{state[k]=v;return true;}});
 return{context,result:()=>({fillMaxY:fillMax,strokeMaxY:strokeMax,maxY:Math.max(fillMax,strokeMax),draws})};
}
