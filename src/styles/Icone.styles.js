import { StyleSheet } from 'react-native';

export function criarEstilosIcone(cor) {
  const fixos = StyleSheet.create({
    capsula: {
      width: 27, height: 15, borderWidth: 2, borderRadius: 9,
      borderColor: cor, transform: [{ rotate: '-40deg' }],
      alignItems: 'center', justifyContent: 'center',
    },
    divisaoCapsula: { width: 2, height: 11, backgroundColor: cor },
    calendario: {
      width: 25, height: 24, borderWidth: 2, borderRadius: 5, borderColor: cor,
    },
    linhaCalendario: {
      position: 'absolute', left: 0, right: 0, top: 6, height: 2, backgroundColor: cor,
    },
    anelEsquerdo: {
      position: 'absolute', top: -5, left: 4, width: 2, height: 7,
      borderRadius: 1, backgroundColor: cor,
    },
    anelDireito: {
      position: 'absolute', top: -5, right: 4, width: 2, height: 7,
      borderRadius: 1, backgroundColor: cor,
    },
    diaCalendario: {
      position: 'absolute', left: 5, top: 12, width: 5, height: 5,
      borderRadius: 1, backgroundColor: cor,
    },
    pessoa: { width: 27, height: 28, alignItems: 'center' },
    cabecaPessoa: {
      width: 11, height: 11, borderWidth: 2, borderRadius: 6, borderColor: cor,
    },
    corpoPessoa: {
      width: 25, height: 12, borderWidth: 2, borderColor: cor,
      borderTopLeftRadius: 14, borderTopRightRadius: 14, marginTop: 3,
    },
    engrenagem: { width: 28, height: 28 },
    anelEngrenagem: {
      position: 'absolute', left: 5, top: 5, width: 18, height: 18,
      borderRadius: 9, borderWidth: 3, borderColor: cor,
    },
    relogio: {
      width: 25, height: 25, borderWidth: 2, borderRadius: 13, borderColor: cor,
    },
    ponteiroVertical: {
      position: 'absolute', width: 2, height: 8, top: 4, left: 10,
      borderRadius: 1, backgroundColor: cor,
    },
    ponteiroHorizontal: {
      position: 'absolute', width: 7, height: 2, top: 10, left: 10,
      borderRadius: 1, backgroundColor: cor,
    },
    lista: { gap: 4 },
    linhaLista: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pontoLista: { width: 3, height: 3, borderRadius: 2, backgroundColor: cor },
    tracoLista: { width: 16, height: 2, borderRadius: 1, backgroundColor: cor },
    simbolo: { fontSize: 29, lineHeight: 35, fontWeight: '500', color: cor },
  });

  const dentes = [
    [11, 0, '0deg'], [19, 3, '45deg'], [23, 11, '90deg'], [19, 20, '135deg'],
    [11, 23, '0deg'], [3, 20, '45deg'], [0, 11, '90deg'], [3, 3, '135deg'],
  ].map(([left, top, rotate]) => ({
    position: 'absolute', width: 6, height: 5, left, top,
    borderRadius: 1, backgroundColor: cor, transform: [{ rotate }],
  }));

  return { ...fixos, dentes };
}
