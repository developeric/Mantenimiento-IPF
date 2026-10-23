import { Boton } from "@/components/Boton";
import { Texto } from "@/components/Texto";
import { useColores } from "@/hooks/useColores";
import { usePermiso } from "@/hooks/usePermiso";
import { abrirPantallaPrevia, NOMBRE_RECURSO, type Recurso } from '@/lib/permisos';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

export function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const c = useColores();
  const { estado, parcial, matiz, disponible, abrirAjustes } =
    usePermiso(recurso);

  const etiqueta = !disponible
    ? { texto: "No disponible", color: c.suave }
    : estado === "concedido" && parcial
      ? { texto: "Parcial", color: c.alerta }
      : {
          cargando: { texto: "Consultando…", color: c.suave },
          concedido: { texto: "Concedido", color: c.exito },
          preguntable: { texto: "Se puede pedir", color: c.primario },
          bloqueado: { texto: "Bloqueado", color: c.error },
        }[estado];

  return (
    <View
      style={[
        styles.tarjeta,
        { backgroundColor: c.tarjeta, borderColor: c.borde },
      ]}
    >
      <View style={styles.encabezado}>
        <Texto negrita>{NOMBRE_RECURSO[recurso]}</Texto>
        <Text
          style={[
            styles.etiqueta,
            { color: etiqueta.color, borderColor: etiqueta.color },
          ]}
        >
          {etiqueta.texto}
        </Text>
      </View>

      <Texto suave>Plataforma: {Platform.OS}</Texto>
      {matiz ? <Texto suave>{matiz}</Texto> : null}

      {estado === "cargando" && <ActivityIndicator />}
      {disponible && estado === "preguntable" && (
        <Boton
          titulo="Pedir"
          variante="secundario"
          onPress={() => abrirPantallaPrevia(recurso)}
        />
      )}
      {disponible && estado === "bloqueado" && (
        <Boton
          titulo="Abrir Ajustes"
          variante="secundario"
          onPress={abrirAjustes}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: "600",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    overflow: "hidden",
  },
});
