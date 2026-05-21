// ai_witness NUI — app.js
// Shows a brief toast when a witness observes a crime scene.
'use strict';

const body = document.body;
const text = document.getElementById('witness-text');

let hideTimer = null;

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || msg.action !== 'witnessAlert') return;

  body.classList.remove('hidden');
  text.textContent = msg.message || 'A witness observed the scene.';

  // Reset the hide timer on every alert so a fast burst of alerts shows the
  // most recent text for a full 4s instead of disappearing because the first
  // alert's timer fired.
  if (hideTimer !== null) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    body.classList.add('hidden');
    hideTimer = null;
  }, 4000);
});
