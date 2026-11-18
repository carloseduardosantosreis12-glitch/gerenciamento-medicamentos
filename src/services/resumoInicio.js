import { montarPainel } from './painelUtils';

// Os horários e o dia vêm do servidor, no fuso da pessoa acompanhada.
export function resumirInicio(dados, diasValidade = 30) {
  const resumo = montarPainel(dados, diasValidade);
  const atrasadas = resumo.pendentes.filter(item => item.semConfirmacao);
  const proxima = resumo.pendentes.find(item => !item.semConfirmacao)
    || atrasadas[0]
    || null;

  return {
    ...resumo,
    proxima,
    atrasadas: atrasadas.length,
    totalMedicamentos: dados?.medicamentos?.length || 0,
  };
}
