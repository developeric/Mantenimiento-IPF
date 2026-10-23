import { StyleSheet, Text } from 'react-native';
import { useColores } from '@/hooks/useColores';
import type { EstadoReporte } from '@/lib/reportes';

export function EtiquetaEstado({ estado }: { estado: EstadoReporte }) {
  const c = useColores();
  const info = {
    pendiente: { texto: 'Pendiente', color: c.alerta },
    'en-curso': { texto: 'En curso', color: c.primario },
    resuelto: { texto: 'Resuelto', color: c.exito },
  }[estado];

  return <Text style={[styles.etiqueta, { color: info.color, borderColor: info.color }]}>{info.texto}</Text>;
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});