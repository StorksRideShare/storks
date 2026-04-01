import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f0a",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  back: {
    color: "#ff6a00",
    fontSize: 20,
    marginRight: 10,
  },

  title: {
    color: "#ff6a00",
    fontSize: 20,
  },

  section: {
    color: "white",
    fontSize: 20,
    margin: 16,
  },

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

  card: {
    borderWidth: 1,
    borderColor: "#555",
    borderStyle: "dashed",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#ccc",
    marginRight: 10,
  },

  name: { color: "white", fontSize: 16 },

  verified: {
    color: "#ff6a00",
    fontSize: 12,
  },

  seats: { color: "#ff6a00" },

  routeBox: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },

  route: { color: "white" },

  dots: {
    color: "#aaa",
    alignSelf: "center",
    marginVertical: 5,
  },

  note: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 10,
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  acceptBtn: {
    backgroundColor: "#ff6a00",
    padding: 10,
    borderRadius: 20,
  },

  acceptText: { color: "white" },

  rejectBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 20,
  },

  rejectText: { color: "white" },

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