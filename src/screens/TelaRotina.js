import { Botao, Tela } from '../components/Interface';
import PainelRotina from '../components/PainelRotina';

export default function TelaRotina({ usuario, navigation }) {
  return (
    <Tela>
      <PainelRotina idosoId={usuario.id} navigation={navigation} />
      <Botao titulo="Agendar medicamento" secundario onPress={() => navigation.navigate('Agenda')} />
      <Botao titulo="Histórico de tomadas" secundario
        onPress={() => navigation.navigate('Historico', { idosoId: usuario.id, nome: '' })} />
    </Tela>
  );
}
