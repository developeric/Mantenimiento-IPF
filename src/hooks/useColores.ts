import { colores } from "@/constants/colores";
import { useColorScheme } from "react-native";

export function useColores() {
  return colores[useColorScheme() === "dark" ? "dark" : "light"];
}
