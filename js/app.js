(() => {
  'use strict';
  const KEY = 'lockedLab.y7.v1';
  const LOCKS = window.LOCKS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const TOTAL_TASKS = LOCKS.reduce((n, l) => n + l.tasks.length, 0);

  /* ───────── saved state ───────── */
  const blank = () => ({ name: '', name2: '', cls: '', start: 0, end: 0, log: {}, opened: [], promise: '', screen: 'start', lock: null, task: 0 });
  let S = load();
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.log) return Object.assign(blank(), s); } catch (e) { /* storage blocked */ }
    return blank();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } }
  const rec = (lockId, i) => { S.log[lockId] = S.log[lockId] || []; return (S.log[lockId][i] = S.log[lockId][i] || { tries: 0, wrong: 0, hint: false, ok: false }); };
  const isOpen = (id) => S.opened.includes(id);
  const nextLock = () => LOCKS.find((l) => !isOpen(l.id));
  const firstTry = () => LOCKS.reduce((n, l) => n + (S.log[l.id] || []).filter((r) => r && r.ok && r.wrong === 0).length, 0);
  const stars = () => { const f = firstTry() / TOTAL_TASKS; return f >= 0.8 ? 3 : f >= 0.55 ? 2 : 1; };

  const app = $('#app');
  const names = () => [S.name, S.name2].map((n) => (n || '').trim()).filter(Boolean).join(' & ');

  /* ───────── header ───────── */
  function drawStrip() {
    $('#strip').innerHTML = LOCKS.map((l) => `<span class="sl ${isOpen(l.id) ? 'on' : ''}" style="--c:${l.color}" title="${esc(l.name)}">${isOpen(l.id) ? l.letter : '🔒'}</span>`).join('');
  }
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  function tick() {
    const t = $('#timer');
    t.hidden = !S.start;
    if (S.start) t.querySelector('b').textContent = fmt((S.end || Date.now()) - S.start);
  }
  setInterval(tick, 1000);

  function go(screen, lock, task) {
    S.screen = screen; if (lock !== undefined) S.lock = lock; if (task !== undefined) S.task = task;
    save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    drawStrip(); tick();
    if (S.screen === 'lock' && S.lock && LOCKS.find((l) => l.id === S.lock)) return screenLock();
    if (S.screen === 'door') return screenDoor();
    if (S.screen === 'escaped' && S.end) return screenEscaped();
    if (S.screen === 'map' && S.start) return screenMap();
    return screenStart();
  }

  /* ───────── START ───────── */
  const STEPS = [
    ['👫', 'Work with a partner. Write both names.'],
    ['🔒', 'Tap a lock and do the tasks.'],
    ['🔤', 'Each lock gives you a letter.'],
    ['🚪', 'Use the letters to open the door!'],
  ];
  const stepsHTML = () => `<ol class="steps">${STEPS.map(([e, t], i) => `<li><span class="n">${i + 1}</span><span class="e">${e}</span><b>${t}</b></li>`).join('')}</ol>`;

  function screenStart() {
    const going = S.start && !S.end;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-txt">
          <p class="kick">Escape room · Year 7</p>
          <h1>Locked in the Lab 🔒</h1>
          <p class="story">Oh no! The door of the computing lab is locked. Open the <b>7 locks</b> to escape!</p>
        </div>
        <div class="door-art" aria-hidden="true"><span>🚪</span><i>🔒</i></div>
      </section>

      <section class="card">
        <h2 class="h">How to play</h2>
        ${stepsHTML()}
        <p class="stuck">Stuck? Tap <b>💡 Hint</b>. Still stuck? Put your hand up ✋</p>
      </section>

      <section class="card who">
        <p class="pair-note">👫 You work in pairs. Write <b>both</b> names.</p>
        <label><span>✏️ Name 1</span><input id="sName" autocomplete="off" placeholder="First name and surname" value="${esc(S.name)}"></label>
        <label><span>✏️ Name 2</span><input id="sName2" autocomplete="off" placeholder="Your partner’s name" value="${esc(S.name2)}"></label>
        <label><span>🏫 Class</span><input id="sCls" placeholder="e.g. 7B" value="${esc(S.cls)}"></label>
        <p class="msg" id="sMsg" aria-live="polite"></p>
        <button class="btn big go" id="sGo">${going ? '▶ Keep going' : S.end ? '🏆 See my certificate' : '▶ Start'}</button>
      </section>

      <p class="foot">Your answers are saved on this device only. Never type real passwords here.<br>
      Based on the Teach Computing Curriculum (National Centre for Computing Education · Raspberry Pi Foundation), Year 7 “Impact of technology – Collaborating online respectfully”, Open Government Licence v3.0. Made for the British School Alzira · Xàtiva · Gandia Group.</p>`;
    $('#sName').addEventListener('input', (e) => { S.name = e.target.value; save(); });
    $('#sName2').addEventListener('input', (e) => { S.name2 = e.target.value; save(); });
    $('#sCls').addEventListener('input', (e) => { S.cls = e.target.value; save(); });
    $('#sGo').addEventListener('click', () => {
      if (!S.name.trim()) { $('#sMsg').textContent = '✏️ Write your names first!'; $('#sName').focus(); return; }
      if (!S.name2.trim()) { $('#sMsg').textContent = '👫 Write your partner’s name too!'; $('#sName2').focus(); return; }
      if (S.end) return go('escaped');
      if (!S.start) S.start = Date.now();
      go('map');
    });
  }

  /* ───────── MAP (the door with 7 locks) ───────── */
  function screenMap() {
    const nx = nextLock();
    app.innerHTML = `
      <section class="card map">
        <p class="todo">👉 ${nx ? 'Tap the <b>glowing lock</b> to start.' : 'All the locks are open! Go to the door.'}</p>
        <div class="locks">
          ${LOCKS.map((l, i) => {
            const open = isOpen(l.id), cur = nx && nx.id === l.id;
            return `<button class="lock ${open ? 'open' : ''} ${cur ? 'cur' : ''}" data-id="${l.id}" style="--c:${l.color}" ${!open && !cur ? 'disabled' : ''}>
              <span class="lk-n">Lock ${i + 1}</span>
              <span class="lk-ic">${open ? '🔓' : cur ? l.icon : '🔒'}</span>
              <b>${esc(l.name)}</b>
              <span class="lk-l">${open ? `Letter: <em>${l.letter}</em>` : cur ? 'Open me!' : 'Locked'}</span>
            </button>`;
          }).join('')}
        </div>
        ${nx ? '' : '<button class="btn big go" id="toDoor">🚪 Go to the door</button>'}
      </section>`;
    $$('.lock').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.id; const l = LOCKS.find((x) => x.id === id);
      const done = (S.log[id] || []).filter((r) => r && r.ok).length;
      go('lock', id, isOpen(id) ? 0 : Math.min(done, l.tasks.length - 1));
    }));
    const d = $('#toDoor'); if (d) d.addEventListener('click', () => go('door'));
  }

  /* ───────── LOCK (tasks) ───────── */
  function screenLock() {
    const L = LOCKS.find((l) => l.id === S.lock);
    const i = Math.min(S.task, L.tasks.length - 1);
    const T = L.tasks[i];
    const r = rec(L.id, i);
    app.innerHTML = `
      <section class="card task" style="--c:${L.color}">
        <div class="task-head">
          <span class="t-ic">${L.icon}</span>
          <div><small>${esc(L.lesson)}</small><h2>${esc(L.name)}</h2></div>
          <div class="dots" aria-label="Task ${i + 1} of ${L.tasks.length}">${L.tasks.map((_, k) => `<span class="${k < i || (S.log[L.id] || [])[k]?.ok ? 'd' : ''} ${k === i ? 'c' : ''}"></span>`).join('')}<small>Task ${i + 1} of ${L.tasks.length}</small></div>
        </div>
        <p class="todo">👉 <b>What to do:</b> ${esc(T.todo)}</p>
        <h3 class="q">${esc(T.q)}</h3>
        <div id="area"></div>
        <p class="hint" id="hint" ${r.hint ? '' : 'hidden'}>💡 ${esc(T.hint)}</p>
        <div class="fb" id="fb" aria-live="polite"></div>
        <div class="task-btns">
          <button class="btn ghost" id="tBack">◀ Back to the locks</button>
          <button class="btn ghost" id="tHint">💡 Hint</button>
          <button class="btn go" id="tCheck" hidden>✔ Check</button>
          <button class="btn go" id="tNext" hidden></button>
        </div>
      </section>`;
    $('#tBack').addEventListener('click', () => go('map'));
    $('#tHint').addEventListener('click', () => { r.hint = true; save(); $('#hint').hidden = false; });

    const fb = (kind, html) => { const f = $('#fb'); f.className = 'fb ' + kind; f.innerHTML = html; if (kind === 'bad') { f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); } };
    const ctx = {
      area: $('#area'), task: T, check: $('#tCheck'),
      wrong(msg) { r.tries++; r.wrong++; save(); fb('bad', `❌ Not quite. ${msg || ''} <b>Try again!</b>`); },
      tryOk() { r.tries++; save(); },
      solved(msg) {
        r.ok = true; save();
        $('#tCheck').hidden = true; $('#tHint').hidden = true;
        fb('good', `✅ <b>Well done!</b> ${msg || ''}`);
        const last = i === L.tasks.length - 1;
        const n = $('#tNext'); n.hidden = false;
        n.textContent = last ? (isOpen(L.id) ? '◀ Back to the locks' : `🔓 Open the lock!`) : 'Next task ▶';
        n.addEventListener('click', () => {
          if (!last) return go('lock', L.id, i + 1);
          if (isOpen(L.id)) return go('map');
          S.opened.push(L.id); save(); unlocked(L);
        });
        n.focus();
      },
    };
    if (r.ok) { TYPES[T.type](ctx, true); ctx.solved('You already did this one.'); return; }
    TYPES[T.type](ctx, false);
  }

  function unlocked(L) {
    drawStrip();
    openModal(`
      <div class="unlock" style="--c:${L.color}">
        <p class="big-ic">🔓</p>
        <h2>Lock open!</h2>
        <p>You found the letter</p>
        <p class="letter">${L.letter}</p>
        <p class="small">Remember it! You need all the letters to open the door.</p>
        <button class="btn big go" id="uOk">${nextLock() ? 'Next lock ▶' : '🚪 Go to the door'}</button>
      </div>`, () => go(nextLock() ? 'map' : 'door'));
    $('#uOk').addEventListener('click', closeModal);
  }

  /* ───────── task types ───────── */
  const TYPES = {
    choice(c, done) {
      const T = c.task;
      const opts = T.cols ? T.options.map((o, k) => ({ o, k })) : shuffle(T.options.map((o, k) => ({ o, k })));
      c.area.innerHTML = `<div class="opts ${T.cols ? 'cols' : ''}">${opts.map(({ o, k }) => `<button class="opt" data-k="${k}">${o.html ? `<span class="opt-l">${esc(o.label)}</span>${o.html}` : esc(o.t)}</button>`).join('')}</div>`;
      const btns = $$('.opt', c.area);
      if (done) { btns.forEach((b) => { b.disabled = true; if (T.options[b.dataset.k].ok) b.classList.add('right'); }); return; }
      btns.forEach((b) => b.addEventListener('click', () => {
        const o = T.options[b.dataset.k];
        if (o.ok) { c.tryOk(); btns.forEach((x) => (x.disabled = true)); b.classList.add('right'); c.solved(o.why); }
        else { b.classList.add('wrong'); b.disabled = true; c.wrong(o.why); }
      }));
    },

    sort(c, done) {
      const T = c.task;
      const order = shuffle(T.items.map((_, k) => k));
      const pick = {};
      c.area.innerHTML = `<div class="sort">${order.map((k) => {
        const it = T.items[k];
        const body = it.from
          ? `<div class="email"><p class="em-h"><span>From: <b>${esc(it.from)}</b></span><span>Subject: <b>${esc(it.subject)}</b></span></p><p>${esc(it.t)}</p></div>`
          : `<p class="it-t">${esc(it.t)}</p>`;
        return `<div class="item" data-k="${k}">${body}<div class="bins">${T.bins.map((b, j) => `<button class="bin" data-j="${j}">${esc(b)}</button>`).join('')}</div><p class="it-why" hidden></p></div>`;
      }).join('')}</div>`;
      const items = $$('.item', c.area);
      const setBtn = () => { c.check.disabled = Object.keys(pick).length < T.items.length; };
      if (done) { items.forEach((el) => { const k = +el.dataset.k; el.classList.add('right'); $$('.bin', el).forEach((b) => { b.disabled = true; b.classList.toggle('sel', +b.dataset.j === T.items[k].bin); }); }); return; }
      items.forEach((el) => $$('.bin', el).forEach((b) => b.addEventListener('click', () => {
        pick[el.dataset.k] = +b.dataset.j;
        $$('.bin', el).forEach((x) => x.classList.toggle('sel', x === b));
        el.classList.remove('wrong'); setBtn();
      })));
      c.check.hidden = false; setBtn();
      c.check.onclick = () => {
        let bad = 0;
        items.forEach((el) => {
          const k = +el.dataset.k; if (el.classList.contains('right')) return;
          const it = T.items[k];
          if (pick[k] === it.bin) {
            el.classList.add('right'); $$('.bin', el).forEach((x) => (x.disabled = true));
            if (it.why) { const w = $('.it-why', el); w.hidden = false; w.textContent = '💡 ' + it.why; }
          } else { bad++; el.classList.add('wrong'); delete pick[k]; $$('.bin', el).forEach((x) => x.classList.remove('sel')); }
        });
        setBtn();
        if (bad) c.wrong(`${bad} ${bad === 1 ? 'answer is' : 'answers are'} in red. Change ${bad === 1 ? 'it' : 'them'}.`);
        else { c.tryOk(); c.solved('Everything is in the right place.'); }
      };
    },

    order(c, done) {
      const T = c.task;
      const slots = T.slots.map(() => null);
      const fixed = T.slots.map(() => false);
      const pool = shuffle(T.items.map((_, k) => k));
      c.area.innerHTML = `<div class="order"><ol class="slots"></ol><p class="pool-l">Tap a sentence to add it:</p><div class="pool"></div></div>`;
      const draw = () => {
        $('.slots', c.area).innerHTML = T.slots.map((s, i) => `<li class="slot ${slots[i] !== null ? 'full' : ''} ${fixed[i] ? 'right' : ''}"><span class="s-l">${esc(s)}</span>${slots[i] !== null ? `<button class="s-it" data-i="${i}" ${fixed[i] || done ? 'disabled' : ''}>${esc(T.items[slots[i]])}${fixed[i] || done ? '' : ' <i>✕</i>'}</button>` : '<span class="s-empty">…</span>'}</li>`).join('');
        $('.pool', c.area).innerHTML = pool.filter((k) => !slots.includes(k)).map((k) => `<button class="p-it" data-k="${k}">${esc(T.items[k])}</button>`).join('');
        $$('.p-it', c.area).forEach((b) => b.addEventListener('click', () => { const e = slots.indexOf(null); if (e > -1) { slots[e] = +b.dataset.k; draw(); } }));
        $$('.s-it', c.area).forEach((b) => b.addEventListener('click', () => { slots[+b.dataset.i] = null; draw(); }));
        c.check.disabled = slots.includes(null);
      };
      if (done) { T.answers[0].forEach((k, i) => { slots[i] = k; fixed[i] = true; }); draw(); return; }
      c.check.hidden = false; draw();
      c.check.onclick = () => {
        const best = T.answers.map((a) => a.filter((k, i) => slots[i] === k).length);
        const a = T.answers[best.indexOf(Math.max(...best))];
        let bad = 0;
        a.forEach((k, i) => { if (slots[i] === k) fixed[i] = true; else { bad++; slots[i] = null; } });
        draw();
        if (bad) c.wrong(`The green ones are right. Put the others back in.`);
        else { c.tryOk(); c.solved('Perfect order!'); }
      };
    },

    fill(c, done) {
      const T = c.task;
      const pick = {};
      c.area.innerHTML = `<div class="email fill">${T.parts.map((p, i) => p.text
        ? `<p class="f-text">${esc(p.text)}</p>`
        : `<div class="f-row" data-i="${i}"><span class="f-l">${esc(p.label)}</span><div class="f-opts">${p.options.map((o, j) => `<button class="f-o" data-j="${j}">${esc(o)}</button>`).join('')}</div></div>`).join('')}</div>`;
      const rows = $$('.f-row', c.area);
      const need = T.parts.filter((p) => !p.text).length;
      const setBtn = () => { c.check.disabled = Object.keys(pick).length < need; };
      if (done) { rows.forEach((r) => { const p = T.parts[r.dataset.i]; r.classList.add('right'); $$('.f-o', r).forEach((b) => { b.disabled = true; b.classList.toggle('sel', +b.dataset.j === p.answer); }); }); return; }
      rows.forEach((r) => $$('.f-o', r).forEach((b) => b.addEventListener('click', () => {
        pick[r.dataset.i] = +b.dataset.j; $$('.f-o', r).forEach((x) => x.classList.toggle('sel', x === b)); r.classList.remove('wrong'); setBtn();
      })));
      c.check.hidden = false; setBtn();
      c.check.onclick = () => {
        let bad = 0;
        rows.forEach((r) => {
          if (r.classList.contains('right')) return;
          const i = r.dataset.i;
          if (pick[i] === T.parts[i].answer) { r.classList.add('right'); $$('.f-o', r).forEach((x) => (x.disabled = true)); }
          else { bad++; r.classList.add('wrong'); delete pick[i]; $$('.f-o', r).forEach((x) => x.classList.remove('sel')); }
        });
        setBtn();
        if (bad) c.wrong('Change the boxes in red.');
        else { c.tryOk(); c.solved('That is a polite, clear email. Mr Smith will be happy to help!'); }
      };
    },

    build(c, done) {
      const T = c.task;
      const words = [], st = { num: null };
      c.area.innerHTML = `<div class="build">
        <p class="b-l">1️⃣ Tap <b>3 words</b>:</p><div class="b-tiles" id="bW">${T.words.map((w) => `<button class="tile" data-w="${w}">${w}</button>`).join('')}</div>
        <p class="b-l">2️⃣ Tap <b>1 number</b>:</p><div class="b-tiles" id="bN">${T.numbers.map((n) => `<button class="tile num" data-n="${n}">${n}</button>`).join('')}</div>
        <div class="pw"><span class="pw-l">Your password:</span><code id="pw">…</code><div class="meter"><i id="meter"></i></div><b id="mTxt">Too weak</b></div>
        <p class="story-pw" id="pStory" hidden></p>
        <p class="small">This is only practice. Make your real password at home and never show it to anyone!</p>
      </div>`;
      const cap = (w) => w[0].toUpperCase() + w.slice(1);
      const draw = () => {
        $$('#bW .tile', c.area).forEach((b) => b.classList.toggle('sel', words.includes(b.dataset.w)));
        $$('#bN .tile', c.area).forEach((b) => b.classList.toggle('sel', b.dataset.n === st.num));
        const pw = (st.num || '') + words.map(cap).join('');
        $('#pw', c.area).textContent = pw || '…';
        const lvl = words.length + (st.num ? 1 : 0);
        $('#meter', c.area).style.width = `${lvl * 25}%`;
        $('#meter', c.area).dataset.l = lvl;
        $('#mTxt', c.area).textContent = ['Too weak', 'Weak', 'OK', 'Good', '💪 Very strong!'][lvl];
        const ok = words.length === 3 && st.num;
        const s = $('#pStory', c.area); s.hidden = !ok;
        if (ok) s.innerHTML = `📖 Remember it as a story: <i>“My ${st.num}-year-old <b>${words[0]}</b> saw a <b>${words[1]}</b> on the <b>${words[2]}</b>.”</i>`;
        if (ok && !done && !st.won) { st.won = true; $$('.tile', c.area).forEach((b) => (b.disabled = true)); c.tryOk(); c.solved('Three random words and a number make a long, strong password that is easy to remember.'); }
      };
      if (done) { words.push(...T.words.slice(0, 3)); st.num = T.numbers[0]; draw(); $$('.tile', c.area).forEach((b) => (b.disabled = true)); return; }
      $$('#bW .tile', c.area).forEach((b) => b.addEventListener('click', () => {
        const w = b.dataset.w, k = words.indexOf(w);
        if (k > -1) words.splice(k, 1); else if (words.length < 3) words.push(w);
        draw();
      }));
      $$('#bN .tile', c.area).forEach((b) => b.addEventListener('click', () => { st.num = st.num === b.dataset.n ? null : b.dataset.n; draw(); }));
      draw();
    },

    spot(c, done) {
      const H = window.HAZARDS, SAFE = window.SAFE;
      const found = new Set(done ? H.map((_, k) => k) : []);
      const em = (o, cls, k) => `<g class="hs ${cls}" data-k="${k}" tabindex="0" role="button" aria-label="${cls === 'hz' ? 'Something in the lab' : 'Something in the lab'}">
          <circle class="hit" cx="${o.x}" cy="${o.y}" r="${(o.s || 50) * 0.75}"/>
          <text x="${o.x}" y="${o.y}" font-size="${o.s}">${o.e}</text>
          <circle class="ring" cx="${o.x}" cy="${o.y}" r="${(o.s || 50) * 0.8}"/></g>`;
      const hz = H.map((o, k) => {
        if (o.cable) return `<g class="hs hz" data-k="${k}" tabindex="0" role="button" aria-label="Something in the lab"><path class="cable" d="M430 334 C 470 380, 520 360, 560 410 S 680 450, 760 400 L 800 395"/><circle class="hit" cx="${o.x}" cy="${o.y}" r="44"/><circle class="ring" cx="${o.x}" cy="${o.y}" r="40"/></g>`;
        if (o.plugs) return `<g class="hs hz" data-k="${k}" tabindex="0" role="button" aria-label="Something in the lab"><rect x="${o.x - 46}" y="${o.y}" width="92" height="22" rx="5" class="strip-p"/><text x="${o.x - 28}" y="${o.y - 2}" font-size="26">🔌</text><text x="${o.x}" y="${o.y - 8}" font-size="26">🔌</text><text x="${o.x + 28}" y="${o.y - 2}" font-size="26">🔌</text><text x="${o.x + 2}" y="${o.y - 40}" font-size="24">⚡</text><circle class="hit" cx="${o.x}" cy="${o.y - 6}" r="50"/><circle class="ring" cx="${o.x}" cy="${o.y - 6}" r="50"/></g>`;
        if (o.chair) return `<g class="hs hz" data-k="${k}" tabindex="0" role="button" aria-label="Something in the lab"><text x="${o.x}" y="${o.y + 82}" font-size="74">🪑</text><text x="${o.x}" y="${o.y + 26}" font-size="${o.s}">${o.e}</text><circle class="hit" cx="${o.x}" cy="${o.y + 36}" r="64"/><circle class="ring" cx="${o.x}" cy="${o.y + 36}" r="68"/></g>`;
        return em(o, 'hz', k);
      }).join('');
      const safe = SAFE.map((o, k) => em(o, 'sf', k)).join('');
      c.area.innerHTML = `
        <p class="count" id="cnt"></p>
        <div class="scene"><svg viewBox="0 0 800 460" role="img" aria-label="A computing lab with some hazards">
          <rect width="800" height="340" class="wall"/><rect y="340" width="800" height="120" class="floor"/>
          <rect x="30" y="130" width="100" height="210" rx="4" class="door"/><circle cx="116" cy="240" r="5" class="knob"/>
          <rect x="34" y="92" width="92" height="28" rx="4" class="exit"/><text x="80" y="107" font-size="15" class="exit-t">EXIT 🏃</text>
          <rect x="170" y="40" width="96" height="120" rx="6" class="poster"/><text x="218" y="78" font-size="13" class="poster-t">STAY SAFE</text><text x="218" y="98" font-size="13" class="poster-t">IN THE LAB!</text><text x="218" y="132" font-size="28">✅</text>
          <rect x="400" y="148" width="160" height="10" rx="3" class="shelf"/>
          <rect x="590" y="40" width="180" height="120" rx="6" class="window"/><line x1="680" y1="40" x2="680" y2="160" class="frame"/><line x1="590" y1="100" x2="770" y2="100" class="frame"/>
          <rect x="200" y="252" width="450" height="14" rx="4" class="desk"/><rect x="215" y="266" width="10" height="74" class="desk"/><rect x="625" y="266" width="10" height="74" class="desk"/>
          ${[220, 375, 520].map((x) => `<rect x="${x}" y="164" width="100" height="70" rx="6" class="mon"/><rect x="${x + 7}" y="171" width="86" height="56" rx="3" class="scr"/><rect x="${x + 44}" y="234" width="12" height="18" class="mon"/><rect x="${x + 14}" y="244" width="72" height="8" rx="2" class="kb"/>`).join('')}
          ${safe}${hz}
        </svg></div>`;
      const cnt = () => { $('#cnt', c.area).innerHTML = `Found: <b>${found.size} / ${H.length}</b> ${'⚠️'.repeat(found.size)}${'⬜'.repeat(H.length - found.size)}`; };
      const mark = () => $$('.hz', c.area).forEach((g) => g.classList.toggle('found', found.has(+g.dataset.k)));
      cnt(); mark();
      if (done) return;
      const fbEl = $('#fb');
      const say = (cls, html) => { fbEl.className = 'fb ' + cls; fbEl.innerHTML = html; };
      const hit = (g) => {
        const k = +g.dataset.k;
        if (g.classList.contains('sf')) { say('info', `👍 ${esc(SAFE[k].why)} Look for something dangerous.`); return; }
        if (found.has(k)) { say('info', `You already found this one: ${esc(H[k].why)}`); return; }
        found.add(k); mark(); cnt();
        if (found.size === H.length) { c.tryOk(); c.solved('You found all 7 hazards! ' + esc(H[k].why)); }
        else say('good', `⚠️ <b>Hazard found!</b> ${esc(H[k].why)}`);
      };
      $$('.hs', c.area).forEach((g) => {
        g.addEventListener('click', () => hit(g));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(g); } });
      });
    },
  };

  /* ───────── THE DOOR ───────── */
  function screenDoor() {
    if (nextLock()) return go('map');
    app.innerHTML = `
      <section class="card door-s">
        <p class="big-ic">🚪</p>
        <h2>The last lock!</h2>
        <p class="todo">👉 <b>What to do:</b> Put your 7 letters together to make a word. Type the word and tap <b>Open</b>.</p>
        <div class="letters">${LOCKS.map((l) => `<span style="--c:${l.color}">${l.letter}</span>`).join('')}</div>
        <div class="code"><input id="dIn" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="The secret word" placeholder="Type the word"><button class="btn big go" id="dGo">🔑 Open</button></div>
        <div class="fb" id="fb" aria-live="polite"></div>
        <button class="btn ghost" id="dBack">◀ Back to the locks</button>
      </section>`;
    const tryIt = () => {
      const v = $('#dIn').value.trim().toUpperCase();
      if (v === window.SECRET) { S.end = Date.now(); save(); go('escaped'); return; }
      const f = $('#fb'); f.className = 'fb bad shake'; f.innerHTML = '❌ Not quite. Read the letters from left to right. <b>Try again!</b>';
    };
    $('#dGo').addEventListener('click', tryIt);
    $('#dIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryIt(); });
    $('#dBack').addEventListener('click', () => go('map'));
    $('#dIn').focus();
  }

  /* ───────── ESCAPED ───────── */
  function screenEscaped() {
    const st = stars();
    app.innerHTML = `
      <section class="card cert">
        <p class="confetti" aria-hidden="true">🎉🎊🎉</p>
        <p class="kick">Certificate</p>
        <h2>${esc(names() || 'You')} escaped the lab!</h2>
        <p class="cls">${esc(S.cls)}</p>
        <p class="stars" aria-label="${st} stars">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</p>
        <p>Time: <b>${fmt(S.end - S.start)}</b> · Right first time: <b>${firstTry()} / ${TOTAL_TASKS}</b></p>
        <p class="word">${window.SECRET.split('').map((x) => `<span>${x}</span>`).join('')}</p>
      </section>
      <section class="card">
        <h2 class="h">✍️ One last thing</h2>
        <p class="todo">👉 <b>What to do:</b> Finish the sentence. Write it together. Then tap <b>Send to my teacher</b>.</p>
        <label class="promise"><span>We will show <b>RESPECT</b> online by…</span><textarea id="pr" rows="3" placeholder="e.g. …writing kind comments and telling an adult if I see cyberbullying.">${esc(S.promise)}</textarea></label>
        <div class="task-btns"><button class="btn go big" id="cSend">📋 Send to my teacher</button></div>
        <p class="small" id="cMsg" aria-live="polite"></p>
      </section>`;
    $('#pr').addEventListener('input', (e) => { S.promise = e.target.value; save(); });
    $('#cSend').addEventListener('click', openProgress);
  }

  /* ───────── report / modal ───────── */
  function report() {
    const lines = [
      'LOCKED IN THE LAB · Year 7 · Collaborating online respectfully',
      `Names: ${names() || '-'}    Class: ${S.cls || '-'}`,
      `Escaped: ${S.end ? 'YES' : 'not yet'}    Time: ${S.start ? fmt((S.end || Date.now()) - S.start) : '-'}    Locks open: ${S.opened.length} / ${LOCKS.length}`,
      `Right first time: ${firstTry()} / ${TOTAL_TASKS}${S.end ? `    Stars: ${stars()}` : ''}`,
      '',
    ];
    LOCKS.forEach((l, n) => {
      lines.push(`${n + 1}. ${l.letter} · ${l.name} — ${isOpen(l.id) ? 'OPEN' : 'locked'}`);
      l.tasks.forEach((t, i) => {
        const r = (S.log[l.id] || [])[i];
        lines.push(`   Task ${i + 1}: ${r && r.ok ? (r.wrong ? `done after ${r.wrong} mistake${r.wrong > 1 ? 's' : ''}` : 'right first time') : 'not done'}${r && r.hint ? ' (used hint)' : ''}`);
      });
    });
    lines.push('', `We will show RESPECT online by… ${S.promise.trim() || '(not written yet)'}`);
    return lines.join('\n');
  }

  let onClose = null;
  function openModal(html, cb) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; onClose = cb || null; const f = $('#modal button.btn, #modal textarea'); (f || $('#modalX')).focus(); }
  function closeModal() { $('#modal').hidden = true; const cb = onClose; onClose = null; if (cb) cb(); }
  $('#modalX').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

  function openProgress() {
    openModal(`
      <h2 class="h">📊 My answers</h2>
      <p class="todo">👉 Tap <b>Copy</b>, then paste it where your teacher asks (Classroom, Teams or email).</p>
      <textarea class="rep" id="rep" readonly rows="14">${esc(report())}</textarea>
      <div class="task-btns"><button class="btn go" id="pCopy">📋 Copy</button></div>
      <p class="small" id="pMsg" aria-live="polite"></p>
      <details class="reset"><summary>Start again from zero</summary><p class="small">This deletes all your answers on this device.</p><button class="btn danger" id="pReset">↺ Delete and start again</button></details>`);
    $('#pCopy').addEventListener('click', async () => {
      const ta = $('#rep'); let ok = false;
      try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) { ta.select(); try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } }
      $('#pMsg').textContent = ok ? '✅ Copied! Now paste it for your teacher.' : 'Select all the text and copy it.';
    });
    $('#pReset').addEventListener('click', () => { S = blank(); save(); closeModal(); go('start'); });
  }

  $('#btnProg').addEventListener('click', openProgress);
  $('#btnHelp').addEventListener('click', () => openModal(`<h2 class="h">❓ How to play</h2>${stepsHTML()}<p class="stuck">Stuck? Tap <b>💡 Hint</b>. Still stuck? Put your hand up ✋</p><div class="task-btns"><button class="btn go" id="hOk">OK, got it!</button></div>`));
  document.addEventListener('click', (e) => { if (e.target.id === 'hOk') closeModal(); });
  $('#btnHome').addEventListener('click', () => go('start'));

  render();
})();
