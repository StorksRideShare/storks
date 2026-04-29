import { StyleSheet } from "react-native";

const MyChildrenScreenstyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0F07",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
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

  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },

  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  sub: {
    color: "#ccc",
    fontSize: 13,
  },

  edit: {
    color: "white",
    fontSize: 18,
  },

  button: {
    backgroundColor: "#FF7A00",
    margin: 20,
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyChildrenScreenstyle;