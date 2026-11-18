import { MARCA_LEMBRETE, pertenceAoAplicativo, planejarLembretes } from './lembretesUtils';
import recursos from '../config/recursos';

export function criarGerenciadorLembretes({ armazenamento, obterNotificacoes, buscarPainel, plataforma,
  habilitado = recursos.notificacoes, agora = () => new Date() }) {
  let conta = null;
  let versao = 0;
  let fila = Promise.resolve();
  let estado = { usuarioId: null, ativados: false, preferenciaAtiva: false, total: 0,
    ate: null, indisponivel: !habilitado || plataforma === 'web', bloqueadoNoCodigo: !habilitado,
    mensagem: !habilitado
      ? 'Os avisos no celular estão desativados nesta versão. Consulte seus horários na Agenda.'
      : 'Lembretes desativados neste aparelho.' };
  const ouvintes = new Set();
  const chave = id => `meus-medicamentos:lembretes:${id}`;
  const vigente = (id, token) => conta === id && versao === token;
  function publicar(mudancas) {
    estado = { ...estado, ...mudancas };
    ouvintes.forEach(ouvinte => ouvinte(estado));
    return estado;
  }
  function informarBloqueio() {
    return publicar({ usuarioId: conta, ativados: false, preferenciaAtiva: false,
      total: 0, ate: null, erro: false, indisponivel: true, bloqueadoNoCodigo: true,
      mensagem: 'Os avisos no celular estão desativados nesta versão. Consulte seus horários na Agenda.' });
  }
  function enfileirar(tarefa) {
    const proxima = fila.catch(() => {}).then(tarefa);
    fila = proxima;
    return proxima;
  }
  async function cancelar(notificacoes, selecionar) {
    const lista = await notificacoes.getAllScheduledNotificationsAsync();
    for (const item of lista) {
      if (pertenceAoAplicativo(item) && selecionar(item.content.data)) {
        await notificacoes.cancelScheduledNotificationAsync(item.identifier);
      }
    }
    const apresentadas = await notificacoes.getPresentedNotificationsAsync();
    for (const item of apresentadas) {
      if (pertenceAoAplicativo(item.request) && selecionar(item.request.content.data)) {
        await notificacoes.dismissNotificationAsync(item.request.identifier);
      }
    }
  }
  async function temPermissao(notificacoes, solicitar = false) {
    if (plataforma === 'android') {
      await notificacoes.setNotificationChannelAsync('medicamentos', {
        name: 'Horários dos medicamentos', importance: notificacoes.AndroidImportance.HIGH,
        sound: 'default', vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility: notificacoes.AndroidNotificationVisibility.PRIVATE,
      });
    }
    let permissoes = await notificacoes.getPermissionsAsync();
    const autorizada = valor => plataforma === 'ios'
      ? [notificacoes.IosAuthorizationStatus.AUTHORIZED, notificacoes.IosAuthorizationStatus.PROVISIONAL,
        notificacoes.IosAuthorizationStatus.EPHEMERAL].includes(valor.ios?.status)
      : valor.granted;
    if (!autorizada(permissoes) && solicitar) {
      permissoes = await notificacoes.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });
    }
    return autorizada(permissoes);
  }
  async function sincronizarAgora(id, token, solicitar = false) {
    if (!habilitado) return informarBloqueio();
    if (!vigente(id, token) || !id) return estado;
    if (plataforma === 'web') return publicar({ ativados: false, indisponivel: true,
      mensagem: 'Os lembretes com som estão disponíveis no aplicativo do celular.' });
    const preferenciaAtiva = await armazenamento.getItem(chave(id)) === 'true';
    if (!vigente(id, token)) return estado;
    const notificacoes = await obterNotificacoes();
    if (!preferenciaAtiva) {
      await cancelar(notificacoes, dados => dados.usuarioId === id);
      if (!vigente(id, token)) return estado;
      return publicar({ usuarioId: id, ativados: false, preferenciaAtiva: false, total: 0,
        ate: null, erro: false, mensagem: 'Lembretes desativados neste aparelho.' });
    }
    if (!await temPermissao(notificacoes, solicitar)) {
      await cancelar(notificacoes, dados => dados.usuarioId === id);
      if (!vigente(id, token)) return estado;
      return publicar({ usuarioId: id, ativados: false, preferenciaAtiva: true, total: 0,
        ate: null, erro: true, mensagem: 'Permita as notificações nos ajustes do celular e toque em Ativar lembretes.' });
    }
    const dados = await buscarPainel(id);
    if (!vigente(id, token)) return estado;
    const plano = planejarLembretes(dados, id, agora());
    const horariosAtivos = new Set(dados.medicamentos.filter(item => item.ativo !== false)
      .flatMap(item => (item.horarios || []).filter(horario => horario.ativo).map(horario => horario.id)));
    const confirmadas = new Set((dados.confirmadas || []).map(item => item.horario_id));
    const apresentadas = await notificacoes.getPresentedNotificationsAsync();
    for (const item of apresentadas) {
      if (!vigente(id, token)) return estado;
      const info = item.request.content.data;
      if (pertenceAoAplicativo(item.request) && info.usuarioId === id && !info.teste
          && (!horariosAtivos.has(info.horarioId)
            || info.dataLocal === dados.hoje && confirmadas.has(info.horarioId))) {
        await notificacoes.dismissNotificationAsync(item.request.identifier);
      }
    }
    const desejadas = new Map(plano.itens.map(item => [item.identificador, item]));
    const existentes = await notificacoes.getAllScheduledNotificationsAsync();
    const manter = new Set();
    for (const item of existentes) {
      if (!vigente(id, token)) return estado;
      if (!pertenceAoAplicativo(item) || item.content.data.teste) continue;
      const prevista = desejadas.get(item.identifier);
      if (item.content.data.usuarioId === id && prevista
          && item.content.data.assinatura === prevista.dados.assinatura) manter.add(item.identifier);
      else await notificacoes.cancelScheduledNotificationAsync(item.identifier);
    }
    for (const item of plano.itens) {
      if (!vigente(id, token)) return estado;
      if (manter.has(item.identificador)) continue;
      const identificador = await notificacoes.scheduleNotificationAsync({
        identifier: item.identificador,
        content: { title: 'Horário do medicamento', body: item.corpo, sound: 'default', data: item.dados },
        trigger: { type: notificacoes.SchedulableTriggerInputTypes.DATE,
          date: item.data, channelId: plataforma === 'android' ? 'medicamentos' : undefined },
      });
      if (!vigente(id, token)) {
        await notificacoes.cancelScheduledNotificationAsync(identificador);
        return estado;
      }
    }
    return publicar({ usuarioId: id, ativados: true, preferenciaAtiva: true, erro: false,
      total: plano.itens.length, ate: plano.ate, incompletos: plano.incompletos,
      limitado: plano.limitado, horariosInexistentes: plano.horariosInexistentes,
      mensagem: plano.itens.length ? 'Lembretes com som programados neste aparelho.'
        : 'Lembretes ativados. Nenhum horário completo para programar.' });
  }
  function sincronizar() {
    if (!habilitado) return Promise.resolve(informarBloqueio());
    const id = conta; const token = versao;
    return enfileirar(() => sincronizarAgora(id, token)).catch(() => {
      if (!vigente(id, token)) return estado;
      return publicar({ erro: true, mensagem: 'Não foi possível atualizar os lembretes. Confira a conexão e tente novamente. Os avisos já programados foram mantidos quando possível.' });
    });
  }
  function definirConta(id) {
    conta = id || null;
    const token = ++versao;
    if (!habilitado) return Promise.resolve(informarBloqueio());
    publicar({ usuarioId: conta, ativados: false, preferenciaAtiva: false,
      total: 0, ate: null, erro: false, indisponivel: plataforma === 'web',
      mensagem: 'Consultando lembretes deste aparelho…' });
    // A limpeza começa imediatamente, mesmo se uma consulta anterior estiver sem conexão.
    const limpeza = plataforma === 'web' ? Promise.resolve()
      : obterNotificacoes().then(notificacoes => cancelar(notificacoes,
        dados => dados.usuarioId !== conta || !conta));
    // Evita rejeição não tratada enquanto a fila anterior termina.
    limpeza.catch(() => {});
    return enfileirar(async () => {
      if (!vigente(id || null, token)) return estado;
      await limpeza;
      return sincronizarAgora(id || null, token);
    }).catch(() => vigente(id || null, token)
      ? publicar({ erro: true, mensagem: 'Não foi possível preparar os lembretes neste aparelho. Tente novamente nos Ajustes.' }) : estado);
  }
  function configurar(ativar) {
    if (!habilitado) return Promise.resolve(informarBloqueio());
    const id = conta; const token = versao;
    let gravou = false;
    return enfileirar(async () => {
      if (!id || !vigente(id, token)) return estado;
      if (plataforma === 'web') return sincronizarAgora(id, token);
      await armazenamento.setItem(chave(id), String(ativar));
      gravou = true;
      return sincronizarAgora(id, token, ativar);
    }).catch(() => vigente(id, token)
      ? publicar({ ...(gravou ? { preferenciaAtiva: ativar } : {}), erro: true,
        mensagem: 'Não foi possível alterar os lembretes. Tente novamente.' }) : estado);
  }
  function testar() {
    if (!habilitado) return Promise.reject(new Error('Os avisos estão desativados nesta versão.'));
    const id = conta; const token = versao;
    return enfileirar(async () => {
      if (!id || !vigente(id, token) || !estado.ativados) throw new Error('Ative os lembretes antes de testar.');
      const notificacoes = await obterNotificacoes();
      if (!await temPermissao(notificacoes)) throw new Error('Permita as notificações nos ajustes do celular.');
      if (!vigente(id, token)) return;
      const identificador = await notificacoes.scheduleNotificationAsync({
        identifier: `${MARCA_LEMBRETE}:teste:${id}`,
        content: { title: 'Teste de lembrete', body: 'O som dos lembretes está funcionando. Este teste não registra uma tomada.',
          sound: 'default', data: { aplicativo: MARCA_LEMBRETE, usuarioId: id, teste: true } },
        trigger: { type: notificacoes.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5,
          channelId: plataforma === 'android' ? 'medicamentos' : undefined },
      });
      if (!vigente(id, token)) await notificacoes.cancelScheduledNotificationAsync(identificador);
    });
  }
  return {
    definirConta, sincronizar, configurar, testar,
    obterEstado: () => estado,
    observar(ouvinte) { ouvintes.add(ouvinte); return () => ouvintes.delete(ouvinte); },
  };
}
