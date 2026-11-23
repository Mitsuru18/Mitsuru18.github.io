/** User-generated original art; fixed file roles, never external hotlinks. */
export const ART=Object.freeze({
 street:{src:'./assets/street-fight-dusk.webp',alt:'夕暮れの街と平らな石畳の広場',position:'center bottom'},
 dojo:{src:'./assets/dojo-entrance.webp',alt:'灯りのともる道場の入口',position:'center 50%'},
 equipment:{src:'./assets/training-loadout.webp',alt:'道着とグローブを置いた稽古場',position:'center 75%'},
 travel:{src:'./assets/world-journey.webp',alt:'海と山の街をつなぐ旅の風景',position:'center 50%'}
});
/** Same country identity for course selection, live arena and result. Country street and dojo roles stay separate. */
export const DOJO_ART=Object.freeze(Object.fromEntries([
 ['jp','日本','木造の空手道場'],['th','タイ','開放的なムエタイジム'],['br','ブラジル','木床のカポエイラ練習場'],
 ['kr','韓国','青いマットのテコンドー道場'],['fr','フランス','高窓のサバット練習場'],['us','米国','煉瓦造りのボクシングジム'],
 ['cn','中国','散打のトレーニングホール'],['nl','オランダ','ダッチキックボクシングジム'],['mm','ミャンマー','木組みのラウェイ練習場'],
 ['ph','フィリピン','明るいヤウヤン練習場'],['ng','ナイジェリア','日除けのあるダンベ練習場']
].map(([id,name,place])=>[id,Object.freeze({src:`./assets/dojo-${id}.webp`,alt:`${name}・${place}`,position:'center bottom'})])));
/** Country-specific street plazas; Japan keeps its accepted Kyoto scene. */
export const STREET_ART=Object.freeze({jp:ART.street,...Object.fromEntries([
 ['th','タイ','バンコクの運河沿い広場'],['br','ブラジル','リオの丘を望む広場'],['kr','韓国','ソウルの街角広場'],
 ['fr','フランス','パリの石畳広場'],['us','米国','ニューヨークの煉瓦街'],['cn','中国','上海の石庫門の広場'],
 ['nl','オランダ','アムステルダムの運河沿い'],['mm','ミャンマー','ヤンゴンの街角広場'],['ph','フィリピン','マニラの街角広場'],['ng','ナイジェリア','カノの街の広場']
].map(([id,name,place])=>[id,Object.freeze({src:`./assets/street-${id}.webp`,alt:`${name}・${place}`,position:'center bottom'})]))});
const COUNTRY_ALIASES={japan:'jp',thailand:'th',brazil:'br',korea:'kr',france:'fr',usa:'us',china:'cn',netherlands:'nl',myanmar:'mm',philippines:'ph',nigeria:'ng'};
/** Independent country practice and food illustrations, separate from arenas. */
export function trainingArt(role,country='jp'){const raw=typeof country==='string'?country:country?.id,id=COUNTRY_ALIASES[raw]||raw,safe=Object.hasOwn(DOJO_ART,id)?id:'jp',kind=role==='meal'?'meal':'practice';return{src:`./assets/training-${safe}-${kind}.webp`,alt:kind==='meal'?'名物料理':'現地の修行',position:'center'};}
export function sceneArt(kind,country='jp'){const raw=typeof country==='string'?country:country?.id,id=COUNTRY_ALIASES[raw]||raw;return kind==='dojo'?(DOJO_ART[id]||DOJO_ART.jp):kind==='street'?(STREET_ART[id]||STREET_ART.jp):ART[kind];}
const images=new Map(),listeners=new Set();
export function sceneImage(kind,country='jp'){const a=sceneArt(kind,country);if(typeof Image==='undefined'||!a)return null;let im=images.get(a.src);if(!im){im=new Image();images.set(a.src,im);im.decoding='async';im.onload=()=>{for(const fn of listeners)fn()};im.src=a.src;}return im.complete&&im.naturalWidth>0?im:null;}
export function warmSceneArt(onReady){if(typeof Image==='undefined')return;if(onReady)listeners.add(onReady);for(const key of Object.keys(ART))sceneImage(key);for(const id of Object.keys(DOJO_ART)){sceneImage('dojo',id);sceneImage('street',id);}}
export function artMarkup(kind,classes='',country='jp'){const a=sceneArt(kind,country);return `<img class="pixel-art ${classes}" src="${a.src}" width="960" height="540" alt="${a.alt}" style="object-position:${a.position}" decoding="async">`;}

// Extra meals are separately generated atlas panels; the original meal stays index0.
export function trainingMealArt(country='jp',index=0){const raw=typeof country==='string'?country:country?.id,id=COUNTRY_ALIASES[raw]||raw,safe=Object.hasOwn(DOJO_ART,id)?id:'jp',n=Number.isInteger(index)&&index>=0&&index<=2?index:0;return{src:n?`./assets/training-${safe}-meal-extra.webp`:trainingArt('meal',safe).src,panel:n?n-1:null,alt:n?'今回の名物料理':'名物料理の一例'};}
