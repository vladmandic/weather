import { log } from './log';

const windy = document.createElement('iframe') as HTMLIFrameElement;
windy.id = 'weather-windy-iframe';
windy.width = '800';
windy.height = '800';
windy.frameBorder = '0';

export async function updateWindy(lat: number, lon: number) {
  log('updateWindy', { lat, lon });
  // eslint-disable-next-line max-len
  windy.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=800&height=800&zoom=7&level=surface&overlay=radar&product=radar&menu=&message=true&marker=&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=mph&metricTemp=%C2%B0F&radarRange=-1`;
}

class ComponentWindy extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = '<div class=windy" id="weather-windy" style="margin-top: 20px; margin-bottom: 20px">more maps</div>';
    this.addEventListener('click', () => {
      if (this.children.length > 1) {
        log('removeWindy');
        for (let i = 1; i < this.children.length; i++) this.removeChild(this.children[i]);
      } else {
        log('appendWindy');
        this.appendChild(windy);
      }
    });
  }
}

customElements.define('component-windy', ComponentWindy);
