import { StyleSheet } from "react-native";

const GroupEmptyScreenstyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f0a",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  logo: {
    color: "#fff",
    fontSize: 18,
  },

  profile: {
    color: "#fff",
    fontSize: 20,
  },

  banner: {
    height: 150,
    backgroundColor: "#ccc",
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "space-between",
    padding: 10,
  },

  back: {
    color: "#ff6a00",
    fontSize: 18,
  },

  editBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#ff6a00",
    padding: 6,
    borderRadius: 20,
  },

  editText: {
    color: "#fff",
    fontSize: 12,
  },

  groupName: {
    color: "#ff6a00",
    fontSize: 22,
    marginTop: 10,
  },

  section: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
  },

  dashedBox: {
    borderWidth: 1,
    borderColor: "#ff6a00",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dashedBoxSmall: {
    borderWidth: 1,
    borderColor: "#ff6a00",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },

  boxText: {
    color: "#fff",
    flex: 1,
  },

  plus: {
    color: "#ff6a00",
    fontSize: 20,
  },

  search: {
    color: "#ff6a00",
    fontSize: 18,
  },

  btn: {
    backgroundColor: "#777",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  navIcon: {
    color: "#fff",
    fontSize: 20,
  },

  active: {
    color: "#ff6a00",
    fontSize: 20,
  },
});

export default GroupEmptyScreenstyle;