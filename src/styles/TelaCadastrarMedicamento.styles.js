// Aparência de TelaCadastrarMedicamento: cores, tamanhos e espaçamentos.
import { StyleSheet } from "react-native";
const fixos = StyleSheet.create({
  rotuloEmbalagem: {
    fontWeight: '600'
  },
  rotuloConteudo: {
    fontWeight: '600'
  },
  totalEstoque: {
    fontWeight: '700'
  }
});
export default {
  rotuloEmbalagem: fixos.rotuloEmbalagem,
  rotuloConteudo: fixos.rotuloConteudo,
  totalEstoque: fixos.totalEstoque
};
