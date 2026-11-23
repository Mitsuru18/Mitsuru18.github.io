// Same accepted head surfaces. Only angle-independent construction is cached.
// At most four hairstyle meshes per module; no tick/pose/angle/skin/HP/SP/RNG state is retained.
const meshes=new Map();
function mesh(customHair){const key=JSON.stringify(customHair),cached=meshes.get(key);if(cached)return cached;const faces=[];const face=(points,color)=>faces.push({points,color});
 const pos=(lat,lon)=>{let y=15.2*Math.sin(lat),x=11*Math.cos(lat)*Math.sin(lon),z=9.2*Math.cos(lat)*Math.cos(lon);return[x,y,z];};
 const hairLimit=t=>Math.asin((-6.8+7.65*(1-Math.cos(t))+.35*Math.sin(t))/15.2);
 const point=(lat,lon,isHair)=>{let q=pos(lat,lon);if(isHair){q[0]*=1.025;q[2]*=1.025;if(q[1]<-10.5)q[1]=-10.5+(q[1]+10.5)*.72;}return q;};
 // A single partitioned shell: hair above the boundary, skin below. No covering layer.
 for(let i=0;i<64;i++){let t0=-Math.PI+i*Math.PI*2/64,t1=t0+Math.PI*2/64;
  for(let j=0;j<18;j++){const h=(u,t)=>point(-Math.PI/2+u*(hairLimit(t)+Math.PI/2),t,true);face([h(j/18,t0),h((j+1)/18,t0),h((j+1)/18,t1),h(j/18,t1)].reverse(),'#ce956b');}
  for(let j=0;j<18;j++){const h=(u,t)=>point(hairLimit(t)+u*(Math.PI/2-hairLimit(t)),t,false);face([h(j/18,t0),h((j+1)/18,t0),h((j+1)/18,t1),h(j/18,t1)].reverse(),'#ce956b');}
 }
 // Original v82 hair outline in its screen-right profile; depth is inferred.
 const hairOutline=customHair??[[-11,0],[-11,-9],[-6,-15],[5,-15],[11,-8],[8,-4],[-3,-5],[-6,1]];
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const inside=(p,a,b,c)=>cross(a,b,p)>=-1e-8&&cross(b,c,p)>=-1e-8&&cross(c,a,p)>=-1e-8;
 let ids=hairOutline.map((_,i)=>i),tris=[];
 while(ids.length>3){let found=false;for(let k=0;k<ids.length;k++){let a=ids[(k+ids.length-1)%ids.length],b=ids[k],d=ids[(k+1)%ids.length];if(cross(hairOutline[a],hairOutline[b],hairOutline[d])<=0)continue;if(ids.some(n=>n!==a&&n!==b&&n!==d&&inside(hairOutline[n],hairOutline[a],hairOutline[b],hairOutline[d])))continue;tris.push([a,b,d]);ids.splice(k,1);found=true;break;}if(!found)throw Error('Hair triangulation failed');}tris.push(ids);
 const hv=(i,side)=>{let [z,y]=hairOutline[i];return[side*Math.max(customHair?0:[11.3,9,5.5,5.5,7.5,10,11.3,11.3][i],11.5*Math.sqrt(Math.max(0,1-y*y/(15.2*15.2)-z*z/(9.5*9.5)))+1.2),y,z];};
  function hairTri(q,depth=3){if(depth){const mid=(a,b)=>a.map((v,i)=>(v+b[i])/2),a=mid(q[0],q[1]),b=mid(q[1],q[2]),d=mid(q[2],q[0]);for(const t of[[q[0],a,d],[a,q[1],b],[d,b,q[2]],[a,b,d]])hairTri(t,depth-1);return;}face(q.map(([x,y,z])=>[Math.sign(x)*Math.max(Math.abs(x),11.5*Math.sqrt(Math.max(0,1-y*y/(15.2*15.2)-z*z/(9.5*9.5)))+1.2),y,z]),'#293b40');}
 for(const tri of tris){hairTri(tri.map(i=>hv(i,-1)));hairTri([...tri].reverse().map(i=>hv(i,1)));}
 for(let i=0;i<hairOutline.length;i++){let n=(i+1)%hairOutline.length;const a=hv(i,-1),b=hv(i,1),d=hv(n,-1),e=hv(n,1),p=(u,v)=>a.map((_,k)=>(a[k]*(1-u)+b[k]*u)*(1-v)+(d[k]*(1-u)+e[k]*u)*v);for(let u=0;u<16;u++)for(let v=0;v<16;v++)face([p(u/16,v/16),p((u+1)/16,v/16),p((u+1)/16,(v+1)/16),p(u/16,(v+1)/16)],'#293b40');}
 // Small surface patches, attached to their anatomical locations; rear-facing ones cull naturally.
 const surface=(x,y,offset=.45)=>[x,y,9.2*Math.sqrt(Math.max(0,1-x*x/121-y*y/(15.2*15.2)))+offset];
 function patch(x,y,rx,ry,color){let q=[];for(let n=0;n<12;n++){let a=n*Math.PI*2/12;q.push(surface(x+rx*Math.cos(a),y+ry*Math.sin(a)));}face(q,color);}
 for(const s of[-1,1]){patch(s*4,-2,1.15,.8,'#253b40');patch(s*4,-4,1.8,.45,'#293b40');}
 patch(0,6.5,3,.5,'#9c684c');
 const n0=surface(-1.4,-1),n1=surface(1.4,-1),n2=surface(1.3,4),n3=surface(-1.3,4),tip=[0,2,13];face([n0,n1,tip],'#d59c72');face([n1,n2,tip],'#c38b63');face([n2,n3,tip],'#c38b63');face([n3,n0,tip],'#d59c72');
 // Ear pinnae are small skin geometry, never cover the face.
 for(const side of[-1,1]){let q=[];for(let n=0;n<16;n++){let a=n*Math.PI*2/16;q.push([side*(10.4+1.6*Math.cos(a)),1+3*Math.sin(a),.4]);}if(side<0)q.reverse();face(q,'#c58c64');}

 // Deduplicate exact world vertices. Projected scratch coordinates are fully overwritten
 // each evaluation; no action, tick, skin, or battle state is memoized.
 const vertices=[],vertexIds=new Map();for(const row of faces){row.ids=row.points.map(q=>{const key=q.join(',');if(!vertexIds.has(key)){vertexIds.set(key,vertices.length);vertices.push(q);}return vertexIds.get(key)});row.z=0;}
 const value={faces,vertices,projected:vertices.map(()=>[0,0,0])};
 if(meshes.size>=4)meshes.delete(meshes.keys().next().value);meshes.set(key,value);return value;}
