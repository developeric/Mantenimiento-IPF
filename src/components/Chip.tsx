import { useColores } from "@/hooks/useColores";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = { texto: string; elegido: boolean; onPress: () => void };

export function Chip({ texto, elegido, onPress }: Props) {
  const c = useColores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: elegido }}
      style={[
        styles.chip,
        {
          backgroundColor: elegido ? c.primario : c.tarjeta,
          borderColor: elegido ? c.primario : c.borde,
        },
      ]}
    >
      <Text
        style={[styles.texto, { color: elegido ? c.textoPrimario : c.texto }]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  texto: { fontWeight: "600" },
});
