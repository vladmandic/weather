let last;

function updateNumber(element, number: string) {
  const second = element.lastElementChild.cloneNode(true);
  second.textContent = number;
  element.classList.add('component-clock-move');
  element.appendChild(second);
  setTimeout(() => {
    element.classList.remove('component-clock-move');
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

export function updateClock(force: boolean) {
  const now = new Date();
  if (!last) {
    force = true;
    last = now;
  }
  if (!document.getElementById('component-clock')) return;
  if (force || (last.getHours() !== now.getHours())) updateContainer(document.getElementById('component-clock-hours'), now.getHours());
  if (force || (last.getMinutes() !== now.getMinutes())) updateContainer(document.getElementById('component-clock-minutes'), now.getMinutes());
  if (force || (last.getSeconds() !== now.getSeconds())) updateContainer(document.getElementById('component-clock-seconds'), now.getSeconds());
  last = now;
}

class ComponentClock extends HTMLElement { // watch for attributes
  connectedCallback() { // triggered on insert
    this.innerHTML = `
      <div id="component-clock" class="component-clock">
        <div id="component-clock-hours"><div><div>0</div></div><div><div>0</div></div></div>
        <span>:</span>
        <div id="component-clock-minutes"><div><div>0</div></div><div><div>0</div></div></div>
        <span>:</span>
        <div id="component-clock-seconds"><div><div>0</div></div><div><div>0</div></div></div>   
      </div>`;
    setInterval(() => updateClock(false), 1000); // start component-clock
  }
}

customElements.define('component-clock', ComponentClock);
