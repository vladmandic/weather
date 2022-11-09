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
  const json = res.json();
  return json;
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  let arrayBuffer = new Uint8Array(0);
  const reader = stream.getReader();
  while (true) { // eslint-disable-line no-constant-condition
    const { done, value } = await reader.read();
    if (done) break;
    const chunkBuffer = new Uint8Array(arrayBuffer.length + value.length);
    chunkBuffer.set(arrayBuffer);
    chunkBuffer.set(value, arrayBuffer.length);
    arrayBuffer = chunkBuffer;
  }

  const blob = new Blob([arrayBuffer], { type: 'image/gif' });
  const imageUrl = URL.createObjectURL(blob);
  return imageUrl;
}

export async function getImage(url: string, useProxy = true): Promise<string> {
  if (useProxy) {
    let res;
    try {
      const uri = `${proxy}${encodeURIComponent(url)}`;
      res = await fetch(uri);
    } catch (err) {
      console.error('fetch', err); // eslint-disable-line no-console
    }
    if (!res || !res.ok) return '';
    const bufferimage = await readStream(res.body);
    return bufferimage;
  }
  const res = await fetch(`${url}`);
  if (!res || !res.ok) return '';
  const bufferimage = await readStream(res.body as ReadableStream);
  return bufferimage;
}
