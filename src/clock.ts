let last;

function updateNumber(element, number: string) {
  const second = element.lastElementChild.cloneNode(true);
  second.textContent = number;
  element.classList.add('move');
  element.appendChild(second);
  setTimeout(() => {
    element.classList.remove('move');
    element.removeChild(element.firstElementChild);
  }, 850);
}

function updateContainer(container, time: number) {
  const s = time.toString().padStart(2, '0').split('');
  const first = container.firstElementChild;
  if (first.lastElementChild.textContent !== s[0]) updateNumber(first, s[0]);
  const second = container.lastElementChild;
  if (second.lastElementChild.textContent !== s[1]) updateNumber(second, s[1]);
}

export class ComponentClock extends HTMLElement {
  css: HTMLStyleElement = document.createElement('style');
  hour: HTMLDivElement = document.createElement('div');
  min: HTMLDivElement = document.createElement('div');
  sec: HTMLDivElement = document.createElement('div');
  interval: number | undefined;
  static get observedAttributes() { return ['dt']; }

  constructor() {
    super();
    this.hour.innerHTML = '<div><div>0</div></div><div><div>0</div></div>';
    this.min.innerHTML = '<div><div>0</div></div><div><div>0</div></div>';
    this.sec.innerHTML = '<div><div>0</div></div><div><div>0</div></div>';
    // this.id = 'component-clock';
    this.attachShadow({ mode: 'open' });
    this.css.innerHTML = `
      div { font-size: 130px; }
      #clock {
        height: 1.6em; font-weight: 800; letter-spacing: 0.3em; line-height: 1.6em; display: flex; position: relative;
        overflow: hidden; min-width: fit-content; justify-content: center;
        animation: fade-in ease 1s; text-shadow: beige 0.025em 0.025em 0.1em; mix-blend-mode: hard-light;
      }
      #clock::before { content: ''; width: 100vw; height: 0.8em; position: absolute; top: 0.8em; z-index: 2; background: linear-gradient(180deg, transparent 50%, black 100%) }
      #clock::after { content: ''; width: 100vw; height: 0.8em; position: absolute; z-index: 2; background: linear-gradient(0deg, transparent 50%, black 100%) }
      #clock > div { display: flex; }
      .move { animation: scroll-up linear 850ms; }
      @keyframes fade-in { 0% { opacity:0; } 100% { opacity:1; } }
      @keyframes scroll-up { from { transform: translateY(0vh) } to { transform: translateY(calc(-1 * 1.6em)) } }
    `;
    const hs = document.createElement('span');
    hs.innerText = ':';
    const hm = document.createElement('span');
    hm.innerText = ':';
    const container = document.createElement('div');
    container.append(this.hour, hs, this.min, hm, this.sec);
    container.id = 'clock';
    this.shadowRoot?.append(this.css, container);
  }

  connectedCallback() {
    this.interval = setInterval(() => this.setAttribute('dt', new Date().toISOString()), 1000);
  }

  disconnectedCallback() {
    if (this.interval) clearInterval(this.interval);
  }

  attributeChangedCallback(name, prevVal, currVal) {
    if (name !== 'dt') return;
    const prev = new Date(prevVal);
    const curr = new Date(currVal);
    if (!prevVal || (prev.getHours() !== curr.getHours())) updateContainer(this.hour, curr.getHours());
    if (!prevVal || (prev.getMinutes() !== curr.getMinutes())) updateContainer(this.min, curr.getMinutes());
    if (!last || (prev.getSeconds() !== curr.getSeconds())) updateContainer(this.sec, curr.getSeconds());
  }
}

customElements.define('component-clock', ComponentClock);
