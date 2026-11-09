import estilos from "../styles/TelaPerfil.styles";
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, Card, Estado, Tela, Texto, useAcao } from '../components/Interface';
import { supabase } from '../services/supabase';
import { resultado } from '../services/api';
import { mascararNascimento, nascimentoBR, nascimentoISO } from '../services/perfilUtils';
export default function TelaPerfil({
  usuario,
  navigation
}) {
  const tipo = usuario?.user_metadata?.tipo_perfil === 'cuidador' ? 'cuidador' : 'idoso';
  const [nome, setNome] = useState(usuario?.user_metadata?.nome || usuario?.user_metadata?.full_name || '');
  const [codigo, setCodigo] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [carregandoNascimento, setCarregandoNascimento] = useState(true);
  const [erroNascimento, setErroNascimento] = useState('');
  const [tentativaNascimento, setTentativaNascimento] = useState(0);
  const [ocupado, executar] = useAcao();
  useEffect(() => {
    let ativo = true;
    setCarregandoNascimento(true);
    setErroNascimento('');
    resultado(supabase.from('perfis').select('data_nascimento').eq('id', usuario.id).single())
      .then(perfil => { if (ativo) setNascimento(nascimentoBR(perfil.data_nascimento)); })
      .catch(erro => { if (ativo) setErroNascimento(erro?.message || 'Não foi possível carregar a data de nascimento.'); })
      .finally(() => { if (ativo) setCarregandoNascimento(false); });
    return () => { ativo = false; };
  }, [usuario.id, tentativaNascimento]);

  function salvarNascimento() {
    executar(async () => {
      const dataNascimento = nascimentoISO(nascimento);
      await resultado(supabase.from('perfis').update({ data_nascimento: dataNascimento })
        .eq('id', usuario.id).select('id').single());
      Alert.alert('Data de nascimento salva', dataNascimento
        ? 'Sua idade será calculada automaticamente para os cuidadores autorizados.'
        : 'A data de nascimento foi removida. Sua idade aparecerá como não informada.');
    });
  }
  function salvar() {
    executar(async () => {
      if (!nome.trim() || nome.trim().length > 200) {
        throw new Error('Informe seu nome com até 200 caracteres.');
      }
      await resultado(supabase.auth.updateUser({
        data: {
          nome: nome.trim()
        }
      }));
      Alert.alert('Perfil salvo', 'Seu nome foi atualizado.');
      navigation.goBack();
    });
  }
  function solicitar() {
    executar(async () => {
      if (tipo !== 'cuidador') {
        throw new Error('Somente contas cadastradas como Cuidador podem solicitar acompanhamento.');
      }
      const valor = codigo.trim().toLowerCase();
      if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(valor)) {
        throw new Error('Cole o código completo da pessoa que será acompanhada.');
      }
      if (valor === usuario.id.toLowerCase()) {
        throw new Error('Use o código de outra conta.');
      }
      const vinculo = await resultado(supabase.rpc('solicitar_acompanhamento', {
        p_idoso_id: valor
      }));
      setCodigo('');
      Alert.alert(vinculo.status === 'autorizado' ? 'Acompanhamento já autorizado' : 'Solicitação registrada', vinculo.status === 'autorizado' ? 'Abra a aba Idosos para ver os medicamentos e a rotina.' : 'A pessoa precisa autorizar o acesso na área Cuidador da conta dela.');
    });
  }
  return <Tela>
      <Texto titulo>Meu perfil</Texto>
      <Card>
        <Campo rotulo="Nome completo" value={nome} onChangeText={setNome} maxLength={200} editable={!ocupado} autoCapitalize="words" />
        <Texto pequeno>E-mail da conta</Texto>
        <Texto selectable>{usuario.email}</Texto>
        <Texto>Perfil de uso</Texto>
        <Texto style={estilos.tipoPerfil}>
          {tipo === 'cuidador' ? 'Cuidador' : 'Idoso'}
        </Texto>
        <Texto pequeno>Perfil definido no cadastro.</Texto>
      </Card>
      <Botao titulo={ocupado ? 'Aguarde...' : 'Salvar perfil'} onPress={salvar} disabled={ocupado} />
      <Card>
        <Texto titulo>Data de nascimento</Texto>
        <Texto pequeno>Opcional. A idade é calculada a partir desta data para aparecer no acompanhamento autorizado.</Texto>
        <Estado erro={erroNascimento} carregando={carregandoNascimento}
          atualizar={() => setTentativaNascimento(valor => valor + 1)} />
        {!erroNascimento && !carregandoNascimento && <>
          <Campo rotulo="Data de nascimento (DD/MM/AAAA)" value={nascimento}
            onChangeText={valor => setNascimento(mascararNascimento(valor))} placeholder="Ex.: 25/08/1954"
            keyboardType="number-pad" maxLength={10} editable={!ocupado} />
          <Botao titulo={ocupado ? 'Aguarde...' : 'Salvar data de nascimento'}
            onPress={salvarNascimento} disabled={ocupado} />
        </>}
      </Card>
      {tipo === 'idoso' ? <Card>
          <Texto titulo>Meu código de acompanhamento</Texto>
          <Texto>Compartilhe este código com seu cuidador.</Texto>
          <Texto pequeno selectable accessibilityLabel="Meu código de acompanhamento">
            {usuario.id}
          </Texto>
          <Texto pequeno>Você não precisa digitar um código. Depois que o cuidador solicitar acesso, autorize a solicitação na área Cuidador.</Texto>
          <Botao titulo="Ver solicitações e permissões" secundario onPress={() => navigation.navigate('Cuidador')} disabled={ocupado} />
        </Card> : <Card>
          <Texto titulo>Acompanhar uma pessoa</Texto>
          <Campo rotulo="Código da pessoa acompanhada" value={codigo} onChangeText={setCodigo} autoCapitalize="none" autoCorrect={false} placeholder="Cole o código completo" editable={!ocupado} />
          <Botao titulo={ocupado ? 'Aguarde...' : 'Solicitar acompanhamento'} onPress={solicitar} disabled={ocupado} />
          <Texto pequeno>O acesso à rotina, ao estoque e ao histórico depende da autorização da pessoa acompanhada.</Texto>
          <Botao titulo="Ver acompanhamentos" secundario onPress={() => navigation.navigate('Cuidador')} disabled={ocupado} />
        </Card>}
    </Tela>;
}
