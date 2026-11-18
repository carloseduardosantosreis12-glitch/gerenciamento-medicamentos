import estilos from "../styles/TelaMedicamentos.styles";
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, Card, Estado, Tela, Texto, useAcao } from '../components/Interface';
import { contaId, resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';
import { dataBR, quantidade } from '../services/painelUtils';
import Detalhes from '../components/Detalhes';
import { sincronizarLembretes } from '../services/lembretes';
export default function TelaMedicamentos({
  navigation,
  route
}) {
  const [busca, setBusca] = useState('');
  const [arquivados, setArquivados] = useState(false);
  const somenteEstoque = route?.name === 'Estoque';
  const [ocupado, executar] = useAcao();
  const buscar = useCallback(async () => {
    const uid = await contaId();
    return resultado(supabase.from('medicamentos').select('*').eq('idoso_id', uid).eq('ativo', !arquivados).order('nome'));
  }, [arquivados]);
  const {
    dados,
    erro,
    carregando,
    atualizar
  } = useDados(buscar);
  function arquivar(item) {
    Alert.alert(arquivados ? 'Reativar medicamento?' : 'Arquivar medicamento?', arquivados ? item.nome : `${item.nome} sairá da rotina. O histórico será preservado.`, [{
      text: 'Voltar',
      style: 'cancel'
    }, {
      text: arquivados ? 'Reativar' : 'Arquivar',
      onPress: () => executar(async () => {
        const uid = await contaId();
        await resultado(supabase.from('medicamentos').update({
          ativo: arquivados
        }).eq('id', item.id).eq('idoso_id', uid).select('id').single());
        await sincronizarLembretes();
        await atualizar();
      })
    }]);
  }
  const lista = (dados || []).filter(m => m.nome.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'))
    && (!somenteEstoque || Number(m.quantidade_estoque) <= Number(m.limite_alerta)));
  return <Tela atualizar={atualizar} carregando={carregando}>
    <Texto titulo>{somenteEstoque ? 'Estoque baixo' : arquivados ? 'Remédios arquivados' : 'Meus remédios'}</Texto>
    {somenteEstoque && <Botao titulo="Ver todos os medicamentos" secundario onPress={() => navigation.navigate('Medicamentos')} />}
    <Botao titulo="Cadastrar remédio" onPress={() => navigation.navigate('CadastrarMedicamento')} />
    <Campo rotulo="Buscar medicamento" value={busca} onChangeText={setBusca} placeholder="Digite o nome" />
    {!somenteEstoque && <Detalhes titulo="Opções da lista"><Botao titulo={arquivados ? 'Mostrar ativos' : 'Mostrar arquivados'} secundario onPress={() => setArquivados(v => !v)} /></Detalhes>}
    <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
    {dados && !lista.length && <Card><Texto>{somenteEstoque && !busca.trim()
      ? 'Nenhum medicamento com estoque baixo.' : 'Nenhum medicamento encontrado nesta lista.'}</Texto></Card>}
    {lista.map(item => <Card key={item.id}>
      <Texto titulo>{item.nome}</Texto><Texto>{item.dosagem}</Texto>
      <Texto>Estoque: {quantidade(item.quantidade_estoque, item.unidade_estoque)}</Texto>
      {item.validade && <Texto>Validade: {dataBR(item.validade)}</Texto>}

      {Number(item.quantidade_estoque) <= Number(item.limite_alerta) && <Texto cor={estilos.corAlertaEstoque}>Estoque no limite ou abaixo dele.</Texto>}
      <Detalhes titulo={`Opções de ${item.nome}`}>
      <Texto>Aviso de estoque: {quantidade(item.limite_alerta, item.unidade_estoque)}</Texto>
      <Botao titulo="Editar dados e estoque" secundario disabled={ocupado} onPress={() => navigation.navigate('CadastrarMedicamento', {
        medicamentoId: item.id
      })} />
      {!arquivados && <Botao titulo="Agendar" secundario onPress={() => navigation.navigate('Agenda', {
        medicamentoId: item.id
      })} />}
      <Botao titulo={arquivados ? 'Reativar' : 'Arquivar'} secundario perigo={!arquivados} disabled={ocupado} onPress={() => arquivar(item)} />
      </Detalhes>
    </Card>)}
  </Tela>;
}
