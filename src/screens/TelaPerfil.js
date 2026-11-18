import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, Card, Estado, Tela, Texto, useAcao } from '../components/Interface';
import { supabase } from '../services/supabase';
import { resultado } from '../services/api';
import Detalhes from '../components/Detalhes';
import { mascararNascimento, nascimentoBR, nascimentoISO } from '../services/perfilUtils';
export default function TelaPerfil({
  usuario,
  navigation
}) {
  const tipo = usuario?.user_metadata?.tipo_perfil === 'cuidador' ? 'cuidador' : 'idoso';
  const [nome, setNome] = useState(usuario?.user_metadata?.nome || usuario?.user_metadata?.full_name || '');
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
  return <Tela>
      <Texto titulo>Meu perfil</Texto>
      <Card>
        <Campo rotulo="Nome completo" value={nome} onChangeText={setNome} maxLength={200} editable={!ocupado} autoCapitalize="words" />
        <Detalhes titulo="Dados da conta"><Texto pequeno>E-mail</Texto>
        <Texto selectable>{usuario.email}</Texto>
        <Texto>Perfil de uso</Texto>
        <Texto>
          {tipo === 'cuidador' ? 'Cuidador' : 'Idoso'}
        </Texto>
        </Detalhes>
      </Card>
      <Botao titulo={ocupado ? 'Aguarde...' : 'Salvar perfil'} onPress={salvar} disabled={ocupado} />
      <Detalhes titulo="Data de nascimento (opcional)">
      <Card>
        <Texto>A idade será mostrada ao cuidador autorizado.</Texto>
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
      </Detalhes>
      <Botao titulo={tipo === 'idoso' ? 'Meu cuidador e permissões' : 'Pessoas e permissões'}
        secundario onPress={() => navigation.navigate('Cuidador')} />
    </Tela>;
}
