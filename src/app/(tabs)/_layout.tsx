import { useAvisos } from "@/lib/avisos";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

export default function TabsLayout() {
  const { avisos } = useAvisos();
  const sinLeer = avisos.filter((a) => !a.leido).length;
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
          headerRight: () => (
            <Link href="/ajustes-app" asChild>
              <Pressable
                hitSlop={12}
                style={{ marginRight: 16 }}
                accessibilityLabel="Ajustes"
              >
                <Ionicons name="settings-outline" size={22} color="gray" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: "Avisos",
          tabBarBadge: sinLeer > 0 ? sinLeer : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="permisos"
        options={{
          title: "Permisos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
