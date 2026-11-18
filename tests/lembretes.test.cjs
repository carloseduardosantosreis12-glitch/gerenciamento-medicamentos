const test = require('node:test');
const assert = require('node:assert/strict');
const carregar = require('./carregarModulo.cjs');
const { planejarLembretes, instanteNoFuso, podeAbrirLembrete, MARCA_LEMBRETE } = carregar('src/services/lembretesUtils.js');
const { criarGerenciadorLembretes } = carregar('src/services/gerenciadorLembretes.js');

const agora = new Date('2026-11-13T13:00:00Z'); // 10h em São Paulo.
function painel() {
  return { fuso: 'America/Sao_Paulo', hoje: '2026-11-13', hora_local: '10:00', dia_semana: 5,
    confirmadas: [], medicamentos: [{ id: 'med', nome: 'Medicamento fictício', dosagem: '10 mg',
      horarios: [{ id: 'h1', ativo: true, horario: '14:00:00', dias: [1, 2, 3, 4, 5, 6, 7],
        quantidade_dose: 1, unidade_dose: 'comprimido' }] }] };
}
function bancada(opcoes = {}) {
  let dados = painel();
  let permissao = true;
  let falhaConsulta = false;
  const gravados = new Map();
  const agendados = new Map();
  const apresentados = new Map();
  const cancelados = [];
  let pedidosPermissao = 0;
  let criados = 0;
  const n = {
    AndroidImportance: { HIGH: 6 }, AndroidNotificationVisibility: { PRIVATE: 2 },
    IosAuthorizationStatus: { AUTHORIZED: 2, PROVISIONAL: 3, EPHEMERAL: 4 },
    SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
    getPermissionsAsync: async () => ({ granted: permissao, ios: { status: permissao ? 2 : 1 } }),
    requestPermissionsAsync: async () => { pedidosPermissao++; return { granted: permissao, ios: {status: permissao ? 2 : 1} }; },
    setNotificationChannelAsync: async () => {},
    getAllScheduledNotificationsAsync: async () => [...agendados.values()],
    getPresentedNotificationsAsync: async () => [...apresentados.values()],
    cancelScheduledNotificationAsync: async id => { cancelados.push(id); agendados.delete(id); },
    dismissNotificationAsync: async id => { apresentados.delete(id); },
    scheduleNotificationAsync: async pedido => {
      criados++;
      agendados.set(pedido.identifier, { ...pedido });
      return pedido.identifier;
    },
  };
  const gerenciador = criarGerenciadorLembretes({
    armazenamento: { getItem: async chave => gravados.get(chave), setItem: async (chave, valor) => gravados.set(chave, valor) },
    obterNotificacoes: async () => n,
    buscarPainel: async id => { if (falhaConsulta) throw new Error('Offline'); return opcoes.buscarPainel ? opcoes.buscarPainel(id) : dados; },
    plataforma: opcoes.plataforma || 'android', habilitado: opcoes.habilitado ?? true, agora: () => agora,
  });
  return { gerenciador, n, agendados, apresentados, cancelados, gravados,
    dados: () => dados, definirDados: valor => { dados = valor; },
    definirPermissao: valor => { permissao = valor; }, falharConsulta: () => { falhaConsulta = true; },
    pedidosPermissao: () => pedidosPermissao, criados: () => criados };
}

test('programa apenas dias e horários futuros no fuso do perfil, com nome e dose', () => {
  const plano = planejarLembretes(painel(), 'a', agora);
  assert.equal(plano.itens[0].data.toISOString(), '2026-11-13T17:00:00.000Z');
  assert.match(plano.itens[0].corpo, /Medicamento fictício.*10 mg/);
  assert.match(plano.itens[0].corpo, /1 comprimido.*14:00/);
  assert.equal(plano.itens[0].dados.usuarioId, 'a');
});

test('não repete dose confirmada hoje, mas mantém os dias seguintes', () => {
  const dados = painel(); dados.confirmadas = [{ horario_id: 'h1' }];
  const plano = planejarLembretes(dados, 'a', agora);
  assert.equal(plano.itens[0].diaISO, '2026-11-14');
});

test('não programa horário pausado, dia não selecionado nem dose incompleta', () => {
  const dados = painel(); const h = dados.medicamentos[0].horarios[0];
  h.ativo = false; assert.equal(planejarLembretes(dados, 'a', agora).itens.length, 0);
  h.ativo = true; h.dias = [1];
  assert(planejarLembretes(dados, 'a', agora).itens.every(item => item.data.getUTCDay() === 1));
  h.quantidade_dose = null;
  const plano = planejarLembretes(dados, 'a', agora);
  assert.equal(plano.itens.length, 0); assert.equal(plano.incompletos, 1);
});

test('respeita o limite de avisos do dispositivo e informa até quando estão programados', () => {
  const dados = painel(); const original = dados.medicamentos[0].horarios[0];
  dados.medicamentos[0].horarios = ['11:00', '14:00', '18:00', '22:00'].map((hora, i) => ({...original, horario:hora, id:`h${i}`}));
  const plano = planejarLembretes(dados, 'a', agora);
  assert.equal(plano.itens.length, 60); assert.equal(plano.limitado, true);
  assert.equal(plano.ate, plano.itens.at(-1).diaISO);
});

test('não desloca silenciosamente horário inexistente e rejeita fuso inválido', () => {
  assert.equal(instanteNoFuso(2026, 3, 29, 2, 30, 'Europe/Berlin'), null);
  assert.throws(() => planejarLembretes({...painel(), fuso:'Fuso/Invalido'}, 'a', agora));
});

