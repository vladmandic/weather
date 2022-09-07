export function updateClockOverlay() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  (document.getElementById('component-clock-overlay') as HTMLDivElement).innerText = window.scrollY > 0 ? pad(now.getHours()) + ':' + pad(now.getMinutes()) : '';
}

class ComponentClockOverlay extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="component-clock-overlay" class="component-clock-overlay">
      </div>`;
    setInterval(() => updateClockOverlay(), 1000); // start component-clock
  }
}

customElements.define('component-clock-overlay', ComponentClockOverlay);
