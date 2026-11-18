import { StyleSheet } from 'react-native';

export function criarEstilosBarra(tema, insets) {
  const escala = tema.escala || 1;
  return StyleSheet.create({
    barra: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingTop: 10,
      paddingBottom: Math.max(insets.bottom, 12),
      paddingLeft: Math.max(insets.left, 8),
      paddingRight: Math.max(insets.right, 8),
      backgroundColor: tema.branco,
      borderTopWidth: 1,
      borderTopColor: tema.borda,
    },
    item: {
      flex: 1,
      minWidth: 0,
      minHeight: 66,
      paddingHorizontal: 2,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fundoIcone: {
      width: 48,
      height: 34,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fundoSelecionado: { backgroundColor: tema.claro },
    texto: {
      width: '100%',
      fontSize: 18 * escala,
      lineHeight: 25 * escala,
      textAlign: 'center',
      marginTop: 5,
    },
    textoSelecionado: { fontWeight: '700' },
    textoIdoso: { fontSize: 18 * escala, lineHeight: 25 * escala },
    pressionado: { opacity: 0.65 },
  });
}
