class CTest extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h3>This is a demonstration of Custom elements</h3>';
  }
}
customElements.define('test-component', CTest);
