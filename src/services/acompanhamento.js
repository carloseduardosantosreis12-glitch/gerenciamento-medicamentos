import { resultado } from './api';
import { supabase } from './supabase';

export function listarIdososAcompanhados(idosoId = null) {
  return resultado(supabase.rpc('listar_idosos_acompanhados', { p_idoso_id: idosoId }));
}

export async function identificacaoAcompanhada(idosoId) {
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(idosoId || '')) {
    throw new Error('Escolha um idoso na aba Idosos para acompanhar.');
  }
  const pessoas = await listarIdososAcompanhados(idosoId);
  const pessoa = (pessoas || []).find(item => item.id === idosoId);
  if (!pessoa) {
    throw new Error('O acompanhamento não está autorizado. Confira o vínculo na aba Idosos.');
  }
  return pessoa;
}
