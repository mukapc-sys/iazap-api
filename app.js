/* ==========================================================
   IA ZAP — helpers globais e componentes compartilhados
   Toda página carrega: config.js → app.css → app.js
   ========================================================== */

const IZ = {
  token() { return localStorage.getItem('iz_token') || ''; },
  save(t) { localStorage.setItem('iz_token', t); },
  clear() { localStorage.removeItem('iz_token'); sessionStorage.removeItem('iz_me'); },
  meCache() { try { return JSON.parse(sessionStorage.getItem('iz_me') || 'null'); } catch { return null; } },
};

function requireAuth() {
  if (!IZ.token()) { location.href = 'login.html'; return false; }
  return true;
}

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (IZ.token() && !opts.noAuth) headers.Authorization = 'Bearer ' + IZ.token();
  const init = { method: opts.method || 'GET', headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  let r;
  try { r = await fetch(window.API + path, init); }
  catch { throw new Error('Sem conexão com o servidor. Verifique sua internet.'); }
  const txt = await r.text();
  let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
  if (r.status === 401 && !opts.noAuth) {
    IZ.clear();
    if (!location.pathname.endsWith('login.html')) location.href = 'login.html';
    throw new Error('Sessão expirada');
  }
  if (r.status === 403 && data.code === 'bloqueada') {
    IZ.clear();
    location.href = 'login.html?bloqueada=1';
    throw new Error('Conta bloqueada');
  }
  if (!r.ok) throw new Error(cap(data.error || data.message || `Erro ${r.status}`));
  return data;
}

// Carrega /me e manda para o onboarding se a configuração inicial não terminou.
async function loadMe({ skipOnboarding = false } = {}) {
  const me = await api('/api/auth/me');
  sessionStorage.setItem('iz_me', JSON.stringify(me));
  if (!skipOnboarding && (!me.account.modelo || !me.account.onboarding_ok)) {
    location.href = 'onboarding.html';
    throw new Error('onboarding');
  }
  return me;
}

// ---------- ícones ----------
const I = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.8 7L4 20.5l1.5-5A8 8 0 1 1 21 12z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5 20 19M8.5 16.5 20 5"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  bike: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17 9 9h6l3.5 8M9 9 7.5 5.5H5M15 9l-3 8"/>',
  store: '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 11v10h14V11"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  send: '<path d="M4 12 20 4l-4 16-4-6.5z"/><path d="m12 13.5 8-9.5"/>',
  clip: '<path d="m20 11.5-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};
