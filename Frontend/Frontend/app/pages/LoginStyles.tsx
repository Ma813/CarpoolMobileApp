import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    error: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        color: 'red',
        padding: 10,
        borderRadius: 5,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: '25%',
    },
    form: {
        width: '80%',
    },
    heading: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
});