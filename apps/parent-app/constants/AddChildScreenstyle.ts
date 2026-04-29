import { StyleSheet } from "react-native";

const AddChildScreenstyle = StyleSheet.create({
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

  section: {
    color: "white",
    fontSize: 20,
    marginBottom: 20,
  },

  inputBox: {
    borderWidth: 1,
    borderColor: "#FF7A00",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  input: {
    color: "white",
    flex: 1,
  },

  placeholder: {
    color: "#777",
  },

  icon: {
    marginLeft: 10,
  },

  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  imageItem: {
    alignItems: "center",
  },

  imageCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  plus: {
    fontSize: 24,
    color: "#FF7A00",
  },

  imageText: {
    color: "white",
    marginTop: 8,
    fontSize: 12,
  },

  helper: {
    color: "#ccc",
    marginBottom: 10,
  },

  optionBtn: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },

  optionText: {
    color: "#000",
    fontWeight: "500",
  },

  submitBtn: {
    backgroundColor: "#777",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },

  submitText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AddChildScreenstyle;