import type { Recurso } from "@/lib/permisos";
import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

type TextosPermiso = {
  titulo: string;
  /** El beneficio en una frase */
  beneficio: string;
  icono: ComponentProps<typeof Ionicons>["name"];
  /** Camino exacto en Ajustes para habilitarlo si quedó bloqueado */
  comoHabilitar: { android: string; ios: string };
};

export const TEXTOS_PERMISO: Record<Recurso, TextosPermiso> = {
  camara: {
    titulo: "Cámara",
    beneficio:
      "Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto.",
    icono: "camera-outline",
    comoHabilitar: {
      android:
        'Ajustes › Apps › Mantenimiento IPF › Permisos › Cámara › "Permitir solo mientras se usa la app"',
      ios: 'Ajustes › Mantenimiento IPF › activá "Cámara"',
    },
  },
  ubicacion: {
    titulo: "Ubicación",
    beneficio:
      "Usamos tu ubicación para marcar en el reporte en qué parte del edificio está el problema.",
    icono: "location-outline",
    comoHabilitar: {
      android:
        'Ajustes › Apps › Mantenimiento IPF › Permisos › Ubicación › "Permitir solo mientras se usa la app"',
      ios: 'Ajustes › Mantenimiento IPF › Ubicación › "Mientras se usa la app"',
    },
  },
  notificaciones: {
    titulo: "Notificaciones",
    beneficio:
      "Usamos las notificaciones para avisarte cuando se resuelva tu reporte.",
    icono: "notifications-outline",
    comoHabilitar: {
      android:
        'Ajustes › Apps › Mantenimiento IPF › Notificaciones › activá "Todas las notificaciones"',
      ios: 'Ajustes › Mantenimiento IPF › Notificaciones › activá "Permitir notificaciones"',
    },
  },
};
