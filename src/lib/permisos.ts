import { cargarNotificaciones } from "@/lib/notificaciones";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Platform } from "react-native";

// ---------- Tipos ----------

export type Recurso = "camara" | "ubicacion" | "notificaciones";

export const RECURSOS: Recurso[] = ["camara", "ubicacion", "notificaciones"];

export const NOMBRE_RECURSO: Record<Recurso, string> = {
  camara: "Cámara",
  ubicacion: "Ubicación",
  notificaciones: "Notificaciones",
};

export type EstadoPermiso =
  | "cargando"
  | "concedido"
  | "preguntable"
  | "bloqueado";

export type InfoPermiso = {
  estado: EstadoPermiso;
  /** Acceso parcial: ubicación aproximada o notificaciones provisionales */
  parcial: boolean;
  /** Texto con el matiz para mostrar en el panel (ej. "Ubicación aproximada") */
  matiz: string | null;
  /** La persona ya dijo que no al menos una vez (sirve para "no insistir") */
  yaDijoQueNo: boolean;
  /** false si la función no existe en este entorno (ej. notificaciones en Expo Go Android) */
  disponible: boolean;
};

export const INFO_INICIAL: InfoPermiso = {
  estado: "cargando",
  parcial: false,
  matiz: null,
  yaDijoQueNo: false,
  disponible: true,
};

/** Lo mínimo que necesitamos de cualquier respuesta de permisos de Expo */
type RespuestaPermiso = {
  status: string;
  granted: boolean;
  canAskAgain: boolean;
  android?: { accuracy?: string; [clave: string]: unknown };
  ios?: { accuracy?: string; status?: number; [clave: string]: unknown };
};

/** Respuesta "vacía" para cuando el módulo no se pudo cargar */
const SIN_RESPUESTA: RespuestaPermiso = {
  status: "undetermined",
  granted: false,
  canAskAgain: false,
};

/** Valida que un texto (por ejemplo, de la URL) sea un recurso conocido */
export function esRecurso(valor: unknown): valor is Recurso {
  return typeof valor === "string" && (RECURSOS as string[]).includes(valor);
}

// ---------- Notificaciones: canal de Android ----------

export const CANAL_REPORTES = "reportes";

/** En Android 13+ el diálogo de notificaciones NO aparece si no existe al menos un canal */
export async function crearCanalReportes() {
  const Notifications = cargarNotificaciones();
  if (Platform.OS !== "android" || !Notifications) return;
  await Notifications.setNotificationChannelAsync(CANAL_REPORTES, {
    name: "Estado de mis reportes",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// ---------- Consultar (nunca muestra diálogo) ----------

export async function consultarPermiso(
  recurso: Recurso,
): Promise<RespuestaPermiso> {
  switch (recurso) {
    case "camara":
      return Camera.getCameraPermissionsAsync();
    case "ubicacion":
      return Location.getForegroundPermissionsAsync();
    case "notificaciones": {
      const Notifications = cargarNotificaciones();
      return Notifications
        ? Notifications.getPermissionsAsync()
        : SIN_RESPUESTA;
    }
  }
}

// ---------- Solicitar (puede mostrar el diálogo del sistema) ----------

export async function solicitarPermiso(
  recurso: Recurso,
): Promise<RespuestaPermiso> {
  switch (recurso) {
    case "camara":
      return Camera.requestCameraPermissionsAsync();
    case "ubicacion":
      // Solo primer plano: mínimo privilegio
      return Location.requestForegroundPermissionsAsync();
    case "notificaciones": {
      const Notifications = cargarNotificaciones();
      if (!Notifications) return SIN_RESPUESTA;
      await crearCanalReportes(); // ¡antes de pedir!
      return Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
    }
  }
}

// ---------- Traducir la respuesta de Expo a nuestros estados ----------

export function interpretar(
  recurso: Recurso,
  r: RespuestaPermiso,
): InfoPermiso {
  const yaDijoQueNo = r.status === "denied";

  if (recurso === "notificaciones") {
    const Notifications = cargarNotificaciones();

    // El módulo no cargó (Expo Go en Android): la función no existe acá
    if (!Notifications) {
      return {
        estado: "bloqueado",
        parcial: false,
        matiz:
          "No disponible en Expo Go para Android. Probalo en una development build.",
        yaDijoQueNo: false,
        disponible: false,
      };
    }

    // Notificaciones provisionales en iOS: llegan en silencio, sin diálogo
    if (
      Platform.OS === "ios" &&
      r.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return {
        estado: "concedido",
        parcial: true,
        matiz: "Provisionales (llegan en silencio)",
        yaDijoQueNo,
        disponible: true,
      };
    }
  }

  if (r.granted) {
    // Ubicación aproximada: Android usa android.accuracy, iOS usa ios.accuracy
    if (recurso === "ubicacion") {
      const aproximada =
        Platform.OS === "android"
          ? r.android?.accuracy === "coarse"
          : r.ios?.accuracy === "reduced";
      return {
        estado: "concedido",
        parcial: aproximada,
        matiz: aproximada ? "Ubicación aproximada" : "Ubicación precisa",
        yaDijoQueNo,
        disponible: true,
      };
    }
    return {
      estado: "concedido",
      parcial: false,
      matiz: null,
      yaDijoQueNo,
      disponible: true,
    };
  }

  if (r.canAskAgain) {
    return {
      estado: "preguntable",
      parcial: false,
      matiz: null,
      yaDijoQueNo,
      disponible: true,
    };
  }

  return {
    estado: "bloqueado",
    parcial: false,
    matiz: null,
    yaDijoQueNo,
    disponible: true,
  };
}
type Oyente = (info: InfoPermiso) => void;

const oyentes: Record<Recurso, Set<Oyente>> = {
  camara: new Set(),
  ubicacion: new Set(),
  notificaciones: new Set(),
};

/** Se suscribe a los cambios de un recurso. Devuelve la función para desuscribirse. */
export function suscribirPermiso(recurso: Recurso, oyente: Oyente) {
  oyentes[recurso].add(oyente);
  return () => {
    oyentes[recurso].delete(oyente);
  };
}

/** Avisa a todas las pantallas que el estado de un recurso cambió */
export function avisarCambio(recurso: Recurso, info: InfoPermiso) {
  oyentes[recurso].forEach((oyente) => oyente(info));
}

// ---------- Navegación ----------

/** Abre la pantalla previa (modal) de un recurso */
export function abrirPantallaPrevia(recurso: Recurso) {
  router.push({ pathname: "/permisos/[recurso]", params: { recurso } });
}
