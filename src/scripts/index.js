// CSS imports
import '../styles/styles.css';
import '../styles/responsives.css';
import '../styles/map.css';
import 'tiny-slider/dist/tiny-slider.css';

// Components
import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  await app.renderPage();
  console.debug('Initial load, hash=', location.hash);

  window.addEventListener('hashchange', async () => {
    console.debug('hashchange event, new hash=', location.hash);
    await app.renderPage();

    Camera.stopAllStreams();
  });
});
