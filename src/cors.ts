const proxy = 'https://corsproxy.io/?';
// const proxy = 'https://api.allorigins.win/get?url='

export async function cors(url: string, useProxy = true) {
  if (useProxy) {
    let res;
    try {
      const uri = `${proxy}${encodeURIComponent(url)}`;
      res = await fetch(uri);
    } catch (err) {
      console.error('fetch', err); // eslint-disable-line no-console
    }
    if (!res || !res.ok) return {};
    const json = await res.json();
    const content = json?.contents;
    const parsed = content ? JSON.parse(content) : json;
    return parsed;
  }
  const res = await fetch(`${url}`);
  if (!res || !res.ok) return {};
  const json = res.json() || {};
  return json;
}
