/* ==========================================================
   IA ZAP — formulário de dados da empresa (contexto da IA)
   Usado em onboarding.html (compacto) e empresa.html (completo)
   ========================================================== */

const DIAS = [['seg', 'Segunda'], ['ter', 'Terça'], ['qua', 'Quarta'], ['qui', 'Quinta'], ['sex', 'Sexta'], ['sab', 'Sábado'], ['dom', 'Domingo']];

const PAGAMENTOS = {
  delivery: ['Dinheiro', 'Pix na entrega', 'Cartão de crédito na maquininha', 'Cartão de débito na maquininha', 'Vale-refeição'],
  padrao: ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Parcelado no cartão', 'Boleto'],
};

const TONS = [
  ['acolhedor', 'Acolhedor e próximo'],
  ['descontraido', 'Descontraído, com emojis'],
  ['profissional', 'Profissional e objetivo'],
  ['formal', 'Formal'],
];

const EXTRAS = {
  agenda: [
    { k: 'passo_agenda', l: 'Intervalo entre horários oferecidos', t: 'select', op: ['30', '15', '20', '45', '60'], rot: { '15': 'A cada 15 min', '20': 'A cada 20 min', '30': 'A cada 30 min', '45': 'A cada 45 min', '60': 'A cada 1 hora' } },
    { k: 'antecedencia_horas', l: 'Antecedência mínima para agendar (horas)', t: 'number', ph: '2' },
    { k: 'politica_cancelamento', l: 'Regra de cancelamento e atraso', t: 'textarea', ph: 'Ex.: cancelar com até 3 horas de antecedência. Atraso acima de 15 min pode perder o horário.' },
    { k: 'obs_agendamento', l: 'O que o cliente precisa saber antes de vir', t: 'textarea', ph: 'Ex.: chegar 5 min antes; estacionamento na rua lateral.' },
    { k: 'oferecer_lembrete', l: 'A IA oferece lembrete depois de marcar?', t: 'select', op: ['Sim', 'Não'] },
    { k: 'lembrete_padrao_min', l: 'Antecedência sugerida pela IA', t: 'select', op: ['30', '15', '60', '120', '180', '1440'], rot: { '15': '15 minutos antes', '30': '30 minutos antes', '60': '1 hora antes', '120': '2 horas antes', '180': '3 horas antes', '1440': '1 dia antes' } },
    { k: 'lembrete_texto', l: 'Texto do lembrete', t: 'textarea', ph: 'Oi, {nome}! Passando para lembrar do seu horário: {servico} com {profissional}, {quando} às {hora}. Até lá!', hint: 'Use {nome}, {servico}, {profissional}, {quando} (hoje, amanhã ou o dia), {data}, {hora}, {empresa} e {orientacoes} (o que o cliente precisa saber antes de vir). Em branco, usa o texto de exemplo com as orientações.' },
  ],
  delivery: [
    { k: 'taxa_entrega', l: 'Taxa de entrega (R$)', t: 'text', ph: '6,00' },
    { k: 'pedido_minimo', l: 'Pedido mínimo (R$)', t: 'text', ph: '25,00' },
    { k: 'tempo_medio', l: 'Tempo médio de entrega', t: 'text', ph: '40 a 60 min' },
    { k: 'retirada', l: 'Aceita retirada no local?', t: 'select', op: ['Sim', 'Não'] },
    { k: 'area_entrega', l: 'Onde entrega', t: 'textarea', ph: 'Ex.: toda a cidade, exceto zona rural.' },
  ],
  varejo: [
    { k: 'politica_troca', l: 'Política de troca e devolução', t: 'textarea', ph: 'Ex.: troca em até 7 dias com etiqueta.' },
    { k: 'envio', l: 'Formas de envio ou retirada', t: 'textarea', ph: 'Ex.: retirada na loja, motoboy na cidade, Correios para fora.' },
    { k: 'quando_vendedor', l: 'Quando passar a conversa para um vendedor', t: 'textarea', ph: 'Ex.: pedidos acima de R$ 1.000, orçamento para empresas, reclamações.' },
  ],
  imobiliaria: [
    { k: 'creci', l: 'CRECI', t: 'input', ph: 'Ex.: CRECI 12.345-J' },
    { k: 'regiao', l: 'Região de atuação', t: 'input', ph: 'Ex.: Zona Sul de Porto Alegre' },
    { k: 'passo_agenda', l: 'Intervalo entre visitas', t: 'select', op: ['30', '60', '90'], rot: { '30': 'A cada 30 min', '60': 'A cada 1 hora', '90': 'A cada 1h30' } },
    { k: 'antecedencia_horas', l: 'Antecedência mínima para visita (horas)', t: 'input', ph: 'Ex.: 3' },
    { k: 'obs_agendamento', l: 'Orientações para a visita', t: 'textarea', ph: 'Ex.: levar documento com foto.' },
    { k: 'oferecer_lembrete', l: 'A IA oferece lembrete da visita?', t: 'select', op: ['Sim', 'Não'] },
  ],
  ecommerce: [
    { k: 'frete', l: 'Frete', t: 'textarea', ph: 'Ex.: grátis acima de R$ 199; abaixo, calculado no checkout.' },
    { k: 'prazo_entrega', l: 'Prazo de entrega', t: 'input', ph: 'Ex.: 3 a 7 dias úteis no Sul e Sudeste' },
    { k: 'politica_troca', l: 'Troca e devolução', t: 'textarea', ph: 'Ex.: até 7 dias após o recebimento.' },
    { k: 'cupom', l: 'Cupom ativo', t: 'input', ph: 'Ex.: PRIMEIRA10 dá 10% na primeira compra' },
  ],
};

