import { StyleSheet } from "react-native";

const CustomScheduleScreenstyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0F07",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
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

  mainTitle: {
    color: "white",
    fontSize: 22,
    marginBottom: 15,
  },

  desc: {
    color: "#ccc",
    marginBottom: 20,
    lineHeight: 20,
  },

  dayBox: {
    borderWidth: 1,
    borderColor: "#FF7A00",
    borderRadius: 30,
    padding: 18,
    marginBottom: 15,
  },

  dayText: {
    color: "#777",
    fontSize: 16,
  },

  infoBox: {
    borderWidth: 1,
    borderColor: "#FF7A00",
    borderStyle: "dashed",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },

  infoText: {
    color: "#ccc",
    textAlign: "center",
  },

  button: {
    backgroundColor: "#eee",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default CustomScheduleScreenstyle;