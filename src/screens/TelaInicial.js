import { Botao, Card, Tela, Texto, usePreferencias } from '../components/Interface';
import InicioIdoso from '../components/InicioIdoso';
import CabecalhoApp from '../components/CabecalhoApp';
import Detalhes from '../components/Detalhes';

export default function TelaInicial({ usuario, navigation }) {
  if (usuario?.user_metadata?.tipo_perfil !== 'cuidador') {
    return <InicioIdoso usuario={usuario} navigation={navigation} />;
  }
  return <InicioCuidador usuario={usuario} navigation={navigation} />;
}

function InicioCuidador({ usuario, navigation }) {
  const { tema } = usePreferencias();
  return <Tela>
    <CabecalhoApp usuario={usuario} navigation={navigation} />
    <Card style={{ backgroundColor: tema.azul, borderColor: tema.azul }}>
      <Texto titulo cor={tema.branco}>Quem eu acompanho</Texto>
      <Texto cor={tema.branco}>Veja a rotina de quem autorizou seu acesso.</Texto>
      <Botao titulo="Ver pessoas acompanhadas" secundario onPress={() => navigation.navigate('Cuidador')} />
    </Card>
    <Card>
      <Texto titulo>Meus medicamentos</Texto>
      <Texto>Sua própria rotina fica aqui.</Texto>
      <Botao titulo="Ver minha agenda" onPress={() => navigation.navigate('Rotina')} />
      <Botao titulo="Ver meus remédios" secundario onPress={() => navigation.navigate('Medicamentos')} />
    </Card>
    <Detalhes titulo="Outros acessos">
      <Botao titulo="Meu histórico de tomadas" secundario onPress={() => navigation.navigate('Historico', { idosoId: usuario.id, nome: '' })} />
      <Botao titulo="Cadastrar remédio" secundario onPress={() => navigation.navigate('CadastrarMedicamento')} />
    </Detalhes>
  </Tela>;
}
