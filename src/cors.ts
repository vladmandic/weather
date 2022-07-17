export async function cors(url: string) {
  const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  if (!res || !res.ok) return {};
  const content = (await res.json()).contents;
  const json = JSON.parse(content);
  return json;
}
