import { log } from './log';

export const showLoader = (msg: string) => {
  Array.from(document.getElementsByTagName('component-loader')).forEach((loader) => {
    (loader as HTMLDivElement).setAttribute('msg', msg);
    (loader as HTMLDivElement).style.display = 'block';
  });
};

export const hideLoader = () => Array.from(document.getElementsByTagName('component-loader')).forEach((loader) => { (loader as HTMLDivElement).style.display = 'none'; });

export const loaderCallback = (callback) => {
  const divs = Array.from(document.getElementsByTagName('component-loader')) as HTMLDivElement[];
  for (const div of divs) {
    if (div && callback) {
      div.onclick = () => {
        log('loaderCallback');
        callback();
      };
    }
  }
};

class ComponentLoader extends HTMLElement { // watch for attributes
  css: HTMLStyleElement = document.createElement('style');
  container: HTMLDivElement = document.createElement('div');
  loader: HTMLDivElement = document.createElement('div');
  message: HTMLDivElement = document.createElement('div');

  static get observedAttributes() { return ['msg']; }

  attributeChangedCallback(_name, _prevVal, currVal) {
    this.message.innerHTML = currVal;
  }

  connectedCallback() { // triggered on insert
    this.attachShadow({ mode: 'open' });
    this.css.innerHTML = `
      .loader-container { top: 300px; justify-content: center; position: fixed; width: 100%; }
      .loader-message { font-size: 1.5rem; padding: 1rem; }
      .loader { width: 300px; height: 300px; border: 3px solid transparent; border-radius: 50%; border-top: 4px solid #f15e41; animation: spin 4s linear infinite; position: relative; }
      .loader::before, .loader::after { content: ""; position: absolute; top: 6px; bottom: 6px; left: 6px; right: 6px; border-radius: 50%; border: 4px solid transparent; }
      .loader::before { border-top-color: #bad375; animation: 3s spin linear infinite; }
      .loader::after { border-top-color: #26a9e0; animation: spin 1.5s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    this.container.id = 'loader-container';
    this.container.className = 'loader-container';
    this.loader.id = 'loader';
    this.loader.className = 'loader';
    this.message.id = 'loader-message';
    this.message.className = 'loader-message';
    this.message.innerHTML = '';
    this.container.appendChild(this.message);
    this.container.appendChild(this.loader);
    this.shadowRoot?.append(this.css, this.container);
  }
}

customElements.define('component-loader', ComponentLoader);
