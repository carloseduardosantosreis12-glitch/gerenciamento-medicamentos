// Monta as cores e a escala de texto conforme as preferências da conta.
import { cores } from "./cores";
export function criarTema(preferencias) {
  return {
    fundo: cores.fundo,
    branco: cores.branco,
    texto: cores.texto,
    secundario: cores.textoSecundario,
    borda: cores.borda,
    azul: preferencias.cor === 'verde' ? cores.verde : cores.azul,
    claro: preferencias.cor === 'verde' ? cores.verdeClaro : cores.azulClaro,
    perigo: cores.perigo,
    aviso: cores.aviso,
    escala: preferencias.textoMaior ? 1.18 : 1
  };
}
