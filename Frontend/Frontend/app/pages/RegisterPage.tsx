import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Animated, Keyboard, Easing, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { signup } from '@/services/authApi';
import { useNavigation } from '@react-navigation/native';
import { styles } from './RegisterStyles';
import { useFonts } from 'expo-font';
import { ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import Icon from "react-native-vector-icons/FontAwesome";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<any>();

    const [fontsLoaded] = useFonts({
        'Gotham': require('@/assets/fonts/Gotham-Black.otf'),
        'Gotham-Bold': require('@/assets/fonts/Gotham-Bold.otf'),
        'Gotham-Italic': require('@/assets/fonts/Gotham-BlackItalic.otf'),
        'Gotham-Light': require('@/assets/fonts/Gotham-Light.otf'),
    });

    // Animated values
    const animatedHeight = useRef(new Animated.Value(200)).current; // Initial height
    const animatedOpacity = useRef(new Animated.Value(1)).current;  // Initial opacity

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            Animated.parallel([
                Animated.timing(animatedHeight, {
                    toValue: 0, // Shrink height to 0
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 0, // Fade out
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: false,
                }),
            ]).start();
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            Animated.parallel([
                Animated.timing(animatedHeight, {
                    toValue: 200, // Restore height
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 1, // Fade in
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: false,
                }),
            ]).start();
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setError('');
            await signup({ username, password }).then(() => {
                console.log('Registered');
                navigation.navigate('pages/LoginPage');
            });
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data);
            }
        }
    };



    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >


            <ScrollView >
                <View style={styles.top}>
                    <TouchableOpacity
                        style={styles.bigX}
                        onPress={() => navigation.navigate('pages/LoginPage')}
                    >
                        <X size={30} color="white" />
                    </TouchableOpacity>
                    <Animated.View style={{ height: animatedHeight, opacity: animatedOpacity }}>
                        <Text style={[styles.name]}>Let's</Text>
                        <Text style={[styles.name, styles.bold]}>Create</Text>
                        <Text style={[styles.name, styles.bold]}>Your</Text>
                        <Text style={[styles.name, styles.bold]}>Account</Text>
                    </Animated.View>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={styles.form}>

                    <View style={styles.inputContainer}>
                        <Icon name="user" size={18} color="#9EABA7" style={styles.icon} />
                        <TextInput
                            placeholder="Username"
                            placeholderTextColor="#9EABA7"
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Icon name="envelope" size={18} color="#9EABA7" style={styles.icon} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#9EABA7"
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Icon name="lock" size={18} color="#9EABA7" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter password"
                            placeholderTextColor="#888"
                            secureTextEntry
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Icon name="lock" size={18} color="#9EABA7" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}

                            placeholder="Retype password"
                            placeholderTextColor="#888"
                            secureTextEntry
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

        </KeyboardAvoidingView >
    );
};
export default RegisterPage;