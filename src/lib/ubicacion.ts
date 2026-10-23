import * as Location from 'expo-location';
import { Platform } from 'react-native';
import type { UbicacionReporte } from '@/lib/borrador';

export type ResultadoUbicacion =
  | { ok: true; latitud: number; longitud: number; aproximada: boolean }
  | { ok: false; motivo: 'sin-permiso' | 'gps-apagado' | 'sin-senal' };

export const MENSAJE_ERROR: Record<'sin-permiso' | 'gps-apagado' | 'sin-senal', string> = {
  'sin-permiso': 'No tenemos permiso para usar tu ubicación.',
  'gps-apagado': 'La ubicación del teléfono está apagada. Activala desde el panel rápido o elegí el sector a mano.',
  'sin-senal': 'No pudimos obtener tu ubicación. Probá de nuevo o elegí el sector a mano.',
};

const TIEMPO_MAXIMO_MS = 15000;

/** Rechaza la promesa si tarda más de `ms` (adentro de un edificio el GPS puede tardar mucho) */
function conTiempoLimite<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Tiempo agotado')), ms);
    promesa.then(
      (valor) => {
        clearTimeout(id);
        resolve(valor);
      },
      (error) => {
        clearTimeout(id);
        reject(error);
      },
    );
  });
}

/**
 * Devuelve la ubicación actual y si es aproximada.
 * No pide el permiso: eso lo hace la pantalla previa. Si no hay permiso, no rompe la app.
 */
export async function obtenerUbicacion(): Promise<ResultadoUbicacion> {
  try {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) return { ok: false, motivo: 'sin-permiso' };

    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, motivo: 'gps-apagado' };

    // Android lo informa en android.accuracy ('coarse'); iOS en ios.accuracy ('reduced')
    const aproximada =
      Platform.OS === 'android'
        ? permiso.android?.accuracy === 'coarse'
        : permiso.ios?.accuracy === 'reduced';

    try {
      const posicion = await conTiempoLimite(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        TIEMPO_MAXIMO_MS,
      );
      return { ok: true, latitud: posicion.coords.latitude, longitud: posicion.coords.longitude, aproximada };
    } catch {
      // Sin señal a tiempo: probamos con la última ubicación conocida
      const ultima = await Location.getLastKnownPositionAsync();
      if (ultima) {
        return { ok: true, latitud: ultima.coords.latitude, longitud: ultima.coords.longitude, aproximada };
      }
      return { ok: false, motivo: 'sin-senal' };
    }
  } catch {
    return { ok: false, motivo: 'sin-senal' };
  }
}

/** Texto para mostrar una ubicación. Si es aproximada, NO muestra coordenadas. */
export function describirUbicacion(u: UbicacionReporte): string {
  if (u.tipo === 'sector') return `Sector: ${u.sector}`;
  if (u.aproximada) return 'Ubicación aproximada';
  return `${u.latitud.toFixed(5)}, ${u.longitud.toFixed(5)}`;
}