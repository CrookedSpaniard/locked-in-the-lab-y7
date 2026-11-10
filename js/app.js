(() => {
  'use strict';
  const KEY = 'lockedLab.y7.v2';
  const LOCKS = window.LOCKS;
  const EXTRA = window.EXTRA || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const extra = (id, i) => ((EXTRA[id] || {}).tasks || [])[i] || {};
  const TOTAL_TASKS = LOCKS.reduce((n, l) => n + l.tasks.length, 0);
  const MAX_PTS = TOTAL_TASKS * 100;

  /* ───────── points ─────────
     no hints 100 · hint 1 70 · hint 2 40 · help us through 10
     every mistake takes away 10, but never below the floor of that level */
  const BASE = [100, 70, 40], FLOOR = [75, 45, 15], HELP_PTS = 10;
  const worth = (r) => (r.helped ? HELP_PTS : Math.max(FLOOR[r.hints], BASE[r.hints] - 10 * r.wrong));

  /* ───────── saved state ───────── */
  const blank = () => ({ v: 2, size: 2, names: ['', '', ''], cls: '', start: 0, end: 0, log: {}, opened: [], promise: '', screen: 'start', lock: null, task: 0 });
  let S = load();
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 2) return Object.assign(blank(), s); } catch (e) { /* storage blocked */ }
    return blank();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } }
  const rec = (id, i) => { S.log[id] = S.log[id] || []; return (S.log[id][i] = S.log[id][i] || { wrong: 0, hints: 0, helped: false, ok: false, pts: 0 }); };
  const isOpen = (id) => S.opened.includes(id);
  const nextLock = () => LOCKS.find((l) => !isOpen(l.id));
  const team = () => S.names.slice(0, S.size).map((n) => (n || '').trim()).filter(Boolean);
  const teamTxt = () => { const t = team(); return t.length > 1 ? `${t.slice(0, -1).join(', ')} & ${t[t.length - 1]}` : t[0] || ''; };
  const allRecs = () => LOCKS.flatMap((l) => (S.log[l.id] || []).filter(Boolean));
  const score = () => allRecs().reduce((n, r) => n + (r.ok ? r.pts : 0), 0);
  const perfect = () => allRecs().filter((r) => r.ok && r.pts === 100).length;
  const stars = () => { const f = score() / MAX_PTS; return f >= 0.8 ? 3 : f >= 0.55 ? 2 : 1; };

  const app = $('#app');

  /* ───────── header ───────── */
  function drawTop() {
    $('#strip').innerHTML = LOCKS.map((l) => `<span class="sl ${isOpen(l.id) ? 'on' : ''}" style="--c:${l.color}" title="${esc(l.name)}">${isOpen(l.id) ? l.letter : '🔒'}</span>`).join('');
    const p = $('#points'); p.hidden = !S.start; p.querySelector('b').textContent = score();
    $('#btnSave').hidden = !S.start;
    $('#btnReset').hidden = !S.start;
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
    drawTop(); tick();
    if (S.screen === 'lock' && S.lock && LOCKS.find((l) => l.id === S.lock)) return screenLock();
    if (S.screen === 'door') return screenDoor();
    if (S.screen === 'escaped' && S.end) return screenEscaped();
    if (S.screen === 'map' && S.start) return screenMap();
    return screenStart();
  }

  /* ───────── START ───────── */
  const STEPS = [
    ['👥', 'Work in a team of 2 or 3. Write all your names.'],
    ['🔒', 'Tap the glowing lock and do the tasks.'],
    ['🔤', 'Each lock gives you a letter.'],
    ['🚪', 'Use the 7 letters to open the door!'],
  ];
  const stepsHTML = () => `<ol class="steps">${STEPS.map(([e, t], i) => `<li><span class="n">${i + 1}</span><span class="e">${e}</span><b>${t}</b></li>`).join('')}</ol>`;
  const pointsHTML = () => `
    <div class="pts-table">
      <div><span>🌟</span><b>No hints</b><em>100 points</em></div>
      <div><span>💡</span><b>Hint 1</b><em>70 points</em></div>
      <div><span>💡💡</span><b>Hint 2</b><em>40 points</em></div>
      <div><span>🆘</span><b>Help us through</b><em>10 points</em></div>
    </div>
    <p class="small center">Every mistake takes away 10 points. Think together before you tap!</p>`;

  function screenStart() {
    const going = S.start && !S.end;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-txt">
          <p class="kick">Escape room · Year 7 · Teams of 2 or 3</p>
          <h1>Locked in the Lab 🔒</h1>
          <p class="story">Oh no! The door of the computing lab is locked. Work as a team to open the <b>7 locks</b> and escape!</p>
        </div>
        <div class="door-art" aria-hidden="true"><span>🚪</span><i>🔒</i></div>
      </section>

      <section class="card">
        <h2 class="h">How to play</h2>
        ${stepsHTML()}
      </section>

      <section class="card">
        <h2 class="h">🏆 How to win points</h2>
        <p>Every task is worth up to <b>100 points</b>. If you are stuck, you can ask for help, but the task gives you fewer points:</p>
        ${pointsHTML()}
      </section>

      <section class="card who">
        <h2 class="h">✏️ Your team</h2>
        <div class="fld"><span>How many people are in your team?</span>
          <div class="seg" id="seg"><button data-n="2">👥 2 people</button><button data-n="3">👥👤 3 people</button></div></div>
        <div class="names" id="names"></div>
        <label class="cls-l"><span>🏫 Class</span><input id="sCls" placeholder="e.g. 7B" value="${esc(S.cls)}"></label>
        <p class="msg" id="sMsg" aria-live="polite"></p>
        <button class="btn big go" id="sGo">${going ? '▶ Keep going' : S.end ? '🏆 See our certificate' : '▶ Start the escape room'}</button>
        <p class="small center">Did you start on another day or another device? <button class="link" id="sCode">🔑 Continue with a code</button></p>
      </section>

      <p class="foot">Your answers are saved on this device. Never type real passwords here.<br>
      Based on the Teach Computing Curriculum (National Centre for Computing Education · Raspberry Pi Foundation), Year 7 “Impact of technology – Collaborating online respectfully”, Open Government Licence v3.0. Made for the British School Alzira · Xàtiva · Gandia Group.</p>`;

    const drawNames = () => {
      $$('#seg button').forEach((b) => { const on = +b.dataset.n === S.size; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $('#names').innerHTML = Array.from({ length: S.size }, (_, i) => `<label><span>Person ${i + 1}</span><input data-i="${i}" autocomplete="off" placeholder="First name and surname" value="${esc(S.names[i])}"></label>`).join('');
      $$('#names input').forEach((inp) => inp.addEventListener('input', () => { S.names[+inp.dataset.i] = inp.value; save(); }));
    };
    $$('#seg button').forEach((b) => b.addEventListener('click', () => { S.size = +b.dataset.n; save(); drawNames(); }));
    drawNames();
    $('#sCls').addEventListener('input', (e) => { S.cls = e.target.value; save(); });
    $('#sCode').addEventListener('click', openLoad);
    $('#sGo').addEventListener('click', () => {
      const empty = $$('#names input').find((i) => !i.value.trim());
      if (empty) { $('#sMsg').textContent = `✏️ Write the name of person ${+empty.dataset.i + 1}.`; empty.focus(); return; }
      if (S.end) return go('escaped');
      if (!S.start) S.start = Date.now();
      go('map');
    });
  }

  /* ───────── MAP ───────── */
  function screenMap() {
    const nx = nextLock();
    app.innerHTML = `
      <section class="card map">
        <p class="team-line">👥 <b>${esc(teamTxt())}</b> · 🏆 <b>${score()}</b> points</p>
        <p class="todo">👉 ${nx ? 'Tap the <b>glowing lock</b> to start. Open the locks in order, from 1 to 7.' : 'All the locks are open! Now go to the door.'}</p>
        <div class="locks">
          ${LOCKS.map((l, i) => {
            const open = isOpen(l.id), cur = nx && nx.id === l.id;
            const pts = (S.log[l.id] || []).reduce((n, r) => n + (r && r.ok ? r.pts : 0), 0);
            return `<button class="lock ${open ? 'open' : ''} ${cur ? 'cur' : ''}" data-id="${l.id}" style="--c:${l.color}" ${!open && !cur ? 'disabled' : ''}>
              <span class="lk-n">Lock ${i + 1}</span>
              <span class="lk-ic">${open ? '🔓' : cur ? l.icon : '🔒'}</span>
              <b>${esc(l.name)}</b>
              <span class="lk-l">${open ? `Letter: <em>${l.letter}</em> · ${pts} pts` : cur ? 'Open me!' : 'Locked'}</span>
            </button>`;
          }).join('')}
        </div>
        ${nx ? '' : '<button class="btn big go" id="toDoor">🚪 Go to the door</button>'}
        <p class="small center">Need to stop? Tap <b>💾 Save</b> at the top to get a code, so you can carry on another day.</p>
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
    const X = extra(L.id, i);
    const r = rec(L.id, i);
    app.innerHTML = `
      <section class="card task" style="--c:${L.color}">
        <div class="task-head">
          <span class="t-ic">${L.icon}</span>
          <div><small>${esc(L.lesson)}</small><h2>${esc(L.name)}</h2></div>
          <div class="dots" aria-label="Task ${i + 1} of ${L.tasks.length}">${L.tasks.map((_, k) => `<span class="${(S.log[L.id] || [])[k]?.ok ? 'd' : ''} ${k === i ? 'c' : ''}"></span>`).join('')}<small>Task ${i + 1} of ${L.tasks.length}</small></div>
        </div>
        ${i === 0 && EXTRA[L.id] ? `<p class="intro">${esc(EXTRA[L.id].intro)}</p>` : ''}
        <p class="todo">👉 <b>What to do:</b> ${esc(T.todo)}</p>
        <div class="q-row"><h3 class="q">${esc(T.q)}</h3><span class="worth" id="worth"></span></div>
        <div id="area"></div>
        <div class="hints" id="hints"></div>
        <div class="fb" id="fb" aria-live="polite"></div>
        <div class="learn" id="learn" hidden></div>
        <div class="task-btns">
          <button class="btn ghost" id="tBack">◀ Back to the locks</button>
          <button class="btn hint-b" id="tHint"></button>
          <button class="btn go" id="tCheck" hidden>✔ Check</button>
          <button class="btn go" id="tNext" hidden></button>
        </div>
      </section>`;
    $('#tBack').addEventListener('click', () => go('map'));

    const drawHelp = () => {
      $('#worth').innerHTML = r.ok ? `+${r.pts} points` : `Worth: <b>${worth(r)}</b> points`;
      $('#hints').innerHTML = [
        r.hints >= 1 ? `<p class="hint">💡 <b>Hint 1:</b> ${esc(T.hint)}</p>` : '',
        r.hints >= 2 ? `<p class="hint">💡 <b>Hint 2:</b> ${esc(X.hint2 || T.hint)}</p>` : '',
      ].join('');
      const b = $('#tHint');
      b.hidden = r.ok;
      b.textContent = r.hints === 0 ? '💡 Hint 1 (task worth 70)' : r.hints === 1 ? '💡 Hint 2 (task worth 40)' : '🆘 Help us through (10 points)';
      b.classList.toggle('sos', r.hints >= 2);
    };
    const fb = (kind, html) => { const f = $('#fb'); f.className = 'fb ' + kind; f.innerHTML = html; if (kind === 'bad') { void f.offsetWidth; f.classList.add('shake'); } };

    const ctx = {
      area: $('#area'), task: T, check: $('#tCheck'),
      wrong(msg) {
        if (r.ok) return;
        r.wrong++; save(); drawHelp();
        const nudge = r.hints < 2 && r.wrong >= 2 ? ' Stuck? Try a <b>💡 hint</b>.' : r.hints >= 2 && r.wrong >= 2 ? ' Still stuck? You can use <b>🆘 Help us through</b>.' : '';
        fb('bad', `❌ Not quite. ${msg || ''} <b>Try again!</b> <span class="minus">−10 points</span>${nudge}`);
      },
      solved(msg) {
        if (!r.ok) { r.ok = true; r.pts = worth(r); save(); drawTop(); }
        $('#tCheck').hidden = true; drawHelp();
        fb('good', `✅ <b>${r.helped ? 'Here are the answers.' : 'Well done!'}</b> ${r.helped ? 'Read them carefully.' : msg || ''} <span class="plus">+${r.pts} points</span>`);
        if (X.learn) { const lr = $('#learn'); lr.hidden = false; lr.innerHTML = `<b>🧠 Remember</b><p>${esc(X.learn)}</p>`; }
        const last = i === L.tasks.length - 1;
        const n = $('#tNext'); n.hidden = false;
        n.textContent = last ? (isOpen(L.id) ? '◀ Back to the locks' : '🔓 Open the lock!') : 'Next task ▶';
        n.onclick = () => {
          if (!last) return go('lock', L.id, i + 1);
          if (isOpen(L.id)) return go('map');
          S.opened.push(L.id); save(); unlocked(L);
        };
      },
    };

    $('#tHint').addEventListener('click', () => {
      if (r.ok) return;
      if (r.hints < 2) { r.hints++; save(); drawHelp(); const h = $('#hints').lastElementChild; if (h) h.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
      fb('info', `🆘 <b>Are you sure?</b> You will see the answers and this task will give you only <b>10 points</b>.
        <span class="sos-btns"><button class="btn sos" id="sosYes">Yes, show us</button><button class="btn ghost" id="sosNo">No, we will try again</button></span>`);
      $('#sosYes').addEventListener('click', () => { r.helped = true; save(); TYPES[T.type](ctx, true); ctx.solved(); });
      $('#sosNo').addEventListener('click', () => { $('#fb').className = 'fb'; $('#fb').innerHTML = ''; });
    });

    drawHelp();
    if (r.ok) { TYPES[T.type](ctx, true); ctx.solved('You already did this one.'); return; }
    TYPES[T.type](ctx, false);
  }

  function unlocked(L) {
    drawTop();
    const pts = (S.log[L.id] || []).reduce((n, r) => n + (r && r.ok ? r.pts : 0), 0);
    openModal(`
      <div class="unlock" style="--c:${L.color}">
        <p class="big-ic">🔓</p>
        <h2>Lock open!</h2>
        <p>You found the letter</p>
        <p class="letter">${L.letter}</p>
        <p><b>+${pts} points</b> in this lock · Total: <b>${score()}</b></p>
        <p class="small">Remember the letter! You need all 7 letters to open the door.</p>
        <button class="btn big go" id="uOk">${nextLock() ? 'Next lock ▶' : '🚪 Go to the door'}</button>
      </div>`, () => go(nextLock() ? 'map' : 'door'));
    $('#uOk').addEventListener('click', closeModal);
  }

  /* ───────── task types (done = show the answers) ───────── */
  const TYPES = {
    choice(c, done) {
      const T = c.task;
      const opts = T.cols ? T.options.map((o, k) => ({ o, k })) : shuffle(T.options.map((o, k) => ({ o, k })));
      c.area.innerHTML = `<div class="opts ${T.cols ? 'cols' : ''}">${opts.map(({ o, k }) => `<button class="opt" data-k="${k}">${o.html ? `<span class="opt-l">${esc(o.label)}</span>${o.html}` : esc(o.t)}</button>`).join('')}</div>`;
      const btns = $$('.opt', c.area);
      if (done) { btns.forEach((b) => { b.disabled = true; if (T.options[b.dataset.k].ok) b.classList.add('right'); }); return; }
      btns.forEach((b) => b.addEventListener('click', () => {
        const o = T.options[b.dataset.k];
        if (o.ok) { btns.forEach((x) => (x.disabled = true)); b.classList.add('right'); c.solved(o.why); }
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
      const showWhy = (el, it) => { if (it.why) { const w = $('.it-why', el); w.hidden = false; w.textContent = '💡 ' + it.why; } };
      const setBtn = () => { c.check.disabled = Object.keys(pick).length < items.filter((el) => !el.classList.contains('right')).length; };
      if (done) { items.forEach((el) => { const it = T.items[+el.dataset.k]; el.classList.remove('wrong'); el.classList.add('right'); showWhy(el, it); $$('.bin', el).forEach((b) => { b.disabled = true; b.classList.toggle('sel', +b.dataset.j === it.bin); }); }); return; }
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
          if (pick[k] === it.bin) { el.classList.add('right'); $$('.bin', el).forEach((x) => (x.disabled = true)); showWhy(el, it); }
          else { bad++; el.classList.add('wrong'); $$('.bin', el).forEach((x) => x.classList.remove('sel')); }
          delete pick[k];
        });
        setBtn();
        if (bad) c.wrong(`${bad} ${bad === 1 ? 'answer is' : 'answers are'} in red. Change ${bad === 1 ? 'it' : 'them'}.`);
        else c.solved('Everything is in the right place.');
      };
    },

    order(c, done) {
      const T = c.task;
      const slots = T.slots.map(() => null);
      const fixed = T.slots.map(() => false);
      const pool = shuffle(T.items.map((_, k) => k));
      c.area.innerHTML = `<div class="order"><ol class="slots"></ol><p class="pool-l">Tap a sentence to add it. Tap it again to take it out.</p><div class="pool"></div></div>`;
      const draw = () => {
        $('.slots', c.area).innerHTML = T.slots.map((s, i) => `<li class="slot ${slots[i] !== null ? 'full' : ''} ${fixed[i] ? 'right' : ''}"><span class="s-l">${esc(s)}</span>${slots[i] !== null ? `<button class="s-it" data-i="${i}" ${fixed[i] || done ? 'disabled' : ''}>${esc(T.items[slots[i]])}${fixed[i] || done ? '' : ' <i>✕</i>'}</button>` : '<span class="s-empty">…</span>'}</li>`).join('');
        $('.pool', c.area).innerHTML = pool.filter((k) => !slots.includes(k)).map((k) => `<button class="p-it" data-k="${k}">${esc(T.items[k])}</button>`).join('');
        $('.pool-l', c.area).hidden = !$('.pool', c.area).children.length;
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
        if (bad) c.wrong('The green ones are right. Put the others back in.');
        else c.solved('Perfect order!');
      };
    },

    fill(c, done) {
      const T = c.task;
      const pick = {};
      c.area.innerHTML = `<div class="email fill">${T.parts.map((p, i) => p.text
        ? `<p class="f-text">${esc(p.text)}</p>`
        : `<div class="f-row" data-i="${i}"><span class="f-l">${esc(p.label)}</span><div class="f-opts">${p.options.map((o, j) => `<button class="f-o" data-j="${j}">${esc(o)}</button>`).join('')}</div></div>`).join('')}</div>`;
      const rows = $$('.f-row', c.area);
      const setBtn = () => { c.check.disabled = Object.keys(pick).length < rows.filter((r) => !r.classList.contains('right')).length; };
      if (done) { rows.forEach((r) => { const p = T.parts[r.dataset.i]; r.classList.remove('wrong'); r.classList.add('right'); $$('.f-o', r).forEach((b) => { b.disabled = true; b.classList.toggle('sel', +b.dataset.j === p.answer); }); }); return; }
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
          else { bad++; r.classList.add('wrong'); $$('.f-o', r).forEach((x) => x.classList.remove('sel')); }
          delete pick[i];
        });
        setBtn();
        if (bad) c.wrong('Change the boxes in red.');
        else c.solved('That is a polite, clear email. Mr Smith will be happy to help!');
      };
    },

    build(c, done) {
      const T = c.task;
      const words = [], st = { num: null, won: false };
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
        if (ok && !done && !st.won) { st.won = true; $$('.tile', c.area).forEach((b) => (b.disabled = true)); c.solved('Three random words and a number make a long, strong password.'); }
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
      const lbl = 'aria-label="Something in the lab" tabindex="0" role="button"';
      const em = (o, cls, k) => `<g class="hs ${cls}" data-k="${k}" ${lbl}>
          <circle class="hit" cx="${o.x}" cy="${o.y}" r="${(o.s || 50) * 0.75}"/>
          <text x="${o.x}" y="${o.y}" font-size="${o.s}">${o.e}</text>
          <circle class="ring" cx="${o.x}" cy="${o.y}" r="${(o.s || 50) * 0.8}"/></g>`;
      const hz = H.map((o, k) => {
        if (o.cable) return `<g class="hs hz" data-k="${k}" ${lbl}><path class="cable" d="M430 334 C 470 380, 520 360, 560 410 S 680 450, 760 400 L 800 395"/><circle class="hit" cx="${o.x}" cy="${o.y}" r="44"/><circle class="ring" cx="${o.x}" cy="${o.y}" r="40"/></g>`;
        if (o.plugs) return `<g class="hs hz" data-k="${k}" ${lbl}><rect x="${o.x - 46}" y="${o.y}" width="92" height="22" rx="5" class="strip-p"/><text x="${o.x - 28}" y="${o.y - 2}" font-size="26">🔌</text><text x="${o.x}" y="${o.y - 8}" font-size="26">🔌</text><text x="${o.x + 28}" y="${o.y - 2}" font-size="26">🔌</text><text x="${o.x + 2}" y="${o.y - 40}" font-size="24">⚡</text><circle class="hit" cx="${o.x}" cy="${o.y - 6}" r="50"/><circle class="ring" cx="${o.x}" cy="${o.y - 6}" r="50"/></g>`;
        if (o.chair) return `<g class="hs hz" data-k="${k}" ${lbl}><text x="${o.x}" y="${o.y + 82}" font-size="74">🪑</text><text x="${o.x}" y="${o.y + 26}" font-size="${o.s}">${o.e}</text><circle class="hit" cx="${o.x}" cy="${o.y + 36}" r="64"/><circle class="ring" cx="${o.x}" cy="${o.y + 36}" r="68"/></g>`;
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
      const say = (cls, html) => { const f = $('#fb'); f.className = 'fb ' + cls; f.innerHTML = html; };
      const hit = (g) => {
        const k = +g.dataset.k;
        if (g.classList.contains('sf')) { say('info', `👍 ${esc(SAFE[k].why)} Look for something dangerous.`); return; }
        if (found.has(k)) { say('info', `You already found this one: ${esc(H[k].why)}`); return; }
        found.add(k); mark(); cnt();
        if (found.size === H.length) c.solved('You found all 7 hazards! ' + esc(H[k].why));
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
        <p class="todo">👉 <b>What to do:</b> Put your 7 letters together to make a word. Type the word in the box and tap <b>Open</b>.</p>
        <div class="letters">${LOCKS.map((l) => `<span style="--c:${l.color}">${l.letter}</span>`).join('')}</div>
        <div class="code"><input id="dIn" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="The secret word" placeholder="Type the word"><button class="btn big go" id="dGo">🔑 Open</button></div>
        <div class="fb" id="fb" aria-live="polite"></div>
        <button class="btn ghost" id="dBack">◀ Back to the locks</button>
      </section>`;
    const tryIt = () => {
      const v = $('#dIn').value.trim().toUpperCase();
      if (v === window.SECRET) { S.end = Date.now(); save(); go('escaped'); return; }
      const f = $('#fb'); f.className = 'fb bad'; void f.offsetWidth; f.classList.add('shake'); f.innerHTML = '❌ Not quite. Read the letters from left to right. <b>Try again!</b>';
    };
    $('#dGo').addEventListener('click', tryIt);
    $('#dIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryIt(); });
    $('#dBack').addEventListener('click', () => go('map'));
    $('#dIn').focus();
  }

  /* ───────── ESCAPED ───────── */
  const sendSteps = () => `
    <ol class="send">
      <li><span class="n">1</span><div><b>Tap “📋 Copy our results”.</b> All your answers and points are copied.</div></li>
      <li><span class="n">2</span><div><b>Open Google Classroom</b> and find the escape room assignment from your teacher.</div></li>
      <li><span class="n">3</span><div><b>Paste</b> the results in a <b>private comment</b> (press and hold, then Paste, or Ctrl + V / ⌘ + V) and tap <b>Hand in</b>. Only ONE person in the team needs to do this.</div></li>
    </ol>`;

  function screenEscaped() {
    const st = stars();
    app.innerHTML = `
      <section class="card cert">
        <p class="confetti" aria-hidden="true">🎉🎊🎉</p>
        <p class="kick">Certificate</p>
        <h2>${esc(teamTxt() || 'You')} escaped the lab!</h2>
        <p class="cls">${esc(S.cls)}</p>
        <p class="stars" aria-label="${st} stars">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</p>
        <p class="score-big">🏆 ${score()} <small>/ ${MAX_PTS} points</small></p>
        <p>Time: <b>${fmt(S.end - S.start)}</b> · Tasks with no help: <b>${perfect()} / ${TOTAL_TASKS}</b></p>
        <p class="word">${window.SECRET.split('').map((x) => `<span>${x}</span>`).join('')}</p>
      </section>
      <section class="card">
        <h2 class="h">✍️ Step 1: one last question</h2>
        <p class="todo">👉 <b>What to do:</b> Talk as a team and finish the sentence together.</p>
        <label class="promise"><span>We will show <b>RESPECT</b> online by…</span><textarea id="pr" rows="3" placeholder="e.g. …writing kind comments and telling an adult if we see cyberbullying.">${esc(S.promise)}</textarea></label>
      </section>
      <section class="card send-card">
        <h2 class="h">📤 Step 2: send your results to your teacher</h2>
        ${sendSteps()}
        <div class="task-btns center"><button class="btn go big" id="cCopy">📋 Copy our results</button></div>
        <p class="copied" id="cMsg" aria-live="polite"></p>
        <details class="see"><summary>See what will be sent</summary><textarea class="rep" id="cRep" readonly rows="12"></textarea></details>
      </section>`;
    const upd = () => { $('#cRep').value = report(); };
    upd();
    $('#pr').addEventListener('input', (e) => { S.promise = e.target.value; save(); upd(); });
    $('#cCopy').addEventListener('click', async () => {
      if (!S.promise.trim()) { $('#cMsg').className = 'copied bad'; $('#cMsg').textContent = '✍️ First, finish the sentence in Step 1.'; $('#pr').focus(); return; }
      const ok = await copyText(report(), $('#cRep'));
      $('#cMsg').className = 'copied ' + (ok ? 'good' : 'bad');
      $('#cMsg').textContent = ok ? '✅ Copied! Now open Google Classroom and paste it in a private comment.' : 'Open “See what will be sent”, select all the text and copy it.';
    });
  }

  /* ───────── report ───────── */
  function report() {
    const lines = [
      'LOCKED IN THE LAB · Year 7 · Collaborating online respectfully',
      `Team: ${teamTxt() || '-'}    Class: ${S.cls || '-'}`,
      `Escaped: ${S.end ? 'YES' : 'not yet'}    Time: ${S.start ? fmt((S.end || Date.now()) - S.start) : '-'}    Locks open: ${S.opened.length} / ${LOCKS.length}`,
      `POINTS: ${score()} / ${MAX_PTS}    Tasks with no help: ${perfect()} / ${TOTAL_TASKS}${S.end ? `    Stars: ${stars()}` : ''}`,
      '',
    ];
    LOCKS.forEach((l, n) => {
      lines.push(`${n + 1}. ${l.letter} · ${l.name} — ${isOpen(l.id) ? 'OPEN' : 'locked'}`);
      l.tasks.forEach((t, i) => {
        const r = (S.log[l.id] || [])[i];
        if (!r || !r.ok) { lines.push(`   Task ${i + 1}: not done`); return; }
        const how = r.helped ? 'Help us through' : r.hints === 2 ? 'hint 1 + hint 2' : r.hints === 1 ? 'hint 1' : 'no hints';
        lines.push(`   Task ${i + 1}: ${String(r.pts).padStart(3)} pts — ${how}, ${r.wrong} mistake${r.wrong === 1 ? '' : 's'}`);
      });
    });
    lines.push('', `We will show RESPECT online by… ${S.promise.trim() || '(not written yet)'}`);
    return lines.join('\n');
  }
  async function copyText(txt, ta) {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) { /* fall back */ }
    try { if (ta) { const d = ta.closest('details'); if (d) d.open = true; ta.value = txt; ta.select(); return document.execCommand('copy'); } } catch (e) { /* ignore */ }
    return false;
  }

  /* ───────── progress code (continue on another day or device) ───────── */
  const b64 = (bytes) => { let s = ''; bytes.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0)); };
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0').slice(0, 5).toUpperCase(); };
  const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
  async function makeCode() {
    let bytes = new TextEncoder().encode(JSON.stringify(S)), z = '0';
    if (window.CompressionStream) { bytes = await pipe(bytes, new CompressionStream('gzip')); z = 'Z'; }
    const body = z + b64(bytes);
    return `LAB-${body}-${hash(body)}`;
  }
  async function readCode(code) {
    const clean = String(code || '').replace(/\s+/g, '');
    const m = /^LAB-([0Z][A-Za-z0-9_-]+)-([0-9A-F]{5})$/.exec(clean);
    if (!m) throw new Error('This does not look like a code from this escape room. It should start with LAB-.');
    if (hash(m[1]) !== m[2]) throw new Error('The code is incomplete or has a mistake. Copy the whole code again.');
    let bytes = unb64(m[1].slice(1));
    if (m[1][0] === 'Z') {
      if (!window.DecompressionStream) throw new Error('This browser is too old to read the code. Try Chrome, Edge or Safari.');
      bytes = await pipe(bytes, new DecompressionStream('gzip'));
    }
    const s = JSON.parse(new TextDecoder().decode(bytes));
    if (!s || s.v !== 2) throw new Error('This code is from a different activity.');
    return s;
  }

  async function openSave() {
    openModal(`
      <h2 class="h">💾 Save to continue later</h2>
      <p>Your progress is saved on <b>this device</b> automatically. If you want to continue <b>another day</b> or on <b>another device</b>, keep this code:</p>
      <ol class="send">
        <li><span class="n">1</span><div>Tap <b>📋 Copy the code</b>.</div></li>
        <li><span class="n">2</span><div>Paste it somewhere safe: an email to yourself, or a private comment in Google Classroom.</div></li>
        <li><span class="n">3</span><div>Next time, open the escape room, tap <b>🔑 Continue with a code</b> on the first page and paste it.</div></li>
      </ol>
      <textarea class="rep code-box" id="sv" readonly rows="4">Making your code…</textarea>
      <div class="task-btns"><button class="btn go" id="svCopy">📋 Copy the code</button></div>
      <p class="copied" id="svMsg" aria-live="polite"></p>`);
    const code = await makeCode();
    $('#sv').value = code;
    $('#svCopy').addEventListener('click', async () => {
      const ok = await copyText(code, $('#sv'));
      $('#svMsg').className = 'copied ' + (ok ? 'good' : 'bad');
      $('#svMsg').textContent = ok ? '✅ Code copied! Paste it somewhere safe.' : 'Select all the code and copy it.';
    });
  }

  function openLoad() {
    openModal(`
      <h2 class="h">🔑 Continue with a code</h2>
      <p>Paste the code you saved last time (it starts with <b>LAB-</b>) and tap <b>Continue</b>.</p>
      <textarea class="rep code-box" id="ld" rows="4" placeholder="LAB-…"></textarea>
      <div class="task-btns"><button class="btn go" id="ldGo">▶ Continue</button></div>
      <p class="copied" id="ldMsg" aria-live="polite"></p>`);
    $('#ldGo').addEventListener('click', async () => {
      try {
        const s = await readCode($('#ld').value);
        S = Object.assign(blank(), s); save();
        closeModal(); go(S.end ? 'escaped' : 'map');
      } catch (e) { $('#ldMsg').className = 'copied bad'; $('#ldMsg').textContent = '❌ ' + e.message; }
    });
  }

  /* ───────── modal ───────── */
  let onClose = null;
  function openModal(html, cb) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; onClose = cb || null; const f = $('#modal .btn.go, #modal textarea'); (f || $('#modalX')).focus(); }
  function closeModal() { $('#modal').hidden = true; const cb = onClose; onClose = null; if (cb) cb(); }
  $('#modalX').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

  function openProgress() {
    openModal(`
      <h2 class="h">📊 Our answers</h2>
      <p>Here you can see your points. When you finish the escape room, send this to your teacher:</p>
      ${sendSteps()}
      <textarea class="rep" id="rep" readonly rows="12">${esc(report())}</textarea>
      <div class="task-btns"><button class="btn go" id="pCopy">📋 Copy our results</button></div>
      <p class="copied" id="pMsg" aria-live="polite"></p>
      <div class="task-btns"><button class="btn danger" id="pReset">↺ New team: start again</button></div>`);
    $('#pCopy').addEventListener('click', async () => {
      const ok = await copyText(report(), $('#rep'));
      $('#pMsg').className = 'copied ' + (ok ? 'good' : 'bad');
      $('#pMsg').textContent = ok ? '✅ Copied! Paste it in a private comment in Google Classroom.' : 'Select all the text and copy it.';
    });
    $('#pReset').addEventListener('click', openReset);
  }

  /* ───────── start again (new team) ───────── */
  function openReset() {
    openModal(`
      <h2 class="h">↺ Start again with a new team</h2>
      <p>This deletes <b>everything</b> on this device:</p>
      <ul class="small"><li>the names of the team</li><li>the timer (it goes back to 00:00)</li><li>all the open locks, answers and points</li></ul>
      <p>Do you want to keep your work? Tap <b>💾 Save</b> first and keep the code.</p>
      <div class="task-btns"><button class="btn danger" id="rsYes">↺ Yes, delete and start again</button><button class="btn" id="rsNo">No, go back</button></div>`);
    $('#rsYes').addEventListener('click', () => {
      S = blank(); save(); closeModal(); go('start');
      const n = document.querySelector('#app input'); if (n) n.focus();
    });
    $('#rsNo').addEventListener('click', closeModal);
  }

  const helpHTML = () => `<h2 class="h">❓ How to play</h2>${stepsHTML()}
    <h3 class="h3">🏆 Points</h3>${pointsHTML()}
    <h3 class="h3">💾 Saving</h3><p>Everything is saved on this device. To continue another day or on another device, tap <b>💾 Save</b> and keep the code.</p>
    <h3 class="h3">📤 At the end</h3><p>Copy your results and paste them in a private comment in <b>Google Classroom</b>.</p>
    <div class="task-btns"><button class="btn go" id="hOk">OK, got it!</button></div>`;

  $('#btnProg').addEventListener('click', openProgress);
  $('#btnSave').addEventListener('click', openSave);
  $('#btnReset').addEventListener('click', openReset);
  $('#btnHelp').addEventListener('click', () => { openModal(helpHTML()); $('#hOk').addEventListener('click', closeModal); });
  $('#btnHome').addEventListener('click', () => go('start'));

  render();
})();
