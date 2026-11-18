import { useCallback, useState } from 'react';
import { Botao, Card, Estado, Opcoes, Tela, Texto } from '../components/Interface';
import { resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { quantidade } from '../services/painelUtils';
import { useDados } from '../services/useDados';
import { identificacaoAcompanhada } from '../services/acompanhamento';
import Detalhes from '../components/Detalhes';
import StatusAtualizacao from '../components/StatusAtualizacao';

const FILTROS = [
  { valor: 'todos', titulo: 'Todas' },
  { valor: 'confirmadas', titulo: 'Confirmadas' },
  { valor: 'sem_confirmacao', titulo: 'Sem confirmação' },
];

export default function TelaHistorico({ usuario, route }) {
  const idosoId = route?.params?.idosoId || usuario.id;
  return <HistoricoPessoa key={idosoId} idosoId={idosoId} usuarioId={usuario.id} />;
}

function HistoricoPessoa({ idosoId, usuarioId }) {
  const [filtro, setFiltro] = useState('todos');
  return <ConteudoHistorico key={filtro} idosoId={idosoId} usuarioId={usuarioId}
    filtro={filtro} mudarFiltro={setFiltro} />;
}

function ConteudoHistorico({ idosoId, usuarioId, filtro, mudarFiltro }) {
  const pessoal = idosoId === usuarioId;
  const [cursores, setCursores] = useState([null]);
  const [pagina, setPagina] = useState(0);
  const cursor = cursores[pagina];
  const buscar = useCallback(async () => {
    const pessoa = pessoal ? null : await identificacaoAcompanhada(idosoId);
    const contexto = await resultado(supabase.rpc('obter_historico_medicamentos', {
      p_idoso_id: idosoId, p_filtro: filtro,
      p_antes_previsto: cursor?.previsto_para || null,
      p_antes_id: cursor?.id || null,
    }));
    return { ...contexto, nome: pessoa?.nome };
  }, [idosoId, pessoal, filtro, cursor]);
  const { dados, erro, carregando, atualizar, atualizadoEm } = useDados(buscar);
  function maisAntigos() {
    const ultimo = dados?.itens?.at(-1);
    if (!ultimo || !dados.tem_mais) return;
    setCursores(lista => [...lista.slice(0, pagina + 1), { previsto_para: ultimo.previsto_para, id: ultimo.id }]);
    setPagina(valor => valor + 1);
  }
  const formatar = (data, fuso) => new Date(data).toLocaleString('pt-BR', {
    timeZone: fuso || dados.fuso, dateStyle: 'short', timeStyle: 'short',
  });
  return <Tela atualizar={atualizar} carregando={carregando}>
    <Texto titulo>Histórico de tomadas</Texto>
    {dados && <Card><Texto titulo>{pessoal ? 'Meu histórico' : `Acompanhando: ${dados.nome}`}</Texto></Card>}

    <Opcoes itens={FILTROS} selecionado={filtro} onChange={mudarFiltro} />
    <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />

    {dados && <>

      {!dados.itens.length && <Card><Texto>Nenhum registro neste período e filtro.</Texto></Card>}
      {dados.itens.map(item => <Card key={item.id}>
        <Texto titulo>{item.nome_medicamento}</Texto>
        <Texto>{quantidade(item.quantidade_registrada, item.unidade_registrada)}</Texto>


        <Texto>{item.confirmado_em ? 'Tomada confirmada' : 'Sem confirmação registrada'}</Texto>
        <Texto>{formatar(item.confirmado_em || item.previsto_para, item.fuso_registrado)}</Texto>
        <Detalhes titulo={`Detalhes do registro de ${item.nome_medicamento}`}>
          <Texto>{item.dosagem_registrada}</Texto>
          <Texto>Previsto: {formatar(item.previsto_para, item.fuso_registrado)}</Texto>
          {item.confirmado_em && <Texto>Confirmado: {formatar(item.confirmado_em, item.fuso_registrado)}</Texto>}
        </Detalhes>
      </Card>)}
      <Texto pequeno>Página {pagina + 1}</Texto>
      {pagina > 0 && <Botao titulo="Ver página mais recente" secundario disabled={carregando}
        onPress={() => setPagina(valor => valor - 1)} />}
      {dados.tem_mais && <Botao titulo="Ver registros mais antigos" secundario disabled={carregando} onPress={maisAntigos} />}
    </>}
    <Detalhes titulo="Sobre o histórico">
      <Texto>Registros dos últimos 30 dias. Sem confirmação significa que a tomada não foi registrada no aplicativo.</Texto>
      <StatusAtualizacao atualizadoEm={atualizadoEm} carregando={carregando} erro={erro} fuso={dados?.fuso} />
      {dados?.historico_desde && <Texto>Início do acompanhamento de doses sem confirmação: {formatar(dados.historico_desde)}.</Texto>}
    </Detalhes>
  </Tela>;
}
