// Datas de nascimento ficam separadas da data/hora das tomadas.
export function mascararNascimento(texto) {
  const numeros = String(texto || '').replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export function nascimentoISO(texto, hoje = new Date()) {
  const valor = String(texto || '').trim();
  if (!valor) return null;
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!partes) throw new Error('Informe a data de nascimento em DD/MM/AAAA.');
  const [, diaTexto, mesTexto, anoTexto] = partes;
  const dia = Number(diaTexto);
  const mes = Number(mesTexto);
  const ano = Number(anoTexto);
  const data = new Date(ano, mes - 1, dia);
  if (ano < 1900 || data.getFullYear() !== ano
      || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    throw new Error('Informe uma data de nascimento válida, a partir de 1900.');
  }
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (data > inicioHoje) throw new Error('A data de nascimento não pode estar no futuro.');
  return `${anoTexto}-${mesTexto}-${diaTexto}`;
}

export function nascimentoBR(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor || '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : '';
}

export function textoIdade(idade) {
  if (idade == null || !Number.isInteger(idade) || idade < 0) return 'Idade não informada';
  return `${idade} ${idade === 1 ? 'ano' : 'anos'}`;
}
