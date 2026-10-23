import { Boton } from "@/components/Boton";
import { CampoTexto } from "@/components/CampoTexto";
import { Chip } from "@/components/Chip";
import { Pantalla } from "@/components/Pantalla";
import { Texto } from "@/components/Texto";
import {
  actualizarBorrador,
  limpiarBorrador,
  useBorrador,
} from "@/lib/borrador";
import { CATEGORIAS, crearReporte, ETIQUETA_CATEGORIA } from "@/lib/reportes";
import { describirUbicacion } from "@/lib/ubicacion";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NuevoReporte() {
  const b = useBorrador();

  // Qué falta para poder crear (foto, ubicación y descripción son opcionales)
  const faltantes = [
    !b.titulo.trim() && "título",
    !b.aula.trim() && "aula",
    !b.categoria && "categoría",
  ].filter(Boolean) as string[];

  function crear() {
    if (!b.categoria) return; // después de esta línea, TypeScript sabe que categoria no es null
    const id = crearReporte({
      titulo: b.titulo.trim(),
      descripcion: b.descripcion.trim(),
      aula: b.aula.trim(),
      categoria: b.categoria,
      fotoUri: b.fotoUri,
      ubicacion: b.ubicacion,
    });
    limpiarBorrador();
    // replace: el formulario se reemplaza por el detalle, así "atrás" vuelve a la lista
    router.replace({ pathname: "/reporte/[id]", params: { id } });
  }

  return (
    <Pantalla titulo="Nuevo reporte">
      <CampoTexto
        etiqueta="Título"
        obligatorio
        value={b.titulo}
        onChangeText={(titulo) => actualizarBorrador({ titulo })}
        placeholder="Ej.: Luz quemada en el pasillo"
      />
      <CampoTexto
        etiqueta="Descripción"
        multiline
        value={b.descripcion}
        onChangeText={(descripcion) => actualizarBorrador({ descripcion })}
        placeholder="Contá qué pasa y desde cuándo"
      />

      {/* Aula: escaneando el QR (cámara) o escribiéndola (sin permiso) */}
      <CampoTexto
        etiqueta="Aula"
        obligatorio
        value={b.aula}
        onChangeText={(aula) => actualizarBorrador({ aula })}
        placeholder="Escaneá el QR o escribila"
      />
      <Boton
        titulo="Escanear QR del aula"
        variante="secundario"
        onPress={() => router.push("/reporte/escanear")}
      />

      <Texto negrita style={styles.separado}>
        Categoría *
      </Texto>
      <View style={styles.chips}>
        {CATEGORIAS.map((categoria) => (
          <Chip
            key={categoria}
            texto={ETIQUETA_CATEGORIA[categoria]}
            elegido={b.categoria === categoria}
            onPress={() => actualizarBorrador({ categoria })}
          />
        ))}
      </View>

      <Texto negrita style={styles.separado}>
        Foto
      </Texto>
      {b.fotoUri ? (
        <Image
          source={{ uri: b.fotoUri }}
          style={styles.miniatura}
          contentFit="cover"
        />
      ) : (
        <Texto suave>Sin foto (opcional)</Texto>
      )}
      <Boton
        titulo={b.fotoUri ? "Cambiar foto" : "Adjuntar foto"}
        variante="secundario"
        onPress={() => router.push("/reporte/foto")}
      />

      <Texto negrita style={styles.separado}>
        Ubicación
      </Texto>
      <Texto suave>
        {b.ubicacion
          ? describirUbicacion(b.ubicacion)
          : "Sin marcar (opcional)"}
      </Texto>
      <Boton
        titulo={b.ubicacion ? "Cambiar ubicación" : "Marcar ubicación"}
        variante="secundario"
        onPress={() => router.push("/reporte/ubicacion")}
      />

      {faltantes.length > 0 && (
        <Texto suave style={styles.separado}>
          Falta completar: {faltantes.join(", ")}.
        </Texto>
      )}
      <Boton
        titulo="Crear reporte"
        deshabilitado={faltantes.length > 0}
        onPress={crear}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  separado: { marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  miniatura: { width: 120, height: 120, borderRadius: 10 },
});
