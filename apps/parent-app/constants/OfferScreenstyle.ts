import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f0a",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  logo: { color: "white", fontSize: 18 },
  offer: { color: "#ff6a00", fontSize: 18 },

  title: {
    color: "white",
    fontSize: 22,
    margin: 16,
  },

  activeBox: {
    borderWidth: 1,
    borderColor: "lime",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  activeTitle: { color: "white", fontSize: 16 },
  activeSub: { color: "#ccc", fontSize: 13 },
  check: { color: "lime", fontSize: 20 },

  center: {
    alignItems: "center",
    marginVertical: 20,
  },

  occupancy: { color: "#aaa" },

  count: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },

  total: { color: "#555", fontSize: 20 },

  badge: {
    backgroundColor: "#3b1f0d",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },

  badgeText: { color: "#ff6a00" },

  box: {
    borderWidth: 1,
    borderColor: "#555",
    borderStyle: "dashed",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  boxText: { color: "white", fontSize: 16 },

  arrow: { color: "white", fontSize: 18 },

  row: { flexDirection: "row", alignItems: "center" },

  manual: {
    color: "#ff6a00",
    borderWidth: 1,
    borderColor: "#ff6a00",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },

  vehicleBox: {
    borderWidth: 1,
    borderColor: "#555",
    borderStyle: "dashed",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    flexDirection: "row",
  },

  sub: { color: "#aaa", marginTop: 4 },

  plate: {
    backgroundColor: "#ff6a00",
    padding: 6,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  plateText: { color: "white" },

  vehicleImg: {
    width: 120,
    height: 80,
    borderRadius: 10,
  },

  destBox: {
    borderWidth: 1,
    borderColor: "#555",
    borderStyle: "dashed",
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  inputText: { color: "white" },

  add: {
    color: "#aaa",
    marginTop: 15,
  },

  note: {
    color: "#777",
    fontSize: 12,
    marginTop: 10,
  },

  requestBox: {
    borderWidth: 1,
    borderColor: "lime",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  requestText: { color: "white" },

  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 0.5,
    borderColor: "#333",
  },

  navIcon: { color: "white", fontSize: 20 },

  active: { color: "#ff6a00", fontSize: 20 },
});