export function updateClockOverlay() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  (document.getElementById('component-clock-overlay') as HTMLDivElement).innerText = window.scrollY > 0 ? pad(now.getHours()) + ':' + pad(now.getMinutes()) : '';
}

class ComponentClockOverlay extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="component-clock-overlay" style="font-size: 5.0rem; letter-spacing: 1.1rem; position: fixed; bottom: 0; right: 16px; font-weight: 800; color: beige; opacity: 45%; z-index: 500; text-shadow: beige 0.025em 0.025em 0.1em">
      </div>`;
    setInterval(() => updateClockOverlay(), 1000); // start component-clock
  }
}

customElements.define('component-clock-overlay', ComponentClockOverlay);
