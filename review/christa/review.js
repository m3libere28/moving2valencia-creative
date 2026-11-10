const image = document.querySelector('#preview-image');
const stage = document.querySelector('#preview-stage');
const deviceScreen = stage.querySelector('.device-screen');
const frame = document.querySelector('#site-preview');
const tools = document.querySelector('#preview-tools');
const replay = document.querySelector('#preview-replay');
const widthButtons = tools.querySelectorAll('[data-width]');
let opening = 0;

function fitDesktopScreen() {
  if (frame.hidden || stage.dataset.width !== 'desktop') return;
  const screenWidth = deviceScreen.clientWidth;
  if (!screenWidth) return;
  // Keep the desktop navigation active when the whole monitor is scaled down.
  const viewportWidth = Math.max(screenWidth, 1160);
  deviceScreen.style.setProperty('--desktop-width', `${viewportWidth}px`);
  deviceScreen.style.setProperty('--desktop-height', `${viewportWidth * 9 / 16}px`);
  deviceScreen.style.setProperty('--desktop-scale', screenWidth / viewportWidth);
}

function setWidth(width) {
  stage.dataset.width = width;
  widthButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.width === width));
  });
  fitDesktopScreen();
}

function showOpening() {
  const url = new URL(image.href);
  url.searchParams.set('review-opening', String(++opening));
  frame.src = url.href;
}

setWidth(matchMedia('(max-width: 600px)').matches ? 'phone' : 'desktop');
new ResizeObserver(fitDesktopScreen).observe(deviceScreen);
tools.hidden = false;
replay.addEventListener('click', showOpening);
widthButtons.forEach(button => button.addEventListener('click', () => {
  setWidth(button.dataset.width);
  if (frame.hidden) {
    image.hidden = true;
    frame.hidden = false;
    replay.hidden = false;
    fitDesktopScreen();
    showOpening();
  }
}));

const form = document.querySelector('#feedback-form');
const feedbackStatus = document.querySelector('#feedback-status');
const fallback = document.querySelector('#copy-fallback');
const email = document.querySelector('#feedback a[href^="mailto:"]');
form.hidden = false;

function feedbackText() {
  const logo = form.elements.logo.value || 'Still deciding';
  const notes = form.elements.notes.value.trim();
  return ['Hi Helbert,', '', 'My feedback on A New Horizon II', '', `Logo preference: ${logo}`, '', notes, '', 'Christa'].join('\r\n');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  window.location.href = `${email.href}&body=${encodeURIComponent(feedbackText())}`;
  feedbackStatus.textContent = 'You can also copy your notes and paste them into your email reply.';
});

document.querySelector('#copy-feedback').addEventListener('click', async () => {
  const text = feedbackText();
  try {
    await navigator.clipboard.writeText(text);
    fallback.hidden = true;
    feedbackStatus.textContent = 'Notes copied. Paste them into your email reply.';
  } catch {
    fallback.value = text;
    fallback.hidden = false;
    fallback.focus();
    fallback.select();
    feedbackStatus.textContent = 'Your notes are selected below and ready to copy.';
  }
});
