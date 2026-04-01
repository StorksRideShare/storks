import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f0a",
  },

  map: {
    width,
    height,
  },

  badge: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "#ff6600",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  badgeText: {
    color: "white",
    fontWeight: "bold",
  },

  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#eee",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  driverName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  vehicle: {
    color: "#ff6600",
    marginBottom: 10,
  },

  pinBox: {
    marginVertical: 10,
  },

  pinLabel: {
    fontWeight: "bold",
  },

  pinRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  pinDigit: {
    backgroundColor: "#ccc",
    padding: 8,
    marginRight: 5,
    borderRadius: 5,
  },

  childText: {
    marginVertical: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  callBtn: {
    backgroundColor: "#ff6600",
    padding: 15,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },

  emergencyBtn: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#ff6600",
    padding: 15,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  secondaryText: {
    color: "#ff6600",
    fontWeight: "bold",
  },
});

export default styles;