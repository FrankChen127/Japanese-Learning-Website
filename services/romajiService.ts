
// Basic Romaji to Kana mapping
const hiraganaMap: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を', n: 'ん',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  // Small variations
  la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ',
  tu: 'つ', // Special handling for 'tu' often meaning 'tsu' but strict 'tu' is 'とぅ' usually. Using basic map.
};

export const toHiragana = (input: string): string => {
  let result = input.toLowerCase();
  
  // Handle small tsu (double consonants)
  // e.g. "kk", "ss", "tt", "pp" -> "っ" + following char
  result = result.replace(/([kstnhmyrwgzbpd])\1/g, 'っ$1');
  
  // Sort keys by length descending to match longest sequences first (e.g., 'shi' before 's')
  const keys = Object.keys(hiraganaMap).sort((a, b) => b.length - a.length);
  
  for (const key of keys) {
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, hiraganaMap[key]);
  }
  
  return result;
};

export const toKatakana = (input: string): string => {
  const hira = toHiragana(input);
  return hira.replace(/[\u3041-\u3096]/g, function(match) {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
};
