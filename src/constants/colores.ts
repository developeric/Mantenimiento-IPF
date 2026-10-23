export const colores = {
  light: {
    fondo: "#F5F7FA",
    tarjeta: "#FFFFFF",
    texto: "#1A1A1A",
    suave: "#5F6B7A",
    borde: "#D8DEE6",
    primario: "#1F6FEB",
    textoPrimario: "#FFFFFF",
    exito: "#1E8E3E",
    alerta: "#B26A00",
    error: "#C62828",
  },
  dark: {
    fondo: "#0F1115",
    tarjeta: "#1A1D23",
    texto: "#F2F4F7",
    suave: "#9AA4B2",
    borde: "#2A2F37",
    primario: "#4C8DFF",
    textoPrimario: "#FFFFFF",
    exito: "#4CC26A",
    alerta: "#F0A93B",
    error: "#EF5350",
  },
};

export type Colores = typeof colores.light;
