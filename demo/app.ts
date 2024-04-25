import './style.css';
import sesamyLogo from '/sesamy.png';

/**
 * This class is only used for rendering the UI and not shipped in the bundle
 */

class SesamyAppComponent extends HTMLElement {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = `
      <div>
        <a href="https://docs.sesamy.com" target="_blank">
          <img src="${sesamyLogo}" class="logo" alt="Vite logo" />
        </a>    
        <h1>Sesamy JS</h1>
        <p class="read-the-docs">
          Click on the Sesamy logo to learn more
        </p>        
      </div>
    `;
  }
}

customElements.define('sesamy-app', SesamyAppComponent);
