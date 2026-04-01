import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

export const AuthContainer = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.container, style]}>
    {children}
  </View>
);

export const AuthLogo = () => (
  <View style={styles.logoContainer}>
    <Text style={styles.logoText}>
      <Text style={styles.logoHighlight}>S</Text>torks
    </Text>
  </View>
);

export const AuthTitle = ({ children }: { children: string }) => (
  <Text style={styles.title}>{children}</Text>
);

export const AuthDescription = ({ children }: { children: string }) => (
  <Text style={styles.description}>{children}</Text>
);

export const AuthInput = (props: TextInputProps) => (
  <TextInput
    style={styles.input}
    placeholderTextColor="#7A726E"
    autoCapitalize="none"
    autoCorrect={false}
    {...props}
  />
);

export const AuthButton = ({
  onPress,
  title,
  isLoading,
  disabled,
  variant = 'primary',
}: {
  onPress: () => void;
  title: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'tos';
}) => {
  const buttonStyle = [
    variant === 'primary' ? styles.primaryButton : variant === 'tos' ? styles.tosButtonActive : styles.footerContainer,
    (disabled || isLoading) && styles.buttonDisabled,
  ];

  const textStyle = [
    variant === 'primary' ? styles.primaryButtonText : variant === 'tos' ? styles.tosButtonTextActive : styles.footerText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000000' : '#FFFFFF'} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export const AuthError = ({ message }: { message: string | null }) => 
  message ? <Text style={styles.errorText}>{message}</Text> : null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171412',
  },
  logoContainer: {
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingLeft: 24,
  },
  logoText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoHighlight: {
    fontFamily: 'Syne_700Bold',
    color: '#E66B00',
  },
  title: {
    fontFamily: 'Syne_400Regular',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
  },
  description: {
    fontFamily: 'Syne_400Regular',
    fontSize: 14,
    color: '#7A726E',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: '#E66B00',
    borderRadius: 30,
    paddingHorizontal: 24,
    color: '#FFFFFF',
    fontFamily: 'Syne_400Regular',
    fontSize: 16,
    marginBottom: 20,
  },
  primaryButton: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  primaryButtonText: {
    fontFamily: 'Syne_700Bold',
    color: '#000000',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Syne_600SemiBold',
    color: '#E66B00',
    fontSize: 15,
  },
  errorText: {
    fontFamily: 'Syne_400Regular',
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  tosButtonActive: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E66B00',
  },
  tosButtonTextActive: {
    fontFamily: 'Syne_700Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
});
