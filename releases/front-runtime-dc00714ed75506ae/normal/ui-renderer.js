import{drawArena as originalDraw,resultPresentationDuration}from'./renderer-2d-review.js';
import{sceneImage}from'./scene-art.js';
export{resultPresentationDuration};
export{breathingEligible}from'./main-battle-runtime.js';
const surfaces=new WeakMap();
function createSurfaces(canvas){let s=surfaces.get(canvas);if(!s){s={background:document.createElement('canvas'),foreground:document.createElement('canvas'),blank:document.createElement('canvas')};s.blank.width=384;s.blank.height=216;surfaces.set(canvas,s);}return s;}
function foregroundCanvas(surface){return{get width(){return surface.width},set width(v){surface.width=v},get height(){return surface.height},set height(v){surface.height=v},getContext(){const c=surface.getContext('2d');return new Proxy(c,{get(t,k){if(k==='fillRect')return(x,y,w,h)=>{if(x===66&&y===25&&w===252&&h===55)return;t.fillRect(x,y,w,h)};if(k==='fillText')return(text,...a)=>{if(['勝利','敗北','引き分け'].includes(text))return;t.fillText(text,...a)};const v=Reflect.get(t,k,t);return typeof v==='function'?v.bind(t):v},set(t,k,v){Reflect.set(t,k,v,t);return true}})}}}
/** Original character rendering, uniformly framed; only the stage background gets taller. */
export function drawArena(canvas,battle,country,time=0,options={}){
 if(canvas?.id!=='arena'||!canvas.getContext?.('2d'))return originalDraw(canvas,battle,country,time,options);
 const s=createSurfaces(canvas),rect=canvas.getBoundingClientRect(),w=rect.width||360,h=rect.height||432;
 const width=1200,height=Math.max(600,Math.round(width*h/w));if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
 for(const part of[s.background,s.foreground]){if(part.width!==1152)part.width=1152;if(part.height!==648)part.height=648;}s.foreground.getContext('2d').clearRect(0,0,1152,648);
 const image=options.backgroundImage||sceneImage(options.sceneKind||'dojo',country),key=String(typeof country==='string'?country:country?.id)+':'+options.sceneKind+':'+(image?.naturalWidth||0);if(s.backgroundKey!==key){s.background.getContext('2d').clearRect(0,0,1152,648);originalDraw(s.background,battle,country,time,{...options,runtimeBackgroundOnly:true});s.backgroundKey=key;}
 originalDraw(foregroundCanvas(s.foreground),battle,country,time,{...options,sceneKind:'street',backgroundImage:s.blank});
 const pair=battle?.fighters||[],center=pair.length?pair.reduce((a,f)=>a+28+f.x*.41,0)/pair.length:192,x=Math.max(0,Math.min(128,center-128));
 const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.clearRect(0,0,width,height);ctx.drawImage(s.background,x*3,0,256*3,216*3,0,0,width,height);
 const scale=width/256,floor=height*189/216;ctx.save();ctx.translate(-x*scale,floor-189*scale);ctx.scale(scale/3,scale/3);ctx.drawImage(s.foreground,0,0);ctx.restore();
 const tail=options.postResultSeconds||0;if(battle?.done&&tail>=1.1){ctx.save();ctx.setTransform(width/384,0,0,width/384,0,0);ctx.globalAlpha=Math.min(1,(tail-1.1)/.18);ctx.fillStyle='#101b27e8';ctx.fillRect(66,25,252,55);ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillStyle=battle.winner==='player'?'#f2cf77':'#efaa9b';ctx.fillText(battle.winner==='player'?'勝利':battle.winner==='opponent'?'敗北':'引き分け',192,65);ctx.restore();}
 canvas.dataset.uiFraming=JSON.stringify({zoom:1.5,sourceLeft:x,uniformActorScale:true,stageHeight:h});
}
export function drawUIPortrait(canvas,battle,country,{role=1,focus='body'}={}){
 const c=canvas?.getContext?.('2d');if(!c)return;const s=createSurfaces(canvas),b=structuredClone(battle);b.fighters[0]={...b.fighters[0],x:role===0?400:60,facing:1,pose:'idle',action:null};b.fighters[1]={...b.fighters[1],x:role===1?400:740,facing:-1,pose:'idle',action:null};b.events=[];b.done=false;
 s.foreground.width=1152;s.foreground.height=648;originalDraw(s.foreground,b,country,0,{sceneKind:'street',backgroundImage:s.blank});canvas.width=400;canvas.height=520;c.clearRect(0,0,400,520);const crop=focus==='head'?[172,78,42,54.6]:[142,60,100,130];c.drawImage(s.foreground,...crop.map(n=>n*3),0,0,400,520);
}
