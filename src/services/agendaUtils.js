export const DIAS_SEMANA = [
  { valor: 1, curto: 'Seg', nome: 'Segunda-feira' },
  { valor: 2, curto: 'Ter', nome: 'Terça-feira' },
  { valor: 3, curto: 'Qua', nome: 'Quarta-feira' },
  { valor: 4, curto: 'Qui', nome: 'Quinta-feira' },
  { valor: 5, curto: 'Sex', nome: 'Sexta-feira' },
  { valor: 6, curto: 'Sáb', nome: 'Sábado' },
  { valor: 7, curto: 'Dom', nome: 'Domingo' },
];

export const UNIDADES_DOSE = [
  { valor: 'comprimido', titulo: 'Comprimidos' },
  { valor: 'cápsula', titulo: 'Cápsulas' },
  { valor: 'mL', titulo: 'mL' },
];

export function unidadeDose(unidade) {
  const texto = String(unidade || '').trim().toLowerCase();
  if (['comprimido', 'comprimidos'].includes(texto)) return 'comprimido';
  if (['capsula', 'capsulas', 'cápsula', 'cápsulas'].includes(texto)) return 'cápsula';
  return texto === 'ml' ? 'mL' : '';
}

export function mascararHorario(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 4);
  return numeros.length > 2
    ? numeros.slice(0, 2) + ':' + numeros.slice(2)
    : numeros;
}

export function horarioValido(valor) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

export function diaParaExpo(dia) {
  return (dia % 7) + 1;
}

export function resumirDias(dias) {
  if (dias.length === 7) return 'Todos os dias';
  return DIAS_SEMANA.filter((dia) => dias.includes(dia.valor))
    .map((dia) => dia.curto).join(', ');
}

export function mensagemBanco(erro) {
  if (['PGRST200', 'PGRST202', 'PGRST205', '42P01', '42883'].includes(erro?.code)) {
    return 'Primeiro execute o arquivo banco_medicamentos.sql no SQL Editor do Supabase. Depois toque em Atualizar.';
  }
  if (erro?.code === '42501') {
    return 'Sua conta não tem autorização para alterar esse medicamento.';
  }
  return erro?.message || 'Não foi possível acessar os dados. Confira sua conexão e tente novamente.';
}
