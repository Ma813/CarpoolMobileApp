import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '@/services/authApi';
import { styles } from './LoginStyles';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<any>();

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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollView}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.form}>
                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        <Text style={styles.heading}>Login</Text>

                        <Text>Username:</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter username"
                            placeholderTextColor="#888"
                            autoCapitalize="none"
                        />

                        <Text>Password:</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter password"
                            placeholderTextColor="#888"
                            secureTextEntry
                        />

                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>

                        <Text style={styles.text}>Don't have an account?</Text>

                        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('pages/RegisterPage')}>
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginPage;