import { StyleSheet } from 'react-native';
import { cores } from './cores';

const fixos = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14,
  },
  foto: { width: 56, height: 56 },
  acessosRapidos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});

export default {
  espacoSuperior(insets) { return { height: insets.top }; },
  cabecalho: fixos.cabecalho,
  avatar(tema) {
    return {
      width: 56, height: 56, borderRadius: 28, backgroundColor: tema.claro,
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    };
  },
  foto: fixos.foto,
  corAvatar(tema) { return tema.azul; },
  cardRotina(tema) {
    return { backgroundColor: tema.azul, borderColor: tema.azul };
  },
  corTituloRotina: cores.branco,
  corTextoRotina: cores.branco,
  acessosRapidos: fixos.acessosRapidos,
};

export function criarDetalhesInicio(tema) {
  const escala = tema.escala || 1;
  return StyleSheet.create({
    marca: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: { width: 46, height: 46 },
    marcaTexto: {
      flexShrink: 1, fontSize: 17 * escala, lineHeight: 22 * escala, fontWeight: '700',
    },
    atalho: {
      flexGrow: 1, flexBasis: '45%', minHeight: 150, padding: 16, borderRadius: 22,
      borderWidth: 1, borderColor: tema.borda, backgroundColor: tema.branco,
    },
    atalhoEmpilhado: { flexBasis: '100%', minHeight: 132 },
    atalhoIcone: {
      width: 42, height: 42, borderRadius: 14, alignItems: 'center',
      justifyContent: 'center', backgroundColor: tema.claro, marginBottom: 14,
    },
    atalhoTexto: { fontWeight: '600' },
    pressionado: { opacity: 0.65 },
  });
}
