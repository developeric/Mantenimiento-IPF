import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Pantalla } from '@/components/Pantalla';
import { Texto } from '@/components/Texto';
import { useColores } from '@/hooks/useColores';
import { usePermiso } from '@/hooks/usePermiso';
import { programarAviso, setAvisarme, useAvisos } from '@/lib/avisos';
import { abrirPantallaPrevia } from '@/lib/permisos';
import { TEXTOS_PERMISO } from '@/lib/textosPermisos';

export default function AjustesApp() {
  const c = useColores();
  const { avisarme } = useAvisos();
  const { estado, disponible, matiz, abrirAjustes } = usePermiso('notificaciones');
  const [mensajePrueba, setMensajePrueba] = useState<string | null>(null);

  // Recuerda que la persona activó el interruptor mientras pasaba por la pantalla previa
  const quiereActivar = useRef(false);

  useEffect(() => {
    if (estado === 'concedido' && quiereActivar.current) {
      quiereActivar.current = false;
      setAvisarme(true);
    }
    if (estado === 'bloqueado') quiereActivar.current = false;
  }, [estado]);

  // El interruptor está prendido solo si la persona lo quiere Y el sistema lo permite
  const activo = avisarme && estado === 'concedido';

  function alCambiar(valor: boolean) {
    if (!valor) {
      setAvisarme(false);
      return;
    }
    if (estado === 'concedido') {
      setAvisarme(true);
    } else if (estado === 'preguntable') {
      // Requisito 5: el permiso se pide recién al activar el interruptor
      quiereActivar.current = true;
      abrirPantallaPrevia('notificaciones');
    }
  }

  async function probar() {
    const via = await programarAviso({
      titulo: 'Aviso de prueba',
      cuerpo: 'Así te vamos a avisar cuando se resuelva tu reporte.',
    });
    setMensajePrueba(
      via === 'notificacion'
        ? 'En 10 segundos te llega una notificación (podés salir de la app para verla) y también queda en Avisos.'
        : 'En 10 segundos el aviso aparece en la pestaña Avisos.',
    );
  }

  const { comoHabilitar } = TEXTOS_PERMISO.notificaciones;

  return (
    <Pantalla titulo="Ajustes">
      <View style={[styles.fila, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
        <View style={styles.textos}>
          <Texto negrita>Avisarme cuando se resuelva mi reporte</Texto>
          <Texto suave>Te mandamos una notificación cuando el reporte se marque como resuelto.</Texto>
        </View>
        <Switch
          value={activo}
          onValueChange={alCambiar}
          disabled={!disponible || estado === 'cargando' || estado === 'bloqueado'}
          trackColor={{ true: c.primario }}
          accessibilityLabel="Avisarme cuando se resuelva mi reporte"
        />
      </View>

      {!disponible && <Texto suave>{matiz}</Texto>}

      {disponible && estado === 'bloqueado' && (
        <View style={[styles.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <Texto>Las notificaciones están desactivadas. Para habilitarlas andá a:</Texto>
          <Texto suave>{Platform.OS === 'ios' ? comoHabilitar.ios : comoHabilitar.android}</Texto>
          <Boton titulo="Abrir Ajustes" variante="secundario" onPress={abrirAjustes} />
        </View>
      )}

      <Texto suave>
        Aunque no actives las notificaciones, cada aviso queda guardado en la pestaña Avisos.
      </Texto>

      <Boton titulo="Probar: aviso en 10 segundos" variante="secundario" onPress={probar} />
      {mensajePrueba && <Texto suave>{mensajePrueba}</Texto>}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14 },
  textos: { flex: 1, gap: 4 },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
});