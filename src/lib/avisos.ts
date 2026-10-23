import { cargarNotificaciones } from "@/lib/notificaciones";
import { CANAL_REPORTES, crearCanalReportes } from "@/lib/permisos";
import { useSyncExternalStore } from "react";

export type Aviso = {
  id: string;
  titulo: string;
  cuerpo: string;
  fecha: number;
  reporteId?: string;
  leido: boolean;
};

type EstadoAvisos = {
  avisos: Aviso[];
  /** El interruptor "Avisarme cuando se resuelva mi reporte" */
  avisarme: boolean;
};

let estado: EstadoAvisos = { avisos: [], avisarme: false };
const oyentes = new Set<() => void>();

function cambiar(cambios: Partial<EstadoAvisos>) {
  estado = { ...estado, ...cambios };
  oyentes.forEach((oyente) => oyente());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function useAvisos() {
  return useSyncExternalStore(suscribir, () => estado);
}

export function setAvisarme(valor: boolean) {
  cambiar({ avisarme: valor });
}

export function agregarAviso(datos: {
  titulo: string;
  cuerpo: string;
  reporteId?: string;
}) {
  const aviso: Aviso = {
    ...datos,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: Date.now(),
    leido: false,
  };
  cambiar({ avisos: [aviso, ...estado.avisos] });
}

export function marcarAvisosLeidos() {
  if (estado.avisos.some((a) => !a.leido)) {
    cambiar({ avisos: estado.avisos.map((a) => ({ ...a, leido: true })) });
  }
}

/**
 * Programa un aviso dentro de `segundos`.
 * - Siempre queda en la bandeja de Avisos (alternativa a las notificaciones).
 * - Además se envía como notificación del sistema solo si la persona la activó y hay permiso.
 * Devuelve por dónde va a llegar.
 */
export async function programarAviso(
  datos: { titulo: string; cuerpo: string; reporteId?: string },
  segundos = 10,
): Promise<"notificacion" | "bandeja"> {
  // 1. La bandeja siempre
  setTimeout(() => agregarAviso(datos), segundos * 1000);

  // 2. La notificación, solo si se puede
  const Notifications = cargarNotificaciones();
  if (!estado.avisarme || !Notifications) return "bandeja";

  const permiso = await Notifications.getPermissionsAsync();
  if (!permiso.granted) return "bandeja";

  await crearCanalReportes(); // por si el permiso vino concedido sin pasar por nuestra previa
  await Notifications.scheduleNotificationAsync({
    content: {
      title: datos.titulo,
      body: datos.cuerpo,
      data: { reporteId: datos.reporteId ?? null },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: segundos,
      channelId: CANAL_REPORTES,
    },
  });
  return "notificacion";
}
