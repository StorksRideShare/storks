import { StyleSheet } from "react-native";

const SearchScreenstyle = StyleSheet.create({
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
        fontSize: 20,
    },

    title: {
        color: "#ff6a00",
        fontSize: 20,
        fontWeight: "600",
    },

    groupRow: {
        flexDirection: "row",
        marginTop: 20,
        alignItems: "center",
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#ccc",
        marginRight: 10,
    },

    groupTitle: {
        color: "#fff",
        fontSize: 16,
    },

    groupSub: {
        color: "#aaa",
        fontSize: 12,
    },

    filterRow: {
        flexDirection: "row",
        marginTop: 15,
        alignItems: "center",
    },

    filterBtn: {
        borderWidth: 1,
        borderColor: "#ff6a00",
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },

    filterText: {
        color: "#ff6a00",
    },

    tag: {
        borderWidth: 1,
        borderColor: "#999",
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },

    divider: {
        height: 1,
        backgroundColor: "#555",
        marginVertical: 15,
    },

    resultText: {
        color: "#ccc",
        textAlign: "center",
        marginBottom: 10,
    },

    card: {
        backgroundColor: "#eee",
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
    },

    cardTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatarSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ccc",
        marginRight: 10,
    },

    driverName: {
        color: "#ff6a00",
        fontWeight: "600",
    },

    vehicle: {
        color: "#333",
    },

    badge: {
        backgroundColor: "#ff6a00",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        marginTop: 5,
        alignSelf: "flex-start",
    },

    badgeText: {
        color: "#fff",
        fontSize: 12,
    },

    hideBtn: {
        backgroundColor: "#ff6a00",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    hideText: {
        color: "#fff",
    },

    infoRow: {
        flexDirection: "row",
        marginTop: 10,
    },

    infoBox: {
        borderWidth: 1,
        borderColor: "#333",
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },

    searchBtn: {
        backgroundColor: "#ff6a00",
        padding: 15,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 10,
    },

    searchText: {
        color: "#fff",
        fontWeight: "600",
    },

    nav: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 15,
    },

    navIcon: {
        color: "#fff",
        fontSize: 20,
    },
});

export default SearchScreenstyle;