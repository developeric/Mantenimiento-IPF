import { Boton } from "@/components/Boton";
import { Pantalla } from "@/components/Pantalla";
import { Texto } from "@/components/Texto";
import { useColores } from "@/hooks/useColores";
import { usePermiso } from "@/hooks/usePermiso";
import { esRecurso, type Recurso } from "@/lib/permisos";
import { TEXTOS_PERMISO } from "@/lib/textosPermisos";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

export default function PantallaPrevia() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();

  // Validar el parámetro de la URL antes de usarlo
  if (!esRecurso(recurso)) {
    return (
      <Pantalla titulo="Permiso desconocido">
        <Texto suave>No existe un permiso llamado “{recurso}”.</Texto>
      </Pantalla>
    );
  }

  return <ContenidoPrevia recurso={recurso} />;
}

function ContenidoPrevia({ recurso }: { recurso: Recurso }) {
  const c = useColores();
  const { estado, disponible, matiz, pedir, abrirAjustes } =
    usePermiso(recurso);
  const textos = TEXTOS_PERMISO[recurso];

  // Si el permiso queda concedido (después del diálogo o al volver de Ajustes), cerramos el modal
  useEffect(() => {
    if (estado === "concedido" && router.canGoBack()) router.back();
  }, [estado]);

  async function continuar() {
    const nueva = await pedir();
    // Si lo concedió, el efecto de arriba cierra el modal.
    // Si no, volvemos igual para que la pantalla anterior muestre su alternativa.
    if (nueva.estado !== "concedido" && router.canGoBack()) router.back();
  }

  const camino =
    Platform.OS === "ios"
      ? textos.comoHabilitar.ios
      : textos.comoHabilitar.android;

  return (
    <Pantalla>
      <Stack.Screen options={{ title: textos.titulo }} />

      <View
        style={[
          styles.icono,
          { backgroundColor: c.tarjeta, borderColor: c.borde },
        ]}
      >
        <Ionicons name={textos.icono} size={44} color={c.primario} />
      </View>

      <Texto negrita style={styles.centrado}>
        {textos.beneficio}
      </Texto>

      {estado === "cargando" && <ActivityIndicator />}

      {!disponible && (
        <Texto suave style={styles.centrado}>
          {matiz}
        </Texto>
      )}

      {disponible && estado === "bloqueado" && (
        <>
          <Texto style={styles.centrado}>
            Este permiso está desactivado. Para habilitarlo andá a:
          </Texto>
          <Texto suave style={styles.centrado}>
            {camino}
          </Texto>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </>
      )}

      {disponible && (estado === "preguntable" || estado === "concedido") && (
        <Boton titulo="Continuar" onPress={continuar} />
      )}

      <Texto suave style={styles.centrado}>
        Podés cambiar este permiso cuando quieras desde los Ajustes del
        teléfono.
      </Texto>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  icono: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  centrado: { textAlign: "center" },
});
