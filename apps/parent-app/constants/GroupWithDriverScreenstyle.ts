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

  logo: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  profile: {
    color: "white",
    fontSize: 20,
  },

  coverContainer: {
    position: "relative",
  },

  cover: {
    width: "100%",
    height: 180,
  },

  editBtn: {
    position: "absolute",
    right: 15,
    bottom: 15,
    backgroundColor: "#ff6a00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  editText: {
    color: "white",
    fontSize: 12,
  },

  groupName: {
    color: "#ff6a00",
    fontSize: 26,
    margin: 16,
    fontWeight: "600",
  },

  section: {
    color: "white",
    fontSize: 18,
    marginHorizontal: 16,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#ccc",
    marginRight: 12,
  },

  name: {
    color: "white",
    fontSize: 16,
  },

  sub: {
    color: "#aaa",
    fontSize: 13,
  },

  icon: {
    color: "white",
    fontSize: 18,
  },

  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
  },

  badge: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderStyle: "dashed",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 5,
    alignSelf: "flex-start",
  },

  badgeText: {
    color: "white",
    fontSize: 12,
  },

  vehicle: {
    color: "#ff6a00",
    fontSize: 14,
  },

  paidBox: {
    borderWidth: 1,
    borderColor: "lime",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },

  paidText: {
    color: "lime",
    fontSize: 12,
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
  },

  callBtn: {
    flex: 1,
    backgroundColor: "#ff6a00",
    padding: 14,
    borderRadius: 30,
    marginRight: 8,
    alignItems: "center",
  },

  callText: {
    color: "white",
    fontWeight: "600",
  },

  manageBtn: {
    flex: 1,
    backgroundColor: "#ddd",
    padding: 14,
    borderRadius: 30,
    marginLeft: 8,
    alignItems: "center",
  },

  manageText: {
    color: "black",
    fontWeight: "600",
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 14,
    borderTopWidth: 0.5,
    borderColor: "#333",
  },

  active: {
    color: "#ff6a00",
    fontSize: 20,
  },

  navIcon: {
    color: "white",
    fontSize: 20,
  },
});