function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ''}</svg>`;
}
function logoHTML() {
  return `<div class="logo">
    <svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.5C8.5 2.5 2.5 8.3 2.5 15.5c0 2.6.8 5 2.1 7L3 28.5l6.3-1.6A13.7 13.7 0 0 0 16 28.5c7.5 0 13.5-5.8 13.5-13S23.5 2.5 16 2.5z" fill="#14A152"/>
      <path d="M16 8.6l1.7 4.6 4.6 1.7-4.6 1.7L16 21.2l-1.7-4.6-4.6-1.7 4.6-1.7z" fill="#fff"/>
    </svg>
    <span class="logo-name">IA ZAP</span>
  </div>`;
}

// ---------- modelos de negócio ----------
const MODELOS = {
  agenda: {
    nome: 'Agenda de serviços', icon: 'calendar',
    desc: 'Para quem trabalha com hora marcada.',
    faz: ['Consulta horários livres', 'Agenda, remarca e cancela', 'Lembra o cliente do horário'],
    ex: 'Barbearia, salão, clínica, dentista, oficina, estética',
    menu: [{ key: 'agenda', label: 'Agenda', icon: 'calendar' }, { key: 'servicos', label: 'Serviços', icon: 'scissors' }],
  },
  delivery: {
    nome: 'Delivery', icon: 'bike',
    desc: 'Para quem recebe pedidos para entregar ou retirar.',
    faz: ['Apresenta o cardápio', 'Monta o pedido completo', 'Combina pagamento na entrega'],
    ex: 'Lancheria, pizzaria, marmitaria, açaí, mercado, farmácia',
    menu: [{ key: 'pedidos', label: 'Pedidos', icon: 'bag' }, { key: 'cardapio', label: 'Cardápio', icon: 'box' }],
  },
  varejo: {
    nome: 'Varejo', icon: 'store',
    desc: 'Para lojas que vendem com atendimento consultivo.',
    faz: ['Tira dúvidas sobre produtos', 'Recomenda o que faz sentido', 'Passa para um vendedor'],
    ex: 'Loja de roupas, calçados, móveis, eletrônicos, autopeças',
    menu: [{ key: 'produtos', label: 'Produtos', icon: 'box' }],
  },
};

// ---------- shell ----------
function renderShell(activeKey, opts = {}) {
  const me = IZ.meCache() || { user: {}, account: {}, setup: {} };
  const mod = MODELOS[me.account.modelo];
  const item = (it, extra = '') => it.soon
    ? `<span class="sb-item off" title="Chega em uma próxima atualização">${icon(it.icon)}<span>${it.label}</span><span class="sb-soon">em breve</span></span>`
    : `<a href="${it.href}" class="sb-item ${it.key === activeKey ? 'active' : ''}">${icon(it.icon)}<span>${it.label}</span>${extra}</a>`;

  const nav = `
    ${item({ key: 'inicio', label: 'Início', icon: 'home', href: 'inicio.html' })}
    <div class="sb-section">Atendimento</div>
    ${item({ key: 'inbox', label: 'Conversas', icon: 'chat', href: 'inbox.html' }, '<span class="sb-badge hidden" id="sb-unread"></span>')}
    ${item({ key: 'contatos', label: 'Contatos', icon: 'users', href: 'contatos.html' })}
    <div class="sb-section">${mod ? escapeHtml(mod.nome) : 'Seu negócio'}</div>
    ${(mod ? mod.menu : []).map(m => item({ ...m, soon: true })).join('')}
    ${item({ key: 'empresa', label: 'Dados da empresa', icon: 'building', href: 'empresa.html' })}
    <div class="sb-section">Configuração</div>
    ${item({ key: 'whatsapp', label: 'WhatsApp', icon: 'phone', href: 'whatsapp.html' }, `<span class="wa-dot ${me.setup.whatsapp ? 'on' : ''}" style="margin-left:auto;margin-right:0"></span>`)}
    ${item({ key: 'ia', label: 'Inteligência artificial', icon: 'spark', href: 'ia.html' })}
  `;

  document.body.innerHTML = `
    <div class="shell">
      <aside class="sidebar" id="sidebar">
        <div class="sb-brand">${logoHTML()}</div>
        <nav class="sb-nav">${nav}</nav>
        <div class="sb-user">
          <div class="sb-user-name">${escapeHtml(me.account.nome || '')}</div>
          <div class="sb-user-email">${escapeHtml(me.user.email || '')}</div>
          <div class="sb-user-actions">
            <button class="sb-link" onclick="modalSenha()">Trocar senha</button>
            <button class="sb-link" onclick="logout()">Sair</button>
          </div>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="mobile-menu" onclick="q('sidebar').classList.toggle('open')" aria-label="Abrir menu">${icon('menu', 22)}</button>
            <div class="topbar-title">${escapeHtml(opts.title || '')}</div>
          </div>
          <div class="topbar-actions" id="topbar-actions"></div>
        </header>
        <main class="content" id="content"></main>
      </div>
    </div>
    <div id="toast"></div>`;
  document.title = `${opts.title ? opts.title + ' — ' : ''}IA ZAP`;
  atualizarBadge();
}

async function atualizarBadge() {
  try {
    const s = await api('/api/stats');
    const el = q('sb-unread');
    if (el) { el.textContent = s.nao_lidas; el.classList.toggle('hidden', !s.nao_lidas); }
  } catch { }
}

async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { }
  IZ.clear();
  location.href = 'login.html';
}

function modalSenha() {
  openModal(`
    <div class="field"><label for="ps-a">Senha atual</label><input type="password" class="input" id="ps-a" autocomplete="current-password"></div>
    <div class="field"><label for="ps-n">Nova senha</label><input type="password" class="input" id="ps-n" autocomplete="new-password"><div class="hint">Pelo menos 8 caracteres.</div></div>
  `, { title: 'Trocar senha', footer: `<button class="btn" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="ps-go">Salvar senha</button>` });
  q('ps-go').onclick = async () => {
    try {
      await api('/api/auth/senha', { method: 'POST', body: { atual: q('ps-a').value, nova: q('ps-n').value } });
      closeModal(); toast('Senha alterada', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  };
}

// ---------- modal / toast ----------
function openModal(html, opts = {}) {
  let ov = q('modal-ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'modal-ov'; ov.className = 'modal-ov';
    ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
    document.body.appendChild(ov);
  }
  ov.innerHTML = `
    <div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${escapeHtml(opts.title || '')}</h3><button class="modal-x" onclick="closeModal()" aria-label="Fechar">×</button></div>
      <div class="modal-body">${html}</div>
      ${opts.footer ? `<div class="modal-foot">${opts.footer}</div>` : ''}
    </div>`;
  ov.classList.add('open');
  const f = ov.querySelector('input,textarea,select'); if (f) f.focus();
}
function closeModal() { const ov = q('modal-ov'); if (ov) ov.classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function toast(msg, kind = '') {
  let root = q('toast');
  if (!root) { root = document.createElement('div'); root.id = 'toast'; document.body.appendChild(root); }
  const el = document.createElement('div');
  el.className = 'toast ' + kind; el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

// ---------- util ----------
function q(id) { return document.getElementById(id); }
function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function parseDate(s) { return new Date(String(s).includes('T') ? s : String(s).replace(' ', 'T') + 'Z'); }
function fmtDate(s) {
  if (!s) return '';
  return parseDate(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtRel(s) {
  if (!s) return '';
  const d = parseDate(s), diff = (Date.now() - d) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return Math.floor(diff / 60) + ' min';
  if (d.toDateString() === new Date().toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 6 * 86400) return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()];
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function fmtPhone(s) {
  const t = String(s || '').replace(/\D/g, '');
  if (t.length === 13) return `(${t.slice(2, 4)}) ${t.slice(4, 9)}-${t.slice(9)}`;
  if (t.length === 12) return `(${t.slice(2, 4)}) ${t.slice(4, 8)}-${t.slice(8)}`;
  return t;
}
function initial(s) { return escapeHtml((String(s || '?').trim().charAt(0) || '?').toUpperCase()); }
function btnLoading(btn, on, txt) {
  if (!btn) return;
  if (on) { btn.dataset.t = btn.innerHTML; btn.disabled = true; btn.innerHTML = txt || 'Aguarde…'; }
  else { btn.disabled = false; if (btn.dataset.t) btn.innerHTML = btn.dataset.t; }
}

// ══════════════════════════════════════════════════════════
// COMPONENTE: conexão do WhatsApp (usado no onboarding e em whatsapp.html)
// ══════════════════════════════════════════════════════════
function mountWhatsapp(el, { onConnected } = {}) {
  let timer = null, inst = null;
  const stop = () => { clearInterval(timer); timer = null; };

  async function load() {
    el.innerHTML = '<div class="panel-body"><div class="spinner"></div></div>';
    try { inst = (await api('/api/instance')).instance; }
    catch (e) { el.innerHTML = `<div class="panel-body"><div class="notice notice-err">${escapeHtml(e.message)}</div></div>`; return; }
    if (!inst) return renderNovo();
    if (inst.status === 'open') return renderConectado();
    renderQR(inst.ultimo_qr);
    startPoll();
  }

  function renderNovo() {
    el.innerHTML = `<div class="panel-body">
      <p style="margin-top:0">Conecte o número de WhatsApp que atende seus clientes. Pode ser WhatsApp comum ou Business.</p>
      <div class="notice notice-warn">Use um número exclusivo do negócio. Atendimento automático em número pessoal mistura conversas de família com clientes.</div>
      <button class="btn btn-primary btn-lg" id="wa-new">${icon('phone')} Gerar QR Code</button>
    </div>`;
    q('wa-new').onclick = async (ev) => {
      btnLoading(ev.currentTarget, true, 'Preparando…');
      try { const r = await api('/api/instance', { method: 'POST' }); renderQR(r.qrcode); startPoll(); }
      catch (e) { toast(e.message, 'err'); btnLoading(ev.currentTarget, false); }
    };
  }

  function renderQR(qr) {
    el.innerHTML = `<div class="panel-body"><div class="qr-wrap">
      <div class="qr-box" id="wa-qr">${qr ? `<img src="${qr}" alt="QR Code para conectar o WhatsApp">` : '<div class="spinner"></div>'}</div>
      <div>
        <h3 style="margin-bottom:10px">Escaneie com o celular</h3>
        <ol class="steps-list">
          <li>Abra o WhatsApp no celular do negócio</li>
          <li>Toque em <b>Mais opções</b> (Android) ou <b>Configurações</b> (iPhone)</li>
          <li>Toque em <b>Dispositivos conectados</b> e depois em <b>Conectar dispositivo</b></li>
          <li>Aponte a câmera para o QR Code ao lado</li>
        </ol>
        <p class="small soft">O código expira em cerca de 40 segundos. Se expirar, gere outro.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <button class="btn" id="wa-refresh">Gerar outro QR</button>
          <button class="btn btn-ghost" id="wa-code">Conectar com código em vez de QR</button>
        </div>
        <div id="wa-pair" class="hidden" style="margin-top:14px"></div>
      </div>
    </div></div>`;
    if (!qr) refreshQR();
    q('wa-refresh').onclick = refreshQR;
    q('wa-code').onclick = () => {
      const box = q('wa-pair'); box.classList.remove('hidden');
      box.innerHTML = `<div class="field"><label for="wa-num">Número do WhatsApp com DDD</label>
        <div style="display:flex;gap:8px"><input class="input" id="wa-num" placeholder="(53) 99999-9999" inputmode="tel"><button class="btn btn-primary" id="wa-pgo">Gerar código</button></div>
        <div class="hint">No celular: Dispositivos conectados → Conectar dispositivo → Conectar com número de telefone.</div></div><div id="wa-pres"></div>`;
      q('wa-pgo').onclick = async (ev) => {
        btnLoading(ev.currentTarget, true, '…');
        try {
          const r = await api('/api/instance/pairing', { method: 'POST', body: { numero: q('wa-num').value } });
          q('wa-pres').innerHTML = r.pairingCode
            ? `<div class="notice notice-ok">Digite no celular: <b style="font-size:20px;letter-spacing:.12em">${escapeHtml(r.pairingCode)}</b></div>`
            : `<div class="notice notice-warn">O servidor não devolveu código agora. Use o QR ou tente de novo.</div>`;
        } catch (e) { toast(e.message, 'err'); }
        btnLoading(ev.currentTarget, false);
      };
    };
  }

  async function refreshQR() {
    const box = q('wa-qr'); if (!box) return;
    box.innerHTML = '<div class="spinner"></div>';
    try {
      const r = await api('/api/instance/qr');
      box.innerHTML = r.qrcode ? `<img src="${r.qrcode}" alt="QR Code para conectar o WhatsApp">` : '<div class="small muted" style="text-align:center">Sem QR agora.<br>Clique em Gerar outro QR.</div>';
    } catch (e) { box.innerHTML = `<div class="small" style="color:var(--danger);text-align:center;padding:10px">${escapeHtml(e.message)}</div>`; }
  }

  function startPoll() {
    stop();
    let ticks = 0;
    timer = setInterval(async () => {
      if (!document.body.contains(el)) return stop();
      ticks++;
      try {
        const s = await api('/api/instance/status');
        if (s.status === 'open') { stop(); inst = { ...inst, ...s }; renderConectado(); toast('WhatsApp conectado', 'ok'); onConnected && onConnected(s); return; }
        if (ticks % 8 === 0) refreshQR();
      } catch { }
    }, 4000);
  }

  function renderConectado() {
    el.innerHTML = `<div class="panel-body">
      <div class="wa-connected">
        <div class="big">${icon('check', 26)}</div>
        <div style="flex:1">
          <div style="font-weight:700;color:var(--ink);font-size:16px">WhatsApp conectado</div>
          <div class="muted">${inst.numero ? fmtPhone(inst.numero) : 'Número identificado em instantes'}${inst.perfil_nome ? ' · ' + escapeHtml(inst.perfil_nome) : ''}</div>
        </div>
        <span class="pill pill-ok">Online</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px">
        <button class="btn" id="wa-diag">Mensagens não chegam?</button>
        <button class="btn" id="wa-check">Verificar conexão</button>
        <button class="btn" id="wa-restart">Reiniciar conexão</button>
        <button class="btn btn-danger" id="wa-out">Desconectar</button>
      </div>
      <div id="wa-diag-box" style="margin-top:16px"></div>
    </div>`;
    q('wa-diag').onclick = () => rodarDiagnostico(false);
    q('wa-check').onclick = async (ev) => {
      btnLoading(ev.currentTarget, true, 'Verificando…');
      try { const s = await api('/api/instance/status'); if (s.status !== 'open') { toast('WhatsApp desconectado. Leia o QR de novo.', 'err'); load(); } else toast('Conexão ativa', 'ok'); }
      catch (e) { toast(e.message, 'err'); }
      btnLoading(ev.currentTarget, false);
    };
    q('wa-restart').onclick = async (ev) => {
      btnLoading(ev.currentTarget, true, 'Reiniciando…');
      try { await api('/api/instance/restart', { method: 'POST' }); toast('Conexão reiniciada', 'ok'); } catch (e) { toast(e.message, 'err'); }
      btnLoading(ev.currentTarget, false);
    };
    q('wa-out').onclick = async () => {
      if (!confirm('Desconectar este WhatsApp? O atendimento automático para até conectar de novo.')) return;
      try { await api('/api/instance', { method: 'DELETE' }); toast('WhatsApp desconectado', 'ok'); load(); } catch (e) { toast(e.message, 'err'); }
    };
  }

  async function rodarDiagnostico(corrigir) {
    const box = q('wa-diag-box'); if (!box) return;
    box.innerHTML = '<div class="notice"><div class="spinner"></div></div>';
    try {
      const d = corrigir
        ? (await api('/api/instance/webhook', { method: 'POST' })).diagnostico
        : await api('/api/instance/diagnostico');
      const linha = (ok, t) => `<li style="display:flex;gap:8px;align-items:center;padding:4px 0"><span class="ck ${ok ? 'done' : ''}" style="width:18px;height:18px;font-size:10px;${ok ? '' : 'border-color:var(--danger);background:var(--danger-lt)'}">${ok ? '✓' : ''}</span>${t}</li>`;
      box.innerHTML = `<div class="panel" style="margin:0"><div class="panel-body">
        <h3 style="margin-bottom:8px">Diagnóstico</h3>
        <ul style="list-style:none;margin:0;padding:0;font-size:13px">
          ${linha(d.evolution_ok, 'Servidor de WhatsApp respondendo')}
          ${linha(d.status_conexao === 'open', 'Número conectado' + (d.status_conexao !== 'open' ? ' (status: ' + escapeHtml(d.status_conexao) + ')' : ''))}
          ${linha(d.webhook_ligado, 'Recebimento de mensagens ligado')}
          ${linha(d.webhook_url_certa, 'Recebimento apontando para o IA ZAP')}
          ${linha(d.eventos_ok, 'Evento de mensagens novas ativado')}
        </ul>
        <p class="small muted" style="margin:10px 0 0">Mensagens recebidas até agora: <b>${d.total_recebidas}</b>${d.ultima_recebida_em ? ' · última em ' + fmtDate(d.ultima_recebida_em) : ''}</p>
        ${d.erro ? `<div class="notice notice-err" style="margin:10px 0 0">${escapeHtml(d.erro)}</div>` : ''}
        ${d.tudo_ok
          ? '<div class="notice notice-ok" style="margin:12px 0 0">Tudo certo. Mande uma mensagem de outro celular e confira em Conversas.</div>'
          : '<div style="margin-top:12px"><button class="btn btn-primary" id="wa-fix">Corrigir recebimento</button></div>'}
      </div></div>`;
      if (q('wa-fix')) q('wa-fix').onclick = () => rodarDiagnostico(true);
      if (corrigir) toast(d.tudo_ok ? 'Recebimento corrigido' : 'Ainda há pendências', d.tudo_ok ? 'ok' : 'err');
    } catch (e) { box.innerHTML = `<div class="notice notice-err">${escapeHtml(e.message)}</div>`; }
  }

  load();
  return { reload: load, stop };
}

// ══════════════════════════════════════════════════════════
// COMPONENTE: chave do Gemini (usado no onboarding e em ia.html)
// ══════════════════════════════════════════════════════════
function mountAiKey(el, { onSaved } = {}) {
  async function load() {
    el.innerHTML = '<div class="panel-body"><div class="spinner"></div></div>';
    let ai;
    try { ai = (await api('/api/ai')).ai; } catch (e) { el.innerHTML = `<div class="panel-body"><div class="notice notice-err">${escapeHtml(e.message)}</div></div>`; return; }
    if (ai.tem_chave) renderSalva(ai); else renderForm();
  }

  function tutorial() {
    return `<details style="margin-bottom:14px">
      <summary style="cursor:pointer;font-weight:600;color:var(--brand-dark)">Como gerar sua chave gratuita (2 minutos)</summary>
      <ol class="steps-list" style="margin-top:10px">
        <li>Acesse <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="color:var(--brand-dark);text-decoration:underline">aistudio.google.com/apikey</a> e entre com uma conta Google</li>
        <li>Clique em <b>Criar chave de API</b></li>
        <li>Copie a chave gerada (começa com <b>AIza</b>) e cole abaixo</li>
      </ol>
      <p class="small soft">A chave fica criptografada e nunca aparece inteira de novo. O uso é cobrado (ou limitado) pela sua conta Google.</p>
    </details>`;
  }

  function renderForm(erro) {
    el.innerHTML = `<div class="panel-body">
      ${tutorial()}
      ${erro ? `<div class="notice notice-err">${escapeHtml(erro)}</div>` : ''}
      <div class="field"><label for="ai-k">Chave da API do Gemini</label>
        <input class="input" id="ai-k" placeholder="AIza…" autocomplete="off" spellcheck="false"></div>
      <button class="btn btn-primary" id="ai-save">Validar e salvar chave</button>
    </div>`;
    q('ai-save').onclick = async (ev) => {
      const chave = q('ai-k').value.trim();
      if (!chave) return toast('Cole a chave primeiro', 'err');
      btnLoading(ev.currentTarget, true, 'Validando com o Google…');
      try {
        await api('/api/ai/key', { method: 'PUT', body: { chave } });
        toast('Chave validada e salva', 'ok'); onSaved && onSaved(); load();
      } catch (e) { renderForm(e.message); }
    };
  }

  function renderSalva(ai) {
    const st = ai.status === 'ok' ? '<span class="pill pill-ok">Chave válida</span>' : '<span class="pill pill-err">Chave com problema</span>';
    el.innerHTML = `<div class="panel-body">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div><div style="font-weight:600;color:var(--ink)">Chave terminada em ••••${escapeHtml(ai.chave_final || '')}</div>
        <div class="small soft">${ai.testada_em ? 'Testada em ' + fmtDate(ai.testada_em) : ''}</div></div>
        ${st}
      </div>
      ${ai.status !== 'ok' && ai.erro ? `<div class="notice notice-err" style="margin-top:12px">${escapeHtml(ai.erro)}</div>` : ''}
      <div class="field" style="margin-top:16px"><label for="ai-m">Modelo de IA</label>
        <select class="select" id="ai-m"><option>${escapeHtml(ai.modelo || '')}</option></select>
        <div class="hint">Os modelos "Flash" respondem rápido e gastam menos. Mantenha o sugerido se não tiver certeza.</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" id="ai-test">Testar chave</button>
        <button class="btn" id="ai-swap">Trocar chave</button>
        <button class="btn btn-danger" id="ai-del">Remover chave</button>
      </div>
    </div>`;
    carregarModelos(ai.modelo);
    q('ai-m').onchange = async (e) => {
      try { await api('/api/ai', { method: 'PATCH', body: { modelo: e.target.value } }); toast('Modelo alterado', 'ok'); } catch (err) { toast(err.message, 'err'); }
    };
    q('ai-test').onclick = async (ev) => {
      btnLoading(ev.currentTarget, true, 'Testando…');
      try { const r = await api('/api/ai/test', { method: 'POST' }); toast(r.ok ? 'Chave funcionando' : r.erro, r.ok ? 'ok' : 'err'); load(); onSaved && onSaved(); }
      catch (e) { toast(e.message, 'err'); btnLoading(ev.currentTarget, false); }
    };
    q('ai-swap').onclick = () => renderForm();
    q('ai-del').onclick = async () => {
      if (!confirm('Remover a chave? A IA será desligada.')) return;
      try { await api('/api/ai/key', { method: 'DELETE' }); toast('Chave removida', 'ok'); onSaved && onSaved(); load(); } catch (e) { toast(e.message, 'err'); }
    };
  }

  async function carregarModelos(atual) {
    try {
      const r = await api('/api/ai/test', { method: 'POST' });
      if (!r.ok || !q('ai-m')) return;
      q('ai-m').innerHTML = r.modelos.map(m => `<option value="${escapeHtml(m.id)}" ${m.id === atual ? 'selected' : ''}>${escapeHtml(m.nome)} (${escapeHtml(m.id)})</option>`).join('');
    } catch { }
  }

  load();
  return { reload: load };
}
