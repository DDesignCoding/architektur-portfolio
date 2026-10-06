/* ==========================================================
   script.js – Verhalten der Seite
   1) Magnet- und 3D-Kipp-Effekt der Bilder (Maus)
   2) Fokus beim Hover (Bild + Projekttitel)
   ========================================================== */

(() => {
  const stage    = document.getElementById('stage');
  const tiles    = [...stage.querySelectorAll('.tile')];
  const focusBox = document.getElementById('focusTitle');
  const focusNum = focusBox.querySelector('.num');
  const focusH2  = focusBox.querySelector('h2');

  /* ---------- 1) Animation: Magnet + 3D-Kippen ---------- */
  const isTouch = window.matchMedia('(hover: none), (max-width: 760px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isTouch && !reduced) {
    // Zustand pro Bild: Mittelpunkt + aktuelle (geglättete) Werte
    const state = tiles.map(el => ({ el, cx: 0, cy: 0, x: 0, y: 0, rx: 0, ry: 0 }));
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Mittelpunkte ohne Transformation messen (bei Start und Resize)
    const measure = () => {
      state.forEach(s => {
        s.el.style.transform = 'none';
        const r = s.el.getBoundingClientRect();
        s.cx = r.left + r.width / 2;
        s.cy = r.top + r.height / 2;
      });
    };
    measure();
    window.addEventListener('resize', measure);

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const MAGNET_RADIUS = () => Math.min(window.innerWidth, window.innerHeight) * 0.6;
    const MAX_PULL = 34;   // max. Verschiebung in px zur Maus hin
    const MAX_TILT = 14;   // max. Kippwinkel in Grad
    const SMOOTH = 0.08;   // 0–1: kleiner = träger

    const loop = () => {
      const radius = MAGNET_RADIUS();

      state.forEach(s => {
        const depth = parseFloat(s.el.dataset.depth) || 1;
        const dx = mouse.x - s.cx;
        const dy = mouse.y - s.cy;
        const dist = Math.hypot(dx, dy) || 1;

        // Je näher die Maus, desto stärker der Zug (zur Maus hin)
        const pull = Math.max(0, 1 - dist / radius);
        const tx = (dx / dist) * MAX_PULL * pull * depth;
        const ty = (dy / dist) * MAX_PULL * pull * depth;

        // Kippen: Bild neigt sich zur Maus
        const nx = Math.max(-1, Math.min(1, dx / radius));
        const ny = Math.max(-1, Math.min(1, dy / radius));
        const ry =  nx * MAX_TILT * depth;
        const rx = -ny * MAX_TILT * depth;

        // Glätten
        s.x  += (tx - s.x)  * SMOOTH;
        s.y  += (ty - s.y)  * SMOOTH;
        s.rx += (rx - s.rx) * SMOOTH;
        s.ry += (ry - s.ry) * SMOOTH;

        s.el.style.transform =
          `perspective(900px) translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) ` +
          `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
      });

      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- 2) Fokus / Hover ---------- */
  const activate = tile => {
    const i = tiles.indexOf(tile) + 1;
    tiles.forEach(t => t.classList.toggle('is-active', t === tile));
    stage.classList.add('has-focus');
    document.body.classList.add('has-focus');
    focusNum.textContent = String(i).padStart(2, '0') + ' / ' + String(tiles.length).padStart(2, '0');
    focusH2.textContent  = tile.dataset.title;
  };

  const deactivate = () => {
    tiles.forEach(t => t.classList.remove('is-active'));
    stage.classList.remove('has-focus');
    document.body.classList.remove('has-focus');
  };

  tiles.forEach(tile => {
    tile.addEventListener('mouseenter', () => activate(tile));
    tile.addEventListener('mouseleave', deactivate);
    tile.addEventListener('focusin',  () => activate(tile));
    tile.addEventListener('focusout', deactivate);
  });
})();
