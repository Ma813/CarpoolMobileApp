import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        padding: 15,
        borderRadius: 5,
        fontFamily: 'Gotham-bold',
        fontSize: 18,  
    },

    form: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    heading: {
        fontFamily: 'Gotham-Bold',
        fontSize: 23,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        fontFamily: 'Gotham-light',
        width: '100%',
        height: 45,
        borderWidth: 1,
        borderColor: '#9fbf2a',
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 23,
        color: '#333',
        textAlign: 'center',
    },
    name: {
        fontFamily: 'Gotham-light',
        fontSize: 50,
        textAlign: 'left',
        color: '#fff',
    },
    bold: {
        fontWeight: 'bold',
    },
    top: {
        justifyContent: 'center',
        backgroundColor: '#9fbf2a',
        borderBottomLeftRadius: 20,

        paddingTop: 50,
        paddingBottom: 30,
        paddingLeft: 20,
        borderBottomRightRadius: 20,
    },
    bigX: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 10,
    },

});