export const TOP_DESIGNS = {
  strike: { name: 'Strike', detail: '6 blades', count: 6, cap: 12, path: 'M10 -7 L36 -5 L30 9 L13 12 Z' },
  guard: { name: 'Guard', detail: '8 blades', count: 8, cap: 18, path: 'M11 -9 L30 -11 Q37 0 30 11 L11 9 Z' },
  glide: { name: 'Glide', detail: '3 wings', count: 3, cap: 14, path: 'M8 -8 Q43 -19 32 12 Q20 21 8 8 Z' },
};

// ponytail: SVG silhouettes mirror the procedural tops without six extra WebGL contexts.
export function topPreview(design, index) {
  const color = index ? '#168d86' : '#f06b4f', light = index ? '#79c5b3' : '#ffb58d';
  const blades = Array.from({ length: design.count }, (_, blade) => `<path d="${design.path}" transform="rotate(${blade * 360 / design.count})" fill="${color}" stroke="#354e43" stroke-width=".7"/>`).join('');
  return `<svg class="top-preview" viewBox="0 0 112 112" aria-hidden="true"><ellipse cx="56" cy="60" rx="37" ry="35" fill="#263e35" opacity=".09"/><g class="rotor"><g transform="translate(56 56)"><circle r="30" fill="#52675d"/><circle r="28" fill="#b3bdb2" stroke="#65786c" stroke-width="2"/>${blades}<circle r="${design.cap}" fill="#d5d9ca" stroke="#50685d" stroke-width="2"/><circle r="${design.cap - 4}" fill="${light}" stroke="#50685d" stroke-width="1"/><circle r="5" fill="${color}" stroke="#50685d" stroke-width="1"/><path d="M-4 -7 Q2 -11 7 -6" fill="none" stroke="#fff8e8" stroke-width="2" opacity=".7"/></g></g></svg>`;
}

export function designCards(index, selected) {
  return Object.entries(TOP_DESIGNS).map(([name, design]) => `<button class="design-card" data-design="${name}" data-index="${index}" aria-pressed="${name === selected}" aria-label="${index ? 'Teal' : 'Coral'} ${design.name}, ${design.detail}" aria-describedby="design-note">${topPreview(design, index)}<span class="selection-check" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 8 3 3 5-6"/></svg></span><span>${design.name}</span><span class="design-detail">${design.detail}</span></button>`).join('');
}
