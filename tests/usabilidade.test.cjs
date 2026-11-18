const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularSus, resumirAvaliacoes } = require('../scripts/calcular-sus.cjs');

test('SUS respeita polaridade dos itens e escala de 0 a 100', () => {
  assert.equal(calcularSus([5,1,5,1,5,1,5,1,5,1]),100);
  assert.equal(calcularSus([1,5,1,5,1,5,1,5,1,5]),0);
  assert.equal(calcularSus(Array(10).fill(3)),50);
});

test('SUS não calcula questionário incompleto ou resposta fora da escala', () => {
  assert.throws(()=>calcularSus([1,2]));
  assert.throws(()=>calcularSus(Array(10).fill(0)));
  assert.throws(()=>calcularSus(Array(10).fill(2.5)));
});

test('resumo mantém amostra vazia sem inventar resultados', () => {
  const r=resumirAvaliacoes([]);
  assert.equal(r.participantes,0); assert.equal(r.resumo[0].media,null);
});

test('resumo recusa códigos repetidos e separa os perfis', () => {
  const a={codigo:'P01',perfil:'idoso',respostas:Array(10).fill(3)};
  assert.throws(()=>resumirAvaliacoes([a,a]));
  const r=resumirAvaliacoes([a,{...a,codigo:'P02',perfil:'cuidador'}]);
  assert.equal(r.resumo[0].participantes,1); assert.equal(r.resumo[1].participantes,1);
});
