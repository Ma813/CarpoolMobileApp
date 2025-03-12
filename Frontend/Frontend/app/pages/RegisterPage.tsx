import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signup } from '@/services/authApi';
import { useNavigation } from '@react-navigation/native';
import { getWeatherForecast } from '@/services/api';
import { styles } from './LoginStyles';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<any>();
    
    const handleRegister = async () => {
        try {
            await signup({ username, password }).then(() => {
                console.log('Registered');
                navigation.navigate('pages/LoginPage');});
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data);
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
export default RegisterPage;