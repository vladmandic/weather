let callback;

export const initInput = (cb) => { callback = cb; };

class ComponentInput extends HTMLElement { // watch for attributes
  css: HTMLStyleElement = document.createElement('style');
  input: HTMLInputElement = document.createElement('input');

  connectedCallback() { // triggered on insert
    this.attachShadow({ mode: 'open' });
    this.css.innerHTML = `
      input[type=text] {
        width: 700px; padding: 10px; background: none; border: none; outline: none; font-family: CenturyGothic; font-variant: small-caps;
        font-size: 2rem; margin: 20px 20px 40px 20px; border-bottom: 4px solid #555555; color: white;
      }
    `;
    this.input.id = 'input-address';
    this.input.type = 'text';
    this.input.size = 10;
    this.input.onclick = (evt) => evt.stopPropagation();
    this.input.onchange = () => {
      if (callback && (this.input.value.trim().length > 0)) callback(this.input.value.trim());
    };
    // <input type="text" id="input-address" name="input-address" size="10" class="input-addres">
    this.shadowRoot?.append(this.css, this.input);
  }
}

customElements.define('component-input', ComponentInput);
