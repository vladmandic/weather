let last = new Date(0);

function updateNumber(element, number: string) {
  const second = element.lastElementChild.cloneNode(true);
  second.textContent = number;
  element.classList.add('clock-move');
  element.appendChild(second);
  setTimeout(() => {
    element.classList.remove('clock-move');
    element.removeChild(element.firstElementChild);
  }, 750);
}

function updateContainer(container, time: number) {
  const s = time.toString().padStart(2, '0').split('');
  const first = container.firstElementChild;
  if (first.lastElementChild.textContent !== s[0]) updateNumber(first, s[0]);
  const second = container.lastElementChild;
  if (second.lastElementChild.textContent !== s[1]) updateNumber(second, s[1]);
}

export function updateClock() {
  const now = new Date();
  if (!document.getElementById('clock')) return;
  if (last.getHours() !== now.getHours()) updateContainer(document.getElementById('hours'), now.getHours());
  if (last.getMinutes() !== now.getMinutes()) updateContainer(document.getElementById('minutes'), now.getMinutes());
  if (last.getSeconds() !== now.getSeconds()) updateContainer(document.getElementById('seconds'), now.getSeconds());
  last = now;
}

class ComponentClock extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="clock" class="clock">
        <div id="hours"><div><div>0</div></div><div><div>0</div></div></div>
        <span>:</span>
        <div id="minutes"><div><div>0</div></div><div><div>0</div></div></div>
        <span>:</span>
        <div id="seconds"><div><div>0</div></div><div><div>0</div></div></div>   
      </div>`;
    setInterval(() => updateClock(), 1000); // start clock
  }
}

customElements.define('component-clock', ComponentClock);
