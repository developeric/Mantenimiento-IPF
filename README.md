# Mantenimiento IPF

**Trabajo Práctico N° 3 — Permisos móviles: Android, iOS y Expo**
Taller Complementario – React Native II · Tecnicatura Superior en Desarrollo de Software Multiplataforma · Instituto Politécnico Formosa

**Alumno/a:** ______________________________

App para que alumnos y docentes reporten desperfectos del edificio (una luz quemada, una canilla que pierde, un proyector roto) y reciban un aviso cuando se resuelven. Usa **cámara**, **ubicación** y **notificaciones**, y elige fotos de la galería **sin pedir permiso de galería**. Cada permiso se pide en contexto, con una pantalla previa, y cada función tiene una alternativa si se deniega.

---

## Tecnologías

| Paquete | Versión |
|---|---|
| Expo SDK | 57 (`expo ~57.0.31`) |
| React Native | 0.86.3 |
| React | 19.2.3 |
| Expo Router | ~57.0.29 |
| TypeScript | ~6.0.3 |
| expo-camera | ~57.0.6 |
| expo-location | ~57.0.22 |
| expo-image-picker | ~57.0.20 |
| expo-notifications | ~57.0.24 |

Todos los paquetes se instalaron con `npx expo install`. El proyecto **no usa `expo-permissions`**: cada módulo trae sus propias funciones de permisos.

---

## Cómo ejecutar

```bash
npm install
npx expo start
```

Escanear el QR con **Expo Go** (Android o iOS).

**Development build (Android):**

```bash
npx expo install expo-dev-client
npx eas-cli@latest build --profile development --platform android
```

Para ver los archivos nativos que genera Expo a partir de `app.json`:

```bash
npx expo prebuild --clean
```

---

## Árbol de carpetas de `src/app`

```
src/app/
├── _layout.tsx                 Stack raíz (define títulos y el modal)
├── (tabs)/                     Grupo: no aparece en la URL
│   ├── _layout.tsx             Barra de pestañas (Reportes, Avisos, Permisos)
│   ├── index.tsx               /                     Lista de reportes
│   ├── avisos.tsx              /avisos               Bandeja de avisos
│   └── permisos.tsx            /permisos             Panel de permisos
├── reporte/
│   ├── nuevo.tsx               /reporte/nuevo        Formulario
│   ├── escanear.tsx            /reporte/escanear     Escáner QR (cámara)
│   ├── foto.tsx                /reporte/foto         Sacar o elegir foto
│   ├── ubicacion.tsx           /reporte/ubicacion    Ubicación o sector a mano
│   └── [id].tsx                /reporte/:id          Detalle del reporte
├── permisos/
│   └── [recurso].tsx           /permisos/:recurso    Pantalla previa (modal)
└── ajustes-app.tsx             /ajustes-app          Interruptor de notificaciones
```

- **`(tabs)`** es un *grupo*: organiza los archivos y comparte el layout de pestañas, pero no forma parte de la URL (`(tabs)/avisos.tsx` responde a `/avisos`).
- **`[id]` y `[recurso]`** son *rutas dinámicas*: el valor entre corchetes se lee con `useLocalSearchParams()`.
- **`permisos/[recurso].tsx`** está fuera de `(tabs)` para que el Stack raíz lo presente como modal (`presentation: "modal"`) por encima de las pestañas.

---

## Configuración de `app.json`

### Bloque `plugins` (comentado)

> El `app.json` real no admite comentarios. Acá se muestran solo para explicar cada opción.

```jsonc
"plugins": [
  // Navegación basada en archivos
  "expo-router",

  // Pantalla de carga
  ["expo-splash-screen", {
    "backgroundColor": "#208AEF",
    "image": "./assets/images/splash-icon.png",
    "imageWidth": 76
  }],

  ["expo-camera", {
    // Texto de propósito de iOS (NSCameraUsageDescription)
    "cameraPermission": "Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto.",
    // Mínimo privilegio: la app no graba audio
    "microphonePermission": false,  // iOS: sin NSMicrophoneUsageDescription
    "recordAudioAndroid": false     // Android: sin RECORD_AUDIO
  }],

  ["expo-image-picker", {
    // Se usa para "Sacar foto" (launchCameraAsync)
    "cameraPermission": "Usamos tu cámara para sacar la foto del desperfecto que querés reportar.",
    // false: no se declara micrófono (iOS) y se bloquea RECORD_AUDIO (Android)
    "microphonePermission": false
  }],

  ["expo-location", {
    // Texto de propósito de iOS (NSLocationWhenInUseUsageDescription)
    "locationWhenInUsePermission": "Usamos tu ubicación para marcar en el reporte en qué parte del edificio está el problema.",
    // Mínimo privilegio: solo primer plano
    "isAndroidBackgroundLocationEnabled": false,
    "isIosBackgroundLocationEnabled": false
  }],

  // Notificaciones locales (en iOS no llevan texto de propósito)
  "expo-notifications"
]
```

