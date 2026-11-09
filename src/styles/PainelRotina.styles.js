// Aparência de PainelRotina: cores, tamanhos e espaçamentos.
export default {
  corAtraso(tema) {
    return tema.aviso;
  },
  corVencido(tema) {
    return tema.perigo;
  },
  corEstoque(tema) {
    return tema.perigo;
  },
  corValidade(item, tema) {
    return item.dias_validade < 0 ? tema.perigo : tema.aviso;
  }
};
