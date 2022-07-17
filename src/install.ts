import { log } from './log';

export async function installable(evt) {
  evt.preventDefault();
  const deferredPrompt = evt;
  // show only if not yet installed
  const div = document.getElementById('install');
  if (!div) return;
  const installed = matchMedia('(display-mode: standalone)').matches;
  log('installable', { installed });
  if (!installed) div.style.display = 'block';
  else div.style.display = 'none';
  div.addEventListener('click', () => {
    div.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice
      .then((res) => log('install: ', res.outcome))
      .catch((err) => log('install error: ', err));
  });
}
