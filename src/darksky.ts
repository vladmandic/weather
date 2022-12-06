import { log } from './log';

const darksky = document.createElement('iframe') as HTMLIFrameElement;
darksky.id = 'weather-darksky-iframe';
darksky.width = '1000';
darksky.height = '1000';
darksky.frameBorder = '0';

export async function updateDarkSky(lat: number, lon: number) {
  log('updateDarkSky', { lat, lon });
  darksky.src = `https://maps.darksky.net/@precipitation_rate,${lat},${lon}`;
}

class ComponentWindy extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = '<div class=darksky" id="weather-darksky" style="margin-top: 20px; margin-bottom: 20px; font-size: 1.4rem; cursor: pointer; letter-spacing: 3px; background: rgba(50, 0, 50, 0.5); padding: 4px;">darksky maps</div>';
    this.addEventListener('click', () => {
      if (this.children.length > 1) {
        log('removeDarkSky');
        for (let i = 1; i < this.children.length; i++) this.removeChild(this.children[i]);
      } else {
        log('appendDarkSky');
        this.appendChild(darksky);
      }
    });
  }
}

customElements.define('component-darksky', ComponentWindy);
