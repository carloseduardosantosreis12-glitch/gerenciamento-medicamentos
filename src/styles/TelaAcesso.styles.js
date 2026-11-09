// Aparência de TelaAcesso: cores, tamanhos e espaçamentos.
import { cores } from "./cores";
import { StyleSheet } from "react-native";
const fixos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.brancoSolido
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40
  },
  cartao: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: cores.fundoCartaoAcesso,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: cores.bordaCartaoAcesso,
    paddingHorizontal: 24,
    paddingVertical: 36
  },
  marca: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.azulAcesso,
    textAlign: 'center',
    marginBottom: 30
  },
  titulo: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    color: cores.tituloAcesso,
    textAlign: 'center'
  },
  subtitulo: {
    fontSize: 18,
    lineHeight: 26,
    color: cores.textoAcesso,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 28
  },
  botaoEntrar: {
    minHeight: 60,
    backgroundColor: cores.azulAcesso,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textoEntrar: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.brancoSolido,
    textAlign: 'center'
  },
  botaoCriarConta: {
    minHeight: 60,
    backgroundColor: cores.brancoSolido,
    borderWidth: 1,
    borderColor: cores.azulAcesso,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textoCriarConta: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.azulAcesso,
    textAlign: 'center'
  },
  divisor: {
    height: 1,
    backgroundColor: cores.divisorAcesso,
    marginTop: 28,
    marginBottom: 20
  },
  descricao: {
    fontSize: 17,
    lineHeight: 25,
    color: cores.textoAcesso,
    textAlign: 'center'
  }
});
export default {
  ...fixos,
  barraStatus: "dark"
};
