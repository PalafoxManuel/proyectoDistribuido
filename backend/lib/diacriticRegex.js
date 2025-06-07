// lib/diacriticRegex.js
const map = {
  a: 'aáàäâãåā',
  e: 'eéèëêē',
  i: 'iíìïîī',
  o: 'oóòöôõō',
  u: 'uúùüûū',
  c: 'cç',
  n: 'nñ'
};

module.exports = function buildRegex(text) {
  const pattern = text
    .split('')
    .map(ch => {
      const low = ch.toLowerCase();
      if (map[low]) {
        const chars = map[low] + map[low].toUpperCase();
        return `[${chars}]`;
      }
      // escapamos regex-special characters
      return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(pattern, 'i');
};
