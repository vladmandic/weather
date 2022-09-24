const xssMap = {
  '&': '&#38;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '#': '&#35;',
  "'": '&#39;',
  '`': '&#x60;',
  '(': '&#40;',
  ')': '&#41;',
};

const invert = (map) => {
  const result = {};
  for (const key in map) {
    // if (map.hasOwnProperty(key)) result[map[key]] = key;
    if (key in map) result[map[key]] = key;
  }
  return result;
};

const unescapeMap = invert(xssMap);

const createEscaper = (map) => {
  const escaper = (match) => map[match];
  const keys: string[] = [];
  for (const key in map) {
    // if (map.hasOwnProperty(key)) keys.push(key);
    if (key in map) keys.push(key);
  }
  let regexp = keys.join('|');
  // for (,)
  regexp = regexp.replace(/\(/g, '\\(');
  regexp = regexp.replace(/\)/g, '\\)');
  regexp = `(?:${regexp})`;
  const testRegexp = RegExp(regexp);
  const replaceRegexp = RegExp(regexp, 'g');
  return (string) => {
    string = !string ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
};

export const escape = createEscaper(xssMap);
export const unescape = createEscaper(unescapeMap);
export const map = xssMap;
// xss.escape = createEscaper(xssMap);
// xss.unescape = createEscaper(unescapeMap);
// xss.map = xssMap;
