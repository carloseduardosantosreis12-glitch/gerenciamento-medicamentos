// Aparência de Interface: cores, tamanhos e espaçamentos.
import { cores } from "./cores";
import { StyleSheet } from "react-native";
const fixos = StyleSheet.create({
  carregamento: {
    flex: 1,
    justifyContent: 'center'
  },
  textoBotao: {
    fontWeight: '600',
    textAlign: 'center'
  },
  grupoCampo: {
    gap: 8,
    marginBottom: 12
  },
  rotuloCampo: {
    fontWeight: '600'
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  }
});
export default {
  carregamento: fixos.carregamento,
  texto(cor, tema, tamanho, titulo, style) {
    return [{
      color: cor || tema.texto,
      fontSize: tamanho,
      lineHeight: tamanho * 1.45,
      fontWeight: titulo ? '700' : '400'
    }, style];
  },
  card(tema, style) {
    return [{
      padding: 18,
      borderRadius: 20,
      backgroundColor: tema.branco,
      borderWidth: 1,
      borderColor: tema.borda,
      gap: 10,
      marginBottom: 14
    }, style];
  },
  botao(secundario, tema, cor, disabled, style) {
    return ({
      pressed
    }) => [{
      minHeight: 54,
      borderRadius: 13,
      padding: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: secundario ? tema.branco : cor,
      borderWidth: 1,
      borderColor: cor,
      opacity: pressed || disabled ? 0.55 : 1
    }, style];
  },
  corTextoBotao(secundario, cor) {
    return secundario ? cor : cores.branco;
  },
  textoBotao: fixos.textoBotao,
  grupoCampo: fixos.grupoCampo,
  rotuloCampo: fixos.rotuloCampo,
  placeholderCampo: cores.placeholderCampo,
  campo(tema) {
    return {
      minHeight: 56,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: cores.bordaCampo,
      color: tema.texto,
      backgroundColor: cores.fundoCampo,
      fontSize: 19 * tema.escala
    };
  },
  opcoes: fixos.opcoes,
  tela(tema) {
    return {
      flex: 1,
      backgroundColor: tema.fundo
    };
  },
  barraStatus: "dark",
  conteudo(insets) {
    return {
      width: '100%',
      maxWidth: 650,
      alignSelf: 'center',
      padding: 20,
      paddingBottom: Math.max(insets.bottom, 16) + 24,
      gap: 14
    };
  },
  corErro: cores.perigo,
  tamanhoTexto(tema, titulo, pequeno) {
    return (titulo ? 26 : pequeno ? 18 : 18) * tema.escala;
  },
  corBotao(tema, perigo) {
    return perigo ? tema.perigo : tema.azul;
  }
};
