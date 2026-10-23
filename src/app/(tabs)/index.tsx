import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { EtiquetaEstado } from '@/components/EtiquetaEstado';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { useColores } from '@/hooks/useColores';
import { ETIQUETA_CATEGORIA, useReportes } from '@/lib/reportes';

export default function Inicio() {
  const c = useColores();
  const reportes = useReportes();

  return (
    <Pantalla titulo="Mis reportes">
      <Boton titulo="Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />

      {reportes.length === 0 ? (
        <Texto suave>
          Todavía no hiciste ningún reporte. Tocá “Nuevo reporte” para avisar de una luz quemada, una canilla
          que pierde o un proyector roto.
        </Texto>
      ) : (
        reportes.map((reporte) => (
          <Pressable
            key={reporte.id}
            onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: reporte.id } })}
            style={({ pressed }) => [
              styles.tarjeta,
              { backgroundColor: c.tarjeta, borderColor: c.borde },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.encabezado}>
              <Texto negrita style={styles.titulo}>
                {reporte.titulo}
              </Texto>
              <EtiquetaEstado estado={reporte.estado} />
            </View>
            <Texto suave>
              {reporte.aula} · {ETIQUETA_CATEGORIA[reporte.categoria]}
            </Texto>
            <Texto suave style={styles.fecha}>
              #{reporte.id} · {new Date(reporte.creado).toLocaleString('es-AR')}
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
  titulo: { flex: 1 },
  fecha: { fontSize: 13 },
});