import { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { definirContaDosLembretes, LEMBRETES_HABILITADOS, obterEstadoLembretes, observarLembretes, sincronizarLembretes } from '../services/lembretes';

const ContextoLembretes = createContext(null);

export function LembretesProvider({ usuarioId, children }) {
  const [estado, setEstado] = useState(obterEstadoLembretes);
  useEffect(() => {
    const parar = observarLembretes(setEstado);
    definirContaDosLembretes(usuarioId || null);
    if (!LEMBRETES_HABILITADOS) return parar;
    const listener = AppState.addEventListener('change', valor => {
      if (valor === 'active') sincronizarLembretes();
    });
    const intervalo = setInterval(() => {
      if (AppState.currentState === 'active') sincronizarLembretes();
    }, 60000);
    return () => { parar(); listener.remove(); clearInterval(intervalo); };
  }, [usuarioId]);
  return <ContextoLembretes.Provider value={estado}>{children}</ContextoLembretes.Provider>;
}

export function useLembretes() {
  return useContext(ContextoLembretes);
}
