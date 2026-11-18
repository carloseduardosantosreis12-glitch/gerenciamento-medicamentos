import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Texto, usePreferencias } from './Interface';
import Icone from './Icone';
import { criarEstilosInicioIdoso } from '../styles/InicioIdoso.styles';

export default function CabecalhoApp({ usuario, navigation }) {
  const { tema } = usePreferencias();
  const insets = useSafeAreaInsets();
  const estilos = criarEstilosInicioIdoso(tema, insets);
  const nome = String(usuario?.user_metadata?.nome || usuario?.user_metadata?.full_name || '').trim().split(/\s+/)[0];
  return <View style={{ paddingTop: insets.top, gap: 14 }}>
    <View style={estilos.cabecalho}>
      <View style={estilos.marca}>
        <Image source={require('../../assets/logo-medicamentos.png')} style={estilos.logo} resizeMode="contain" accessible={false} />
        <Texto titulo style={estilos.tituloMarca}>Meus{'\n'}medicamentos</Texto>
      </View>
      <Pressable onPress={() => navigation.navigate('Configuracoes')}
        accessibilityRole="button" accessibilityLabel="Abrir configurações" style={estilos.configuracoes}>
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Icone tipo="configuracoes" cor={tema.azul} />
        </View>
        <Texto style={estilos.rotuloConfiguracoes}>Ajustes</Texto>
      </Pressable>
    </View>
    <Texto style={estilos.saudacao}>{nome ? `Olá, ${nome}!` : 'Olá!'}</Texto>
  </View>;
}
