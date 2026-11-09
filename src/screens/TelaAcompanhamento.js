import { useCallback } from 'react';
import { Botao, Card, Estado, Tela, Texto } from '../components/Interface';
import PainelRotina from '../components/PainelRotina';
import { identificacaoAcompanhada } from '../services/acompanhamento';
import { textoIdade } from '../services/perfilUtils';
import { useDados } from '../services/useDados';

export default function TelaAcompanhamento({ route, navigation }) {
  const idosoId = route?.params?.idosoId;
  // Uma troca de pessoa recria o conteúdo e descarta os dados da anterior.
  return <ConteudoAcompanhamento key={idosoId || 'sem-pessoa'} idosoId={idosoId} navigation={navigation} />;
}

function ConteudoAcompanhamento({ idosoId, navigation }) {
  const buscar = useCallback(() => identificacaoAcompanhada(idosoId), [idosoId]);
  const { dados, erro, carregando, atualizar } = useDados(buscar);
  return <Tela atualizar={atualizar} carregando={carregando}>
    <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
    {dados && <>
      <Card>
        <Texto pequeno>Você está acompanhando</Texto>
        <Texto titulo>{dados.nome}</Texto>
        <Texto>{textoIdade(dados.idade)}</Texto>
        <Texto pequeno>Os medicamentos e horários abaixo pertencem a {dados.nome}.</Texto>
      </Card>
      <Texto>Consulta autorizada. As confirmações e as alterações ficam com a pessoa acompanhada.</Texto>
      <Botao titulo="Ver histórico de tomadas" secundario onPress={() => navigation.navigate('Historico', { idosoId, nome: dados.nome })} />
      <PainelRotina key={idosoId} idosoId={idosoId} navigation={navigation} somenteLeitura exibirMedicamentos />
    </>}
    <Botao titulo="Voltar aos idosos acompanhados" secundario onPress={() => navigation.navigate('Cuidador')} />
  </Tela>;
}
