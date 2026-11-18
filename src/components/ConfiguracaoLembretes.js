import { Alert } from 'react-native';
import { Botao, Card, Texto, useAcao } from './Interface';
import { useLembretes } from './LembretesProvider';
import { configurarLembretes, sincronizarLembretes, testarLembrete } from '../services/lembretes';
import { dataBR } from '../services/painelUtils';

export default function ConfiguracaoLembretes() {
  const estado = useLembretes();
  const [ocupado, executar] = useAcao();
  return <Card>
    <Texto titulo>Lembretes com som</Texto>
    <Texto>{estado?.mensagem || 'Consultando lembretes…'}</Texto>
    {!estado?.indisponivel && <>
      <Botao titulo={ocupado ? 'Aguarde…' : estado?.ativados ? 'Desativar lembretes' : 'Ativar lembretes'}
        secundario={estado?.ativados} disabled={ocupado}
        onPress={() => executar(() => configurarLembretes(!estado?.ativados))} />
      {estado?.preferenciaAtiva && !estado?.ativados && <Botao titulo="Manter lembretes desativados"
        secundario disabled={ocupado} onPress={() => executar(() => configurarLembretes(false))} />}
      {estado?.ativados && <>
        {!!estado.ate && <Texto>
          {estado.total} lembretes programados até {dataBR(estado.ate)}. Abra o aplicativo para renovar os próximos avisos.
        </Texto>}
        <Botao titulo="Testar som do lembrete" secundario disabled={ocupado} onPress={() => executar(async () => {
          await testarLembrete();
          Alert.alert('Teste programado', 'O aviso aparecerá em cerca de 5 segundos. Confira o volume do celular.');
        })} />
      </>}
      {(estado?.preferenciaAtiva || estado?.erro) && <Botao titulo="Atualizar lembretes" secundario
        disabled={ocupado} onPress={() => executar(sincronizarLembretes)} />}
      {!!estado?.incompletos && <Texto>Há horários sem quantidade de dose. Complete os dados na Agenda para receber esses lembretes.</Texto>}
      {!!estado?.horariosInexistentes && <Texto>Alguns horários não existem após uma mudança de fuso. Confira sua Agenda.</Texto>}
      <Texto>Ao tocar no aviso, você abre a agenda. A tomada só é registrada depois que você confirma no aplicativo.</Texto>
      <Texto pequeno>Os avisos já programados funcionam sem internet. Para atualizar a rotina, conecte-se. Som e pontualidade dependem das permissões, volume e ajustes do celular.</Texto>
    </>}
  </Card>;
}
