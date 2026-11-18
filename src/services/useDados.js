import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export function useDados(buscar) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const sequencia = useRef(0);
  const ativa = useRef(false);
  const atualizar = useCallback(async () => {
    const pedido = ++sequencia.current;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await buscar();
      if (ativa.current && pedido === sequencia.current) {
        setDados(resultado);
        setAtualizadoEm(Date.now());
      }
    } catch (falha) {
      if (ativa.current && pedido === sequencia.current) {
        setDados(null);
        setErro(falha?.message || 'Confira sua conexão e tente novamente.');
      }
    } finally {
      if (ativa.current && pedido === sequencia.current) setCarregando(false);
    }
  }, [buscar]);
  useFocusEffect(useCallback(() => {
    ativa.current = true;
    setDados(null);
    setAtualizadoEm(null);
    atualizar();
    const listener = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });
    const relogio = setInterval(() => {
      if (AppState.currentState === 'active') atualizar();
    }, 60000);
    return () => {
      ativa.current = false;
      sequencia.current++;
      listener.remove();
      clearInterval(relogio);
    };
  }, [atualizar]));
  return { dados, erro, carregando, atualizar, atualizadoEm };
}
