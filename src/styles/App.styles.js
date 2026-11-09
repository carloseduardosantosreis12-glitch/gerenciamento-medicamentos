import { StyleSheet } from 'react-native';

const fixos = StyleSheet.create({
  areaAplicativo: { flex: 1 },
  erroConfiguracao: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  textoErroConfiguracao: { fontSize: 20 },
  carregamento: { flex: 1, justifyContent: 'center' },
});

export default {
  areaAplicativo: fixos.areaAplicativo,
  navegacao(tema) {
    return {
      headerTintColor: tema.azul,
      contentStyle: { backgroundColor: tema.fundo },
    };
  },
  erroConfiguracao: fixos.erroConfiguracao,
  textoErroConfiguracao: fixos.textoErroConfiguracao,
  carregamento: fixos.carregamento,
};
