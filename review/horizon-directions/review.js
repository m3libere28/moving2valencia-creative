const concept = document.getElementById('concept');
const logo = document.getElementById('logo');
const viewer = document.getElementById('viewer');
const screen = document.getElementById('screen');
const preview = document.getElementById('site-preview');
const full = document.getElementById('full');
const deviceButtons = document.querySelectorAll('[data-device]');
const devices = { desktop: [1280, 740], phone: [390, 785] };
const revision = new URL(preview.src).searchParams.get('v');
let device = matchMedia('(max-width: 700px)').matches ? 'phone' : 'desktop';

function sizePreview() {
  const [width, height] = devices[device];
  const style = getComputedStyle(viewer);
  const available = viewer.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  if (available <= 0) return;
  const scale = Math.min(1, available / width);
  screen.style.width = width * scale + 'px';
  screen.style.height = height * scale + 'px';
  preview.width = width;
  preview.height = height;
  preview.style.transform = 'scale(' + scale + ')';
}

function updatePreview() {
  const url = new URL(concept.value + '.html', location.href);
  if (revision) url.searchParams.set('v', revision);
  if (logo.value === 'r5') url.searchParams.set('logo', 'r5');
  if (preview.src !== url.href) preview.src = url.href;
  full.href = url.href;
  const name = concept.selectedOptions[0].textContent.split(' · ')[1];
  preview.title = name + ' · ' + (device === 'desktop' ? 'Desktop' : 'Phone') + ' preview';
  screen.dataset.mode = device;
  deviceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === device)));
  sizePreview();
}

concept.addEventListener('change', updatePreview);
logo.addEventListener('change', updatePreview);
deviceButtons.forEach(button => button.addEventListener('click', () => {
  device = button.dataset.device;
  updatePreview();
}));
document.querySelectorAll('[data-show]').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  concept.value = link.dataset.show;
  updatePreview();
  document.getElementById('compare-title').focus({preventScroll: true});
  document.getElementById('compare').scrollIntoView({block: 'start'});
}));
document.getElementById('replay').addEventListener('click', () => {
  const origin = location.protocol === 'file:' ? '*' : location.origin;
  preview.contentWindow.postMessage({type: 'm2v:replay-opening'}, origin);
});
new ResizeObserver(sizePreview).observe(viewer);
updatePreview();

const form = document.getElementById('review-form');
const feedbackStatus = document.getElementById('feedback-status');
const fallback = document.getElementById('copy-fallback');

function feedbackText() {
  const direction = document.getElementById('preferred').value;
  const mark = document.getElementById('preferred-logo').value;
  const notes = document.getElementById('notes').value.trim();
  return [
    'Moving2Valencia · Website design feedback',
    'Christa Brokke',
    '',
    'Preferred direction: ' + direction,
    'Preferred logo layout: ' + mark,
    '',
    'Notes, preferred weight or colour:',
    notes || '—'
  ].join('\n');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const url = URL.createObjectURL(new Blob([feedbackText()], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Christa-Moving2Valencia-feedback.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  feedbackStatus.textContent = 'Your feedback file is ready to share.';
});

document.getElementById('copy').addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const response = feedbackText();
  try {
    await navigator.clipboard.writeText(response);
    fallback.hidden = true;
    feedbackStatus.textContent = 'Feedback copied. You can paste it into your reply.';
  } catch {
    fallback.value = response;
    fallback.hidden = false;
    fallback.select();
    feedbackStatus.textContent = 'Your feedback is selected below. Copy it to share.';
  }
});
