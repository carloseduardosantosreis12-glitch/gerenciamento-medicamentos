// O instante é a conclusão de uma consulta ao servidor, não a hora de renderizar a tela.
export function formatarAtualizacao(instante, fuso) {
  if (instante == null) return null;
  const data = new Date(instante);
  if (!Number.isFinite(data.getTime())) return null;
  /** @type {Intl.DateTimeFormatOptions} */
  const opcoes = { dateStyle: 'short', timeStyle: 'medium' };
  try {
    return data.toLocaleString('pt-BR', { ...opcoes, ...(fuso ? { timeZone: fuso } : {}) });
  } catch {
    return data.toLocaleString('pt-BR', opcoes);
  }
}
