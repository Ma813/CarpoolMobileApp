import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signup } from '@/services/authApi';
import { getWeatherForecast } from '@/services/api';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            await signup({ username, password });
        } catch (error: any) {
            if (error.response) {
                setError("Server error occurred: " + error.error);
        }
    }
    };

    return (
        <View style={styles.container}>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.form}>
                <Text style={styles.heading}>Register</Text>
                <Text>Username:</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                    autoCapitalize="none"
                />
                <Text>Password:</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    secureTextEntry
                />
                <Button title="Register" onPress={handleRegister} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    error: {
        color: 'red',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

export default RegisterPage;