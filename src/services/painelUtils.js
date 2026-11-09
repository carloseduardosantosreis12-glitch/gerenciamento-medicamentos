export function numero(texto, permitirZero = true) {
  if (!/^\d{1,9}([.,]\d{1,3})?$/.test(String(texto).trim())) return null;
  const valor = Number(String(texto).trim().replace(',', '.'));
  return (permitirZero ? valor >= 0 : valor > 0) ? valor : null;
}

export function quantidade(valor, unidade) {
  if (valor == null || !unidade) return 'Quantidade não informada';
  const texto = String(Number(valor)).replace('.', ',');
  const tipo = String(unidade).trim().toLowerCase();
  const singular = Number(valor) === 1;
  let sufixo = unidade;
  if (['comprimido', 'comprimidos'].includes(tipo)) {
    sufixo = singular ? 'comprimido' : 'comprimidos';
  } else if (['cápsula', 'cápsulas', 'capsula', 'capsulas'].includes(tipo)) {
    sufixo = singular ? 'cápsula' : 'cápsulas';
  } else if (['frasco', 'frascos'].includes(tipo)) {
    sufixo = singular ? 'frasco' : 'frascos';
  } else if (tipo === 'ml') {
    sufixo = 'mL';
  }
  return `${texto} ${sufixo}`;
}

export function dataBR(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor || '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : 'Não informada';
}

export function validadeISO(valor) {
  if (!String(valor).trim()) return null;
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!partes) throw new Error('Informe a validade em DD/MM/AAAA.');
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (Number(ano) < 1900 || data.getFullYear() !== Number(ano)
    || data.getMonth() !== Number(mes) - 1 || data.getDate() !== Number(dia)) {
    throw new Error('Informe uma data de validade que exista no calendário.');
  }
  return `${ano}-${mes}-${dia}`;
}

export function montarPainel(dados, diasValidade = 30) {
  const medicamentos = dados?.medicamentos || [];
  const tomadas = dados?.confirmadas || [];
  const confirmadas = new Set(tomadas.map((item) => item.horario_id));
  const rotina = medicamentos.flatMap((medicamento) => (medicamento.horarios || [])
    .filter((h) => h.ativo && h.previsto_hoje !== false && (h.dias || []).includes(Number(dados.dia_semana)))
    .map((h) => ({ ...h, medicamento, confirmado: confirmadas.has(h.id),
      semConfirmacao: h.horario.slice(0, 5) < dados.hora_local })));
  rotina.sort((a, b) => a.horario.localeCompare(b.horario)
    || a.medicamento.nome.localeCompare(b.medicamento.nome));
  return {
    pendentes: rotina.filter((item) => !item.confirmado),
    tomadas,
    estoque: medicamentos.filter((m) => Number(m.quantidade_estoque) <= Number(m.limite_alerta)),
    validade: medicamentos.filter((m) => m.dias_validade != null
      && Number(m.dias_validade) <= diasValidade)
      .sort((a, b) => Number(a.dias_validade) - Number(b.dias_validade)),
    semValidade: medicamentos.filter((m) => !m.validade).length,
  };
}

export function textoValidade(item) {
  if (Number(item.dias_validade) < 0) return `Vencido em ${dataBR(item.validade)}`;
  if (Number(item.dias_validade) === 0) return 'Vence hoje';
  return `Vence em ${item.dias_validade} dia(s), em ${dataBR(item.validade)}`;
}
