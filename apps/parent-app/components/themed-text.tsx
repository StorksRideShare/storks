import { Text, TextProps } from './Themed';

export interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

export function ThemedText({ style, type, ...rest }: ThemedTextProps) {
  const typeStyles = {
    default: { fontSize: 16, lineHeight: 24 },
    defaultSemiBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    title: { fontSize: 32, fontWeight: 'bold' as const, lineHeight: 32 },
    subtitle: { fontSize: 20, fontWeight: 'bold' as const },
    link: { lineHeight: 30, fontSize: 16, color: '#0a7ea4' },
  };

  return (
    <Text
      style={[
        type ? typeStyles[type] : typeStyles.default,
        style,
      ]}
      {...rest}
    />
  );
}
