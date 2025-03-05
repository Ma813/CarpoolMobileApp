import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';

const UserWorkTime: React.FC = () => {
    const [workTimes, setWorkTimes] = useState<{ [key: string]: { start_time: string, end_time: string, id_user: number, changed: boolean } }>({
        Monday: { start_time: '', end_time: '', id_user: 1, changed: false },
        Tuesday: { start_time: '', end_time: '', id_user: 1, changed: false },
        Wednesday: { start_time: '', end_time: '', id_user: 1, changed: false },
        Thursday: { start_time: '', end_time: '', id_user: 1, changed: false },
        Friday: { start_time: '', end_time: '', id_user: 1, changed: false },
        Saturday: { start_time: '', end_time: '', id_user: 1, changed: false },
        Sunday: { start_time: '', end_time: '', id_user: 1, changed: false },
    });

    const handleTimeChange = (day: string, time: string, isStart: boolean) => {
        setWorkTimes({
            ...workTimes,
            [day]: {
                ...workTimes[day],
                [isStart ? 'start_time' : 'end_time']: time,
                changed: true
            }
        });
    };

    const onChange = (day: string, isStart: boolean, event: any, selectedDate?: Date) => {
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0'); // Local time
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0'); // Local time
            const timeString = `${hours}:${minutes}:00`; // Store time in HH:MM:SS format

            handleTimeChange(day, timeString, isStart);
        }
    };

    const saveWorkTimes = async () => {
        const changedWorkTimes = Object.keys(workTimes).reduce((acc, day) => {
            if (workTimes[day].changed) {
                acc[day] = workTimes[day];
            }
            return acc;
        }, {} as { [key: string]: { start_time: string, end_time: string, id_user: number, changed: boolean } });

        if (Object.keys(changedWorkTimes).length === 0) {
            alert('No changes to save.');
            return;
        }

        try {
            const response = await api.post('/userworktime/saveWorkTimes', changedWorkTimes, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            alert('Work times saved successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save work times.');
        }
    };

    return (
        <View>
            <Text>Enter Your Work Time</Text>
            {Object.keys(workTimes).map((day) => (
                <View key={day} style={styles.dayContainer}>
                    <Text style={styles.dayText}>{day}</Text>
                    <DateTimePicker
                        value={
                            workTimes[day].start_time 
                                ? new Date(1970, 0, 1, ...workTimes[day].start_time.split(':').map(Number)) 
                                : new Date()
                        }
                        mode="time"
                        display="default"
                        minuteInterval={15}
                        timeZoneName={'Europe/Vilnius'}
                        onChange={(event, selectedDate) => onChange(day, true, event, selectedDate)}
                    />
                    <DateTimePicker
                        value={
                            workTimes[day].end_time 
                                ? new Date(1970, 0, 1, ...workTimes[day].end_time.split(':').map(Number)) 
                                : new Date()
                        }
                        mode="time"
                        display="default"
                        minuteInterval={15}
                        timeZoneName={'Europe/Vilnius'}
                        onChange={(event, selectedDate) => onChange(day, false, event, selectedDate)}
                    />
                </View>
            ))}
            <Button title="Save" onPress={saveWorkTimes} />
        </View>
    );
};

const styles = StyleSheet.create({
    dayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    dayText: {
        flex: 1,
        textAlign: 'center',
    },
});

export default UserWorkTime;