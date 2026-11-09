// Aparência de TelaCuidador: cores, tamanhos e espaçamentos.
import { StyleSheet } from "react-native";
const fixos = StyleSheet.create({
  acoesCodigo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  botaoCopiar: {
    flexGrow: 1,
    flexBasis: 140
  },
  botaoCompartilhar: {
    flexGrow: 1,
    flexBasis: 140
  }
});
export default {
  acoesCodigo: fixos.acoesCodigo,
  botaoCopiar: fixos.botaoCopiar,
  botaoCompartilhar: fixos.botaoCompartilhar
};
