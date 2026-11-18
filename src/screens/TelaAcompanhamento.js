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
        <Texto titulo>{dados.nome}</Texto>
        <Texto>{textoIdade(dados.idade)}</Texto>

      </Card>


      <PainelRotina key={idosoId} idosoId={idosoId} navigation={navigation} somenteLeitura exibirMedicamentos />
      <Botao titulo="Ver histórico de tomadas" secundario onPress={() => navigation.navigate('Historico', { idosoId, nome: dados.nome })} />
    </>}
    <Botao titulo="Voltar às pessoas acompanhadas" secundario onPress={() => navigation.navigate('Cuidador')} />
  </Tela>;
}
