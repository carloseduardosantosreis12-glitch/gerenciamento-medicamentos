const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

// Executa os módulos JavaScript do app no Node, sem inicializar o React Native.
module.exports = function carregarModulo(arquivo, cache = new Map()) {
  const caminho = path.resolve(__dirname, '..', arquivo);
  if (cache.has(caminho)) return cache.get(caminho).exports;
  const modulo = { exports: {} };
  cache.set(caminho, modulo);
  const { code } = babel.transformSync(fs.readFileSync(caminho, 'utf8'), {
    filename: caminho, babelrc: false, configFile: false,
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  new Function('require', 'module', 'exports', code)(id => {
    if (!id.startsWith('.')) return require(id);
    const dependencia = path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(caminho), `${id}.js`));
    return module.exports(dependencia, cache);
  }, modulo, modulo.exports);
  return modulo.exports;
};
