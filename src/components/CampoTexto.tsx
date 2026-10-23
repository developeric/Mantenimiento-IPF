import { Texto } from "@/components/Texto";
import { useColores } from "@/hooks/useColores";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  etiqueta: string;
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  multiline?: boolean;
  obligatorio?: boolean;
};

export function CampoTexto({
  etiqueta,
  value,
  onChangeText,
  placeholder,
  multiline,
  obligatorio,
}: Props) {
  const c = useColores();
  return (
    <View style={styles.contenedor}>
      <Texto negrita>
        {etiqueta}
        {obligatorio ? " *" : ""}
      </Texto>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.suave}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        accessibilityLabel={etiqueta}
        style={[
          styles.input,
          multiline && styles.multilinea,
          { color: c.texto, backgroundColor: c.tarjeta, borderColor: c.borde },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  multilinea: { minHeight: 96 },
});
