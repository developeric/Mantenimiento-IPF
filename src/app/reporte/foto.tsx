import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { useColores } from '@/hooks/useColores';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador, useBorrador } from '@/lib/borrador';
import { abrirPantallaPrevia } from '@/lib/permisos';
import { TEXTOS_PERMISO } from '@/lib/textosPermisos';

/** Abre la cámara del sistema. Requiere el permiso de cámara concedido. */
async function abrirCamara() {
  try {
    const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!resultado.canceled) actualizarBorrador({ fotoUri: resultado.assets[0].uri });
  } catch {
    Alert.alert('No se pudo abrir la cámara', 'Probá elegir una foto de la galería.');
  }
}

/** Abre el selector de fotos DEL SISTEMA. No necesita ningún permiso. */
async function elegirDeGaleria() {
  const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (!resultado.canceled) actualizarBorrador({ fotoUri: resultado.assets[0].uri });
}

export default function Foto() {
  const c = useColores();
  const { fotoUri } = useBorrador();
  const { estado, abrirAjustes } = usePermiso('camara');

  // Recuerda que la persona tocó "Sacar foto" mientras pasaba por la pantalla previa
  const quiereSacarFoto = useRef(false);

  useEffect(() => {
    if (estado === 'concedido' && quiereSacarFoto.current) {
      // Concedió en la previa: abrimos la cámara sin hacerla tocar de nuevo
      quiereSacarFoto.current = false;
      abrirCamara();
    }
    if (estado === 'bloqueado') quiereSacarFoto.current = false;
  }, [estado]);

  function sacarFoto() {
    if (estado === 'concedido') {
      abrirCamara();
    } else if (estado === 'preguntable') {
      quiereSacarFoto.current = true;
      abrirPantallaPrevia('camara');
    }
  }

  const { comoHabilitar } = TEXTOS_PERMISO.camara;

  return (
    <Pantalla titulo="Foto del desperfecto">
      {fotoUri ? (
        <>
          <Image source={{ uri: fotoUri }} style={[styles.foto, { borderColor: c.borde }]} contentFit="cover" />
          <Boton titulo="Usar esta foto" onPress={() => router.back()} />
          <Boton titulo="Quitar foto" variante="secundario" onPress={() => actualizarBorrador({ fotoUri: null })} />
        </>
      ) : (
        <Texto suave>Sacá una foto del problema o elegila de tu galería.</Texto>
      )}

      <Boton
        titulo="Sacar foto"
        variante={fotoUri ? 'secundario' : 'primario'}
        deshabilitado={estado === 'cargando' || estado === 'bloqueado'}
        onPress={sacarFoto}
      />

      {estado === 'bloqueado' && (
        <View style={[styles.aviso, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <Texto>La cámara está desactivada. Para habilitarla andá a:</Texto>
          <Texto suave>{Platform.OS === 'ios' ? comoHabilitar.ios : comoHabilitar.android}</Texto>
          <Boton titulo="Abrir Ajustes" variante="secundario" onPress={abrirAjustes} />
          <Texto suave>Mientras tanto, podés elegir una foto de la galería.</Texto>
        </View>
      )}

      <Boton titulo="Elegir de la galería" variante="secundario" onPress={elegirDeGaleria} />

      <Texto suave style={styles.nota}>
        Elegir de la galería no pide permiso: lo abre el sistema y la app solo recibe la foto que elegís.
      </Texto>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, borderWidth: 1 },
  aviso: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  nota: { fontSize: 13, textAlign: 'center' },
});