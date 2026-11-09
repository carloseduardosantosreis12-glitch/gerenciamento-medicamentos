import { useCallback } from 'react';
import { Alert, Switch } from 'react-native';
import { Botao, Card, Estado, Opcoes, Tela, Texto, useAcao, usePreferencias } from '../components/Interface';
import { resultado } from '../services/api';
import { supabase } from '../services/supabase';
import { useDados } from '../services/useDados';

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
        await atualizar();
      }) },
    ]);
  }
  return <Tela><Texto titulo>Configurações</Texto>
    <Card><Texto titulo>{usuario?.user_metadata?.nome || 'Minha conta'}</Texto><Texto pequeno>{usuario.email}</Texto>
      <Botao titulo="Meu perfil" secundario onPress={() => navigation.navigate('Perfil')} />
      <Botao titulo="Cuidador e privacidade" secundario onPress={() => navigation.navigate('Cuidador')} />
    </Card>
    <Card><Texto titulo>Aparência</Texto><Texto>Cor de destaque</Texto>
      <Opcoes itens={[{ valor: 'azul', titulo: 'Azul' }, { valor: 'verde', titulo: 'Verde' }]}
        selecionado={preferencias.cor} onChange={(v) => mudar('cor', v)} disabled={ocupado} />
      <Texto>Letras maiores</Texto><Switch value={preferencias.textoMaior} disabled={ocupado}
        accessibilityLabel="Usar letras maiores" onValueChange={(v) => mudar('textoMaior', v)} />
    </Card>
    <Card><Texto titulo>Alerta de validade</Texto><Texto>Avisar na tela quando faltar até:</Texto>
      <Opcoes itens={[7, 15, 30, 60].map((v) => ({ valor: v, titulo: `${v} dias` }))}
        selecionado={preferencias.diasValidade} onChange={(v) => mudar('diasValidade', v)} disabled={ocupado} />
      <Texto pequeno>As preferências de aparência e validade ficam salvas nesta conta, neste aparelho.</Texto>
    </Card>
    <Card><Texto titulo>Fuso da rotina</Texto>
      <Estado erro={erro} carregando={carregando && !dados} atualizar={atualizar} />
      {dados && <Opcoes itens={FUSOS} selecionado={dados.fuso_horario} onChange={mudarFuso} disabled={ocupado} />}
      <Texto pequeno>O cuidador vê a rotina no fuso da pessoa acompanhada.</Texto>
    </Card>
    <Card><Texto titulo>Como funciona</Texto>
      <Texto pequeno>Cadastre o medicamento e o estoque. Na Agenda, defina quantidade, dias e horários. Em Hoje, confirme somente as tomadas realizadas. Atualize o estoque manualmente em Medicamentos e estoque.</Texto>
      <Texto pequeno>Os dados de medicamentos e histórico precisam de conexão com a internet. Esta versão não envia notificações.</Texto>
    </Card>
    <Botao titulo={ocupado ? 'Aguarde...' : 'Sair da conta'} secundario perigo disabled={ocupado}
      onPress={() => executar(() => resultado(supabase.auth.signOut({ scope: 'local' })))} />
  </Tela>;
}
