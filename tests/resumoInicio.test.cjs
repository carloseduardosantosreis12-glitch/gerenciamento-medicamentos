const test = require('node:test');
const assert = require('node:assert/strict');
const carregar = require('./carregarModulo.cjs');
const { resumirInicio } = carregar('src/services/resumoInicio.js');

test('destaque da home prioriza próxima dose e informa atrasadas', () => {
  const dados={dia_semana:1,hora_local:'12:00',confirmadas:[],medicamentos:[{
    id:'a',nome:'Fictício',quantidade_estoque:3,limite_alerta:5,horarios:[
      {id:'08',horario:'08:00',ativo:true,dias:[1]}, {id:'14',horario:'14:00',ativo:true,dias:[1]},
    ],
  }]};
  const r=resumirInicio(dados); assert.equal(r.proxima.id,'14'); assert.equal(r.atrasadas,1);
  assert.equal(r.estoque.length,1);
  dados.confirmadas=[{horario_id:'08'},{horario_id:'14'}];
  assert.equal(resumirInicio(dados).proxima,null);
});

test('home lida com rotina vazia e carregamento', () => {
  assert.equal(resumirInicio(null).proxima,null);
  assert.equal(resumirInicio({medicamentos:[]}).totalMedicamentos,0);
});
