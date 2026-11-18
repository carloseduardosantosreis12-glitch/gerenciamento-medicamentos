import { horarioValido } from './agendaUtils';
import { quantidade } from './painelUtils';

export const MARCA_LEMBRETE = 'meus-medicamentos';
export const LIMITE_LEMBRETES = 60;
export const DIAS_LEMBRETES = 30;

function partesNoFuso(data, fuso) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(data);
  return Object.fromEntries(partes.filter(item => item.type !== 'literal')
    .map(item => [item.type, Number(item.value)]));
}

function dataISO(partes) {
  return `${partes.year}-${String(partes.month).padStart(2, '0')}-${String(partes.day).padStart(2, '0')}`;
}

export function instanteNoFuso(ano, mes, dia, hora, minuto, fuso) {
  const alvo = Date.UTC(ano, mes - 1, dia, hora, minuto);
  let instante = alvo;
  for (let i = 0; i < 4; i += 1) {
    const partes = partesNoFuso(new Date(instante), fuso);
    const observado = Date.UTC(partes.year, partes.month - 1, partes.day,
      partes.hour, partes.minute, partes.second);
    const diferenca = alvo - observado;
    if (diferenca === 0) return new Date(instante);
    instante += diferenca;
  }
  // Horários inexistentes durante uma mudança de fuso não são deslocados silenciosamente.
  return null;
}

export function planejarLembretes(dados, usuarioId, agora = new Date()) {
  if (!usuarioId || !dados?.fuso || !Array.isArray(dados.medicamentos)) {
    throw new Error('Não foi possível conferir a rotina e o fuso dos lembretes.');
  }
  const hoje = partesNoFuso(agora, dados.fuso);
  const confirmadas = new Set((dados.confirmadas || []).map(item => item.horario_id));
  const ocorrencias = [];
  const incompletos = new Set();
  let horariosInexistentes = 0;
  for (let deslocamento = 0; deslocamento < DIAS_LEMBRETES; deslocamento += 1) {
    const dia = new Date(Date.UTC(hoje.year, hoje.month - 1, hoje.day + deslocamento));
    const diaISO = dia.toISOString().slice(0, 10);
    const diaSemana = dia.getUTCDay() || 7;
    for (const medicamento of dados.medicamentos) {
      if (medicamento.ativo === false) continue;
      for (const horario of medicamento.horarios || []) {
        if (!horario.ativo || !(horario.dias || []).includes(diaSemana)) continue;
        const hhmm = String(horario.horario || '').slice(0, 5);
        if (!horario.id || !horarioValido(hhmm) || !Number.isFinite(Number(horario.quantidade_dose))
          || Number(horario.quantidade_dose) <= 0
          || !['comprimido', 'cápsula', 'mL'].includes(horario.unidade_dose)) {
          incompletos.add(horario.id || medicamento.id);
          continue;
        }
        if (diaISO === dados.hoje && (horario.previsto_hoje === false || confirmadas.has(horario.id))) continue;
        const [hora, minuto] = hhmm.split(':').map(Number);
        const data = instanteNoFuso(dia.getUTCFullYear(), dia.getUTCMonth() + 1,
          dia.getUTCDate(), hora, minuto, dados.fuso);
        if (!data) { horariosInexistentes += 1; continue; }
        if (data.getTime() <= agora.getTime()) continue;
        const corpo = `${medicamento.nome} · ${medicamento.dosagem || ''}\n`
          + `${quantidade(horario.quantidade_dose, horario.unidade_dose)} · ${hhmm}\n`
          + 'Abra a agenda para confirmar a tomada.';
        ocorrencias.push({
          identificador: `${MARCA_LEMBRETE}:${usuarioId}:${horario.id}:${diaISO}`,
          data, diaISO, corpo,
          dados: {
            aplicativo: MARCA_LEMBRETE, usuarioId, horarioId: horario.id, dataLocal: diaISO,
            assinatura: JSON.stringify([data.getTime(), corpo, dados.fuso]),
          },
        });
      }
    }
  }
  ocorrencias.sort((a, b) => a.data.getTime() - b.data.getTime()
    || a.identificador.localeCompare(b.identificador));
  const itens = [...new Map(ocorrencias.map(item => [item.identificador, item])).values()]
    .slice(0, LIMITE_LEMBRETES);
  return {
    itens, ate: itens.at(-1)?.diaISO || null,
    limitado: ocorrencias.length > LIMITE_LEMBRETES,
    incompletos: incompletos.size, horariosInexistentes,
    hoje: dataISO(hoje),
  };
}

export function pertenceAoAplicativo(notificacao) {
  return notificacao?.content?.data?.aplicativo === MARCA_LEMBRETE;
}

export function podeAbrirLembrete(resposta, usuarioId) {
  const pedido = resposta?.notification?.request;
  return !!usuarioId && pertenceAoAplicativo(pedido)
    && pedido.content.data.usuarioId === usuarioId;
}
