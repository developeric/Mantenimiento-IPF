import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { useColores } from '@/hooks/useColores';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador, useBorrador } from '@/lib/borrador';
import { abrirPantallaPrevia } from '@/lib/permisos';
import { TEXTOS_PERMISO } from '@/lib/textosPermisos';
import { describirUbicacion, MENSAJE_ERROR, obtenerUbicacion } from '@/lib/ubicacion';

const SECTORES = [
  'Patio',
  'Estacionamiento',
  'Pasillo',
  'Hall de entrada',
  'Baños',
  'Biblioteca',
  'Laboratorio',
  'Otro',
];

export default function Ubicacion() {
  const c = useColores();
  const { ubicacion } = useBorrador();
  const { estado, abrirAjustes } = usePermiso('ubicacion');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recuerda que la persona tocó "Usar mi ubicación" mientras pasaba por la pantalla previa
  const quiereUbicacion = useRef(false);

  async function marcarUbicacionActual() {
    setBuscando(true);
    setError(null);
    const resultado = await obtenerUbicacion();
    setBuscando(false);

    if (resultado.ok) {
      actualizarBorrador({
        ubicacion: {
          tipo: 'gps',
          latitud: resultado.latitud,
          longitud: resultado.longitud,
          aproximada: resultado.aproximada,
        },
      });
    } else {
      setError(MENSAJE_ERROR[resultado.motivo]);
    }
  }

  useEffect(() => {
    if (estado === 'concedido' && quiereUbicacion.current) {
      // Concedió en la previa: buscamos la ubicación sin hacerla tocar de nuevo
      quiereUbicacion.current = false;
      marcarUbicacionActual();
    }
    if (estado === 'bloqueado') quiereUbicacion.current = false;
  }, [estado]);

  function usarMiUbicacion() {
    if (estado === 'concedido') {
      marcarUbicacionActual();
    } else if (estado === 'preguntable') {
      quiereUbicacion.current = true;
      abrirPantallaPrevia('ubicacion');
    }
  }

  function elegirSector(sector: string) {
    actualizarBorrador({ ubicacion: { tipo: 'sector', sector } });
    router.back();
  }

  const { comoHabilitar } = TEXTOS_PERMISO.ubicacion;

  return (
    <Pantalla titulo="¿Dónde está el problema?">
      {ubicacion && (
        <View style={[styles.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <Texto suave>Marcada:</Texto>
          <Texto negrita>{describirUbicacion(ubicacion)}</Texto>
          {ubicacion.tipo === 'gps' && ubicacion.aproximada && (
            <Texto suave>
              Tu teléfono compartió solo la ubicación aproximada, por eso no mostramos coordenadas exactas.
            </Texto>
          )}
          <Boton titulo="Listo" onPress={() => router.back()} />
        </View>
      )}

      {/* Opción 1: ubicación actual (pide permiso) */}
      <Texto negrita>Con tu ubicación actual</Texto>
      <Boton
        titulo={buscando ? 'Buscando…' : 'Usar mi ubicación actual'}
        variante={ubicacion ? 'secundario' : 'primario'}
        deshabilitado={buscando || estado === 'cargando' || estado === 'bloqueado'}
        onPress={usarMiUbicacion}
      />
      {buscando && <ActivityIndicator />}
      {error && <Texto style={{ color: c.error }}>{error}</Texto>}

      {estado === 'bloqueado' && (
        <View style={[styles.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <Texto>La ubicación está desactivada. Para habilitarla andá a:</Texto>
          <Texto suave>{Platform.OS === 'ios' ? comoHabilitar.ios : comoHabilitar.android}</Texto>
          <Boton titulo="Abrir Ajustes" variante="secundario" onPress={abrirAjustes} />
        </View>
      )}

      {/* Opción 2: sector a mano (nunca pide permiso: siempre disponible) */}
      <Texto negrita style={styles.separado}>
        O elegí el sector a mano
      </Texto>
      <View style={styles.chips}>
        {SECTORES.map((sector) => {
          const elegido = ubicacion?.tipo === 'sector' && ubicacion.sector === sector;
          return (
            <Pressable
              key={sector}
              onPress={() => elegirSector(sector)}
              accessibilityRole="button"
              accessibilityState={{ selected: elegido }}
              style={[
                styles.chip,
                {
                  backgroundColor: elegido ? c.primario : c.tarjeta,
                  borderColor: elegido ? c.primario : c.borde,
                },
              ]}
            >
              <Text style={{ color: elegido ? c.textoPrimario : c.texto, fontWeight: '600' }}>{sector}</Text>
            </Pressable>
          );
        })}
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  separado: { marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
}); 