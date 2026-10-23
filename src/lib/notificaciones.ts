import Constants, { ExecutionEnvironment } from "expo-constants";
import type * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { router } from "expo-router";

type ModuloNotificaciones = typeof ExpoNotifications;

/**
 * En Expo Go para Android (SDK 57) cargar expo-notifications falla por un bug de Expo.
 * "StoreClient" significa que la app está corriendo dentro de Expo Go.
 */
export const esExpoGoAndroid =
  Platform.OS === "android" &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// undefined = todavía no lo intentamos; null = no disponible
let modulo: ModuloNotificaciones | null | undefined;

/** Carga expo-notifications solo donde funciona. Si no está disponible, devuelve null. */
export function cargarNotificaciones(): ModuloNotificaciones | null {
  if (modulo === undefined) {
    if (esExpoGoAndroid) {
      modulo = null; // ni lo intentamos: así no aparecen los errores
    } else {
      try {
        modulo =
          (require("expo-notifications") as ModuloNotificaciones | undefined) ??
          null;
      } catch {
        modulo = null;
      }
    }
  }
  return modulo;
}

/**
 * Configura cómo se comportan las notificaciones. Se llama una sola vez, desde el layout raíz.
 * Devuelve la función de limpieza (o nada, si las notificaciones no están disponibles).
 */
export function configurarNotificaciones(): (() => void) | undefined {
  const Notifications = cargarNotificaciones();
  if (!Notifications) return;

  // Sin esto, las notificaciones NO se muestran mientras la app está abierta
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Al tocar la notificación: ir al reporte (si trae uno) o a la bandeja
  const suscripcion = Notifications.addNotificationResponseReceivedListener(
    (respuesta) => {
      const reporteId = respuesta.notification.request.content.data?.reporteId;
      if (typeof reporteId === "string") {
        router.push({ pathname: "/reporte/[id]", params: { id: reporteId } });
      } else {
        router.push("/avisos");
      }
    },
  );

  return () => suscripcion.remove();
}
