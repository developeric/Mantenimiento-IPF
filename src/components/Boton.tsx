import { Pressable, StyleSheet, Text } from 'react-native';
import { useColores } from '@/hooks/useColores';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  deshabilitado?: boolean;
};

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado }: Props) {
  const c = useColores();
  const primario = variante === 'primario';
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.boton,
        primario
          ? { backgroundColor: c.primario }
          : { backgroundColor: c.tarjeta, borderColor: c.borde, borderWidth: 1 },
        (pressed || deshabilitado) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.texto, { color: primario ? c.textoPrimario : c.texto }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  texto: { fontSize: 16, fontWeight: '600' },
});