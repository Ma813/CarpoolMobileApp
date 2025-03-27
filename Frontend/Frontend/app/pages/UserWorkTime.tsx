import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/services/api";
import { getUserWorkTimes } from "@/services/workTimeApi";

const UserWorkTime: React.FC = () => {
  const navigation = useNavigation<any>();
  const [workTimes, setWorkTimes] = useState<{
    [key: string]: {
      start_time: string;
      end_time: string;
      changed: boolean;
      working: boolean;
    };
  }>({
    Monday: { start_time: "00:00:00", end_time: "00:00:00", changed: false, working: false },
    Tuesday: { start_time: "00:00:00", end_time: "00:00:00", changed: false, working: false },
    Wednesday: { start_time: "00:00:00", end_time: "00:00:00", changed: false, working: false },
    Thursday: { start_time: "00:00:00", end_time: "00:00:00", changed: false, working: false },
    Friday: { start_time: "00:00:00", end_time: "00:00:00", changed: false, working: false },
    Saturday: { start_time: "00:00:00", end_time: "00:00:00", changed: false, working: false },
    Sunday: { start_time: "00:00:00", end_time: "00:00:00", changed: false, working: false },
  });

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

  const handleWorkingToggle = (day: string, value: boolean) => {
    if (!value) {
      // If the switch is turned off, reset start and end times
      setWorkTimes((prevWorkTimes) => ({
        ...prevWorkTimes,
        [day]: {
          ...prevWorkTimes[day],
          start_time: "00:00:00",
          end_time: "00:00:00",
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
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
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
                <DateTimePicker
                  value={
                    workTimes[day].start_time && workTimes[day].start_time !== ""
                      ? new Date(
                        1970,
                        0,
                        1,
                        ...workTimes[day].start_time.split(":").map(Number)

                      )
                      : new Date(1970, 0, 1, 0, 0) // Default to 00:00 UTC
                  }
                  mode="time"
                  display="compact"
                  minuteInterval={15}
                  onChange={(event, selectedDate) =>
                    onChange(day, true, event, selectedDate)
                  }
                />
                <DateTimePicker
                  value={
                    workTimes[day].end_time
                      ? new Date(

                        1970,
                        0,
                        1,
                        ...workTimes[day].end_time.split(":").map(Number)

                      )
                      : new Date(1970, 0, 1, 0, 0) // Default to 00:00 UTC
                  }
                  mode="time"
                  display="default"
                  minuteInterval={15}
                  onChange={(event, selectedDate) =>
                    onChange(day, false, event, selectedDate)
                  }
                />
              </>
            )}
          </View>
        </View>
      ))}
      <Button title="Save" onPress={saveWorkTimes} />
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
});

export default UserWorkTime;
