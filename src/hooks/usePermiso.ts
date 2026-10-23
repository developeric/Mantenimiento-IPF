import { useRevisarAlVolver } from "@/hooks/useRevisarAlVolver";
import {
  avisarCambio,
  consultarPermiso,
  INFO_INICIAL,
  interpretar,
  solicitarPermiso,
  suscribirPermiso,
  type InfoPermiso,
  type Recurso,
} from "@/lib/permisos";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";

export function usePermiso(recurso: Recurso) {
  const [info, setInfo] = useState<InfoPermiso>(INFO_INICIAL);

  // Escuchar los cambios que hagan otras pantallas sobre este mismo recurso
  useEffect(() => suscribirPermiso(recurso, setInfo), [recurso]);

  /** Consulta el estado actual (sin diálogo) */
  const refrescar = useCallback(async () => {
    try {
      const respuesta = await consultarPermiso(recurso);
      avisarCambio(recurso, interpretar(recurso, respuesta));
    } catch {
      avisarCambio(recurso, {
        ...INFO_INICIAL,
        estado: "bloqueado",
        matiz: "No disponible en este dispositivo",
        disponible: false,
      });
    }
  }, [recurso]);

  /** Pide el permiso (puede mostrar el diálogo del sistema) y devuelve el nuevo estado */
  const pedir = useCallback(async () => {
    const respuesta = await solicitarPermiso(recurso);
    const nueva = interpretar(recurso, respuesta);
    avisarCambio(recurso, nueva);
    return nueva;
  }, [recurso]);

  const abrirAjustes = useCallback(() => Linking.openSettings(), []);

  // Al montar: consultar una vez
  useEffect(() => {
    refrescar();
  }, [refrescar]);

  // Al volver de Ajustes: volver a consultar
  useRevisarAlVolver(refrescar);

  return { ...info, pedir, abrirAjustes, refrescar };
}
