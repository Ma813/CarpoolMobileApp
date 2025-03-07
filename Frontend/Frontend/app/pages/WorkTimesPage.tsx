import React, { useState, useEffect } from 'react';
import { getUserWorkTimes, WorkTime } from '@/services/api';
import { View, Text } from 'react-native';

const WorkTimesPage = () => {
    const [workTimes, setWorkTimes] = useState<WorkTime[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserWorkTimes().then((data) => {
            console.log('Fetched work times:', data); // Debugging log
            setWorkTimes(data);
            setLoading(false);
        }).catch((error) => {
            console.error('Error fetching work times:', error);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;
    }
    if (!workTimes || workTimes.length === 0) {
        return <Text>No work times</Text>;
    }

    return (
        <View>
            <Text>Work Times</Text>
            {workTimes.map((workTime) => (
                <View key={workTime.id_user_work_times}>
                    <Text>{workTime.start_time}</Text>
                    <Text>{workTime.end_time}</Text>
                    <Text>{workTime.day}</Text>
                </View>
            ))}
        </View>
    );
};

export default WorkTimesPage;