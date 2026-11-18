import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { painel } from './api';
import { criarGerenciadorLembretes } from './gerenciadorLembretes';
import { MARCA_LEMBRETE } from './lembretesUtils';
import recursos from '../config/recursos';

export const LEMBRETES_HABILITADOS = recursos.notificacoes;

let modulo;
export async function obterNotificacoes() {
  if (!LEMBRETES_HABILITADOS || Platform.OS === 'web') return null;
  if (!modulo) {
    modulo = await import('expo-notifications');
    modulo.setNotificationHandler({ handleNotification: async notificacao => {
      const dados = notificacao.request.content.data;
      const mostrar = dados?.aplicativo === MARCA_LEMBRETE
        && dados.usuarioId === gerenciador.obterEstado().usuarioId;
      return { shouldShowBanner: mostrar, shouldShowList: mostrar,
        shouldPlaySound: mostrar, shouldSetBadge: false };
    } });
  }
  return modulo;
}

const gerenciador = criarGerenciadorLembretes({ armazenamento: AsyncStorage,
  obterNotificacoes, buscarPainel: painel, plataforma: Platform.OS, habilitado: LEMBRETES_HABILITADOS });

export const definirContaDosLembretes = gerenciador.definirConta;
export const sincronizarLembretes = gerenciador.sincronizar;
export const configurarLembretes = gerenciador.configurar;
export const testarLembrete = gerenciador.testar;
export const observarLembretes = gerenciador.observar;
export const obterEstadoLembretes = gerenciador.obterEstado;
