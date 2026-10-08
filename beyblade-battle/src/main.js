import './style.css';
import { createBattle, boundAim, clamp, SETTINGS } from './battle.js';
import { createScene } from './scene.js';
import { mountRim, mountAtmosphere } from './effects.js';
import { createSound } from './sound.js';
import { designCards, TOP_DESIGNS } from './top-previews.js';

const $ = id => document.getElementById(id), stage = $('stage'), handle = $('ripcord');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const audio = createSound(), listeners = [];
const designs = ['strike', 'guard'], desktop = matchMedia('(min-width: 1100px)');
$('design-a').innerHTML = designCards(0, designs[0]); $('design-b').innerHTML = designCards(1, designs[1]);
$('round-setup').open = desktop.matches;
const designButtons = [...document.querySelectorAll('[data-design]')], modeButtons = [...document.querySelectorAll('[data-mode]')], themeButtons = [...document.querySelectorAll('button[data-theme]')];
let battle, scene, rim, atmosphere, raf, closed = false, failed = false, aim = 0, mode = 'cpu', theme = 'premium', previewsPaused = false, pointer = null, holdPointer = null, pull = 0, keyStarted = null, energy = 0, last = 0, accumulator = 0, lastRim = 0, lastUi = 0;
const on = (element, event, callback, options) => { element.addEventListener(event, callback, options); listeners.push(() => element.removeEventListener(event, callback, options)); };
const ready = () => battle && !failed;
const settingUp = () => ready() && !battle.state.paused && ['setupA', 'setupB'].includes(battle.state.phase);
const charge = () => keyStarted === null ? pull : clamp((performance.now() - keyStarted) / 1000);
function cancelPull() { pointer = null; holdPointer = null; keyStarted = null; pull = 0; }
function overlay(kicker, title, note, action, type) {
  $('overlay-kicker').textContent = kicker; $('overlay-title').textContent = title; $('overlay-note').textContent = note;
  $('overlay-action').textContent = action || ''; $('overlay-action').hidden = !action; $('overlay-action').dataset.action = type || ''; $('overlay').hidden = false;
}
function failure(message, fatal) {
  $('status').textContent = message;
  if (!fatal) { stage.dataset.shaderFallback = 'true'; return; }
  failed = true; cancelPull(); battle?.setPaused(true); audio.update(0, false, true);
  overlay('ARENA INTERRUPTED', 'Try again', message, 'Retry', 'retry'); sync();
}
function reset() {
  if (!ready()) return;
  cancelPull(); battle.reset(mode); scene.reset(); aim = 0; energy = 0; accumulator = 0; last = 0;
  $('overlay').hidden = true; $('status').textContent = 'Fresh round. Aim coral, hold for power, and release.'; sync();
}
function pause(value) {
  if (!ready()) return;
  cancelPull(); battle.setPaused(value); accumulator = 0; last = 0;
  if (value) overlay('ROUND PAUSED', 'Paused', 'Your settings and spin are saved.', ['setupA', 'setupB'].includes(battle.state.phase) ? 'Resume setup' : battle.state.phase === 'finished' ? 'View result' : 'Resume battle', 'resume');
  else { $('overlay').hidden = true; if (battle.state.phase === 'finished') showResult(); }
  audio.update(0, false, value); rim?.update(energy, value, motion.matches, theme, battle.state.result?.winner ?? null); sync();
}
function showResult() {
  const result = battle.state.result, winner = result.winner === null ? 'A perfect tie.' : result.winner === 0 ? 'Coral takes the arena.' : 'Teal takes the arena.';
  const explanation = { 'Spin-out': 'A top ran out of spin.', 'Ring-out': 'A top left through an exit pocket.', 'Spin remaining': 'Time’s up. Remaining spin decides the round.' }[result.reason] || 'Both tops reached the finish together.';
  overlay(result.reason.toUpperCase(), winner, `${explanation} ${battle.state.hits} ${battle.state.hits === 1 ? 'clash' : 'clashes'}.`, 'Battle again', 'again');
  if ([document.body, stage, handle, hold].includes(document.activeElement)) $('overlay-action').focus({ preventScroll: true });
  $('status').textContent = `${winner} ${result.reason}. ${battle.state.hits} ${battle.state.hits === 1 ? 'clash' : 'clashes'}.`;
}
function commitPull() {
  if (!settingUp()) { cancelPull(); return; }
  const power = charge(); cancelPull();
  if (power < .08) { $('status').textContent = 'Launch cancelled. Hold a little longer or pull the ripcord farther.'; sync(); return; }
  audio.gesture(); audio.event('pull');
  battle.configureLaunch(aim, power); aim = 0; energy = power;
  if (battle.state.phase === 'countdown' && matchMedia('(max-width: 700px)').matches) stage.scrollIntoView({ block: 'center', behavior: motion.matches ? 'instant' : 'smooth' });
  $('status').textContent = battle.state.phase === 'setupB' ? `Coral staged at ${Math.round(power * 100)} percent power. Now aim and launch teal.` : `Launch confirmed at ${Math.round(power * 100)} percent power. Both tops launch together.`;
  sync();
}
function aimPointer(event) { if (settingUp() && pointer === null && keyStarted === null) aim = boundAim(scene.aim(event, battle.state.phase === 'setupB' ? 1 : 0)); }
on(stage, 'pointerdown', event => { if (event.button !== 0 || !settingUp()) return; stage.focus({ preventScroll: true }); aimPointer(event); });
on(stage, 'pointermove', aimPointer);
on(handle, 'pointerdown', event => {
  if (!settingUp() || pointer || keyStarted !== null || event.button !== 0) return;
  event.preventDefault(); handle.focus({ preventScroll: true }); handle.setPointerCapture(event.pointerId);
  pointer = { id: event.pointerId, x: event.clientX }; pull = 0; audio.gesture(); audio.event('pull');
});
on(handle, 'pointermove', event => { if (pointer?.id === event.pointerId) pull = clamp((event.clientX - pointer.x) / 140); });
on(handle, 'pointerup', event => { if (pointer?.id === event.pointerId) commitPull(); });
on(handle, 'pointercancel', cancelPull); on(handle, 'lostpointercapture', cancelPull);
const hold = $('hold-launch');
on(hold, 'pointerdown', event => {
  if (!settingUp() || pointer || keyStarted !== null || event.button !== 0) return;
  event.preventDefault(); hold.focus({ preventScroll: true }); hold.setPointerCapture(event.pointerId);
  holdPointer = event.pointerId; keyStarted = performance.now(); audio.gesture(); audio.event('pull');
});
on(hold, 'pointerup', event => { if (holdPointer === event.pointerId) commitPull(); });
on(hold, 'pointercancel', cancelPull); on(hold, 'lostpointercapture', cancelPull); on(hold, 'blur', cancelPull);
on($('aim'), 'input', () => { if (settingUp()) aim = boundAim(Number($('aim').value) * Math.PI / 180); });
function keyboardDown(event) {
  if (!['stage', 'ripcord', 'hold-launch'].includes(event.target.id)) return;
  if (event.code === 'Escape') { cancelPull(); return; }
  if (event.code === 'Space' || (event.code === 'Enter' && event.target === hold)) { event.preventDefault(); if (settingUp() && !event.repeat && !pointer && keyStarted === null) { keyStarted = performance.now(); audio.gesture(); audio.event('pull'); } }
  if (['ArrowLeft', 'ArrowRight'].includes(event.code)) { event.preventDefault(); if (settingUp() && keyStarted === null) aim = boundAim(aim + (event.code === 'ArrowLeft' ? -.06 : .06)); }
}
on(stage, 'keydown', keyboardDown); on(handle, 'keydown', keyboardDown); on(hold, 'keydown', keyboardDown);
function keyboardUp(event) { if (event.code === 'Space' || (event.code === 'Enter' && event.target === hold)) { event.preventDefault(); if (keyStarted !== null && holdPointer === null) commitPull(); } }
on(stage, 'keyup', keyboardUp); on(handle, 'keyup', keyboardUp); on(hold, 'keyup', keyboardUp);
on(stage, 'focusout', cancelPull); on(handle, 'blur', cancelPull);
modeButtons.forEach(button => on(button, 'click', () => { if (button.disabled || mode === button.dataset.mode) return; mode = button.dataset.mode; reset(); }));
designButtons.forEach(button => on(button, 'click', () => {
  const index = Number(button.dataset.index);
  if (!settingUp() || battle.state.launches[index]) return;
  cancelPull(); designs[index] = button.dataset.design; scene.setDesign(index, designs[index]);
  $('status').textContent = `${index ? 'Teal' : 'Coral'} design: ${TOP_DESIGNS[designs[index]].name}.`; sync();
}));
themeButtons.forEach(button => on(button, 'click', () => { theme = button.dataset.theme; document.body.dataset.theme = theme; scene?.setTheme(theme); rim?.update(energy, battle?.state.paused || false, motion.matches, theme, battle?.state.result?.winner ?? null); sync(); }));
on($('preview-motion'), 'click', () => { previewsPaused = !previewsPaused; sync(); });
on(desktop, 'change', () => { $('round-setup').open = desktop.matches; });
['angled', 'top'].forEach(view => on($(view), 'click', () => { scene?.setView(view, motion.matches); $('angled').ariaPressed = String(view === 'angled'); $('top').ariaPressed = String(view === 'top'); }));
on($('reset'), 'click', reset); on($('pause'), 'click', () => pause(!battle.state.paused));
on($('overlay-action'), 'click', () => {
  const action = $('overlay-action').dataset.action;
  if (action === 'retry') location.reload();
  if (action === 'again') { reset(); stage.focus(); }
  if (action === 'resume') { pause(false); stage.focus(); }
});
on($('sound'), 'click', async () => { const enabled = await audio.toggle(); $('sound').ariaPressed = String(enabled); $('sound').textContent = `Sound ${enabled ? 'on' : 'off'}`; if (enabled) audio.event('pull'); });
on(window, 'blur', cancelPull);
on(document, 'visibilitychange', () => { cancelPull(); if (document.hidden && ready() && !battle.state.paused) pause(true); last = 0; accumulator = 0; });
on(motion, 'change', () => { if (scene) scene.setView($('top').ariaPressed === 'true' ? 'top' : 'angled', motion.matches); });

