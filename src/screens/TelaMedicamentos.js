import estilos from "../styles/TelaMedicamentos.styles";
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, Card, Estado, Tela, Texto, useAcao } from '../components/Interface';
import { contaId, resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';
import { dataBR, quantidade } from '../services/painelUtils';
export default function TelaMedicamentos({
  navigation
}) {
  const [busca, setBusca] = useState('');
  const [arquivados, setArquivados] = useState(false);
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
        await atualizar();
      })
    }]);
  }
  const lista = (dados || []).filter(m => m.nome.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR')));
  return <Tela atualizar={atualizar} carregando={carregando}>
    <Texto titulo>Medicamentos e estoque</Texto>
    <Botao titulo="Cadastrar medicamento" onPress={() => navigation.navigate('CadastrarMedicamento')} />
    <Campo rotulo="Buscar medicamento" value={busca} onChangeText={setBusca} placeholder="Digite o nome" />
    <Botao titulo={arquivados ? 'Mostrar ativos' : 'Mostrar arquivados'} secundario onPress={() => setArquivados(v => !v)} />
    <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
    {dados && !lista.length && <Card><Texto>Nenhum medicamento encontrado nesta lista.</Texto></Card>}
    {lista.map(item => <Card key={item.id}>
      <Texto titulo>{item.nome}</Texto><Texto>{item.dosagem}</Texto>
      <Texto>Estoque: {quantidade(item.quantidade_estoque, item.unidade_estoque)}</Texto>
      <Texto pequeno>Limite: {quantidade(item.limite_alerta, item.unidade_estoque)}</Texto>
      <Texto pequeno>Validade: {dataBR(item.validade)}</Texto>
      {Number(item.quantidade_estoque) <= Number(item.limite_alerta) && <Texto cor={estilos.corAlertaEstoque}>Estoque no limite ou abaixo dele.</Texto>}
      <Botao titulo="Editar dados e estoque" secundario disabled={ocupado} onPress={() => navigation.navigate('CadastrarMedicamento', {
        medicamentoId: item.id
      })} />
      {!arquivados && <Botao titulo="Agendar" secundario onPress={() => navigation.navigate('Agenda', {
        medicamentoId: item.id
      })} />}
      <Botao titulo={arquivados ? 'Reativar' : 'Arquivar'} secundario perigo={!arquivados} disabled={ocupado} onPress={() => arquivar(item)} />
    </Card>)}
  </Tela>;
}
