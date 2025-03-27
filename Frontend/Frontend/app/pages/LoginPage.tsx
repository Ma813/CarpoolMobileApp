import React, { useState, useEffect, useRef } from 'react';
import { Navigation, X } from 'lucide-react-native'; // Using Lucide icons, you can replace with any other
import { useFonts } from 'expo-font';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    Animated,
    Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '@/services/authApi';
import { styles } from './LoginStyles';

const LoginPage = () => {
    const [fontsLoaded] = useFonts({
        'Gotham': require('@/assets/fonts/Gotham-Black.otf'),
        'Gotham-Bold': require('@/assets/fonts/Gotham-Bold.otf'),
        'Gotham-Italic': require('@/assets/fonts/Gotham-BlackItalic.otf'),
        'Gotham-Light': require('@/assets/fonts/Gotham-Light.otf'),
    });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<any>();

    // Animated values
    const animatedHeight = useRef(new Animated.Value(150)).current; // Initial height
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
                    toValue: 150, // Restore height
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
                        {/* Animated Image Container */}
                        <Animated.View style={[styles.imageContainer, { height: animatedHeight, opacity: animatedOpacity }]}>
                            <Image source={require('@/assets/images/car.png')} style={styles.image} />
                            <Text style={styles.app_name}>COLLAB.RIDE</Text>
                            <Text style={styles.welcome}>WELCOME</Text>
                        </Animated.View>

                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        <Text style={styles.heading}>Sign in to continue</Text>

                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            placeholderTextColor="#888"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            placeholderTextColor="#888"
                            secureTextEntry
                        />

                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>SIGN IN</Text>
                        </TouchableOpacity>

                        <View style={styles.greenLine} />
                        <Text onPress={() => setError("Pats kaltas!")} style={styles.hyperlink}>Forgot password?</Text>

                        <Text style={styles.text}>Don't have an account?</Text>

                        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('pages/RegisterPage')}>
                            <Text style={styles.buttonText}>REGISTER</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginPage;