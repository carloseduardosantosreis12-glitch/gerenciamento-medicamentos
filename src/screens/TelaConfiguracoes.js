import { useCallback } from 'react';
import { Alert, Switch } from 'react-native';
import { Botao, Card, Estado, Opcoes, Tela, Texto, useAcao, usePreferencias } from '../components/Interface';
import { resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';
import Detalhes from '../components/Detalhes';
import ConfiguracaoLembretes from '../components/ConfiguracaoLembretes';
import { definirContaDosLembretes, sincronizarLembretes } from '../services/lembretes';

const FUSOS = [
  { valor: 'America/Sao_Paulo', titulo: 'Brasília / São Paulo' },
  { valor: 'America/Manaus', titulo: 'Manaus' },
  { valor: 'America/Rio_Branco', titulo: 'Rio Branco' },
  { valor: 'America/Noronha', titulo: 'Fernando de Noronha' },
];
export default function TelaConfiguracoes({ usuario, navigation }) {
  const { preferencias, salvar } = usePreferencias();
  const [ocupado, executar] = useAcao();
  const buscar = useCallback(() => resultado(supabase.from('perfis').select('fuso_horario').eq('id', usuario.id).single()), [usuario.id]);
  const { dados, erro, carregando, atualizar } = useDados(buscar);
  function mudar(chave, valor) { executar(() => salvar({ [chave]: valor })); }
  function mudarFuso(fuso) {
    Alert.alert('Alterar fuso da rotina?', 'Os horários cadastrados passarão a seguir o fuso selecionado. Confira a Agenda depois da alteração.', [
      { text: 'Voltar', style: 'cancel' }, { text: 'Alterar', onPress: () => executar(async () => {
        await resultado(supabase.from('perfis').update({ fuso_horario: fuso }).eq('id', usuario.id).select('id').single());
        await sincronizarLembretes();
        await atualizar();
      }) },
    ]);
  }
  return <Tela>
    <Texto titulo>Ajustes</Texto>
    <Card>
      <Texto titulo>Leitura</Texto>
      <Texto>Letras maiores</Texto>
      <Switch value={preferencias.textoMaior} disabled={ocupado}
        accessibilityLabel="Usar letras maiores" hitSlop={10}
        onValueChange={v => mudar('textoMaior', v)} />
      <Detalhes titulo="Cor do aplicativo">
        <Opcoes itens={[{ valor: 'azul', titulo: 'Azul' }, { valor: 'verde', titulo: 'Verde' }]}
          selecionado={preferencias.cor} onChange={v => mudar('cor', v)} disabled={ocupado} />
      </Detalhes>
    </Card>
    <Card>
      <Texto titulo>Minha conta</Texto>
      <Botao titulo="Meu perfil" secundario onPress={() => navigation.navigate('Perfil')} />
      <Botao titulo={usuario?.user_metadata?.tipo_perfil === 'cuidador' ? 'Pessoas e permissões' : 'Meu cuidador e permissões'}
        secundario onPress={() => navigation.navigate('Cuidador')} />
    </Card>
    <Detalhes titulo="Outros ajustes">
      <Card><Texto titulo>Aviso de validade</Texto><Texto>Mostrar alerta quando faltar até:</Texto>
        <Opcoes itens={[7, 15, 30, 60].map(v => ({ valor: v, titulo: `${v} dias` }))}
          selecionado={preferencias.diasValidade} onChange={v => mudar('diasValidade', v)} disabled={ocupado} />
      </Card>
      <Card><Texto titulo>Fuso horário</Texto>
        <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
        {dados && <Opcoes itens={FUSOS} selecionado={dados.fuso_horario} onChange={mudarFuso} disabled={ocupado} />}
        <Texto>Use o fuso do local onde a pessoa toma os medicamentos.</Texto>
      </Card>
      <ConfiguracaoLembretes />
    </Detalhes>
    <Detalhes titulo="Como usar">
      <Texto>Cadastre um remédio e defina os horários. Na Agenda, toque em Já tomei somente depois de tomar.</Texto>
      <Texto>Os medicamentos e o histórico precisam de conexão. Os avisos no celular estão desativados nesta versão.</Texto>
    </Detalhes>
    <Botao titulo={ocupado ? 'Aguarde...' : 'Sair da conta'} secundario perigo disabled={ocupado}
      onPress={() => executar(async () => {
        await definirContaDosLembretes(null);
        try { await resultado(supabase.auth.signOut({ scope: 'local' })); }
        catch (erroSaida) { await definirContaDosLembretes(usuario.id); throw erroSaida; }
      })} />
  </Tela>;
}
