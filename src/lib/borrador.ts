import { useSyncExternalStore } from "react";

export type Categoria = "electricidad" | "agua" | "mobiliario" | "equipos";

export type UbicacionReporte =
  | { tipo: "gps"; latitud: number; longitud: number; aproximada: boolean }
  | { tipo: "sector"; sector: string };

export type Borrador = {
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria | null;
  fotoUri: string | null;
  ubicacion: UbicacionReporte | null;
};

const VACIO: Borrador = {
  titulo: "",
  descripcion: "",
  aula: "",
  categoria: null,
  fotoUri: null,
  ubicacion: null,
};

let actual: Borrador = VACIO;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/** Cambia solo los campos que le pases (ej. { aula: 'Aula 12' }) */
export function actualizarBorrador(cambios: Partial<Borrador>) {
  actual = { ...actual, ...cambios };
  avisar();
}

/** Deja el borrador vacío (al terminar de crear un reporte) */
export function limpiarBorrador() {
  actual = VACIO;
  avisar();
}

/** Hook: devuelve el borrador y vuelve a renderizar cuando cambia */
export function useBorrador() {
  return useSyncExternalStore(suscribir, () => actual);
}
