import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { useColores } from '@/hooks/useColores';
import { marcarAvisosLeidos, useAvisos } from '@/lib/avisos';

export default function Avisos() {
  const c = useColores();
  const { avisos } = useAvisos();

  // Al SALIR de la pestaña se marcan como leídos (así mientras la mirás se ven los nuevos resaltados)
  useFocusEffect(
    useCallback(() => {
      return () => marcarAvisosLeidos();
    }, []),
  );

  return (
    <Pantalla titulo="Avisos">
      {avisos.length === 0 ? (
        <Texto suave>
          No tenés avisos todavía. Cuando se resuelva un reporte lo vas a ver acá, aunque no actives las
          notificaciones.
        </Texto>
      ) : (
        avisos.map((aviso) => (
          <Pressable
            key={aviso.id}
            disabled={!aviso.reporteId}
            onPress={() =>
              aviso.reporteId &&
              router.push({ pathname: '/reporte/[id]', params: { id: aviso.reporteId } })
            }
            style={[
              styles.tarjeta,
              { backgroundColor: c.tarjeta, borderColor: aviso.leido ? c.borde : c.primario },
            ]}
          >
            <View style={styles.encabezado}>
              {!aviso.leido && <View style={[styles.punto, { backgroundColor: c.primario }]} />}
              <Texto negrita style={styles.titulo}>
                {aviso.titulo}
              </Texto>
            </View>
            <Texto>{aviso.cuerpo}</Texto>
            <Texto suave style={styles.fecha}>
              {new Date(aviso.fecha).toLocaleString('es-AR')}
            </Texto>
          </Pressable>
        ))
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 8, height: 8, borderRadius: 4 },
  titulo: { flex: 1 },
  fecha: { fontSize: 13 },
});