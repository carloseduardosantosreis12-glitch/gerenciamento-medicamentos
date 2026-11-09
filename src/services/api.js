import { supabase } from './supabase';

export async function resultado(pedido) {
  const { data, error } = await pedido;
  if (error) {
    if (['PGRST202', 'PGRST205', '42703', '42883', '42P01'].includes(error.code)) {
      throw new Error('Execute o SQL de atualização do aplicativo no Supabase e toque em Atualizar.');
    }
    throw error;
  }
  return data;
}

export async function contaId() {
  const data = await resultado(supabase.auth.getSession());
  const id = data.session?.user.id;
  if (!id) throw new Error('Entre na sua conta para continuar.');
  return id;
}

export async function painel(idosoId) {
  return resultado(supabase.rpc('obter_painel_medicamentos', { p_idoso_id: idosoId }));
}
