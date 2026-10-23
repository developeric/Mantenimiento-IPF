import { useColores } from "@/hooks/useColores";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

type Props = { titulo?: string; children?: ReactNode };

export function Pantalla({ titulo, children }: Props) {
  const c = useColores();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.fondo }}
      contentContainerStyle={styles.contenido}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {titulo ? (
        <Text style={[styles.titulo, { color: c.texto }]}>{titulo}</Text>
      ) : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: "700" },
});
