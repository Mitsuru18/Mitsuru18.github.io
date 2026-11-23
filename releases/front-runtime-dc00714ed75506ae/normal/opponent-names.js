import{EXTRA_NAMES}from'./world-countries.js';
// Original fictional identities. Ordering follows permanent course IDs, not win count.
import {EXTRA_LESSONS,courseIndex} from './course-layout.js';
export const OPPONENT_NAMES=Object.freeze({...EXTRA_NAMES,
 jp:['佐藤 迅牙','高橋 鉄臣','田中 烈伍','鈴木 斬也','山本 剛玄','中村 砕馬','小林 蓮牙','加藤 雷斗','吉田 玄武','山田 迅伍','渡辺 鉄真','伊藤 烈臣'],
 th:['サーン・ラクト','ヴェク・タナン','ラーム・カシン','タルン・サイガ','ナーク・ヴァラ','チャイ・ラトク','クラン・テーヴ','パク・ラヴァ','シン・タルガ','ヴァン・ケータ','ローク・ナリン','タワン・クラド'],
 br:['カイオ・ヴァス','ダリオ・フェル','レナン・コルザ','ブルノ・ヴァル','ルアン・トルヴ','エリオ・ブラス','マルコ・セドラ','イザク・ロシャ','ヴィト・セルガ','ダンテ・アヴロ','ラウロ・グラダ','テオ・フェロス'],
 kr:['カン・テリュン','ソ・ガンウ','ペク・ドユン','リュ・ソンガ','チャ・ムジン','ト・ハンギョル','チン・ガンソ','シン・テギョン','クォン・ユゴン','ムン・ジンソ','ハ・ソリュン','イム・ゴンヒョ'],
 fr:['リュク・ヴォル','レミ・ドラク','ノエ・ヴァルク','マルク・ロセル','ガエル・モラン','エリク・ヴェル','イヴ・ヴェルド','ロアン・セグル','アラン・ヴォス','セド・マルヴ','リオ・グレヴ','ニル・モルザ'],
 us:['ゼイン・ロック','コール・ヴェク','レックス・ケイド','ブレイク・ノール','カイル・ドレグ','ノックス・ヘイル','トロイ・グレイブ','ジェイス・ガルド','ディーン・ヴォル','アッシュ・クロム','レイド・フォード','ヴァン・ストーム']
});
Object.values(OPPONENT_NAMES).forEach(Object.freeze);
export function opponentName(id){if(typeof id==='string'&&/^[a-z]{2}-[012]$/.test(id))id=id.slice(0,3)+'dojo-'+id.slice(-1);if(courseIndex(id)===12)return EXTRA_LESSONS[id.slice(0,2)]?.name??null;return OPPONENT_NAMES[id?.slice(0,2)]?.[courseIndex(id)]??null;}
