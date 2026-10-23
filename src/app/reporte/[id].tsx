import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { EtiquetaEstado } from '@/components/EtiquetaEstado';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { useColores } from '@/hooks/useColores';
import { ETIQUETA_CATEGORIA, simularResolucion, useReporte } from '@/lib/reportes';
import { describirUbicacion } from '@/lib/ubicacion';

export default function DetalleReporte() {
  const c = useColores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reporte = useReporte(id);
  const [via, setVia] = useState<'notificacion' | 'bandeja' | null>(null);

  // Validar el id: si no existe, mensaje en vez de romper
  if (!reporte) {
    return (
      <Pantalla titulo="Reporte no encontrado">
        <Stack.Screen options={{ title: 'No encontrado' }} />
        <Texto>No existe un reporte con el número “{id}”.</Texto>
        <Boton
          titulo="Ir a mis reportes"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </Pantalla>
    );
  }

  async function simular() {
    if (!reporte) return;
    setVia(await simularResolucion(reporte.id));
  }

  return (
    <Pantalla titulo={reporte.titulo}>
      <Stack.Screen options={{ title: `Reporte #${reporte.id}` }} />
      <EtiquetaEstado estado={reporte.estado} />

      <Dato etiqueta="Aula" valor={reporte.aula} />
      <Dato etiqueta="Categoría" valor={ETIQUETA_CATEGORIA[reporte.categoria]} />
      {reporte.descripcion ? <Dato etiqueta="Descripción" valor={reporte.descripcion} /> : null}
      <Dato
        etiqueta="Ubicación"
        valor={reporte.ubicacion ? describirUbicacion(reporte.ubicacion) : 'Sin marcar'}
      />
      <Dato etiqueta="Creado" valor={new Date(reporte.creado).toLocaleString('es-AR')} />

      {reporte.fotoUri ? (
        <Image source={{ uri: reporte.fotoUri }} style={[styles.foto, { borderColor: c.borde }]} contentFit="cover" />
      ) : (
        <Texto suave>Sin foto</Texto>
      )}

      {reporte.estado === 'pendiente' && <Boton titulo="Simular resolución" onPress={simular} />}

      {reporte.estado === 'en-curso' && (
        <Texto suave>
          {via === 'notificacion'
            ? 'En 10 segundos te llega una notificación y el aviso queda en la pestaña Avisos.'
            : via === 'bandeja'
              ? 'En 10 segundos el aviso aparece en la pestaña Avisos.'
              : 'El reporte se está resolviendo…'}
        </Texto>
      )}

      {reporte.estado === 'resuelto' && (
        <Texto style={{ color: c.exito }}>Este reporte ya fue resuelto.</Texto>
      )}
    </Pantalla>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <Texto suave>{etiqueta}</Texto>
      <Texto>{valor}</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  dato: { gap: 2 },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, borderWidth: 1 },
});