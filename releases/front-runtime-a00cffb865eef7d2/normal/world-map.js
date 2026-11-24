// Geographical anchor points; label offsets are connected to actual positions.
// Land outline: Natural Earth 1:110m public-domain data, nvkelso/natural-earth-vector.
import{COUNTRIES,newGame,opponents,courseCount,courseWonCount,travelEligibility}from'./progression.js';
export const COUNTRY_GEO={jp:[135.77,35.01],th:[100.5,13.76],br:[-43.2,-22.9],kr:[126.98,37.57],fr:[2.35,48.86],us:[-74,40.71],cn:[121.47,31.23],nl:[4.9,52.37],mm:[96.17,16.84],ph:[120.98,14.6],ng:[8.5,12]};
export const MARTIAL_ART={jp:'空手',th:'ムエタイ',br:'カポエイラ',kr:'テコンドー',fr:'サバット',us:'ボクシング',cn:'散打',nl:'ダッチキックボクシング',mm:'ラウェイ',ph:'ヤウヤン',ng:'ダンベ'};
export const MAP_REGIONS={world:{label:'世界',box:[0,0,1000,440]},asia:{label:'アジア',box:[735,90,170,170]},europe:{label:'欧州',box:[470,65,100,95]},americas:{label:'米州',box:[100,100,330,285]},africa:{label:'アフリカ',box:[450,150,170,195]}};
export const NEW_JOURNEY_COUNTRY='jp';
// Public new-game entry. The general newGame(country) factory remains available
// to load/verify historical non-Japan starts; no existing save is reassigned.
export const createNewJourney=()=>newGame(NEW_JOURNEY_COUNTRY);
export const DIFFICULTY_BANDS=Object.freeze([{through:10,label:'入門'},{through:20,label:'初級'},{through:30,label:'中級'},{through:40,label:'上級'},{through:Infinity,label:'達人'}]);
export function countryDifficulty(state,id){const baseline=state??createNewJourney(),s={...baseline,country:id},os=opponents(s).filter(o=>!o.ordinal),totals=os.map(o=>Object.values(o.abilityPoints).reduce((a,b)=>a+b,0)),min=Math.min(...totals),max=Math.max(...totals),midpoint=(min+max)/2,band=DIFFICULTY_BANDS.find(b=>midpoint<=b.through),allocated=state?Object.values(state.abilities.spent).reduce((a,b)=>a+b,0):10;return{min,max,midpoint,label:band.label,basis:'whole-country-allocation-range-midpoint',journeyStart:s.journeyStart,allocated,count:courseCount(id),won:state?courseWonCount(state,id):0,cost:state?travelEligibility(state,id).cost??0:0};}

export function mapPins(region='world'){const r=MAP_REGIONS[region]??MAP_REGIONS.world,[bx,by,bw,bh]=r.box;const offsets=region==='world'?{jp:[0,0],kr:[-15,-38],cn:[-42,12],th:[10,42],mm:[-48,14],ph:[0,92],fr:[-28,30],nl:[28,-18],ng:[-12,0]}:region==='asia'?{jp:[30,-5],kr:[-25,-30],cn:[-55,20],th:[15,35],mm:[-45,-10],ph:[40,25]}:region==='europe'?{fr:[-20,30],nl:[30,-20]}:{};return COUNTRIES.flatMap(c=>{const[lon,lat]=COUNTRY_GEO[c.id],px=(lon+180)/360*1000,py=(82-lat)/142*440,x=(px-bx)/bw*100,y=(py-by)/bh*100;if(x<0||x>100||y<0||y>100)return[];return[{...c,x,y,dx:offsets[c.id]?.[0]??0,dy:offsets[c.id]?.[1]??0}];});}
