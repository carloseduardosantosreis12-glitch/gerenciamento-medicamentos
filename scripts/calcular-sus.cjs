const fs = require('node:fs');

function calcularSus(respostas) {
  if (!Array.isArray(respostas) || respostas.length !== 10
      || Array.from(respostas).some(valor => !Number.isInteger(valor) || valor < 1 || valor > 5)) {
    throw new Error('Informe exatamente dez respostas inteiras entre 1 e 5.');
  }
  return respostas.reduce((soma, valor, indice) => soma + (indice % 2 === 0 ? valor - 1 : 5 - valor), 0) * 2.5;
}

function resumirAvaliacoes(registros) {
  if (!Array.isArray(registros)) throw new Error('O arquivo deve conter uma lista de avaliações.');
  const codigos = new Set();
  const resultados = registros.map(item => {
    if (!item || typeof item !== 'object') throw new Error('Cada avaliação deve ser um registro preenchido.');
    if (typeof item.codigo !== 'string' || !item.codigo.trim() || codigos.has(item.codigo.trim())) {
      throw new Error('Use um código de participante preenchido e único em cada registro.');
    }
    if (!['idoso', 'cuidador'].includes(item.perfil)) throw new Error('Informe o perfil idoso ou cuidador.');
    codigos.add(item.codigo.trim());
    return { codigo: item.codigo.trim(), perfil: item.perfil, sus: calcularSus(item.respostas) };
  });
  const resumo = ['idoso', 'cuidador'].map(perfil => {
    const notas = resultados.filter(item => item.perfil === perfil).map(item => item.sus);
    return { perfil, participantes: notas.length,
      media: notas.length ? Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : null };
  });
  return { participantes: resultados.length, resultados, resumo };
}

if (require.main === module) {
  try {
    if (!process.argv[2]) throw new Error('Uso: node scripts/calcular-sus.cjs caminho-das-respostas.json');
    const resultado = resumirAvaliacoes(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
    if (!resultado.participantes) console.log('Nenhuma avaliação preenchida. Não há resultados de usabilidade para calcular.');
    else console.log(JSON.stringify(resultado, null, 2));
  } catch (erro) { console.error(erro.message); process.exitCode = 1; }
}

module.exports = { calcularSus, resumirAvaliacoes };