Todos los textos de propósito siguen el molde **“Usamos tu [dato] para [beneficio concreto]”** (pauta 5.1.1 de Apple).

### Permisos bloqueados (`android.blockedPermissions`)

| Permiso | Por qué se bloquea |
|---|---|
| `RECORD_AUDIO` | La app no graba audio. Lo agregan `expo-camera` (para video con sonido) y `expo-image-picker`. |
| `READ_EXTERNAL_STORAGE` | La galería se usa con el selector del sistema, que no necesita permiso. Lo agregan la plantilla nativa y `expo-image-picker`. |
| `WRITE_EXTERNAL_STORAGE` | La app no escribe archivos fuera de su propio almacenamiento. Lo agregan la plantilla nativa y `expo-image-picker`. |
| `READ_MEDIA_IMAGES` | Daría acceso a **todas** las fotos. Google Play lo restringe y el selector del sistema alcanza. |
| `READ_MEDIA_VIDEO` | La app no trabaja con videos. Google Play también lo restringe. |
| `READ_MEDIA_AUDIO` | La app no lee archivos de audio. |
| `ACCESS_BACKGROUND_LOCATION` | Solo se usa la ubicación en primer plano. |
| `SYSTEM_ALERT_WINDOW` | La app no dibuja sobre otras apps. Lo incluye la plantilla nativa de Expo. |

`blockedPermissions` agrega `tools:node="remove"` en el `AndroidManifest.xml` generado. **No tiene efecto en Expo Go**, que ya viene compilado con su propio manifiesto: se aplica en la development build y en la build de producción.

---

## Tabla de permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se deniega |
|---|---|---|---|
| **Cámara** (escanear QR) | `expo-camera` | Al tocar “Escanear QR del aula” | Escribir el código del aula a mano |
| **Cámara** (sacar foto) | `expo-image-picker` (`launchCameraAsync`) | Al tocar “Sacar foto” | “Elegir de la galería” |
| **Ubicación** (primer plano) | `expo-location` | Al tocar “Usar mi ubicación actual” | Elegir el sector a mano (patio, pasillo, etc.) |
| **Notificaciones** | `expo-notifications` | Al activar el interruptor “Avisarme cuando se resuelva mi reporte” en `/ajustes-app` | Bandeja de avisos en la pestaña **Avisos** |
| **Galería** | `expo-image-picker` (`launchImageLibraryAsync`) | **Nunca**: usa el selector del sistema, sin permiso | — |

Ningún permiso se pide al abrir la app ni al abrir el formulario: cada uno se pide recién al tocar su función.

---

## Cómo funciona el manejo de permisos

### Hook unificado `usePermiso(recurso)`

Archivo: `src/hooks/usePermiso.ts`. Recibe `'camara' | 'ubicacion' | 'notificaciones'` y devuelve:

| Valor | Descripción |
|---|---|
| `estado` | `'cargando' \| 'concedido' \| 'preguntable' \| 'bloqueado'` |
| `parcial` | `true` si la ubicación es aproximada o las notificaciones son provisionales (iOS) |
| `matiz` | Texto con el detalle (ej. “Ubicación aproximada”) |
| `yaDijoQueNo` | `true` si la persona ya rechazó al menos una vez (para no insistir) |
| `disponible` | `false` si la función no existe en el entorno (ej. notificaciones en Expo Go para Android) |
| `pedir()` | Pide el permiso (puede mostrar el diálogo del sistema) y devuelve el nuevo estado |
| `abrirAjustes()` | Abre los Ajustes de la app (`Linking.openSettings()`) |
| `refrescar()` | Vuelve a consultar el estado sin mostrar diálogo |

La respuesta de Expo se traduce en `interpretar()` (`src/lib/permisos.ts`) a partir de los dos campos que deciden casi todo:

| `granted` | `canAskAgain` | Estado |
|---|---|---|
| `true` | — | `concedido` |
| `false` | `true` | `preguntable` |
| `false` | `false` | `bloqueado` |
| (todavía sin respuesta) | — | `cargando` |