function bizForm(el, { modelo, compact = false, onSaved } = {}) {
  let biz = null;

  async function load() {
    el.innerHTML = '<div class="spinner"></div>';
    try { biz = (await api('/api/business')).business; }
    catch (e) { el.innerHTML = `<div class="notice notice-err">${escapeHtml(e.message)}</div>`; return; }
    render();
  }

  const val = (k) => escapeHtml(biz[k] || '');

  function render() {
    const pags = PAGAMENTOS[modelo === 'delivery' ? 'delivery' : 'padrao'];
    const hor = biz.horarios || {};
    const extras = biz.extras || {};

    const basico = `
      <div class="row">
        <div class="field"><label for="b-nome">Nome da empresa</label><input class="input" id="b-nome" value="${val('nome_empresa')}"></div>
        <div class="field"><label for="b-seg">Segmento</label><input class="input" id="b-seg" value="${val('segmento')}" placeholder="${modelo === 'delivery' ? 'Ex.: hamburgueria' : modelo === 'agenda' ? 'Ex.: barbearia' : 'Ex.: loja de roupas femininas'}"></div>
      </div>
      <div class="field"><label for="b-desc">O que a empresa faz</label>
        <textarea class="textarea" id="b-desc" placeholder="Descreva em poucas linhas o negócio, o que vende ou atende e o que diferencia vocês. A IA usa isso para se apresentar.">${val('descricao')}</textarea></div>
      <div class="row">
        <div class="field"><label for="b-end">Endereço</label><input class="input" id="b-end" value="${val('endereco')}" placeholder="Rua, número, bairro"></div>
        <div class="field"><label for="b-cid">Cidade</label><input class="input" id="b-cid" value="${val('cidade')}"></div>
      </div>
      <div class="row">
        <div class="field"><label for="b-tel">Telefone de contato</label><input class="input" id="b-tel" value="${val('telefone')}" inputmode="tel"></div>
        <div class="field"><label for="b-ig">Instagram</label><input class="input" id="b-ig" value="${val('instagram')}" placeholder="@suaempresa"></div>
      </div>`;

    const horarios = `
      <div class="section-title">Horário de funcionamento</div>
      <div class="hours">${DIAS.map(([k, n]) => {
        const h = hor[k] || { aberto: !['dom'].includes(k), ini: '09:00', fim: '18:00' };
        return `<div class="hour-row ${h.aberto ? '' : 'closed'}" data-dia="${k}">
          <span>${n}</span>
          <label class="switch" title="Aberto"><input type="checkbox" ${h.aberto ? 'checked' : ''} onchange="this.closest('.hour-row').classList.toggle('closed', !this.checked)"><span></span></label>
          <input type="time" class="input" value="${escapeHtml(h.ini || '09:00')}" aria-label="${n} abre">
          <input type="time" class="input" value="${escapeHtml(h.fim || '18:00')}" aria-label="${n} fecha">
        </div>`;
      }).join('')}</div>`;

    const pagamento = `
      <div class="section-title">Formas de pagamento</div>
      ${modelo === 'delivery' ? '<p class="small muted" style="margin:-4px 0 8px">O pagamento é sempre feito na entrega. A IA só pergunta e registra a forma escolhida.</p>' : ''}
      <div class="checks" id="b-pag">${pags.map(p => `<label class="check"><input type="checkbox" value="${escapeHtml(p)}" ${(biz.formas_pagamento || []).includes(p) ? 'checked' : ''}>${escapeHtml(p)}</label>`).join('')}</div>`;

    const extrasHtml = (EXTRAS[modelo] || []).map(f => {
      const v = escapeHtml(extras[f.k] || '');
      const inp = f.t === 'textarea' ? `<textarea class="textarea" data-ex="${f.k}" placeholder="${escapeHtml(f.ph || '')}" style="min-height:64px">${v}</textarea>`
        : f.t === 'select' ? `<select class="select" data-ex="${f.k}">${f.op.map(o => `<option value="${o}" ${extras[f.k] === o ? 'selected' : ''}>${f.rot ? f.rot[o] : o}</option>`).join('')}</select>`
          : `<input class="input" data-ex="${f.k}" type="${f.t}" value="${v}" placeholder="${escapeHtml(f.ph || '')}">`;
      return `<div class="field"><label>${escapeHtml(f.l)}</label>${inp}${f.hint ? `<div class="hint">${escapeHtml(f.hint)}</div>` : ''}</div>`;
    }).join('');

    const ia = `
      <div class="row">
        <div class="field"><label for="b-ass">Nome do atendente virtual</label><input class="input" id="b-ass" value="${val('nome_assistente')}" placeholder="Ex.: Bia"><div class="hint">Deixe em branco para a IA se apresentar como atendimento da empresa.</div></div>
        <div class="field"><label for="b-tom">Jeito de falar</label><select class="select" id="b-tom">${TONS.map(([k, n]) => `<option value="${k}" ${biz.tom_voz === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label for="b-faq">Perguntas frequentes</label>
        <textarea class="textarea" id="b-faq" style="min-height:130px" placeholder="Escreva pergunta e resposta, uma por linha.&#10;Ex.: Tem estacionamento? Sim, na frente da loja.">${val('perguntas_frequentes')}</textarea></div>
      <div class="field"><label for="b-reg">O que a IA nunca deve fazer</label>
        <textarea class="textarea" id="b-reg" placeholder="Ex.: não dar desconto; não prometer prazo; não falar de concorrentes.">${val('regras')}</textarea></div>`;

    if (compact) {
      el.innerHTML = basico + horarios + pagamento;
    } else {
      el.innerHTML = `
        <div class="panel"><div class="panel-head"><div><h3>Empresa</h3><p>Informações básicas que a IA usa para se apresentar.</p></div></div><div class="panel-body">${basico}</div></div>
        <div class="panel"><div class="panel-head"><div><h3>Funcionamento e pagamento</h3><p>A IA avisa quando está fechado e informa como pagar.</p></div></div><div class="panel-body" style="padding-top:4px">${horarios}${pagamento}</div></div>
        ${extrasHtml ? `<div class="panel"><div class="panel-head"><div><h3>Regras do ${escapeHtml(MODELOS[modelo]?.nome.toLowerCase() || 'negócio')}</h3><p>Detalhes específicos que evitam respostas erradas.</p></div></div><div class="panel-body">${extrasHtml}</div></div>` : ''}
        <div class="panel"><div class="panel-head"><div><h3>Atendimento da IA</h3><p>Como a IA fala e o que ela precisa saber.</p></div></div><div class="panel-body">${ia}</div></div>`;
    }
  }

  function coletar() {
    const g = (id) => (q(id) ? q(id).value.trim() : undefined);
    const horarios = {};
    el.querySelectorAll('.hour-row').forEach(r => {
      const [ck] = r.querySelectorAll('input[type=checkbox]');
      const [ini, fim] = r.querySelectorAll('input[type=time]');
      horarios[r.dataset.dia] = { aberto: ck.checked, ini: ini.value, fim: fim.value };
    });
    const body = {
      nome_empresa: g('b-nome'), segmento: g('b-seg'), descricao: g('b-desc'),
      endereco: g('b-end'), cidade: g('b-cid'), telefone: g('b-tel'), instagram: g('b-ig'),
      horarios,
      formas_pagamento: [...el.querySelectorAll('#b-pag input:checked')].map(i => i.value),
    };
    if (!compact) {
      body.nome_assistente = g('b-ass'); body.tom_voz = g('b-tom');
      body.perguntas_frequentes = g('b-faq'); body.regras = g('b-reg');
      const ex = { ...(biz.extras || {}) };
      el.querySelectorAll('[data-ex]').forEach(i => { ex[i.dataset.ex] = i.value.trim(); });
      body.extras = ex;
    }
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);
    return body;
  }

  async function save() {
    const body = coletar();
    if (!body.nome_empresa) throw new Error('Informe o nome da empresa');
    if (!body.descricao) throw new Error('Descreva o que a empresa faz');
    await api('/api/business', { method: 'PUT', body });
    onSaved && onSaved();
  }

  load();
  return { save };
}
