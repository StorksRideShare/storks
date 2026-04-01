import { StyleSheet } from "react-native";

const DriverProfileScreenstyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f0a",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  back: {
    color: "#ff6a00",
    fontSize: 18,
  },

  title: {
    color: "#ff6a00",
    fontSize: 18,
  },

  bookmark: {
    color: "#ff6a00",
    fontSize: 18,
  },

  center: {
    alignItems: "center",
    marginTop: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
  },

  name: {
    color: "#ff6a00",
    fontSize: 20,
    marginTop: 10,
  },

  verify: {
    color: "#ff6a00",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  statBox: {
    borderWidth: 1,
    borderColor: "#fff",
    borderStyle: "dashed",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "30%",
  },

  statMain: {
    color: "#ff6a00",
    fontSize: 16,
  },

  statSub: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },

  section: {
    color: "#fff",
    fontSize: 18,
    marginTop: 25,
  },

  vehicleBox: {
    borderWidth: 1,
    borderColor: "#fff",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  image: {
    width: "48%",
    height: 100,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },

  vehicleName: {
    color: "#fff",
    marginTop: 10,
  },

  plate: {
    backgroundColor: "#ff6a00",
    color: "#fff",
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: 10,
    marginTop: 5,
  },

  destinationBox: {
    borderWidth: 1,
    borderColor: "#fff",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

  destinationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  location: {
    color: "#fff",
  },

  matchBtn: {
    borderWidth: 1,
    borderColor: "#ff6a00",
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  matchText: {
    color: "#ff6a00",
  },

  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
  },

  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },

  groupTitle: {
    color: "#fff",
  },

  groupSub: {
    color: "#aaa",
    fontSize: 12,
  },

  arrow: {
    color: "#ff6a00",
  },

  bookBtn: {
    backgroundColor: "#ff6a00",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  bookText: {
    color: "#fff",
    fontWeight: "bold",
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

export default DriverProfileScreenstyle;