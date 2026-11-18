const test = require('node:test');
const assert = require('node:assert/strict');
const carregar = require('./carregarModulo.cjs');
const recursos = require('../src/config/recursos');
const configurarApp = require('../app.config');
const { criarGerenciadorLembretes } = carregar('src/services/gerenciadorLembretes.js');
const { formatarAtualizacao } = carregar('src/services/atualizacaoUtils.js');

test('a versão entregue bloqueia notificações no código e na configuração Android', () => {
  assert.equal(recursos.notificacoes, false);
  const original = { android: { permissions: ['android.permission.SCHEDULE_EXACT_ALARM'] },
    plugins: ['expo-status-bar', ['expo-notifications', { color: '#123456' }]] };
  const config = configurarApp({ config: original });
  assert.deepEqual(config.plugins, ['expo-status-bar']);
  assert.deepEqual(config.android.permissions, []);
  assert(config.android.blockedPermissions.includes('android.permission.POST_NOTIFICATIONS'));
  assert(config.android.blockedPermissions.includes('android.permission.SCHEDULE_EXACT_ALARM'));
  assert.equal(original.plugins.length, 2);
  assert.equal(original.android.permissions.length, 1);
});

test('bloqueio ignora preferência antiga e impede importação nativa, permissões e agendamento', async () => {
  let acessos = 0;
  const proibido = async () => { acessos++; throw new Error('Não deveria executar'); };
  const gerenciador = criarGerenciadorLembretes({
    armazenamento: { getItem: proibido, setItem: proibido },
    obterNotificacoes: proibido, buscarPainel: proibido, plataforma: 'android',
  });
  assert.equal(gerenciador.obterEstado().indisponivel, true);
  assert.equal(gerenciador.obterEstado().ativados, false);
  await gerenciador.definirConta('idoso');
  await gerenciador.configurar(true);
  await gerenciador.sincronizar();
  await assert.rejects(gerenciador.testar(), /desativados/);
  assert.equal(acessos, 0);
  assert.equal(gerenciador.obterEstado().ativados, false);
  assert.equal(gerenciador.obterEstado().preferenciaAtiva, false);
  assert.equal(gerenciador.obterEstado().bloqueadoNoCodigo, true);
  await gerenciador.definirConta('outra-conta');
  assert.equal(gerenciador.obterEstado().usuarioId, 'outra-conta');
  await gerenciador.definirConta(null);
  assert.equal(gerenciador.obterEstado().usuarioId, null);
  assert.equal(acessos, 0);
});

test('última consulta usa o instante recebido e respeita o fuso da rotina', () => {
  assert.equal(formatarAtualizacao(null), null);
  assert.equal(formatarAtualizacao('data inválida'), null);
  const texto = formatarAtualizacao(Date.parse('2026-11-15T15:30:45Z'), 'America/Sao_Paulo');
  assert.match(texto, /15\/11\/2026/);
  assert.match(texto, /12:30:45/);
  assert(formatarAtualizacao(0, 'Fuso/Invalido'));
});