El **matiz** se lee de campos distintos según la plataforma:

- **Ubicación aproximada:** `android.accuracy === 'coarse'` en Android, `ios.accuracy === 'reduced'` en iOS.
- **Notificaciones provisionales (iOS):** `ios.status === IosAuthorizationStatus.PROVISIONAL`.

### Actualización al volver de Ajustes

El hook `useRevisarAlVolver` (`src/hooks/useRevisarAlVolver.ts`) escucha `AppState`. Cuando la app pasa de `background` o `inactive` a `active`, vuelve a consultar el permiso. El sistema no avisa cuando un permiso cambia en Ajustes, por eso hay que consultarlo de nuevo.

### Sincronización entre pantallas

Cada vez que un `usePermiso` consulta o pide un permiso, avisa el resultado a todos los demás hooks del mismo recurso (`suscribirPermiso` / `avisarCambio` en `src/lib/permisos.ts`). Así, cuando la pantalla previa concede un permiso, el panel y la pantalla que la abrió se actualizan solos.

### Pantalla previa (`/permisos/[recurso]`)

- Se muestra **antes de cada diálogo del sistema**, como modal.
- Tiene el ícono, el **beneficio en una frase**, un **único botón “Continuar”** y la aclaración de que se puede cambiar en Ajustes. No tiene “Ahora no” ni “Cerrar” (pauta 5.1.1(iv) de Apple).
- Si el permiso está **bloqueado**, explica el camino exacto en Ajustes para Android o iOS y el botón pasa a ser **“Abrir Ajustes”**.
- El campo que decide entre “Continuar” y “Abrir Ajustes” es **`canAskAgain`**, traducido a `estado` en `interpretar()`.
- Valida el parámetro de la URL con `esRecurso()`: si el recurso no existe, muestra un mensaje.

### No insistir

En el escáner, la pantalla previa se abre sola solo si la persona **nunca** respondió (`yaDijoQueNo === false`). Si ya dijo que no, la pantalla muestra la explicación y la alternativa, y la previa vuelve a aparecer solo si toca “Continuar”. En foto, ubicación y notificaciones la previa se abre únicamente al tocar la función.

### Sobre `useCameraPermissions`

El escáner usa `usePermiso('camara')`, que por dentro llama a `Camera.getCameraPermissionsAsync()` y `Camera.requestCameraPermissionsAsync()`, las mismas funciones que usa `useCameraPermissions()` de `expo-camera`. Se eligió el hook unificado porque además devuelve los cuatro estados, se actualiza al volver de Ajustes y se sincroniza con la pantalla previa y el panel.

---

## Requisitos funcionales (G2)

| # | Requisito | Dónde se resuelve |
|---|---|---|
| 1 | Hook unificado con los cuatro estados, `parcial`, `pedir()` y `abrirAjustes()`; se actualiza con `AppState` | `src/hooks/usePermiso.ts`, `src/hooks/useRevisarAlVolver.ts`, `src/lib/permisos.ts` |
| 2 | Escáner con cuatro estados y código del aula a mano | `src/app/reporte/escanear.tsx` |
| 3 | Foto sin permiso de galería (`launchImageLibraryAsync`; `READ_MEDIA_IMAGES` bloqueado) | `src/app/reporte/foto.tsx`, `app.json` |
| 4 | Solo primer plano; si es aproximada muestra “Ubicación aproximada”; si se deniega, sector a mano | `src/app/reporte/ubicacion.tsx`, `src/lib/ubicacion.ts` |
| 5 | Notificaciones pedidas al activar el interruptor; canal `"reportes"` creado antes de pedir; aviso local a los 10 s; bandeja como alternativa | `src/app/ajustes-app.tsx`, `src/lib/permisos.ts`, `src/lib/avisos.ts`, `src/lib/reportes.ts` |
| 6 | Pantalla previa con un único botón “Continuar” o “Abrir Ajustes” | `src/app/permisos/[recurso].tsx` |
| 7 | Ningún permiso denegado impide crear un reporte | Cada pantalla tiene su alternativa (ver tabla de permisos) |
| 8 | No insistir: la previa no vuelve a aparecer sola | `src/app/reporte/escanear.tsx` (`yaDijoQueNo`) |
| 9 | Panel con estado, plataforma (`Platform.OS`) y matiz | `src/app/(tabs)/permisos.tsx`, `src/components/FilaPermiso.tsx` |

---

## Decisiones y problemas encontrados

