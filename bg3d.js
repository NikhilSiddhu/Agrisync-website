/* AgriSync — persistent, refined 3D atmosphere behind the whole site.
   A soothing "data field": a thin, distance-fading grid corridor, a soft horizon
   glow at the vanishing point, and two drifting layers of round particles.
   Gentle scroll + mouse parallax. Stable & unobtrusive — content stays readable.
   Exposes window.AgriBG.update({mode, intensity, accent}) + setEnabled(bool). */
(function () {
  function start() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    var cfg = {
      mode: 'both',          // 'grid' | 'particles' | 'both' | 'off'
      intensity: 0.6,        // 0..1 overall presence + speed
      accent: '#8aa17d',
      enabled: true
    };

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true,
      powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    // Tighter fog → distant grid lines melt softly into the page background.
    scene.fog = new THREE.Fog(0xe7ede7, 7, 26);

    var camera = new THREE.PerspectiveCamera(54, 1, 0.1, 120);
    camera.position.set(0, 1.1, 8);

    var accent = new THREE.Color(cfg.accent);

    // ---------- soft round sprite texture (shared by particles + glow) ----------
    function radialTex(stops) {
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      stops.forEach(function (s) { grd.addColorStop(s[0], s[1]); });
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }
    var dotTex = radialTex([
      [0, 'rgba(255,255,255,1)'],
      [0.35, 'rgba(255,255,255,0.85)'],
      [1, 'rgba(255,255,255,0)']
    ]);

    // ---------- receding grid corridor (floor + faint ceiling) ----------
    var SPACING = 2;
    var gridGroup = new THREE.Group();
    function makeGrid(y, opacity, divisions) {
      var g = new THREE.GridHelper(80, divisions, accent.getHex(), accent.getHex());
      g.material.transparent = true;
      g.material.opacity = opacity;
      g.material.depthWrite = false;
      g.position.y = y;
      return g;
    }
    var floor = makeGrid(-2.4, 0.42, 40);
    var floorFine = makeGrid(-2.4, 0.16, 80);   // finer secondary lines for depth
    var ceil = makeGrid(5.0, 0.14, 40);
    gridGroup.add(floor); gridGroup.add(floorFine); gridGroup.add(ceil);
    scene.add(gridGroup);

    // ---------- horizon glow at the vanishing point ----------
    var glowTex = radialTex([
      [0, 'rgba(255,255,255,0.9)'],
      [0.3, 'rgba(210,228,200,0.5)'],
      [1, 'rgba(180,205,170,0)']
    ]);
    var glowMat = new THREE.SpriteMaterial({
      map: glowTex, color: accent.clone(), transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    });
    var horizon = new THREE.Sprite(glowMat);
    horizon.scale.set(26, 14, 1);
    horizon.position.set(0, 0.6, -16);
    scene.add(horizon);

    // ---------- two particle layers (near soft / far fine) ----------
    function makeParticles(count, range, size, opacity, color) {
      var geo = new THREE.BufferGeometry();
      var pos = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        pos[i*3]   = (Math.random() - 0.5) * range.x;
        pos[i*3+1] = (Math.random() - 0.5) * range.y + 1.2;
        pos[i*3+2] = -Math.random() * range.z + 10;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var mat = new THREE.PointsMaterial({
        map: dotTex, color: color, size: size, transparent: true, opacity: opacity,
        sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
        alphaTest: 0.01
      });
      var pts = new THREE.Points(geo, mat);
      pts.userData.depth = range.z;
      return pts;
    }
    var DEPTH = 60;
    var nearN = coarse ? 380 : 760;
    var farN  = coarse ? 500 : 1000;
    var pNear = makeParticles(nearN, { x: 34, y: 9, z: DEPTH }, 0.13, 0.5,
      accent.clone().offsetHSL(0, -0.03, 0.06));
    var pFar  = makeParticles(farN, { x: 40, y: 11, z: DEPTH }, 0.05, 0.35,
      accent.clone().offsetHSL(0, -0.06, -0.06));
    scene.add(pNear); scene.add(pFar);
    var particleLayers = [pNear, pFar];

    // ---------- parallax targets ----------
    var mx = 0, my = 0, cmx = 0, cmy = 0;
    var scrollFrac = 0, cScroll = 0;
    if (!coarse && !reduce) {
      window.addEventListener('pointermove', function (e) {
        mx = (e.clientX / window.innerWidth - 0.5);
        my = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
    }
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      scrollFrac = h > 0 ? window.scrollY / h : 0;
    }, { passive: true });

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    function applyMode() {
      var showGrid = cfg.mode === 'grid' || cfg.mode === 'both';
      var showPts  = cfg.mode === 'particles' || cfg.mode === 'both';
      gridGroup.visible = showGrid && cfg.enabled;
      horizon.visible = cfg.enabled && cfg.mode !== 'off';
      pNear.visible = pFar.visible = showPts && cfg.enabled;
    }

    function setAccent(hex) {
      accent.set(hex); cfg.accent = hex;
      floor.material.color.set(accent);
      floorFine.material.color.set(accent);
      ceil.material.color.set(accent);
      glowMat.color.copy(accent);
      pNear.material.color.copy(accent.clone().offsetHSL(0, -0.03, 0.06));
      pFar.material.color.copy(accent.clone().offsetHSL(0, -0.06, -0.06));
    }

    window.AgriBG = {
      update: function (o) {
        o = o || {};
        if (o.accent) setAccent(o.accent);
        if (o.mode) cfg.mode = o.mode;
        if (o.intensity != null) cfg.intensity = o.intensity;
        applyMode();
      },
      setEnabled: function (b) {
        cfg.enabled = b;
        canvas.style.display = b ? 'block' : 'none';
        applyMode();
      }
    };
    applyMode();

    var paused = false;
    document.addEventListener('visibilitychange', function () { paused = document.hidden; });

    var t0 = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (paused || !cfg.enabled) return;
      var dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
      var spd = 0.32 + cfg.intensity * 1.3;

      // forward glide with wrap
      gridGroup.position.z = (gridGroup.position.z + dt * spd) % SPACING;
      for (var i = 0; i < particleLayers.length; i++) {
        var L = particleLayers[i];
        L.position.z += dt * spd * (i === 0 ? 1 : 0.6); // parallax between layers
        if (L.position.z > 12) L.position.z -= L.userData.depth;
      }

      // eased parallax
      cmx += (mx - cmx) * 0.04; cmy += (my - cmy) * 0.04;
      cScroll += (scrollFrac - cScroll) * 0.06;
      camera.position.x = cmx * 2.0;
      camera.position.y = 1.1 - cmy * 0.9 + cScroll * 1.1;
      camera.lookAt(0, 0.6 - cScroll * 0.4, -10);
      horizon.position.x = cmx * 1.2;

      renderer.render(scene, camera);
    }

    resize();
    if (reduce) {
      renderer.render(scene, camera);
    } else {
      requestAnimationFrame(frame);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
