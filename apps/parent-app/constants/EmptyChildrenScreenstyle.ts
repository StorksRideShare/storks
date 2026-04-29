import { StyleSheet } from "react-native";

const EmptyChildrenScreenstyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0F07",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  back: {
    color: "#FF7A00",
    fontSize: 20,
  },

  title: {
    color: "#FF7A00",
    fontSize: 22,
    fontWeight: "bold",
  },

  infoBox: {
    borderWidth: 1,
    borderColor: "#FF7A00",
    borderStyle: "dashed",
    borderRadius: 15,
    padding: 20,
    marginTop: 40,
  },

  infoText: {
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#FF7A00",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EmptyChildrenScreenstyle;