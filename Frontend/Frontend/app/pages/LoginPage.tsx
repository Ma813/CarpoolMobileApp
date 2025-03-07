import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '@/services/authApi';
import { styles } from './LoginStyles';

import { getWeatherForecast } from '@/services/api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<any>();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const handleLogin = async () => {
        try {
            await login({ username, password }).then(() => {
                console.log('Logged in');
                navigation.navigate('index');
            });

        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setError("Wrong username or password");
            } else {
                setError("Server error occurred: " + error.message);
                console.error(error);
            }
        }
    };

    return (
        <View style={styles.container}>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.form}>
                <Text style={styles.heading}>Login</Text>
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
                <Button title="Login" onPress={handleLogin} />
            </View>
        </View>
    );
};

export default LoginPage;