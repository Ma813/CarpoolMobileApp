import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    button: {
        backgroundColor: '#9fbf2a',
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#3e5916',
        fontSize: 22,
        fontWeight: 'bold',
    },
    text: {
        marginTop: 15,
        textAlign: 'center',
        color: '#333',
        fontFamily: 'Gotham-light',
        fontSize: 23,

    },
    imageContainer: {
        marginBottom: 50,
        alignItems: 'center',

    },
    image: {
        width: 100,
        resizeMode: 'contain',
    },
    app_name: {
        fontSize: 33,
        fontFamily: 'Gotham-bold',
    },
    welcome: {
        fontFamily: 'Gotham-bold',
        fontSize: 43,
        marginTop: 50,
    },
    greenLine: {
        width: '100%',
        height: 5,
        backgroundColor: '#9fbf2a',
        marginBottom: 5,
        marginTop: 20,
    },

    hyperlink: {
        color: '#9fbf2a',
        textAlign: 'center',
        fontSize: 23,
        fontFamily: 'Gotham-light',
        marginTop: 10,
    },

});