test('não pede permissão automaticamente; ativação é uma ação explícita', async () => {
  const b = bancada(); b.definirPermissao(false);
  await b.gerenciador.definirConta('a');
  assert.equal(b.pedidosPermissao(), 0); assert.equal(b.agendados.size, 0);
  await b.gerenciador.configurar(true);
  assert.equal(b.pedidosPermissao(), 1); assert.equal(b.agendados.size, 0);
  assert.equal(b.gerenciador.obterEstado().erro, true);
});

test('sincronização é idempotente e edição de horário substitui os avisos antigos', async () => {
  const b = bancada(); await b.gerenciador.definirConta('a'); await b.gerenciador.configurar(true);
  const criados = b.criados(); await b.gerenciador.sincronizar(); assert.equal(b.criados(), criados);
  b.dados().medicamentos[0].horarios[0].horario = '16:00';
  await b.gerenciador.sincronizar();
  assert(b.cancelados.length > 0);
  assert([...b.agendados.values()].every(item => item.content.body.includes('16:00')));
});

test('confirmação remove o aviso de hoje e pausa remove os avisos seguintes', async () => {
  const b = bancada(); await b.gerenciador.definirConta('a'); await b.gerenciador.configurar(true);
  b.apresentados.set('exibida', {request:{identifier:'exibida',content:{data:{
    aplicativo:MARCA_LEMBRETE,usuarioId:'a',horarioId:'h1',dataLocal:'2026-11-13',
  }}}});
  b.dados().confirmadas = [{ horario_id: 'h1' }]; await b.gerenciador.sincronizar();
  assert([...b.agendados.values()].every(item => item.content.data.dataLocal !== '2026-11-13'));
  assert.equal(b.apresentados.size,0);
  b.dados().medicamentos[0].horarios[0].ativo = false; await b.gerenciador.sincronizar();
  assert.equal(b.agendados.size, 0);
});

test('sair ou trocar de conta remove avisos próprios, sem cancelar notificações alheias', async () => {
  const b = bancada(); await b.gerenciador.definirConta('a'); await b.gerenciador.configurar(true);
  b.agendados.set('alheia', {identifier:'alheia',content:{data:{aplicativo:'outro'}}});
  b.apresentados.set('exibida', {request:{identifier:'exibida',content:{data:{aplicativo:MARCA_LEMBRETE,usuarioId:'a'}}}});
  await b.gerenciador.definirConta('b');
  assert.deepEqual([...b.agendados.keys()], ['alheia']); assert.equal(b.apresentados.size, 0);
  await b.gerenciador.configurar(true); await b.gerenciador.definirConta(null);
  assert.deepEqual([...b.agendados.keys()], ['alheia']);
});

test('sem conexão preserva avisos programados e mostra falha de atualização', async () => {
  const b = bancada(); await b.gerenciador.definirConta('a'); await b.gerenciador.configurar(true);
  const antes = [...b.agendados.keys()]; b.falharConsulta(); await b.gerenciador.sincronizar();
  assert.deepEqual([...b.agendados.keys()], antes); assert.equal(b.gerenciador.obterEstado().erro, true);
});

test('desativar remove avisos de tomada e de teste', async () => {
  const b = bancada(); await b.gerenciador.definirConta('a'); await b.gerenciador.configurar(true);
  await b.gerenciador.testar(); assert([...b.agendados.values()].some(item=>item.content.data.teste));
  await b.gerenciador.configurar(false);
  assert.equal(b.agendados.size, 0); assert.equal(b.gerenciador.obterEstado().preferenciaAtiva, false);
});

test('troca de conta durante consulta não deixa programar os dados anteriores', async () => {
  let liberar;
  const b = bancada({buscarPainel:()=>new Promise(resolve=>{liberar=resolve;})});
  await b.gerenciador.definirConta('a');
  const ativacao=b.gerenciador.configurar(true);
  while(!liberar) await new Promise(resolve=>setImmediate(resolve));
  const troca=b.gerenciador.definirConta('b'); liberar(painel());
  await Promise.all([ativacao,troca]);
  assert.equal(b.agendados.size,0); assert.equal(b.gerenciador.obterEstado().usuarioId,'b');
});

test('falha parcial ao programar não informa sucesso e permite desativar', async () => {
  const b = bancada(); await b.gerenciador.definirConta('a');
  const original=b.n.scheduleNotificationAsync; let contador=0;
  b.n.scheduleNotificationAsync=async pedido=>{ if(++contador===2) throw new Error('Falha nativa'); return original(pedido); };
  await b.gerenciador.configurar(true);
  assert.equal(b.gerenciador.obterEstado().erro,true); assert.equal(b.gerenciador.obterEstado().preferenciaAtiva,true);
  await b.gerenciador.configurar(false); assert.equal(b.agendados.size,0);
});

test('no navegador informa indisponibilidade sem inicializar módulos nativos', async () => {
  const b = bancada({plataforma:'web'}); await b.gerenciador.definirConta('a'); await b.gerenciador.configurar(true);
  assert.equal(b.gerenciador.obterEstado().indisponivel,true); assert.equal(b.agendados.size,0);
});

test('toque de notificação só abre rotina da conta correspondente e não confirma dose', () => {
  const resposta={notification:{request:{content:{data:{aplicativo:MARCA_LEMBRETE,usuarioId:'a'}}}}};
  assert.equal(podeAbrirLembrete(resposta,'a'),true);
  assert.equal(podeAbrirLembrete(resposta,'b'),false);
  assert.equal(podeAbrirLembrete(resposta,null),false);
  assert.equal(podeAbrirLembrete(null,'a'),false);
});
