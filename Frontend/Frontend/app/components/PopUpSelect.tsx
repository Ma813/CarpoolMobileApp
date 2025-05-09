import React from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    FlatList,
    Dimensions,
} from 'react-native';

interface Option {
    id: string;
    name: string;
}

interface PopUpSelectProps {
    title?: string;
    visible: boolean;
    options: Option[];
    onSelect: (option: Option) => void;
    onClose: () => void;
}

const PopUpSelect: React.FC<PopUpSelectProps> = ({
    title,
    visible,
    options,
    onSelect,
    onClose,
}) => {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>{title || "Select an option"}</Text>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.option,
                                    pressed && styles.optionPressed,
                                ]}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={styles.optionText}>{item.name}</Text>
                            </Pressable>
                        )}
                    />
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: width * 0.8,
        maxHeight: '70%',
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    option: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    optionPressed: {
        backgroundColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    closeButton: {
        marginTop: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#007aff',
        fontWeight: '600',
    },
});

export default PopUpSelect;