function sync() {
  const state = battle?.state, power = charge(), setup = settingUp();
  handle.disabled = !setup; $('reset').disabled = !ready(); $('pause').disabled = !ready();
  modeButtons.forEach(button => { button.disabled = !ready() || state.paused || ['setupB', 'countdown', 'battling'].includes(state.phase); button.ariaPressed = String(button.dataset.mode === mode); });
  themeButtons.forEach(button => { button.ariaPressed = String(button.dataset.theme === theme); });
  designButtons.forEach(button => { const index = Number(button.dataset.index); button.disabled = !setup || !!state?.launches[index]; button.ariaPressed = String(designs[index] === button.dataset.design); });
  document.body.dataset.phase = state?.phase || 'loading'; document.body.dataset.paused = String(state?.paused || false);
  document.body.dataset.previewMotion = setup && !previewsPaused && !motion.matches && !document.hidden ? 'running' : 'paused';
  $('preview-motion').disabled = motion.matches || !setup; $('preview-motion').ariaPressed = String(previewsPaused || motion.matches || !setup);
  $('preview-motion').textContent = motion.matches ? 'Motion reduced' : !setup ? 'Previews paused' : previewsPaused ? 'Play previews' : 'Pause previews';
  $('setup-summary').textContent = `${mode === 'cpu' ? 'CPU' : 'Both'} · ${theme === 'premium' ? 'Premium' : 'Retro'}`;
  $('mode-description').textContent = mode === 'cpu' ? 'You launch coral; the CPU launches teal.' : 'Save coral, then teal. Both launch together.';
  $('teal-design-label').textContent = `Teal design${mode === 'cpu' ? ' · CPU' : ''}`;
  $('launch-setup').hidden = !setup;
  hold.disabled = !setup; $('aim').disabled = !setup || pointer !== null || keyStarted !== null;
  $('aim').value = String(Math.round(aim * 180 / Math.PI)); $('aim-value').textContent = `${Math.round(aim * 180 / Math.PI)}°`;
  stage.dataset.phase = state?.phase || 'loading';
  $('pause').ariaPressed = String(state?.paused || false); $('pause').textContent = state?.paused ? 'Resume' : 'Pause';
  handle.style.transform = `translateX(${power * 140}px)`;
  $('charge-meter').firstElementChild.style.transform = `scaleX(${power})`; $('charge-meter').setAttribute('aria-valuenow', String(Math.round(power * 100))); $('pull-value').textContent = `${Math.round(power * 100)}%`;
  hold.classList.toggle('charging', keyStarted !== null);
  hold.style.setProperty('--charge', power.toFixed(2));
  const teal = state?.phase === 'setupB';
  document.querySelector('.launch-dock').dataset.top = teal ? 'teal' : 'coral';
  document.querySelector('.play-steps').style.setProperty('--active', teal ? 'var(--teal)' : 'var(--coral)');
  $('dock-label').textContent = state?.paused ? 'ON HOLD' : setup ? `YOUR TURN · ${teal ? 'TEAL' : 'CORAL'}` : state?.phase === 'finished' ? 'ROUND COMPLETE' : 'ROUND IN PROGRESS';
  hold.firstChild.textContent = `Hold to ${state?.mode === 'both' ? 'stage' : 'launch'}`;
  handle.ariaLabel = `Pull ripcord to ${state?.mode === 'both' ? 'stage' : 'launch'} ${teal ? 'teal' : 'coral'}`;
  $('top-b-label').textContent = `Teal${mode === 'cpu' ? ' · CPU' : ''}`;
  if (state) {
    const labels = { setupA: 'Aim coral and choose your power.', setupB: 'Coral saved · prepare teal.', countdown: 'Both tops launching together.', battling: 'Battle underway', finished: state.result?.reason };
    $('phase-label').textContent = state.paused ? 'Round paused · settings saved' : labels[state.phase];
    $('round-label').textContent = state.paused ? 'Paused' : state.phase === 'battling' ? `${Math.max(0, 20 - state.time).toFixed(1)}s left` : state.phase === 'setupB' ? 'Coral saved' : state.phase === 'countdown' ? 'Launching…' : state.phase === 'finished' ? 'Round complete' : 'Ready to launch';
    const activeStep = state.phase === 'setupA' ? 0 : state.phase === 'setupB' ? 1 : 2;
    ['step-a', 'step-b', 'step-battle'].forEach((id, index) => {
      $(id).classList.toggle('complete', index < activeStep);
      if (index === activeStep) $(id).setAttribute('aria-current', 'step'); else $(id).removeAttribute('aria-current');
    });
    $('step-b').lastElementChild.textContent = mode === 'cpu' ? 'CPU auto-launch' : 'Teal';
    $('dock-title').textContent = state.paused ? 'Round paused' : state.phase === 'battling' ? 'Watch the battle' : state.phase === 'countdown' ? 'Launching both' : state.phase === 'finished' ? 'Ready for a rematch?' : teal ? 'Prepare teal' : 'Launch coral';
    $('mode-hint').textContent = state.paused ? 'Reset starts a fresh round.' : state.phase === 'finished' ? 'Reset lets you change designs and mode.' : state.phase === 'battling' ? 'At 20 seconds, higher remaining spin wins.' : state.phase === 'countdown' ? 'Directions and powers saved.' : mode === 'cpu' ? 'The CPU sets teal’s aim and power.' : teal ? `Coral saved at ${Math.round(state.launches[0].power * 100)}% power.` : 'Teal is next. Both tops launch together.';
    $('power-hint').textContent = power >= .99 ? `Full power. Release to ${mode === 'both' ? teal ? 'start both' : 'save coral' : 'launch'}.` : power >= .08 ? `Release at ${Math.round(power * 100)}% power.` : 'Hold for up to 1 second. Release to commit.';
    $('selection-note').textContent = state.paused ? 'Resume to edit an unstaged top.' : state.phase === 'setupB' ? 'Coral is saved. You can still choose teal.' : state.phase === 'setupA' ? 'Choose either design before launching.' : 'Designs locked for this round. Reset to change them.';
    $('hit-label').textContent = `${state.hits} ${state.hits === 1 ? 'clash' : 'clashes'}`;
    state.tops.forEach((top, index) => {
      const letter = index ? 'b' : 'a', percent = Math.round(top.energy * 100), staged = !!state.launches[index] && ['setupA', 'setupB', 'countdown'].includes(state.phase);
      $('spin-' + letter).textContent = ['setupA', 'setupB', 'countdown'].includes(state.phase) ? staged ? 'STAGED' : index && mode === 'cpu' ? 'AUTO' : 'READY' : `${percent}% spin`;
      $('meter-' + letter).setAttribute('aria-valuetext', ['setupA', 'setupB', 'countdown'].includes(state.phase) ? staged ? 'Launch staged' : 'Ready, not launched' : `${percent} percent spin remaining`);
      $('meter-' + letter).setAttribute('aria-valuenow', String(percent)); $('meter-' + letter).firstElementChild.style.transform = `scaleX(${top.energy})`;
    });
    $('instructions').textContent = state.paused ? 'Resume to continue. Your settings and spin are saved.' : state.phase === 'battling' ? 'Spin-out or ring-out wins the round.' : state.phase === 'countdown' ? 'Both tops will launch together.' : state.phase === 'finished' ? 'Choose Battle again in the arena to replay.' : teal ? 'Aim teal. Hold, then release to start both tops.' : mode === 'both' ? 'Aim coral. Hold, then release to save its launch.' : 'Aim in the arena or adjust the angle. Hold, then release.';
  }
  stage.style.setProperty('--energy', Math.max(power, energy).toFixed(2));
}
function frame(timestamp) {
  if (closed) return;
  const dt = last ? Math.min((timestamp - last) / 1000, .05) : 0; last = timestamp;
  if (ready()) {
    const state = battle.state;
    if (!state.paused && !document.hidden) {
      accumulator = Math.min(.05, accumulator + dt);
      while (accumulator >= SETTINGS.timestep) { battle.step(); accumulator -= SETTINGS.timestep; }
      energy = Math.max(0, energy - dt * 1.5);
    }
    for (const event of battle.events()) {
      if (event.type === 'launch') { energy = 1; audio.event('launch'); }
      if (event.type === 'impact') { energy = Math.max(.6, energy); scene.impact(event, state.time, motion.matches); audio.event('impact'); }
      if (event.type === 'finish') { energy = .75; audio.event('finish'); showResult(); }
    }
    const winner = state.result?.winner ?? null;
    scene.render(state, state.paused ? 1 : accumulator / SETTINGS.timestep, charge(), aim, dt, motion.matches);
    audio.update((state.tops[0].energy + state.tops[1].energy) / 2, state.phase === 'battling', state.paused || document.hidden);
    if (timestamp - lastRim >= 1000 / 30) { rim?.update(Math.max(charge(), energy), state.paused || document.hidden, motion.matches, theme, winner); atmosphere?.update(Math.max(charge(), energy), state.paused || document.hidden, motion.matches, theme); lastRim = timestamp; }
  }
  if (timestamp - lastUi >= 1000 / 30) { sync(); lastUi = timestamp; }
  raf = requestAnimationFrame(frame);
}
async function initialize() {
  try {
    scene = createScene($('scene'), failure); scene.setTheme(theme);
    scene.setDesign(0, designs[0]); scene.setDesign(1, designs[1]);
    atmosphere = mountAtmosphere($('paper-background'), $('paper-surface'));
    battle = await createBattle(); battle.reset(mode);
    if (closed) { battle.dispose(); scene.dispose(); return; }
    mountRim($('paper-rim')).then(result => { if (closed) result.dispose(); else rim = result; });
    $('overlay').hidden = true; sync(); raf = requestAnimationFrame(frame);
  } catch (error) { failure('The 3D arena could not start. Check WebGL support and retry.', true); }
}
function dispose() { closed = true; cancelAnimationFrame(raf); listeners.forEach(remove => remove()); scene?.dispose(); rim?.dispose(); atmosphere?.dispose(); battle?.dispose(); audio.dispose(); }
on(window, 'pagehide', event => { if (!event.persisted) dispose(); else { cancelPull(); if (ready()) pause(true); } });
if (import.meta.hot) import.meta.hot.dispose(dispose);
sync();
void initialize();
