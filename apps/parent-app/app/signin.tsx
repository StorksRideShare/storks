import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canContinue = email.trim().length > 3 && password.trim().length > 3;

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Storks</Text>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.loginButton, !canContinue && styles.disabled]}
        disabled={!canContinue}
        onPress={() => router.replace("./children")}
      >
        <Text style={styles.loginText}>Log In</Text>
      </Pressable>

      <View style={styles.orRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      <Pressable style={styles.socialButton}>
        <Text style={styles.socialText}>Continue with Google</Text>
      </Pressable>

      <Pressable style={styles.socialButton}>
        <Text style={styles.socialText}>Continue with Facebook</Text>
      </Pressable>

      <Text style={styles.signupHint}>Don't have an account yet?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#140A07",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 96,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 28,
    color: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 14,
    marginTop: 8,
  },
  disabled: {
    opacity: 0.45,
  },
  loginText: {
    textAlign: "center",
    color: "#000000",
    fontSize: 20,
    fontWeight: "700",
  },
  orRow: {
    marginTop: 26,
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: "#4A3A31" },
  orText: { color: "#FFFFFF", fontSize: 20, fontWeight: "600" },
  socialButton: {
    backgroundColor: "#F97316",
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 12,
  },
  socialText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  signupHint: {
    marginTop: 8,
    color: "#F97316",
    textAlign: "center",
    fontSize: 18,
  },
});
