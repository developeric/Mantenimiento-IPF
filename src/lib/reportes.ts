import { useSyncExternalStore } from 'react';
import { programarAviso } from '@/lib/avisos';
import type { Categoria, UbicacionReporte } from '@/lib/borrador';

export type EstadoReporte = 'pendiente' | 'en-curso' | 'resuelto';

export type Reporte = {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  fotoUri: string | null;
  ubicacion: UbicacionReporte | null;
  estado: EstadoReporte;
  creado: number;
};

export const CATEGORIAS: Categoria[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];

export const ETIQUETA_CATEGORIA: Record<Categoria, string> = {
  electricidad: 'Electricidad',
  agua: 'Agua',
  mobiliario: 'Mobiliario',
  equipos: 'Equipos',
};

/** Segundos que tarda la "resolución" simulada (lo pide el TP) */
const SEGUNDOS_RESOLUCION = 10;

let reportes: Reporte[] = [];
let siguienteId = 1;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

// ---------- Lectura ----------

export function useReportes() {
  return useSyncExternalStore(suscribir, () => reportes);
}

/** Devuelve el reporte con ese id, o undefined si no existe */
export function useReporte(id: string | undefined) {
  return useReportes().find((r) => r.id === id);
}

function buscar(id: string) {
  return reportes.find((r) => r.id === id);
}

// ---------- Escritura ----------

/** Crea un reporte nuevo (queda "pendiente") y devuelve su id */
export function crearReporte(datos: Omit<Reporte, 'id' | 'estado' | 'creado'>): string {
  const id = String(siguienteId++);
  reportes = [{ ...datos, id, estado: 'pendiente', creado: Date.now() }, ...reportes];
  avisar();
  return id;
}

function cambiarEstado(id: string, estado: EstadoReporte) {
  reportes = reportes.map((r) => (r.id === id ? { ...r, estado } : r));
  avisar();
}

/**
 * Botón de prueba "Simular resolución": pasa a "en curso" y a los 10 s a "resuelto".
 * El aviso llega como notificación (si está activada y permitida) y siempre a la bandeja.
 */
export async function simularResolucion(id: string) {
  const reporte = buscar(id);
  if (!reporte || reporte.estado !== 'pendiente') return null;

  cambiarEstado(id, 'en-curso');
  setTimeout(() => cambiarEstado(id, 'resuelto'), SEGUNDOS_RESOLUCION * 1000);

  return programarAviso(
    {
      titulo: 'Reporte resuelto',
      cuerpo: `“${reporte.titulo}” (${reporte.aula}) ya fue resuelto.`,
      reporteId: id,
    },
    SEGUNDOS_RESOLUCION,
  );
}