export function restoredHairHead(c,p,yaw,roll,pitch,{hairOutline:customHair=null,colorMap=x=>x}={}){
 const fill=c.fillStyle,stroke=c.strokeStyle;c.save();c.translate(p.joints.head[0]*2,-p.joints.head[1]*2);c.rotate(roll);
 const cy=Math.cos(yaw),sy=Math.sin(yaw),a=pitch*.38,cp=Math.cos(a),sp=Math.sin(a),faces=[],m=mesh(customHair);
 for(let i=0;i<m.vertices.length;i++){const[x,y,z]=m.vertices[i],v=m.projected[i],xx=x*cy+z*sy,zz=z*cy-x*sy;v[0]=xx;v[1]=y*cp+zz*sp;v[2]=zz*cp-y*sp;}
 for(const row of m.faces){const v0=m.projected[row.ids[0]],v1=m.projected[row.ids[1]],v2=m.projected[row.ids[2]],ux=v1[0]-v0[0],uy=v1[1]-v0[1],wx=v2[0]-v0[0],wy=v2[1]-v0[1];if(ux*wy-uy*wx<=1e-8)continue;let z=0;for(const id of row.ids)z+=m.projected[id][2];row.z=z/row.ids.length;faces.push(row);}
 faces.sort((a,b)=>a.z-b.z);c.lineJoin='round';c.lineWidth=.32;let lastColor=null;for(const f of faces){c.beginPath();for(let i=0;i<f.ids.length;i++){const v=m.projected[f.ids[i]];if(i)c.lineTo(v[0],v[1]);else c.moveTo(v[0],v[1]);}c.closePath();const mapped=colorMap(f.color);if(mapped!==lastColor){c.fillStyle=mapped;c.strokeStyle=mapped;lastColor=mapped;}c.fill();c.stroke();}
 c.restore();c.fillStyle=fill;c.strokeStyle=stroke;
}
