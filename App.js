import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Text, View } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase, erroConfiguracao } from './src/services/supabase';
import { PreferenciasProvider, usePreferencias } from './src/components/Interface';
import BarraNavegacao from './src/components/BarraNavegacao';
import estilos from './src/styles/App.styles';
import TelaAcesso from './src/screens/TelaAcesso';
import TelaCadastro from './src/screens/TelaCadastro';
import TelaLogin from './src/screens/TelaLogin';
import TelaConfirmarEmail from './src/screens/TelaConfirmarEmail';
import TelaInicial from './src/screens/TelaInicial';
import TelaCadastrarMedicamento from './src/screens/TelaCadastrarMedicamento';
import TelaAgendarMedicamento from './src/screens/TelaAgendarMedicamento';
import TelaMedicamentos from './src/screens/TelaMedicamentos';
import TelaCuidador from './src/screens/TelaCuidador';
import TelaAcompanhamento from './src/screens/TelaAcompanhamento';
import TelaHistorico from './src/screens/TelaHistorico';
import TelaPerfil from './src/screens/TelaPerfil';
import TelaConfiguracoes from './src/screens/TelaConfiguracoes';

const Stack = createNativeStackNavigator();

export function Navegacao({ sessao }) {
  const { tema } = usePreferencias();
  const navigationRef = useNavigationContainerRef();
  const [rotaAtual, setRotaAtual] = useState({ name: 'Inicio' });
  const usuario = sessao?.user;
  const ehCuidador = usuario?.user_metadata?.tipo_perfil === 'cuidador';

  function atualizarRotaAtual() {
    const rota = navigationRef.getCurrentRoute();
    if (rota) setRotaAtual(rota);
  }

  const telas = usuario
    ? [
        ['Inicio', TelaInicial, '', false],
        ['CadastrarMedicamento', TelaCadastrarMedicamento, 'Medicamento'],
        ['Agenda', TelaAgendarMedicamento, 'Agenda'],
        ['Medicamentos', TelaMedicamentos, 'Medicamentos e estoque'],
        ['Cuidador', TelaCuidador, ehCuidador ? 'Idosos acompanhados' : 'Cuidador'],
        ['Acompanhamento', TelaAcompanhamento, 'Acompanhamento'],
        ['Historico', TelaHistorico, 'Histórico'],
        ['Perfil', TelaPerfil, 'Meu perfil'],
        ['Configuracoes', TelaConfiguracoes, 'Configurações'],
      ]
    : [
        ['Acesso', TelaAcesso, '', false],
        ['Cadastro', TelaCadastro, 'Criar conta'],
        ['Login', TelaLogin, 'Entrar'],
        ['ConfirmarEmail', TelaConfirmarEmail, 'Confirmar e-mail'],
      ];

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={atualizarRotaAtual}
      onStateChange={atualizarRotaAtual}
    >
      <View style={estilos.areaAplicativo}>
        <Stack.Navigator
          key={usuario?.id || 'acesso'}
          screenOptions={estilos.navegacao(tema)}
        >
          {telas.map(([nome, Componente, titulo, cabecalho]) => (
            <Stack.Screen
              key={nome}
              name={nome}
              options={{ title: titulo, headerShown: cabecalho !== false }}
            >
              {props => <Componente {...props} usuario={usuario} />}
            </Stack.Screen>
          ))}
        </Stack.Navigator>
        {usuario && (
          <BarraNavegacao
            navigation={navigationRef}
            rotaAtual={rotaAtual}
            usuario={usuario}
          />
        )}
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      setCarregando(false);
    });
    if (Platform.OS !== 'web') supabase.auth.startAutoRefresh();
    const listener = AppState.addEventListener('change', estado => {
      if (Platform.OS !== 'web') {
        if (estado === 'active') supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
      }
    });
    return () => {
      data.subscription.unsubscribe();
      listener.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  if (erroConfiguracao) {
    return (
      <View style={estilos.erroConfiguracao}>
        <Text style={estilos.textoErroConfiguracao}>{erroConfiguracao}</Text>
      </View>
    );
  }
  if (carregando) {
    return (
      <View style={estilos.carregamento}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <PreferenciasProvider
        key={sessao?.user.id || 'acesso'}
        usuarioId={sessao?.user.id}
      >
        <Navegacao sessao={sessao} />
      </PreferenciasProvider>
    </SafeAreaProvider>
  );
}
