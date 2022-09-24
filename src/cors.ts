export async function cors(url: string, useProxy = true) {
  if (useProxy) {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (!res || !res.ok) return {};
    const content = (await res.json()).contents;
    const json = content ? JSON.parse(content) : {};
    return json;
  }
  const res = await fetch(`${url}`);
  if (!res || !res.ok) return {};
  const json = res.json() || {};
  return json;
}
