// Cosmetic data only. No ability, collision or time calculations depend on it.
export const SKIN_OPTIONS=Object.freeze([
{id:'original',name:'従来',skin:null},
{id:'light',name:'ライト',skin:'#edc5a7',light:'#ffdfc0',shade:'#bc9177'},
{id:'gold',name:'ゴールド',skin:'#d9ad78',light:'#f3ca96',shade:'#a57a50'},
{id:'copper',name:'カッパー',skin:'#bb805b',light:'#dca17a',shade:'#89563c'},
{id:'brown',name:'ブラウン',skin:'#925c43',light:'#b98060',shade:'#643d30'},
{id:'deep',name:'ディープ',skin:'#613e33',light:'#8e6250',shade:'#402b26'}]);
export const OUTFIT_OPTIONS=Object.freeze([{id:'shorts',name:'格闘ショーツ'},{id:'tank',name:'タンクトップ'},{id:'tee',name:'Tシャツ'},{id:'gi',name:'道着'}]);
export const TONE_OPTIONS=Object.freeze([{id:'team',name:'従来色',cloth:null},{id:'navy',name:'紺',cloth:'#263b59',bright:'#47698b'},{id:'ivory',name:'生成り',cloth:'#bdb6a0',bright:'#e8e1c7'},{id:'forest',name:'深緑',cloth:'#315347',bright:'#60816a'}]);
export const HAIR_OPTIONS=Object.freeze([{id:'short',name:'短髪'},{id:'buzz',name:'坊主'},{id:'swept',name:'立ち上げ'},{id:'tied',name:'長め・結び髪'}]);
export const DEFAULT_APPEARANCE=Object.freeze({skin:'original',outfit:'shorts',tone:'team',hair:'short'});
export function normalizeAppearance(value){const v=value&&typeof value==='object'?value:{};return Object.fromEntries([['skin',SKIN_OPTIONS],['outfit',OUTFIT_OPTIONS],['tone',TONE_OPTIONS],['hair',HAIR_OPTIONS]].map(([k,options])=>[k,options.some(o=>o.id===v[k])?v[k]:DEFAULT_APPEARANCE[k]]));}
export function opponentAppearance(id){let h=2166136261;for(const c of String(id))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return{skin:SKIN_OPTIONS[1+(h%5)].id,outfit:OUTFIT_OPTIONS[Math.floor(h/7)%4].id,tone:TONE_OPTIONS[Math.floor(h/31)%4].id,hair:HAIR_OPTIONS[Math.floor(h/127)%4].id};}
export function appearancePalette(value,base,role=0){if(!value)return base;const a=normalizeAppearance(value),skin=SKIN_OPTIONS.find(o=>o.id===a.skin),tone=TONE_OPTIONS.find(o=>o.id===a.tone);return{...base,...(skin.skin?{skin:skin.skin,light:skin.light,shade:skin.shade}:{}),...(tone.cloth?{cloth:tone.cloth,bright:tone.bright}:{}),outfit:a.outfit,hairStyle:a.hair,accent:role%2?'#e78378':'#7bbfdc'};}
// Local head coordinates; attached to the same rigid head transform in both rigs.
export function hairShape(style){return style==='buzz'?[[-5,0],[-6,-3],[-4,-6],[1,-7],[5,-4],[5,-2],[0,-4],[-3,-3]]:style==='swept'?[[-5,2],[-6,-3],[-5,-7],[-1,-10],[0,-7],[5,-9],[5,-4],[1,-3],[-3,-2],[-3,2]]:style==='tied'?[[-5,4],[-6,-3],[-4,-7],[1,-8],[5,-5],[4,-3],[-1,-4],[-3,0],[-4,5],[-7,9],[-9,8],[-8,3]]:null;}
