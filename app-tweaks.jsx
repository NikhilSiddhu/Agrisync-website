// AgriSync Tweaks — a small React island that drives the page atmosphere + 3D scene.
// The page itself is vanilla; this only reads tweak values and applies them to CSS
// variables + the Three.js scene. Panel stays hidden until the Tweaks toolbar toggle.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#8aa17d",
  "world3d": true,
  "atmosphere": "both",
  "depth": 60,
  "pulseStyle": "particles",
  "glow": 55,
  "spin": 30,
  "motion": 35,
  "mist": true,
  "cursorLight": true,
  "grain": false
}/*EDITMODE-END*/;

// mix a hex toward white by amount (0..1)
function lighten(hex, amt) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  const n = parseInt(x, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r + (255 - r) * amt);
  g = Math.round(g + (255 - g) * amt);
  b = Math.round(b + (255 - b) * amt);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function applyTweaks(t) {
  const root = document.documentElement.style;
  const motionScale = 0.2 + (t.motion / 100) * 1.6;          // 0.2 … 1.8
  root.setProperty('--accent', t.accent);
  root.setProperty('--accent-soft', lighten(t.accent, 0.38));
  root.setProperty('--motion-scale', motionScale.toFixed(3));
  root.setProperty('--amb-mist', t.mist ? '1' : '0');
  root.setProperty('--amb-cursor', t.cursorLight ? '0.55' : '0');
  root.setProperty('--amb-grain', t.grain ? '0.5' : '0');
  root.setProperty('--reveal-dur', (1.3 - (t.motion / 100) * 0.7).toFixed(2) + 's');

  // Master 3D world: toggle the floating-slab + atmosphere treatment as one unit
  document.body.classList.toggle('f3d', !!t.world3d);
  if (window.AgriBG) {
    window.AgriBG.setEnabled(!!t.world3d);
    window.AgriBG.update({
      accent: t.accent,
      mode: t.atmosphere,
      intensity: t.depth / 100
    });
  }
  if (window.AgriPulse) {
    window.AgriPulse.update({
      accent: t.accent,
      style: t.pulseStyle,
      glow: t.glow / 100,
      spin: t.spin / 100,
      motion: motionScale
    });
  }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyTweaks(t); }, [t]);
  // Re-apply once the 3D scenes have finished loading (CDN is async).
  React.useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      if (window.AgriPulse && window.AgriBG) { applyTweaks(t); clearInterval(id); }
      if (++n > 50) clearInterval(id);
    }, 150);
    return () => clearInterval(id);
  }, []);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="3D world" />
      <TweakToggle label="Atmosphere on" value={t.world3d}
        onChange={v => setTweak('world3d', v)} />
      <TweakRadio label="Field" value={t.atmosphere}
        options={['grid', 'particles', 'both']}
        onChange={v => setTweak('atmosphere', v)} />
      <TweakSlider label="Depth flow" value={t.depth} min={0} max={100} step={5} unit="%"
        onChange={v => setTweak('depth', v)} />

      <TweakSection label="Atmosphere" />
      <TweakColor label="Accent" value={t.accent}
        options={['#8aa17d', '#6fae9b', '#94afc4', '#c2a878', '#a9b0a0']}
        onChange={v => setTweak('accent', v)} />
      <TweakSlider label="Motion" value={t.motion} min={0} max={100} step={5} unit="%"
        onChange={v => setTweak('motion', v)} />
      <TweakToggle label="Breathing mist" value={t.mist}
        onChange={v => setTweak('mist', v)} />
      <TweakToggle label="Cursor glow" value={t.cursorLight}
        onChange={v => setTweak('cursorLight', v)} />
      <TweakToggle label="Film grain" value={t.grain}
        onChange={v => setTweak('grain', v)} />

      <TweakSection label="Centerpiece orb" />
      <TweakRadio label="Form" value={t.pulseStyle}
        options={['orb', 'particles', 'both']}
        onChange={v => setTweak('pulseStyle', v)} />
      <TweakSlider label="Glow" value={t.glow} min={0} max={100} step={5} unit="%"
        onChange={v => setTweak('glow', v)} />
      <TweakSlider label="Spin" value={t.spin} min={0} max={100} step={5} unit="%"
        onChange={v => setTweak('spin', v)} />
    </TweaksPanel>
  );
}

(function mount() {
  const el = document.getElementById('tweaks-root');
  if (!el) return;
  if (ReactDOM.createRoot) ReactDOM.createRoot(el).render(<App />);
  else ReactDOM.render(<App />, el);
})();
