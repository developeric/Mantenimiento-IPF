import { Boton } from "@/components/Boton";
import { Pantalla } from "@/components/Pantalla";
import { Texto } from "@/components/Texto";
import { useColores } from "@/hooks/useColores";
import { usePermiso } from "@/hooks/usePermiso";
import { actualizarBorrador, useBorrador } from "@/lib/borrador";
import { abrirPantallaPrevia } from "@/lib/permisos";
import { TEXTOS_PERMISO } from "@/lib/textosPermisos";
import { CameraView, type BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

/** Guarda el aula en el borrador y vuelve al formulario */
function guardarAula(valor: string) {
  const aula = valor.trim();
  if (!aula) return;
  actualizarBorrador({ aula });
  router.back();
}

export default function Escanear() {
  const { estado, yaDijoQueNo, abrirAjustes } = usePermiso("camara");
  const yaAbrimosPrevia = useRef(false);

  // Requisito 8: la previa se abre sola SOLO si la persona nunca dijo que no
  useEffect(() => {
    if (estado === "preguntable" && !yaDijoQueNo && !yaAbrimosPrevia.current) {
      yaAbrimosPrevia.current = true;
      abrirPantallaPrevia("camara");
    }
  }, [estado, yaDijoQueNo]);

  // 1. Cargando
  if (estado === "cargando") {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 2. Concedido
  if (estado === "concedido") {
    return <Camara />;
  }

  // 3. Preguntable
  if (estado === "preguntable") {
    return (
      <Pantalla titulo="Escanear el QR del aula">
        <Texto>{TEXTOS_PERMISO.camara.beneficio}</Texto>
        <Boton
          titulo="Continuar"
          onPress={() => abrirPantallaPrevia("camara")}
        />
        <IngresoManual />
      </Pantalla>
    );
  }

  // 4. Bloqueado
  const { comoHabilitar } = TEXTOS_PERMISO.camara;
  return (
    <Pantalla titulo="La cámara está desactivada">
      <Texto>Para escanear el QR, habilitá la cámara en:</Texto>
      <Texto suave>
        {Platform.OS === "ios" ? comoHabilitar.ios : comoHabilitar.android}
      </Texto>
      <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
      <IngresoManual />
    </Pantalla>
  );
}

function Camara() {
  // onBarcodeScanned se dispara muchas veces por segundo mientras el QR está a la vista:
  // con esta marca nos quedamos solo con la primera lectura.
  const yaLeido = useRef(false);

  function alEscanear({ data }: BarcodeScanningResult) {
    if (yaLeido.current) return;
    yaLeido.current = true;
    guardarAula(data);
  }

  return (
    <View style={styles.camaraContenedor}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={alEscanear}
      />
      {/* La superposición va al lado de la cámara (no adentro) y no captura toques */}
      <View style={styles.superposicion}>
        <View style={styles.marco} />
        <Texto style={styles.ayuda}>
          Apuntá al QR pegado en la puerta del aula
        </Texto>
      </View>
    </View>
  );
}

/** Alternativa cuando no hay cámara: escribir el aula a mano */
function IngresoManual() {
  const c = useColores();
  const { aula } = useBorrador();
  const [codigo, setCodigo] = useState(aula);

  return (
    <View style={[styles.manual, { borderColor: c.borde }]}>
      <Texto negrita>¿No podés escanear? Escribí el aula a mano</Texto>
      <TextInput
        value={codigo}
        onChangeText={setCodigo}
        placeholder="Ej.: Aula 12"
        placeholderTextColor={c.suave}
        returnKeyType="done"
        onSubmitEditing={() => guardarAula(codigo)}
        style={[
          styles.input,
          { color: c.texto, backgroundColor: c.tarjeta, borderColor: c.borde },
        ]}
      />
      <Boton
        titulo="Usar este código"
        variante="secundario"
        deshabilitado={!codigo.trim()}
        onPress={() => guardarAula(codigo)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  camaraContenedor: { flex: 1, backgroundColor: "#000" },
  superposicion: {
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    pointerEvents: "none",
  },
  marco: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 16,
  },
  ayuda: {
    color: "#FFFFFF",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  manual: { borderTopWidth: 1, paddingTop: 16, marginTop: 8, gap: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
});
