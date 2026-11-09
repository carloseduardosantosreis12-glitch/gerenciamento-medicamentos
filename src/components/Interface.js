import { criarTema } from "../styles/tema";
import estilos from "../styles/Interface.styles";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Contexto = createContext(null);
const PADRAO = {
  cor: 'azul',
  textoMaior: false,
  diasValidade: 30
};
export function PreferenciasProvider({
  usuarioId,
  children
}) {
  const [preferencias, setPreferencias] = useState(PADRAO);
  const [pronto, setPronto] = useState(false);
  const atual = useRef(PADRAO);
  const fila = useRef(Promise.resolve());
  const chave = `meus-medicamentos:preferencias:${usuarioId || 'acesso'}`;
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const texto = await AsyncStorage.getItem(chave);
        const salvo = texto ? JSON.parse(texto) : {};
        const valor = {
          cor: ['azul', 'verde'].includes(salvo.cor) ? salvo.cor : PADRAO.cor,
          textoMaior: salvo.textoMaior === true,
          diasValidade: [7, 15, 30, 60].includes(salvo.diasValidade) ? salvo.diasValidade : 30
        };
        if (ativo) {
          atual.current = valor;
          setPreferencias(valor);
        }
      } catch {
        if (ativo) {
          atual.current = PADRAO;
          setPreferencias(PADRAO);
        }
      } finally {
        if (ativo) setPronto(true);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [chave]);
  function salvar(mudancas) {
    const tarefa = fila.current.catch(() => {}).then(async () => {
      const proxima = {
        ...atual.current,
        ...mudancas
      };
      await AsyncStorage.setItem(chave, JSON.stringify(proxima));
      atual.current = proxima;
      setPreferencias(proxima);
    });
    fila.current = tarefa;
    return tarefa;
  }
  const tema = useMemo(() => criarTema(preferencias), [preferencias]);
  return <Contexto.Provider value={{
    preferencias,
    salvar,
    tema
  }}>
    {pronto ? children : <View style={estilos.carregamento}><ActivityIndicator /></View>}
  </Contexto.Provider>;
}
export function usePreferencias() {
  return useContext(Contexto);
}
export function useAcao() {
  const [ocupado, setOcupado] = useState(false);
  const trava = useRef(false);
  async function executar(acao) {
    if (trava.current) return;
    trava.current = true;
    setOcupado(true);
    try {
      return await acao();
    } catch (erro) {
      Alert.alert('Não foi possível concluir', erro?.message || 'Tente novamente.');
    } finally {
      trava.current = false;
      setOcupado(false);
    }
  }
  return [ocupado, executar];
}
export function Texto({
  children,
  titulo,
  pequeno,
  cor,
  style,
  ...resto
}) {
  const {
    tema
  } = usePreferencias();
  const tamanho = estilos.tamanhoTexto(tema, titulo, pequeno);
  return <Text accessibilityRole={titulo ? 'header' : undefined} {...resto} style={estilos.texto(cor, tema, tamanho, titulo, style)}>{children}</Text>;
}
export function Card({
  children,
  style
}) {
  const {
    tema
  } = usePreferencias();
  return <View style={estilos.card(tema, style)}>{children}</View>;
}
export function Botao({
  titulo,
  onPress,
  secundario,
  disabled,
  perigo,
  style,
  papel = 'button',
  selecionado
}) {
  const {
    tema
  } = usePreferencias();
  const cor = estilos.corBotao(tema, perigo);
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole={papel} accessibilityState={{
    disabled: !!disabled,
    checked: papel === 'radio' ? selecionado : undefined
  }} style={estilos.botao(secundario, tema, cor, disabled, style)}>
    <Texto cor={estilos.corTextoBotao(secundario, cor)} style={estilos.textoBotao}>{titulo}</Texto>
  </Pressable>;
}
export function Campo({
  rotulo,
  ...props
}) {
  const {
    tema
  } = usePreferencias();
  return <View style={estilos.grupoCampo}>
    <Texto style={estilos.rotuloCampo}>{rotulo}</Texto>
    <TextInput {...props} accessibilityLabel={rotulo} placeholderTextColor={estilos.placeholderCampo} style={estilos.campo(tema)} />
  </View>;
}
export function Opcoes({
  itens,
  selecionado,
  onChange,
  disabled
}) {
  return <View style={estilos.opcoes}>
    {itens.map(item => <Botao key={String(item.valor)} titulo={item.titulo} papel="radio" selecionado={selecionado === item.valor} disabled={disabled} secundario={selecionado !== item.valor} onPress={() => onChange(item.valor)} />)}
  </View>;
}
export function Tela({
  children,
  atualizar,
  carregando,
  rodape
}) {
  const {
    tema
  } = usePreferencias();
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView style={estilos.tela(tema)} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <StatusBar style={estilos.barraStatus} />
    <ScrollView keyboardShouldPersistTaps="handled" refreshControl={atualizar ? <RefreshControl refreshing={!!carregando} onRefresh={atualizar} /> : undefined} contentContainerStyle={estilos.conteudo(insets)}>
      {children}
    </ScrollView>
    {rodape}
  </KeyboardAvoidingView>;
}
export function Estado({
  erro,
  carregando,
  atualizar
}) {
  if (erro) return <Card><Texto cor={estilos.corErro} accessibilityRole="alert">{erro}</Texto>
    <Botao titulo="Tentar novamente" onPress={atualizar} /></Card>;
  return carregando ? <ActivityIndicator size="large" accessibilityLabel="Carregando os dados" /> : null;
}
