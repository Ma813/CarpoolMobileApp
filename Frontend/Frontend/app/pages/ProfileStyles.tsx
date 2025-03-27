import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    input: {
        height: 45,
        borderColor: "#9fbf2a", // Updated border color
        borderWidth: 2, // Slightly thicker border for a more defined look
        borderRadius: 10, // Rounded corners for a cuter look
        paddingLeft: 15,
        marginBottom: 15, // Increased bottom margin for better spacing
        backgroundColor: "#f0f8e2", // Light background color for better contrast with the green
        fontSize: 16, // Slightly larger font for readability
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    button: {
        backgroundColor: "#9fbf2a",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },

});