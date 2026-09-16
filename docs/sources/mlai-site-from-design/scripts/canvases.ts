/* ════════════════════════════════════════════════════════════════
   MLAI — signature canvas backgrounds (vanilla port of the React mocks)
   Global config lives on window.MLAI so the Tweaks panel can retune live.
═════════════════════════════════════════════════════════════════ */
window.MLAI = window.MLAI || {
  motion: "full",          // "full" | "calm" | "off"
  accentRGB: [34, 211, 238], // cyan default
  accentHue: 187,
};

(function () {
  const INK = "#05070d";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const speed = () => {
    if (reduceMotion || window.MLAI.motion === "off") return 0;
    return window.MLAI.motion === "calm" ? 0.45 : 1;
  };
  const acc = () => window.MLAI.accentRGB;

  function fit(c) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* ─── Flow field — drifting trails (hero) ─────────────────────── */
  function flowField(c) {
    let raf, w, h, t = 0, P = [], ctx;
    const resize = () => {
      ({ ctx, w, h } = fit(c));
      ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
      P = Array.from({ length: 440 }, () => ({ x: Math.random() * w, y: Math.random() * h }));
    };
    resize(); addEventListener("resize", resize);
    const ang = (x, y) => (Math.sin(x * 0.008 + t) + Math.cos(y * 0.008 - t * 0.7) + Math.sin((x + y) * 0.004)) * 1.6;
    const draw = () => {
      const s = speed();
      t += 0.0022 * s;
      ctx.fillStyle = "rgba(5,7,13,0.045)"; ctx.fillRect(0, 0, w, h);
      const [r, g, b] = acc();
      for (const p of P) {
        const a = ang(p.x, p.y);
        const nx = p.x + Math.cos(a) * 1.5 * (s || 0.0001), ny = p.y + Math.sin(a) * 1.5 * (s || 0.0001);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.42)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
        p.x = nx; p.y = ny;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) { p.x = Math.random() * w; p.y = Math.random() * h; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }

  /* ─── Network — connected node graph ──────────────────────────── */
  function network(c) {
    let raf, w, h, nodes = [], ctx;
    const resize = () => {
      ({ ctx, w, h } = fit(c));
      nodes = Array.from({ length: Math.min(70, Math.floor(w * h / 16000)) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      }));
    };
    resize(); addEventListener("resize", resize);
    const draw = () => {
      const s = speed();
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = acc();
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx * s; a.y += a.vy * s;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const bb = nodes[j], dx = a.x - bb.x, dy = a.y - bb.y, d = Math.hypot(dx, dy);
          if (d < 140) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.13 * (1 - d / 140)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bb.x, bb.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${r},${g},${b},0.45)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.7, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }

  /* ─── Embedding cloud — rotating persona vectors ──────────────── */
  function embeddingCloud(c) {
    let raf, w, h, t = 0, ctx;
    const N = 520;
    const cols = [[34, 211, 238], [168, 85, 247], [52, 211, 153]]; // 3 personas — fixed
    const pts = Array.from({ length: N }, () => {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 0.7 + Math.random() * 0.3;
      return { x: r * Math.sin(ph) * Math.cos(th), y: r * Math.sin(ph) * Math.sin(th), z: r * Math.cos(ph), c: cols[Math.floor(Math.random() * 3)] };
    });
    const resize = () => { ({ ctx, w, h } = fit(c)); };
    resize(); addEventListener("resize", resize);
    const draw = () => {
      t += 0.004 * speed();
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.4;
      const ca = Math.cos(t), sa = Math.sin(t);
      const proj = pts.map(p => {
        const x = p.x * ca - p.z * sa, z = p.x * sa + p.z * ca; const sc = 1 / (1.8 - z);
        return { px: cx + x * s * sc, py: cy + p.y * s * sc, sc, c: p.c };
      }).sort((a, b) => a.sc - b.sc);
      for (const p of proj) {
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${0.25 + p.sc * 0.5})`;
        ctx.beginPath(); ctx.arc(p.px, p.py, p.sc * 2.2, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }

  /* ─── De Jong attractor — neural backtracking art ─────────────── */
  function deJong(c) {
    let raf, w, h, t = 0, ctx;
    const resize = () => { ({ ctx, w, h } = fit(c)); ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h); };
    resize(); addEventListener("resize", resize);
    const draw = () => {
      t += 0.0016 * speed();
      ctx.fillStyle = "rgba(5,7,13,0.14)"; ctx.fillRect(0, 0, w, h);
      const a = 2.4 + Math.sin(t) * 0.6, b = -2.3 + Math.cos(t * 0.8) * 0.5,
        cc = 1.7 + Math.sin(t * 0.5) * 0.4, d = -2.1 + Math.cos(t * 0.3) * 0.4;
      let x = 0, y = 0; const cx = w / 2, cy = h / 2, s = Math.min(w, h) / 4.4;
      for (let i = 0; i < 5200; i++) {
        const nx = Math.sin(a * y) - Math.cos(b * x);
        const ny = Math.sin(cc * x) - Math.cos(d * y);
        x = nx; y = ny;
        const hue = (i / 5200 * 120 + t * 60) % 360;
        ctx.fillStyle = `hsla(${180 + hue % 120},90%,65%,0.5)`;
        ctx.fillRect(cx + x * s, cy + y * s, 1, 1);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }

  const KIND = { flow: flowField, network, embedding: embeddingCloud, dejong: deJong };
  const stops = new Map();

  function mount() {
    document.querySelectorAll("canvas[data-canvas]").forEach((c) => {
      if (stops.has(c)) return;
      const fn = KIND[c.dataset.canvas];
      if (fn) stops.set(c, fn(c));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else { mount(); }

  window.MLAI.remount = mount;
})();
