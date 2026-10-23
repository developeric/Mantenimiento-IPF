import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { configurarNotificaciones } from '@/lib/notificaciones';

export default function RootLayout() {
  const scheme = useColorScheme();
   useEffect(() => configurarNotificaciones(), []);
  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="reporte/nuevo"
          options={{ title: "Nuevo reporte" }}
        />
        <Stack.Screen
          name="reporte/escanear"
          options={{ title: "Escanear QR del aula" }}
        />
        <Stack.Screen
          name="reporte/foto"
          options={{ title: "Foto del desperfecto" }}
        />
        <Stack.Screen
          name="reporte/ubicacion"
          options={{ title: "Ubicación" }}
        />
        <Stack.Screen
          name="reporte/[id]"
          options={{ title: "Detalle del reporte" }}
        />
        <Stack.Screen name="ajustes-app" options={{ title: "Ajustes" }} />
        <Stack.Screen
          name="permisos/[recurso]"
          options={{ presentation: "modal", title: "Permiso" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
