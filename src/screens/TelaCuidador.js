import estilos from "../styles/TelaCuidador.styles";
import { useCallback, useState } from 'react';
import { Alert, Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Botao, Campo, Card, Estado, Tela, Texto, useAcao } from '../components/Interface';
import { resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';
import { listarIdososAcompanhados } from '../services/acompanhamento';
import Detalhes from '../components/Detalhes';
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
  function cartaoPermissao(v) {
    return <Card key={v.id}>
      <Texto titulo>{nome(v.cuidador_id)}</Texto>
      <Texto>{v.status === 'pendente' ? 'Quer acompanhar sua rotina' : v.status === 'autorizado' ? 'Acesso autorizado' : 'Acesso encerrado'}</Texto>
      {v.status === 'pendente' ? <>
        <Botao titulo="Autorizar acesso" disabled={ocupado} onPress={() => decidir(v, 'autorizado')} />
        <Botao titulo="Recusar solicitação" secundario perigo disabled={ocupado} onPress={() => decidir(v, 'revogado')} />
      </> : <Detalhes titulo={`Gerenciar acesso de ${nome(v.cuidador_id)}`}>
        <Texto>Esta pessoa pode consultar medicamentos e histórico enquanto o acesso estiver autorizado.</Texto>
        <Botao titulo={v.status === 'revogado' ? 'Reativar acesso' : 'Revogar acesso'} secundario perigo={v.status !== 'revogado'}
          disabled={ocupado} onPress={() => decidir(v, v.status === 'revogado' ? 'autorizado' : 'revogado')} />
      </Detalhes>}
    </Card>;
  }
  function cartaoPessoa(v) {
    const nomePessoa = dados.idosos[v.idoso_id]?.nome || (v.status === 'autorizado' ? nome(v.idoso_id) : 'Solicitação enviada');
    return <Card key={v.id}>
      <Texto titulo>{nomePessoa}</Texto>
      {v.status === 'autorizado' ? <>
        <Texto>{textoIdade(dados.idosos[v.idoso_id]?.idade)}</Texto>
        <Botao titulo="Ver rotina" onPress={() => navigation.navigate('Acompanhamento', { idosoId: v.idoso_id, nome: nomePessoa })} />
      </> : <Texto>{v.status === 'pendente' ? 'Aguardando autorização' : 'Acompanhamento encerrado'}</Texto>}
      {v.status !== 'revogado' && <Detalhes titulo={`Opções de ${nomePessoa}`}>
        <Botao titulo={v.status === 'pendente' ? 'Cancelar solicitação' : 'Encerrar acompanhamento'} secundario perigo
          disabled={ocupado} onPress={() => decidir(v, 'revogado')} />
      </Detalhes>}
    </Card>;
  }
  return <Tela atualizar={atualizar} carregando={carregando}>
    <Texto titulo>{ehCuidador ? 'Pessoas acompanhadas' : 'Meu cuidador'}</Texto>
    <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
    {dados && <>
      {minhas.some(v => v.status === 'pendente') && <>
        <Texto titulo>Solicitações recebidas</Texto>
        {minhas.filter(v => v.status === 'pendente').map(cartaoPermissao)}
      </>}
      {(!ehCuidador || minhas.some(v => v.status === 'autorizado')) && <>
        <Texto titulo>Quem acompanha minha conta</Texto>
        {!minhas.some(v => v.status === 'autorizado') && <Texto>Nenhum cuidador autorizado.</Texto>}
        {minhas.filter(v => v.status === 'autorizado').map(cartaoPermissao)}
      </>}
      {(ehCuidador || acompanho.some(v => v.status !== 'revogado')) && <>
        {!acompanho.some(v => v.status !== 'revogado') && <Card><Texto>Você ainda não acompanha ninguém. Use Adicionar pessoa para começar.</Texto></Card>}
        {acompanho.filter(v => v.status !== 'revogado').map(cartaoPessoa)}
      </>}
      {(minhas.some(v => v.status === 'revogado') || acompanho.some(v => v.status === 'revogado')) && <Detalhes titulo="Acessos encerrados">
        {minhas.filter(v => v.status === 'revogado').map(cartaoPermissao)}
        {acompanho.filter(v => v.status === 'revogado').map(cartaoPessoa)}
      </Detalhes>}
    </>}
    {ehCuidador ? <Detalhes titulo="Adicionar pessoa">
      <Card>
        <Campo rotulo="Código da pessoa" value={codigo} onChangeText={setCodigo} autoCapitalize="none" autoCorrect={false}
          placeholder="Cole o código completo" editable={!ocupado} />
        <Botao titulo={ocupado ? 'Aguarde...' : 'Solicitar acompanhamento'} onPress={solicitar} disabled={ocupado} />
        <Texto>A pessoa precisa autorizar seu acesso.</Texto>
      </Card>
    </Detalhes> : <Detalhes titulo="Compartilhar meu código">
      <Card>
        <Texto>Envie ao cuidador e aguarde a solicitação.</Texto>
        <Texto selectable accessibilityLabel={`Meu código: ${usuario.id}`}>{usuario.id}</Texto>
        <View style={estilos.acoesCodigo}>
          <Botao titulo="Copiar código" onPress={copiarCodigo} disabled={ocupado} style={estilos.botaoCopiar} />
          <Botao titulo="Compartilhar" onPress={compartilharCodigo} secundario disabled={ocupado} style={estilos.botaoCompartilhar} />
        </View>
      </Card>
    </Detalhes>}
  </Tela>;
}
