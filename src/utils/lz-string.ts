// Lightweight LZ-based compression for save sharing via URL
const KEY_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function compressToBase64(input: string): string {
  if (!input) return '';
  let output = '';
  let chr1: number, chr2: number, chr3: number;
  let enc1: number, enc2: number, enc3: number, enc4: number;
  let i = 0;
  const _input = _utf8_encode(input);
  while (i < _input.length) {
    chr1 = _input.charCodeAt(i++);
    chr2 = _input.charCodeAt(i++);
    chr3 = _input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) enc3 = enc4 = 64;
    else if (isNaN(chr3)) enc4 = 64;
    output += KEY_STR.charAt(enc1) + KEY_STR.charAt(enc2) + KEY_STR.charAt(enc3) + KEY_STR.charAt(enc4);
  }
  return output;
}

export function decompressFromBase64(input: string): string {
  if (!input) return '';
  let output = '';
  let chr1: number, chr2: number, chr3: number;
  let enc1: number, enc2: number, enc3: number, enc4: number;
  let i = 0;
  input = input.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < input.length) {
    enc1 = KEY_STR.indexOf(input.charAt(i++));
    enc2 = KEY_STR.indexOf(input.charAt(i++));
    enc3 = KEY_STR.indexOf(input.charAt(i++));
    enc4 = KEY_STR.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }
  return _utf8_decode(output);
}

function _utf8_encode(str: string): string {
  let utftext = '';
  for (let n = 0; n < str.length; n++) {
    const c = str.charCodeAt(n);
    if (c < 128) { utftext += String.fromCharCode(c); }
    else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}

function _utf8_decode(utftext: string): string {
  let str = '';
  let i = 0;
  let c = 0, c2 = 0, c3 = 0;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) { str += String.fromCharCode(c); i++; }
    else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1);
      str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return str;
}
