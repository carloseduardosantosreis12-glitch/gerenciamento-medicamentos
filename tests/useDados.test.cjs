const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

// Executa o hook real com foco, relógio e eventos controlados, sem rede nem dados pessoais.
function bancada(buscar) {
  const estados = []; const refs = [];
  let indiceEstado = 0; let indiceRef = 0; let foco; let horario = 1000;
  const react = {
    useState(inicial) {
      const indice = indiceEstado++;
      if (!(indice in estados)) estados[indice] = inicial;
      return [estados[indice], valor => { estados[indice] = valor; }];
    },
    useRef(inicial) {
      const indice = indiceRef++;
      return refs[indice] ||= { current: inicial };
    },
    useCallback: callback => callback,
  };
  const { code } = babel.transformSync(fs.readFileSync(path.join(__dirname, '../src/services/useDados.js'), 'utf8'), {
    babelrc: false, configFile: false,
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  const modulo = { exports: {} };
  new Function('require', 'module', 'exports', 'Date', 'setInterval', 'clearInterval', code)(id => {
    if (id === 'react') return react;
    if (id === 'react-native') return { AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } };
    if (id === '@react-navigation/native') return { useFocusEffect: callback => { foco = callback; } };
    throw new Error(`Dependência inesperada: ${id}`);
  }, modulo, modulo.exports, { now: () => horario }, () => 1, () => {});
  const render = () => {
    indiceEstado = 0; indiceRef = 0;
    return modulo.exports.useDados(buscar);
  };
  render();
  const desfocar = foco();
  return { render, desfocar, horario: valor => { horario = valor; } };
}
const terminar = () => new Promise(resolve => setImmediate(resolve));

test('a hora da última consulta só muda quando a consulta termina com sucesso', async () => {
  let falhar = false;
  const b = bancada(async () => {
    if (falhar) throw new Error('Sem conexão');
    return { nome: 'Dados fictícios' };
  });
  await terminar();
  assert.equal(b.render().atualizadoEm, 1000);
  falhar = true; b.horario(2000);
  await b.render().atualizar();
  assert.equal(b.render().atualizadoEm, 1000);
  assert.equal(b.render().dados, null);
  assert.match(b.render().erro, /Sem conexão/);
  b.desfocar();
});

test('resposta antiga não substitui os dados e a data de uma consulta mais recente', async () => {
  const respostas = [];
  const b = bancada(() => new Promise(resolve => respostas.push(resolve)));
  const proxima = b.render().atualizar();
  b.horario(3000); respostas[1]({ nome: 'Consulta recente' });
  await proxima;
  b.horario(4000); respostas[0]({ nome: 'Consulta antiga' });
  await terminar();
  assert.equal(b.render().dados.nome, 'Consulta recente');
  assert.equal(b.render().atualizadoEm, 3000);
  b.desfocar();
});

test('consulta concluída após sair da tela não publica dados nem horário', async () => {
  let responder;
  const b = bancada(() => new Promise(resolve => { responder = resolve; }));
  b.desfocar(); responder({ nome: 'Pessoa anterior' });
  await terminar();
  assert.equal(b.render().dados, null);
  assert.equal(b.render().atualizadoEm, null);
});
