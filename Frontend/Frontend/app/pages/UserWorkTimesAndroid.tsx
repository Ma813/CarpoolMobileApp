import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Switch, TouchableOpacity, Platform, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/services/api";
import { getUserWorkTimes } from "@/services/workTimeApi";
import { styles } from "./ProfileStyles";

const UserWorkTimeAndroid: React.FC = () => {
    const navigation = useNavigation<any>();
    const [workTimes, setWorkTimes] = useState<{
        [key: string]: {
            start_time: string;
            end_time: string;
            changed: boolean;
            working: boolean;
        };
    }>({
        Monday: { start_time: "09:00:00", end_time: "17:00:00", changed: false, working: false },
        Tuesday: { start_time: "09:00:00", end_time: "17:00:00", changed: false, working: false },
        Wednesday: { start_time: "09:00:00", end_time: "17:00:00", changed: false, working: false },
        Thursday: { start_time: "09:00:00", end_time: "17:00:00", changed: false, working: false },
        Friday: { start_time: "09:00:00", end_time: "17:00:00", changed: false, working: false },
        Saturday: { start_time: "09:00:00", end_time: "17:00:00", changed: false, working: false },
        Sunday: { start_time: "09:00:00", end_time: "17:00:00", changed: false, working: false },
    });

    const [pickerConfig, setPickerConfig] = useState<{
        day: string;
        isStart: boolean;
        visible: boolean;
    }>({ day: "", isStart: true, visible: false });

    const [tempTime, setTempTime] = useState<Date | undefined>(undefined);

    const fetchWorkTimes = async () => {
        try {
            const workTimesArray = await getUserWorkTimes();
            console.log("API Response:", workTimesArray); // Debugging: Log the API response

            // If the API returns no data, use the initial state
            if (!workTimesArray || workTimesArray.length === 0) {
                console.log("No work times found, using default values.");
                return;
            }

            // Update the state with the fetched data
            const updatedWorkTimes = { ...workTimes };
            workTimesArray.forEach((workTime) => {
                if (workTime.day in updatedWorkTimes) {
                    updatedWorkTimes[workTime.day] = {
                        start_time: workTime.start_time?.toString() || "",
                        end_time: workTime.end_time?.toString() || "",
                        changed: false,
                        working: !!workTime.start_time && !!workTime.end_time, // Set working to true if both times are present
                    };
                }
            });

            setWorkTimes(updatedWorkTimes);
        } catch (error) {
            console.error("Error fetching work times:", error);
            alert("Failed to fetch work times.");
        }
    };

    useEffect(() => {
        fetchWorkTimes();
    }, []);

    const handleTimeChange = (day: string, time: string, isStart: boolean) => {
        setWorkTimes((prevWorkTimes) => ({
            ...prevWorkTimes,
            [day]: {
                ...prevWorkTimes[day],
                [isStart ? "start_time" : "end_time"]: time,
                changed: true,
            },
        }));
        console.log("Work time:", workTimes[day]); // Debugging: Log the work times
    };

    const openPicker = (day: string, isStart: boolean) => {
        const defaultDate = new Date(
            Date.UTC(
                1970,
                0,
                1,
                ...(workTimes[day][isStart ? "start_time" : "end_time"]
                    ?.split(":")
                    .map(Number) || [0, 0, 0])
            )
        );
        setTempTime(defaultDate);
        setPickerConfig({ day, isStart, visible: true });
    };

    const closePicker = () => {
        setPickerConfig({ ...pickerConfig, visible: false });
    };

    const handleWorkingToggle = (day: string, value: boolean) => {
        if (!value) {
            // If the switch is turned off, reset start and end times
            setWorkTimes((prevWorkTimes) => ({
                ...prevWorkTimes,
                [day]: {
                    ...prevWorkTimes[day],
                    working: false,
                    changed: true,
                },
            }));
        }
        else {
            setWorkTimes((prevWorkTimes) => ({
                ...prevWorkTimes,
                [day]: {
                    ...prevWorkTimes[day],
                    working: value,
                    changed: true,
                },
            }));
        }
    };

    const onChange = (
        day: string,
        isStart: boolean,
        event: any,
        selectedDate?: Date
    ) => {
        if (selectedDate) {
            console.log("Selected date:", selectedDate); // Debugging: Log the selected date
            const hours = selectedDate.getUTCHours().toString().padStart(2, "0");
            const minutes = selectedDate.getUTCMinutes().toString().padStart(2, "0");
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
        }, {} as { [key: string]: { start_time: string; end_time: string; changed: boolean } });

        if (Object.keys(changedWorkTimes).length === 0) {
            alert("No changes to save.");
            return;
        }
        for (const day in changedWorkTimes) {
            const { start_time, end_time } = changedWorkTimes[day];
            if (!start_time || !end_time) {
                alert(`Please set both start and end times for ${day}.`);
                return;
            }
            if (start_time > end_time) {
                alert(`Start time cannot be greater than end time for ${day}.`);
                return;
            }
        }

        try {
            const response = await api.post(
                "/userworktime/saveWorkTimes",
                changedWorkTimes,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Work times saved successfully!");
            console.log(workTimes);
            // navigation.navigate("index");
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save work times.");
        }
    };

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(":");
        return `${hour}:${minute}`;
    };

    return (
        <View>
            <Text style={{ textAlign: "center", fontSize: 18, marginVertical: 10 }}>
                Enter Your Work Time
            </Text>
            {Object.keys(workTimes).map((day) => (
                <View key={day} style={WorkTimeStyles.dayContainer}>
                    <Text style={WorkTimeStyles.dayText}>{day.toLocaleUpperCase()}</Text>
                    <Switch
                        value={workTimes[day].working}
                        onValueChange={(value) => handleWorkingToggle(day, value)}
                    />
                    <View style={WorkTimeStyles.timePickersContainer}>
                        {workTimes[day].working && (
                            <>
                                <View style={WorkTimeStyles.timeRow}>
                                    <TouchableOpacity onPress={() => openPicker(day, true)} style={WorkTimeStyles.timeButton}>
                                        <Text style={WorkTimeStyles.timeText}>{formatTime(workTimes[day].start_time)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => openPicker(day, false)} style={WorkTimeStyles.timeButton}>
                                        <Text style={WorkTimeStyles.timeText}>{formatTime(workTimes[day].end_time)}</Text>
                                    </TouchableOpacity>
                                </View>

                                {pickerConfig.visible && pickerConfig.day === day && (
                                    <Modal
                                        transparent
                                        animationType="fade"
                                        visible={pickerConfig.visible}
                                        onRequestClose={closePicker}
                                    >
                                        <View style={WorkTimeStyles.modalBackground}>
                                            <View style={WorkTimeStyles.modalContainer}>
                                                <DateTimePicker
                                                    value={tempTime || new Date(
                                                        Date.UTC(
                                                            1970,
                                                            0,
                                                            1,
                                                            ...(workTimes[day][pickerConfig.isStart ? "start_time" : "end_time"]
                                                                ?.split(":")
                                                                .map(Number) || [0, 0, 0])
                                                        )
                                                    )}
                                                    mode="time"
                                                    is24Hour={true}
                                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                                    minuteInterval={15}
                                                    timeZoneName="UTC"
                                                    onChange={(event, selectedDate) => {
                                                        if (Platform.OS === "ios") {
                                                            if (selectedDate) setTempTime(selectedDate);
                                                        } else {
                                                            closePicker();
                                                            onChange(day, pickerConfig.isStart, event, selectedDate);
                                                        }
                                                    }}
                                                />
                                                {Platform.OS === "ios" && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            if (tempTime) {
                                                                onChange(day, pickerConfig.isStart, null, tempTime);
                                                            }
                                                            closePicker();
                                                        }}
                                                        style={WorkTimeStyles.modalCloseButton}
                                                    >
                                                        <Text style={WorkTimeStyles.modalCloseText}>OK</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {Platform.OS !== "ios" && (
                                                    <TouchableOpacity onPress={closePicker} style={WorkTimeStyles.modalCloseButton}>
                                                        <Text style={WorkTimeStyles.modalCloseText}>Close</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </Modal>
                                )}
                            </>
                        )}
                    </View>
                </View>
            ))}
            <TouchableOpacity
                style={styles.button}
                onPress={() => { saveWorkTimes() }}>
                <Text style={styles.buttonText}>Save Work Times</Text>
            </TouchableOpacity>

        </View>
    );
};

const WorkTimeStyles = StyleSheet.create({
    dayContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    dayText: {
        flex: 1,
        textAlign: "center",
        marginRight: 25,
        backgroundColor: "#9fbf2a",
        padding: 10,
        fontFamily: "Gotham-Bold",
        color: "#3e5916",
    },
    timePickersContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 2,
    },
    DateTimePicker: {
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        color: "red", // ensure text color is visible
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRadius: 10,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    modalCloseButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#9fbf2a",
        borderRadius: 5,
    },
    modalCloseText: {
        color: "#fff",
        fontWeight: "bold",
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 12,
    },
    timeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "lightgray",
        borderRadius: 4,
        marginRight: 10,
    },
    timeText: {
        fontFamily: "Gotham-Bold",
        fontSize: 16,
        color: "#000",
    }
});

export default UserWorkTimeAndroid;
