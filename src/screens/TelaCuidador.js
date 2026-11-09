import estilos from "../styles/TelaCuidador.styles";
import { useCallback, useState } from 'react';
import { Alert, Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Botao, Campo, Card, Estado, Tela, Texto, useAcao } from '../components/Interface';
import { resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';
import { listarIdososAcompanhados } from '../services/acompanhamento';
import { textoIdade } from '../services/perfilUtils';
export default function TelaCuidador({
  usuario,
  navigation
}) {
  const ehCuidador = usuario?.user_metadata?.tipo_perfil === 'cuidador';
  const [codigo, setCodigo] = useState('');
  const [ocupado, executar] = useAcao();
  const buscar = useCallback(async () => {
    const vinculos = await resultado(supabase.from('autorizacoes').select('id,idoso_id,cuidador_id,status,criado_em').or(`idoso_id.eq.${usuario.id},cuidador_id.eq.${usuario.id}`).order('criado_em', {
      ascending: false
    }));
    const ids = [...new Set(vinculos.flatMap(v => [v.idoso_id, v.cuidador_id]))];
    const perfis = ids.length ? await resultado(supabase.from('perfis').select('id,nome').in('id', ids)) : [];
    const idosos = await listarIdososAcompanhados();
    return {
      vinculos,
      nomes: Object.fromEntries(perfis.map(p => [p.id, p.nome])),
      idosos: Object.fromEntries((idosos || []).map(p => [p.id, p]))
    };
  }, [usuario.id]);
  const {
    dados,
    erro,
    carregando,
    atualizar
  } = useDados(buscar);
  function copiarCodigo() {
    executar(async () => {
      const copiado = await Clipboard.setStringAsync(usuario.id);
      if (!copiado) {
        throw new Error('Não foi possível copiar o código. Tente novamente ou use Compartilhar.');
      }
      Alert.alert('Código copiado', 'Agora você pode colar o código e enviar ao seu cuidador.');
    });
  }
  function compartilharCodigo() {
    executar(async () => {
      await Share.share({
        title: 'Meu código de acompanhamento',
        message: `Meu código de acompanhamento no Meus medicamentos:\n\n${usuario.id}\n\nNo perfil Cuidador, cole o código e solicite o acompanhamento. Depois eu autorizo o acesso pelo aplicativo.`
      });
    });
  }
  function solicitar() {
    executar(async () => {
      if (!ehCuidador) {
        throw new Error('Use o perfil Cuidador para solicitar acompanhamento.');
      }
      const valor = codigo.trim().toLowerCase();
      if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(valor)) {
        throw new Error('Cole o código completo da pessoa que será acompanhada.');
      }
      if (valor === usuario.id.toLowerCase()) throw new Error('Use o código de outra conta.');
      const vinculo = await resultado(supabase.rpc('solicitar_acompanhamento', {
        p_idoso_id: valor
      }));
      setCodigo('');
      await atualizar();
      Alert.alert(vinculo.status === 'autorizado' ? 'Acompanhamento já autorizado' : 'Solicitação registrada', vinculo.status === 'autorizado' ? 'Você já pode abrir o acompanhamento.' : 'A pessoa precisa autorizar o acesso na área Cuidador da conta dela.');
    });
  }
  function decidir(vinculo, status) {
    const aprovando = status === 'autorizado';
    Alert.alert(aprovando ? 'Autorizar acompanhamento?' : 'Encerrar acesso?', aprovando ? 'Esta conta poderá consultar seus medicamentos, estoque, validade e histórico. O acesso pode ser revogado aqui.' : 'A conta deixará de ter acesso às informações da pessoa acompanhada.', [{
      text: 'Voltar',
      style: 'cancel'
    }, {
      text: aprovando ? 'Autorizar' : 'Encerrar',
      onPress: () => executar(async () => {
        await resultado(supabase.from('autorizacoes').update({
          status
        }).eq('id', vinculo.id).select('id').single());
        await atualizar();
      })
    }]);
  }
  const minhas = (dados?.vinculos || []).filter(v => v.idoso_id === usuario.id);
  const acompanho = (dados?.vinculos || [])
    .filter(v => v.cuidador_id === usuario.id)
    .sort((a, b) => Number(b.status === 'autorizado') - Number(a.status === 'autorizado'));
  const nome = id => dados?.nomes[id] || `Conta ${id.slice(0, 8)}`;
  return <Tela atualizar={atualizar} carregando={carregando}>
      <Texto titulo>{ehCuidador ? 'Idosos acompanhados' : 'Cuidador e acompanhamento'}</Texto>
      {ehCuidador && <Texto>Escolha um idoso autorizado para consultar seus medicamentos e sua rotina. Seus próprios remédios ficam em Meus remédios e Minha agenda.</Texto>}
      {ehCuidador ? <Card>
          <Texto titulo>Quero acompanhar alguém</Texto>
          <Campo rotulo="Código da pessoa acompanhada" value={codigo} onChangeText={setCodigo} autoCapitalize="none" autoCorrect={false} placeholder="Cole o código completo" editable={!ocupado} />
          <Botao titulo={ocupado ? 'Aguarde...' : 'Solicitar acompanhamento'} onPress={solicitar} disabled={ocupado} />
          <Texto pequeno>O acesso depende da autorização da pessoa acompanhada.</Texto>
        </Card> : <Card>
          <Texto titulo>Meu código de acompanhamento</Texto>
          <Texto selectable accessibilityLabel={`Meu código de acompanhamento: ${usuario.id}`}>
            {usuario.id}
          </Texto>
          <View style={estilos.acoesCodigo}>
            <Botao titulo="Copiar" onPress={copiarCodigo} disabled={ocupado} style={estilos.botaoCopiar} />
            <Botao titulo="Compartilhar" onPress={compartilharCodigo} secundario disabled={ocupado} style={estilos.botaoCompartilhar} />
          </View>
          <Texto pequeno>Envie este código ao cuidador. Você decide se autoriza o acompanhamento.</Texto>
        </Card>}
      <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
      {dados && <>
        {(!ehCuidador || minhas.length > 0) && <>
          <Texto titulo>Quem acompanha minha conta</Texto>
          {!minhas.length && <Texto>Nenhuma solicitação recebida.</Texto>}
          {minhas.map(v => <Card key={v.id}>
              <Texto titulo>{nome(v.cuidador_id)}</Texto>
              <Texto pequeno>Status: {v.status}</Texto>
              <Texto pequeno selectable>Código da conta: {v.cuidador_id}</Texto>
              {v.status !== 'autorizado' && <Botao titulo={v.status === 'revogado' ? 'Reativar acesso' : 'Autorizar acesso'} disabled={ocupado} onPress={() => decidir(v, 'autorizado')} />}
              {v.status !== 'revogado' && <Botao titulo={v.status === 'pendente' ? 'Recusar solicitação' : 'Revogar acesso'} secundario perigo disabled={ocupado} onPress={() => decidir(v, 'revogado')} />}
            </Card>)}
        </>}
        {(ehCuidador || acompanho.length > 0) && <>
          <Texto titulo>{ehCuidador ? 'Quem eu acompanho' : 'Pessoas que acompanho'}</Texto>
          {!acompanho.length && <Card><Texto>Você ainda não acompanha nenhum idoso. Solicite o acompanhamento pelo código e aguarde a autorização na conta dele.</Texto></Card>}
          {acompanho.map(v => <Card key={v.id}>
              <Texto titulo>{dados.idosos[v.idoso_id]?.nome || (v.status === 'autorizado' ? nome(v.idoso_id) : 'Solicitação de acompanhamento')}</Texto>
              {v.status === 'autorizado' && <Texto>{textoIdade(dados.idosos[v.idoso_id]?.idade)}</Texto>}
              <Texto pequeno>{v.status === 'autorizado' ? 'Acompanhamento autorizado' : v.status === 'pendente' ? 'Aguardando autorização do idoso' : 'Acompanhamento encerrado'}</Texto>
              {v.status === 'pendente' && <Texto pequeno>Os dados do idoso estarão disponíveis depois da autorização.</Texto>}
              {v.status !== 'autorizado' && <Texto pequeno selectable>Código da conta: {v.idoso_id}</Texto>}
              {v.status === 'autorizado' && <Botao titulo="Ver medicamentos e rotina" onPress={() => navigation.navigate('Acompanhamento', {
            idosoId: v.idoso_id,
            nome: dados.idosos[v.idoso_id]?.nome || nome(v.idoso_id)
          })} />}
              {v.status !== 'revogado' && <Botao titulo={v.status === 'pendente' ? 'Cancelar solicitação' : 'Encerrar acompanhamento'} secundario perigo disabled={ocupado} onPress={() => decidir(v, 'revogado')} />}
            </Card>)}
        </>}
      </>}
    </Tela>;
}
