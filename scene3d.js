/* AgriSync — "The field has a pulse" 3D centerpiece.
   A soft, slowly-breathing displaced orb (the living field signal) wrapped in a
   drifting particle haze and a contour wireframe. Calm, futuristic, on-brand sage.
   Exposes window.AgriPulse.update({accent, style, glow, spin, motion}). */
(function () {
  function start() {
    var canvas = document.getElementById('pulse-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- shared config (driven by Tweaks) ----
    var cfg = {
      accent: '#8aa17d',
      style: 'both',     // 'orb' | 'particles' | 'both'
      glow: 0.55,        // 0..1
      spin: 0.30,        // 0..1
      motion: 0.70       // 0..~1.8  (overall liveliness)
    };

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x222b29, 0.12);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 4.0);

    var group = new THREE.Group();
    scene.add(group);

    // ---- the breathing orb ----
    var R = 1.18;
    var geo = new THREE.IcosahedronGeometry(R, 5);
    var orig = geo.attributes.position.array.slice(0);
    var nVerts = geo.attributes.position.count;
    // precompute normalized dirs + base length
    var dirs = new Float32Array(nVerts * 3);
    for (var i = 0; i < nVerts; i++) {
      var x = orig[i*3], y = orig[i*3+1], z = orig[i*3+2];
      var l = Math.sqrt(x*x + y*y + z*z) || 1;
      dirs[i*3] = x/l; dirs[i*3+1] = y/l; dirs[i*3+2] = z/l;
    }

    var mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.accent),
      roughness: 0.42, metalness: 0.18,
      flatShading: false, transparent: true, opacity: 0.96
    });
    var orb = new THREE.Mesh(geo, mat);
    group.add(orb);

    // contour wireframe shell (subtle techy lines)
    var wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff), wireframe: true,
      transparent: true, opacity: 0.06
    });
    var wire = new THREE.Mesh(geo, wireMat); // shares geometry → morphs together
    wire.scale.setScalar(1.012);
    group.add(wire);

    // ---- glow halo sprite ----
    function glowTexture() {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(128,128,0,128,128,128);
      grd.addColorStop(0,'rgba(255,255,255,0.9)');
      grd.addColorStop(0.25,'rgba(190,220,180,0.55)');
      grd.addColorStop(0.55,'rgba(140,180,140,0.18)');
      grd.addColorStop(1,'rgba(140,180,140,0)');
      g.fillStyle = grd; g.fillRect(0,0,256,256);
      return new THREE.CanvasTexture(c);
    }
    var glowMat = new THREE.SpriteMaterial({
      map: glowTexture(), color: new THREE.Color(cfg.accent),
      transparent: true, opacity: cfg.glow, blending: THREE.AdditiveBlending, depthWrite: false
    });
    var glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(5.0);
    glow.position.z = -0.4;
    scene.add(glow);

    // ---- drifting particle cloud (round, soft, with a filled luminous core) ----
    function dotTexture() {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(32,32,0,32,32,32);
      grd.addColorStop(0,'rgba(255,255,255,1)');
      grd.addColorStop(0.4,'rgba(255,255,255,0.7)');
      grd.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0,0,64,64);
      return new THREE.CanvasTexture(c);
    }
    var P = 2600;
    var pgeo = new THREE.BufferGeometry();
    var ppos = new Float32Array(P * 3);
    for (var p = 0; p < P; p++) {
      // hollow-cored spherical cloud → open centre keeps headline legible
      var u = Math.random(), v = Math.random();
      var theta = u * Math.PI * 2, phi = Math.acos(2*v - 1);
      var rad = 1.05 + Math.pow(Math.random(), 0.78) * 2.95;
      ppos[p*3]   = rad * Math.sin(phi) * Math.cos(theta);
      ppos[p*3+1] = rad * Math.cos(phi) * 0.82;
      ppos[p*3+2] = rad * Math.sin(phi) * Math.sin(theta);
    }
    pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
    var pmat = new THREE.PointsMaterial({
      map: dotTexture(), color: new THREE.Color(0xcfe2c4), size: 0.05,
      transparent: true, opacity: 0.6, sizeAttenuation: true,
      blending: THREE.AdditiveBlending, depthWrite: false, alphaTest: 0.01
    });
    var points = new THREE.Points(pgeo, pmat);

    // ---- constellation lines (computed once → cheap, gives a "data network" read) ----
    var NODES = Math.min(620, P);
    var THRESH = 0.62, MAX_SEG = 640;
    var segs = [];
    for (var a = 0; a < NODES && segs.length < MAX_SEG; a++) {
      var ax = ppos[a*3], ay = ppos[a*3+1], az = ppos[a*3+2];
      for (var b = a + 1; b < NODES && segs.length < MAX_SEG; b++) {
        var dx = ax - ppos[b*3], dy = ay - ppos[b*3+1], dz = az - ppos[b*3+2];
        if (dx*dx + dy*dy + dz*dz < THRESH * THRESH) {
          segs.push(ax, ay, az, ppos[b*3], ppos[b*3+1], ppos[b*3+2]);
        }
      }
    }
    var lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs), 3));
    var lmat = new THREE.LineBasicMaterial({
      color: new THREE.Color(cfg.accent), transparent: true, opacity: 0.14,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var lines = new THREE.LineSegments(lgeo, lmat);

    // cloud group so points + lines drift / pulse together
    var cloud = new THREE.Group();
    cloud.add(points); cloud.add(lines);
    scene.add(cloud);

    // ---- lights ----
    scene.add(new THREE.AmbientLight(0x3a4644, 0.7));
    var key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(-3, 4, 5); scene.add(key);
    var fill = new THREE.PointLight(0x9bd4a3, 0.9, 20); fill.position.set(4, -1, 2); scene.add(fill);
    var rim = new THREE.PointLight(0xbfe0ff, 0.6, 20); rim.position.set(0, 2, -4); scene.add(rim);

    // ---- pointer parallax ----
    var tgX = 0, tgY = 0, curX = 0, curY = 0;
    var section = document.getElementById('pulse');
    function onMove(e) {
      var r = (section || document.body).getBoundingClientRect();
      tgX = ((e.clientX - r.left) / r.width - 0.5);
      tgY = ((e.clientY - r.top) / r.height - 0.5);
    }
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

    // ---- resize ----
    function resize() {
      var w = canvas.clientWidth || canvas.offsetWidth || 1;
      var h = canvas.clientHeight || canvas.offsetHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    // ---- visibility gate ----
    var visible = true;
    if ('IntersectionObserver' in window && section) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
      }, { threshold: 0.01 }).observe(section);
    }

    // ---- apply config to materials ----
    function applyStyle() {
      var showOrb = cfg.style !== 'particles';
      var showPts = cfg.style !== 'orb';
      orb.visible = showOrb; wire.visible = showOrb;
      // keep a soft luminous core glow in BOTH orb and particles modes
      glow.visible = cfg.glow > 0.001;
      cloud.visible = showPts;
    }
    applyStyle();

    window.AgriPulse = {
      update: function (o) {
        o = o || {};
        if (o.accent) {
          mat.color.set(o.accent); glowMat.color.set(o.accent); fill.color.set(o.accent);
          lmat.color.set(o.accent);
          cfg.accent = o.accent;
        }
        if (o.style) { cfg.style = o.style; applyStyle(); }
        if (o.glow != null) { cfg.glow = o.glow; glowMat.opacity = o.glow; glow.visible = o.glow > 0.001; }
        if (o.spin != null) cfg.spin = o.spin;
        if (o.motion != null) cfg.motion = o.motion;
      }
    };

    // ---- animate ----
    var pos = geo.attributes.position;
    var arr = pos.array;
    var clock = new THREE.Clock();
    var F = 2.15;

    function morph(t) {
      var amp = 0.16 * (0.18 + cfg.motion * 0.82);
      var breathe = 1 + Math.sin(t * 0.6) * 0.025 * (0.3 + cfg.motion);
      for (var i = 0; i < nVerts; i++) {
        var nx = dirs[i*3], ny = dirs[i*3+1], nz = dirs[i*3+2];
        var d = (Math.sin(nx*F + t*0.9) + Math.sin(ny*F*1.3 + t*0.78) + Math.sin(nz*F*1.7 + t*1.05)) / 3;
        var nl = (R + d * amp) * breathe;
        arr[i*3] = nx*nl; arr[i*3+1] = ny*nl; arr[i*3+2] = nz*nl;
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      var t = clock.getElapsedTime();
      morph(t);
      // parallax easing
      curX += (tgX - curX) * 0.05; curY += (tgY - curY) * 0.05;
      var spinSpd = 0.04 + cfg.spin * 0.5;
      group.rotation.y += spinSpd * 0.01 * (0.4 + cfg.motion);
      group.rotation.x = curY * 0.5;
      group.position.x = curX * 0.5;
      group.position.y = -curY * 0.35;
      // particle cloud: slow swirl + a gentle heartbeat pulse
      cloud.rotation.y -= 0.0006 * (0.4 + cfg.motion);
      cloud.rotation.x = curY * 0.2;
      var beat = 1 + Math.sin(t * 0.7) * 0.035 * (0.4 + cfg.motion);
      cloud.scale.setScalar(beat);
      // gentle color drift — particles & links breathe between cool sage and warm
      var drift = Math.sin(t * 0.18) * 0.5 + 0.5;            // 0..1
      pmat.color.setHSL(0.30 - drift * 0.06, 0.34, 0.78);
      lmat.opacity = 0.10 + drift * 0.06;
      glow.scale.setScalar(5.0 * (1 + Math.sin(t * 0.7) * 0.04));
      renderer.render(scene, camera);
    }

    resize();
    if (reduce) {
      morph(0.8); group.rotation.set(0.1, 0.5, 0); renderer.render(scene, camera);
    } else {
      frame();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
