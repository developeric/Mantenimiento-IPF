import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Llama a `revisar` cada vez que la app vuelve al frente
 * (por ejemplo, después de que la persona fue a Ajustes).
 */
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}