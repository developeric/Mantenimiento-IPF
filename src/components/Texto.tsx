import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';
import { useColores } from '@/hooks/useColores';

type Props = { children: ReactNode; suave?: boolean; negrita?: boolean; style?: TextStyle };

export function Texto({ children, suave, negrita, style }: Props) {
  const c = useColores();
  return (
    <Text
      style={[
        { color: suave ? c.suave : c.texto, fontSize: 16, lineHeight: 22 },
        negrita && { fontWeight: '600' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}