- **`expo-notifications` en Expo Go para Android.** Desde el SDK 53, Expo Go para Android no incluye notificaciones push. Además, en el SDK 57, importar el módulo en Expo Go para Android falla con `Cannot find native module 'ExpoTopicSubscriptionModule'` ([expo/expo#51476](https://github.com/expo/expo/pull/51476)). Para que la app no se rompa, `src/lib/notificaciones.ts` detecta Expo Go con `Constants.executionEnvironment === ExecutionEnvironment.StoreClient` y, en ese caso, no carga el módulo. Las notificaciones aparecen como “No disponible” y los avisos llegan a la bandeja. En la development build y en iOS funcionan normalmente.
- **Notificaciones con la app abierta.** Por defecto no se muestran. Se configura `setNotificationHandler` en `configurarNotificaciones()`, llamada desde el layout raíz. Al tocar una notificación se navega al reporte correspondiente.
- **Rutas tipadas** (`typedRoutes: true`). Las rutas dinámicas se navegan con la forma de objeto: `router.push({ pathname: '/reporte/[id]', params: { id } })`.
- **Bandeja de avisos.** Todos los avisos quedan en la pestaña Avisos, se envíe o no la notificación del sistema. La pestaña muestra la cantidad sin leer.
- **Datos en memoria.** Los reportes, el borrador y los avisos se guardan en memoria (`useSyncExternalStore`). Se pierden al cerrar o recargar la app; el TP no pide persistencia.

---

## Pruebas realizadas

- [x] **Expo Go (Android):** navegación, escáner en sus cuatro estados, foto desde la cámara y desde el selector, ubicación precisa, aproximada, denegada y con GPS apagado, panel de permisos, actualización al volver de Ajustes, bandeja de avisos y validación de id inexistente.
- [ ] **Development build (Android o iOS):** textos de propósito propios, diálogo de notificaciones y notificación recibida. *(completar)*

---

## Capturas

> Guardar las imágenes en `docs/capturas/` con estos nombres.

### Escáner en sus cuatro estados

| Cargando | Concedido | Preguntable | Bloqueado |
|---|---|---|---|
| ![Cargando](docs/capturas/escaner-cargando.png) | ![Concedido](docs/capturas/escaner-concedido.png) | ![Preguntable](docs/capturas/escaner-preguntable.png) | ![Bloqueado](docs/capturas/escaner-bloqueado.png) |

### Ubicación

| Concedida | Denegada |
|---|---|
| ![Ubicación concedida](docs/capturas/ubicacion-concedida.png) | ![Ubicación denegada](docs/capturas/ubicacion-denegada.png) |

### Foto desde el selector del sistema

![Foto desde el selector](docs/capturas/foto-selector.png)

### Notificación recibida

![Notificación recibida](docs/capturas/notificacion-recibida.png)

### Panel de permisos antes y después de volver de Ajustes

| Antes | Después |
|---|---|
| ![Panel antes](docs/capturas/permisos-antes.png) | ![Panel después](docs/capturas/permisos-despues.png) |

### Diálogo del sistema en la development build (con el texto de propósito propio)

![Diálogo en development build](docs/capturas/dialogo-dev-build.png)

---

## Desafíos opcionales

- [x] **Bloqueo por plataforma:** la pantalla previa y las pantallas de escáner, foto, ubicación y ajustes muestran el camino exacto en Ajustes para Android y para iOS (`src/lib/textosPermisos.ts`).
- [ ] Auditoría del manifiesto
- [ ] Notificaciones provisionales
- [ ] Nota de voz

---

## Estructura de `src`: qué hace cada carpeta y archivo

### `src/app/` — Pantallas y rutas (Expo Router)

Cada archivo es una pantalla y su ruta sale del nombre del archivo. Los archivos `_layout.tsx` no son pantallas: definen cómo se navega entre las pantallas de su carpeta.

| Archivo | Finalidad |
|---|---|
| `_layout.tsx` | Layout raíz. Define el Stack con el título de cada pantalla, presenta `permisos/[recurso]` como modal, aplica el tema claro u oscuro y llama a `configurarNotificaciones()` al abrir la app. |
| `(tabs)/_layout.tsx` | Barra de pestañas: Reportes, Avisos (con la cantidad sin leer) y Permisos. Agrega el engranaje que abre `/ajustes-app`. |
| `(tabs)/index.tsx` | Ruta `/`. Lista de reportes propios con su estado y botón “Nuevo reporte”. |
| `(tabs)/avisos.tsx` | Ruta `/avisos`. Bandeja de avisos, alternativa a las notificaciones. Marca los avisos como leídos al salir de la pestaña. |
| `(tabs)/permisos.tsx` | Ruta `/permisos`. Panel con una fila por recurso. |
| `reporte/nuevo.tsx` | Ruta `/reporte/nuevo`. Formulario: título, descripción, aula, categoría, foto y ubicación. Valida los campos obligatorios y crea el reporte. No pide ningún permiso al abrirse. |
| `reporte/escanear.tsx` | Ruta `/reporte/escanear`. Escáner QR con los cuatro estados del permiso de cámara y carga manual del aula. |
| `reporte/foto.tsx` | Ruta `/reporte/foto`. “Sacar foto” (pide cámara) y “Elegir de la galería” (selector del sistema, sin permiso). |
| `reporte/ubicacion.tsx` | Ruta `/reporte/ubicacion`. Ubicación actual en primer plano o sector elegido a mano. |
| `reporte/[id].tsx` | Ruta `/reporte/:id`. Detalle del reporte. Valida que el id exista y tiene el botón “Simular resolución”. |
| `permisos/[recurso].tsx` | Ruta `/permisos/:recurso`. Pantalla previa al diálogo del sistema, presentada como modal. |
| `ajustes-app.tsx` | Ruta `/ajustes-app`. Interruptor “Avisarme cuando se resuelva mi reporte” y botón para probar un aviso en 10 segundos. |

### `src/components/` — Componentes reutilizables

| Archivo | Finalidad |
|---|---|
| `Pantalla.tsx` | Contenedor de cada pantalla: scroll, fondo, título opcional y ajustes para el teclado. |
| `Texto.tsx` | Texto que respeta el modo claro u oscuro, con variantes `suave` y `negrita`. |
| `Boton.tsx` | Botón con variante primaria o secundaria y estado deshabilitado. |
| `CampoTexto.tsx` | Campo de texto con etiqueta, de una línea o multilínea, para el formulario. |
| `Chip.tsx` | Opción seleccionable con forma de píldora, para las categorías. |
| `EtiquetaEstado.tsx` | Etiqueta de color con el estado del reporte: pendiente, en curso o resuelto. |
| `FilaPermiso.tsx` | Fila del panel de permisos: nombre, estado, plataforma, matiz y botón “Pedir” o “Abrir Ajustes”. |

### `src/hooks/` — Hooks propios

| Archivo | Finalidad |
|---|---|
| `usePermiso.ts` | Hook unificado de permisos: devuelve el estado, el matiz, `pedir()`, `abrirAjustes()` y `refrescar()`, y se sincroniza con otras pantallas. |
| `useRevisarAlVolver.ts` | Ejecuta una función cada vez que la app vuelve al frente (por ejemplo, al volver de Ajustes), usando `AppState`. |
| `useColores.ts` | Devuelve la paleta de colores según el modo claro u oscuro del teléfono. |

### `src/lib/` — Lógica de la app (sin pantallas)

| Archivo | Finalidad |
|---|---|
| `permisos.ts` | Lógica central de permisos: tipos, consulta y pedido según el recurso, traducción de la respuesta de Expo a los cuatro estados, creación del canal `"reportes"`, aviso compartido entre pantallas y apertura de la pantalla previa. |
| `textosPermisos.ts` | Textos de cada pantalla previa: título, beneficio en una frase, ícono y camino exacto en Ajustes para Android y para iOS. |
| `notificaciones.ts` | Carga `expo-notifications` solo donde funciona (no en Expo Go para Android) y configura cómo se muestran y qué pasa al tocar una notificación. |
| `avisos.ts` | Bandeja de avisos y preferencia del interruptor. `programarAviso()` agrega el aviso a la bandeja y, si está permitido, programa la notificación local. |
| `borrador.ts` | Reporte que se está armando. Lo comparten el formulario, el escáner, la foto y la ubicación. |
| `reportes.ts` | Almacén de reportes: crear, buscar por id, cambiar el estado y simular la resolución. |
| `ubicacion.ts` | Obtiene la ubicación actual con límite de tiempo, detecta si es aproximada en Android e iOS y arma el texto para mostrarla (sin coordenadas si es aproximada). |

### `src/constants/`

| Archivo | Finalidad |
|---|---|
| `colores.ts` | Paleta de colores para el modo claro y el modo oscuro. |

### Otros

| Archivo | Finalidad |
|---|---|
| `global.css` | Variables de fuentes para la versión web, heredadas de la plantilla de Expo. La app no lo importa en ningún archivo. |
#   M a n t e n i m i e n t o - I P F  
 