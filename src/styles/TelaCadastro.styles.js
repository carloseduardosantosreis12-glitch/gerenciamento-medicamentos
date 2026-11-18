// Aparência de TelaCadastro: cores, tamanhos e espaçamentos.
import { cores } from "./cores";
import { StyleSheet } from "react-native";
const fixos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoCadastro
  },
  conteudo: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40
  },
  formulario: {
    backgroundColor: cores.brancoSolido,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: cores.bordaCadastro,
    elevation: 3
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: cores.textoCadastro
  },
  subtitulo: {
    fontSize: 18,
    lineHeight: 26,
    color: cores.textoSecundarioCadastro,
    marginTop: 8,
    marginBottom: 8
  },
  rotulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.rotuloCadastro,
    marginTop: 20,
    marginBottom: 10
  },
  campo: {
    minHeight: 56,
    backgroundColor: cores.fundoCampoCadastro,
    borderWidth: 1,
    borderColor: cores.placeholderCampo,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: cores.textoCadastro
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  opcaoSelecionada: {
    borderColor: cores.roxoCadastro,
    backgroundColor: cores.roxoClaroCadastro
  },
  circulo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: cores.roxoCadastro,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ponto: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: cores.roxoCadastro
  },
  textosOpcao: {
    flex: 1,
    minWidth: 0
  },
  tituloOpcao: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.textoCadastro
  },
  descricaoOpcao: {
    fontSize: 18,
    lineHeight: 24,
    color: cores.textoSecundarioCadastro,
    marginTop: 5
  },
  botao: {
    minHeight: 60,
    backgroundColor: cores.roxoCadastro,
    borderRadius: 14,
    marginTop: 28,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  botaoDesativado: {
    opacity: 0.6
  },
  textoBotao: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.brancoSolido,
    textAlign: 'center'
  },
  pressionado: {
    opacity: 0.7
  }
});
export default {
  ...fixos,
  opcaoPerfil(selecionado) {
    return ({
      pressed
    }) => [fixos.opcao, selecionado && fixos.opcaoSelecionada, pressed && fixos.pressionado];
  },
  placeholderNome: cores.placeholderCadastro,
  placeholderEmail: cores.placeholderCadastro,
  placeholderSenha: cores.placeholderCadastro,
  placeholderConfirmacao: cores.placeholderCadastro,
  botaoCriarConta(enviando) {
    return ({
      pressed
    }) => [fixos.botao, enviando && fixos.botaoDesativado, pressed && fixos.pressionado];
  },
  corCarregamento: cores.brancoSolido,
  barraStatus: "dark"
};
