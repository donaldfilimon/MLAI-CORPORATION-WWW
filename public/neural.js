/* ════════════════════════════════════════════════════════════════
   MLAI — signature neural canvases, precompiled vanilla JS.
   No React/Babel. Auto-mounts into:
     [data-neural="galaxy"] — tri-persona embedding galaxy (hero)
     [data-neural="net"]    — drifting node constellation (backdrops)
   Per-element overrides via data-speed / data-density / data-glow /
   data-chain / data-parallax / data-color / data-dense.
   Live retuning: MLAINeural.updateAll({ speed, glow, abbey, … }).
═════════════════════════════════════════════════════════════════ */
(function () {
  var hexRGB = function (h) { var n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  var PERIOD_BASE = 8000;
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DEFAULTS = {
    abbey: '#34d399', aviva: '#a855f7', abi: '#22d3ee',
    speed: 1.3, density: 1.1, glow: 0.95, parallax: true, chain: true,
  };

  var instances = [];
  var ptr = { tx: 0, ty: 0, x: 0, y: 0 };
  addEventListener('pointermove', function (e) {
    ptr.tx = (e.clientX / innerWidth - 0.5) * 2;
    ptr.ty = (e.clientY / innerHeight - 0.5) * 2;
  });

  function sphere(n, clustered) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var ci = Math.floor(Math.random() * 3);
      var u = Math.random(), v = Math.random();
      var th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), r = 0.55 + Math.random() * 0.45;
      var x = r * Math.sin(ph) * Math.cos(th), y = r * Math.cos(ph), z = r * Math.sin(ph) * Math.sin(th);
      if (clustered) {
        var lobes = [[0.62, 0.2, 0], [-0.4, 0.45, 0.4], [-0.2, -0.55, -0.45]];
        var L = lobes[ci], b = 0.42;
        x = x * (1 - b) + L[0] * b; y = y * (1 - b) + L[1] * b; z = z * (1 - b) + L[2] * b;
      }
      out.push({ x: x, y: y, z: z, ci: ci });
    }
    return out;
  }

  function makeCanvas(host) {
    var c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
    host.appendChild(c);
    return c;
  }

  function datasetCfg(el) {
    var d = el.dataset, cfg = {};
    if (d.speed) cfg.speed = parseFloat(d.speed);
    if (d.density) cfg.density = parseFloat(d.density);
    if (d.glow) cfg.glow = parseFloat(d.glow);
    if (d.chain !== undefined) cfg.chain = d.chain !== '0' && d.chain !== 'false';
    if (d.parallax !== undefined) cfg.parallax = d.parallax !== '0' && d.parallax !== 'false';
    return cfg;
  }

  function mountGalaxy(host) {
    var cfg = Object.assign({}, DEFAULTS, datasetCfg(host));
    var c = makeCanvas(host);
    var ctx = c.getContext('2d');
    var raf, w, h, dpr, cloud = [], lat = [], dust = [], curDensity = -1, stopped = false;
    var tiltC = Math.cos(0.34), tiltS = Math.sin(0.34);

    function build() {
      var dens = cfg.density;
      cloud = sphere(Math.min(760, Math.floor(w * h / 4200 * dens)), true);
      lat = sphere(46, false);
      dust = [];
      var nd = Math.floor(w * h / 13000 * dens);
      for (var i = 0; i < nd; i++) dust.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + 0.3, p: Math.random() * 6.28, vy: 0.04 + Math.random() * 0.08 });
      curDensity = dens;
    }
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    resize(); addEventListener('resize', resize);

    function project(p, cosR, sinR, cx, cy, S, tx, ty) {
      var y1 = p.y * tiltC - p.z * tiltS, z1 = p.y * tiltS + p.z * tiltC;
      var x2 = p.x * cosR + z1 * sinR, z2 = -p.x * sinR + z1 * cosR;
      var persp = 1 / (2.4 - z2);
      var norm = (persp - 0.29) / 0.42;
      return { px: cx + x2 * persp * S + tx * (0.4 + norm), py: cy + y1 * persp * S + ty * (0.4 + norm), n: Math.max(0, Math.min(1, norm)) };
    }
    function chainPath(t, loop, cx, cy) {
      var x = w * (0.06 + 0.88 * t);
      var y = cy + h * 0.30 + Math.sin(t * Math.PI * 2 + loop * Math.PI * 2) * h * 0.045;
      return [x, y];
    }

    function draw(now) {
      if (stopped) return;
      if (cfg.density !== curDensity) build();
      var speed = REDUCE ? 0 : cfg.speed;
      var par = (REDUCE || !cfg.parallax) ? 0 : 1;
      var glow = cfg.glow;
      var cols = [hexRGB(cfg.abbey), hexRGB(cfg.aviva), hexRGB(cfg.abi)];
      var PERIOD = PERIOD_BASE / Math.max(speed, 0.0001);
      var loop = speed === 0 ? 0.25 : (now % PERIOD) / PERIOD;

      ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;
      var offX = ptr.x * 26 * par, offY = ptr.y * 18 * par;

      var breath = 1 + 0.04 * Math.sin(loop * Math.PI * 2);
      var cx = w / 2 + offX, cyC = h * 0.46 + offY, S = Math.min(w, h) * 0.42 * breath;
      var rot = loop * Math.PI * 2 + ptr.x * 0.25 * par, cosR = Math.cos(rot), sinR = Math.sin(rot);

      var bg = ctx.createRadialGradient(cx, cyC, 0, cx, cyC, Math.max(w, h) * 0.78);
      bg.addColorStop(0, '#0b1530'); bg.addColorStop(0.55, '#05081a'); bg.addColorStop(1, '#020308');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (var di = 0; di < dust.length; di++) {
        var d = dust[di];
        if (speed > 0) { d.y -= d.vy; if (d.y < -2) { d.y = h + 2; d.x = Math.random() * w; } }
        var da = (0.16 + 0.22 * Math.sin(now * 0.001 + d.p)) * glow;
        ctx.fillStyle = 'rgba(150,190,230,' + da + ')';
        ctx.beginPath(); ctx.arc(d.x + offX * 0.3, d.y, d.r, 0, 6.3); ctx.fill();
      }

      var offs = [0, 0.33, 0.66];
      for (var oi = 0; oi < 3; oi++) {
        var lp = (loop + offs[oi]) % 1, rr = lp * Math.min(w, h) * 0.66, ra = (1 - lp) * 0.32 * glow;
        var cc0 = cols[2];
        ctx.strokeStyle = 'rgba(' + cc0[0] + ',' + cc0[1] + ',' + cc0[2] + ',' + ra + ')'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cyC, rr, 0, 6.3); ctx.stroke();
      }
      var core = 0.5 + 0.5 * Math.sin(now * 0.004);
      var cg = ctx.createRadialGradient(cx, cyC, 0, cx, cyC, S * 0.5);
      cg.addColorStop(0, 'rgba(120,210,255,' + ((0.10 + core * 0.08) * glow) + ')'); cg.addColorStop(1, 'rgba(120,210,255,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cyC, S * 0.5, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(150,225,255,' + ((0.5 + core * 0.4) * glow) + ')';
      ctx.beginPath(); ctx.arc(cx, cyC, 2 + core * 1.8, 0, 6.3); ctx.fill();

      var lpos = [], li;
      for (li = 0; li < lat.length; li++) lpos.push(project(lat[li], cosR, sinR, cx, cyC, S, offX, offY));
      var thr = Math.min(w, h) * 0.19;
      for (var i = 0; i < lpos.length; i++) for (var j = i + 1; j < lpos.length; j++) {
        var dx = lpos[i].px - lpos[j].px, dy = lpos[i].py - lpos[j].py, dd = Math.hypot(dx, dy);
        if (dd < thr) {
          var ci2 = cols[lat[i].ci], cj = cols[lat[j].ci];
          var rr2 = (ci2[0] + cj[0]) / 2, gg = (ci2[1] + cj[1]) / 2, bb = (ci2[2] + cj[2]) / 2;
          var la = (1 - dd / thr) * 0.22 * (0.4 + lpos[i].n) * glow;
          ctx.strokeStyle = 'rgba(' + (rr2 | 0) + ',' + (gg | 0) + ',' + (bb | 0) + ',' + la + ')'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(lpos[i].px, lpos[i].py); ctx.lineTo(lpos[j].px, lpos[j].py); ctx.stroke();
        }
      }
      for (i = 0; i < lpos.length; i++) { var p1 = lpos[i], cl = cols[lat[i].ci]; ctx.fillStyle = 'rgba(' + cl[0] + ',' + cl[1] + ',' + cl[2] + ',' + ((0.4 + p1.n * 0.5) * glow) + ')'; ctx.beginPath(); ctx.arc(p1.px, p1.py, 1 + p1.n * 1.6, 0, 6.3); ctx.fill(); }
      for (i = 0; i < cloud.length; i++) { var p2 = project(cloud[i], cosR, sinR, cx, cyC, S, offX, offY), cl2 = cols[cloud[i].ci]; ctx.fillStyle = 'rgba(' + cl2[0] + ',' + cl2[1] + ',' + cl2[2] + ',' + ((0.14 + p2.n * 0.6) * glow) + ')'; ctx.beginPath(); ctx.arc(p2.px, p2.py, 0.6 + p2.n * 1.7, 0, 6.3); ctx.fill(); }

      if (cfg.chain) {
        var cc = cols[2];
        var NB = 7, bw = Math.max(20, Math.min(w, h) * 0.03), bh = bw * 0.66;
        ctx.strokeStyle = 'rgba(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ',0.18)'; ctx.lineWidth = 1.4; ctx.beginPath();
        for (var s = 0; s <= 60; s++) { var xy = chainPath(s / 60, loop, cx, cyC); s ? ctx.lineTo(xy[0], xy[1]) : ctx.moveTo(xy[0], xy[1]); } ctx.stroke();
        for (i = 0; i < NB; i++) {
          var t = (i + 0.5) / NB, bxy = chainPath(t, loop, cx, cyC), bx = bxy[0], by = bxy[1];
          var fd = Math.abs(loop - t); fd = Math.min(fd, 1 - fd);
          var flare = Math.exp(-fd * fd * 130), fa = 0.26 + flare * 0.7;
          ctx.strokeStyle = 'rgba(' + (cc[0] + flare * 80) + ',' + cc[1] + ',' + cc[2] + ',' + fa + ')'; ctx.lineWidth = 1.2 + flare * 1.5;
          ctx.beginPath(); ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 4); ctx.stroke();
          if (flare > 0.05) { ctx.fillStyle = 'rgba(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ',' + (flare * 0.18) + ')'; ctx.fill(); }
          ctx.fillStyle = 'rgba(190,245,255,' + (0.3 + flare * 0.6) + ')'; ctx.beginPath(); ctx.arc(bx, by, 1.1, 0, 6.3); ctx.fill();
        }
        for (var k = 0; k < 6; k++) { var tp = (loop - k * 0.012 + 1) % 1, pxy = chainPath(tp, loop, cx, cyC), pa = (1 - k / 6) * 0.9; ctx.fillStyle = 'rgba(190,245,255,' + pa + ')'; ctx.beginPath(); ctx.arc(pxy[0], pxy[1], (bw * 0.18) * (1 - k / 9), 0, 6.3); ctx.fill(); }
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    instances.push({
      host: host, kind: 'galaxy', cfg: cfg,
      destroy: function () { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', resize); c.remove(); },
    });
  }

  function mountNet(host) {
    var color = host.dataset.color || '34,211,238';
    var dense = parseFloat(host.dataset.dense || '9000');
    var op = parseFloat(host.dataset.op || '1');
    var c = makeCanvas(host);
    var ctx = c.getContext('2d'); var raf, w, h, dpr, n = [], stopped = false;
    function rs() { dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); n = []; var cnt = Math.min(54, Math.floor(w * h / dense)); for (var i = 0; i < cnt; i++) n.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 }); }
    rs(); addEventListener('resize', rs);
    var still = REDUCE;
    function d() {
      if (stopped) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < n.length; i++) {
        var a = n[i];
        if (!still) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > w) a.vx *= -1; if (a.y < 0 || a.y > h) a.vy *= -1; }
        for (var j = i + 1; j < n.length; j++) { var b = n[j], dx = a.x - b.x, dy = a.y - b.y, ds = Math.hypot(dx, dy); if (ds < 120) { ctx.strokeStyle = 'rgba(' + color + ',' + (0.13 * op * (1 - ds / 120)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
      }
      for (var pi = 0; pi < n.length; pi++) { var p = n[pi]; ctx.fillStyle = 'rgba(' + color + ',' + (0.45 * op) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 7); ctx.fill(); }
      raf = requestAnimationFrame(d);
    }
    d();
    instances.push({
      host: host, kind: 'net', cfg: {},
      destroy: function () { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', rs); c.remove(); },
    });
  }

  function updateAll(partial) {
    for (var i = 0; i < instances.length; i++) Object.assign(instances[i].cfg, partial);
  }

  // Tear down mounted canvases (cancel rAF + remove listeners + canvas). With a
  // host, only that host's instance(s); without, all. Lets React unmount the
  // hero without leaking a detached animation loop on SPA navigation.
  function unmount(host) {
    for (var i = instances.length - 1; i >= 0; i--) {
      if (!host || instances[i].host === host) {
        try { if (instances[i].destroy) instances[i].destroy(); } catch (e) {}
        instances.splice(i, 1);
      }
    }
  }

  function mount() {
    document.querySelectorAll('[data-neural="galaxy"]').forEach(function (el) { if (!el.firstElementChild) mountGalaxy(el); });
    document.querySelectorAll('[data-neural="net"]').forEach(function (el) { if (!el.firstElementChild) mountNet(el); });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', mount); } else { mount(); }

  window.MLAINeural = { updateAll: updateAll, mount: mount, unmount: unmount, DEFAULTS: DEFAULTS };
})();
