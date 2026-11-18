import { StyleSheet } from 'react-native';

export function criarEstilosInicioIdoso(tema, insets) {
  const escala = tema.escala || 1;
  return StyleSheet.create({
    conteudo: { gap: 16 },
    cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    marca: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: { width: 36, height: 36 },
    tituloMarca: { flex: 1, fontSize: 26 * escala, lineHeight: 31 * escala },
    saudacao: { fontSize: 18 * escala, lineHeight: 25 * escala },
    configuracoes: { minWidth: 56, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 4 },
    rotuloConfiguracoes: { fontSize: 18 * escala, lineHeight: 24 * escala },
    agendamento: {
      padding: 18, borderRadius: 22, backgroundColor: tema.azul,
      gap: 8, borderWidth: 1, borderColor: tema.azul,
    },
    linhaTitulo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    titulo: { flexShrink: 1, fontSize: 26 * escala, lineHeight: 33 * escala },
    horario: { fontSize: 56 * escala, lineHeight: 66 * escala, fontWeight: '800', fontVariant: ['tabular-nums'] },
    medicamento: { fontSize: 22 * escala, lineHeight: 29 * escala, fontWeight: '600' },
    situacao: { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: tema.claro },
    textoSituacao: { fontSize: 18 * escala, lineHeight: 25 * escala, fontWeight: '700' },
    botaoAgenda: {
      minHeight: 56, padding: 14, borderRadius: 13, backgroundColor: tema.branco,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 6,
    },
    textoBotao: { flexShrink: 1, fontSize: 20 * escala, lineHeight: 28 * escala, fontWeight: '700' },
    cartao: { padding: 18, borderRadius: 20, borderWidth: 1, borderColor: tema.borda, backgroundColor: tema.branco, gap: 8, minHeight: 96 },
    seta: { marginLeft: 'auto', fontSize: 30 * escala, lineHeight: 34 * escala },
    alerta: { fontWeight: '700' },
    pressionado: { opacity: 0.75 },
  });
}
