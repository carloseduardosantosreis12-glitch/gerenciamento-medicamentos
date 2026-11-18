import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Texto, usePreferencias } from './Interface';
import Icone from './Icone';
import { criarEstilosBarra } from '../styles/BarraNavegacao.styles';

export const ITENS_NAVEGACAO = [
  { tipo: 'medicamentos', titulo: 'Medicamentos', rota: 'Inicio' },
  { tipo: 'agenda', titulo: 'Agenda', rota: 'Rotina' },
  { tipo: 'cuidador', titulo: 'Cuidador', rota: 'Cuidador' },
  { tipo: 'configuracoes', titulo: 'Configurações', rota: 'Configuracoes' },
];

const SECOES = {
  Inicio: 'Inicio',
  Medicamentos: 'Inicio',
  Estoque: 'Inicio',
  CadastrarMedicamento: 'Inicio',
  Historico: 'Inicio',
  Agenda: 'Rotina',
  Rotina: 'Rotina',
  Cuidador: 'Cuidador',
  Acompanhamento: 'Cuidador',
  Configuracoes: 'Configuracoes',
  Perfil: 'Configuracoes',
};

export function itensDaNavegacao(usuario) {
  if (usuario?.user_metadata?.tipo_perfil !== 'cuidador') return [
    { tipo: 'medicamentos', titulo: 'Início', rota: 'Inicio' },
    { tipo: 'agenda', titulo: 'Agenda', rota: 'Rotina' },
    { tipo: 'lista', titulo: 'Remédios', rota: 'Medicamentos' },
  ];
  return ITENS_NAVEGACAO.map(item => ({
    ...item,
    titulo: {
      Inicio: 'Início',
      Rotina: 'Agenda',
      Cuidador: 'Pessoas',
      Configuracoes: 'Ajustes',
    }[item.rota] || item.titulo,
  }));
}

export function secaoDaRota(rota, usuarioId, ehCuidador = true) {
  const nome = typeof rota === 'string' ? rota : rota?.name;
  if (nome === 'Historico' && rota?.params?.idosoId
      && rota.params.idosoId !== usuarioId) return 'Cuidador';
  if (!ehCuidador) {
    if (['Medicamentos', 'Estoque', 'CadastrarMedicamento'].includes(nome)) return 'Medicamentos';
    if (['Rotina', 'Agenda', 'Historico'].includes(nome)) return 'Rotina';
  }
  return SECOES[nome];
}

export function abrirSecao(navigation, destino) {
  if (!navigation.isReady()) return;
  if (navigation.getCurrentRoute()?.name === destino) return;

  const estado = navigation.getRootState();
  let indiceAnterior = -1;
  for (let indice = 0; indice < (estado?.index ?? 0); indice += 1) {
    if (estado.routes[indice].name === destino) indiceAnterior = indice;
  }

  if (indiceAnterior >= 0) {
    // Volta à tela que já estava aberta, sem criar outra cópia dela.
    navigation.dispatch({
      ...StackActions.pop(estado.index - indiceAnterior),
      target: estado.key,
    });
    return;
  }
  navigation.navigate(destino);
}

export default function BarraNavegacao({ navigation, rotaAtual, usuario }) {
  const { tema } = usePreferencias();
  const insets = useSafeAreaInsets();
  const [tecladoAberto, setTecladoAberto] = useState(false);
  const estilos = useMemo(() => criarEstilosBarra(tema, insets), [tema, insets]);
  const ehCuidador = usuario?.user_metadata?.tipo_perfil === 'cuidador';
  const selecionada = secaoDaRota(rotaAtual, usuario?.id, ehCuidador);
  const itens = itensDaNavegacao(usuario);

  useEffect(() => {
    const abriu = Keyboard.addListener('keyboardDidShow', () => setTecladoAberto(true));
    const fechou = Keyboard.addListener('keyboardDidHide', () => setTecladoAberto(false));
    return () => {
      abriu.remove();
      fechou.remove();
    };
  }, []);

  // Libera espaço para preencher os campos; reaparece ao fechar o teclado.
  if (tecladoAberto) return null;

  return (
    <View style={estilos.barra} accessibilityRole="tablist">
      {itens.map(item => {
        const selecionado = selecionada === item.rota;
        const cor = selecionado ? tema.azul : tema.secundario;
        return (
          <Pressable
            key={item.rota}
            accessibilityRole="tab"
            accessibilityLabel={item.titulo}
            accessibilityState={{ selected: selecionado }}
            onPress={() => abrirSecao(navigation, item.rota)}
            style={({ pressed }) => [estilos.item, pressed && estilos.pressionado]}
          >
            <View
              style={[estilos.fundoIcone, selecionado && estilos.fundoSelecionado]}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              <Icone tipo={item.tipo} cor={cor} />
            </View>
            <Texto
              pequeno
              cor={cor}
              style={[estilos.texto, !ehCuidador && estilos.textoIdoso, selecionado && estilos.textoSelecionado]}
            >
              {item.titulo}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}
