import { useState, useEffect } from "react";
import { Button, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";
import React from "react";
import { UserWorkTime } from "@/types/UserWorkTime";
import { getUserWorkTimes } from "@/services/api";
import { useRouter } from "expo-router";

export default function UserWorkTimesPage() {
  const [workTime, setWorkTime] = useState<UserWorkTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDay, setNewDay] = useState<string>("Monday"); // Default day
  const [newStartTime, setNewStartTime] = useState<Date | null>(null);
  const [newEndTime, setNewEndTime] = useState<Date | null>(null);
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);
  const [isDayPickerVisible, setDayPickerVisible] = useState(false);
  const router = useRouter();
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    getUserWorkTimes().then((workTime) => {
      setWorkTime(workTime);
      setLoading(false);
    });
  }, []);

  const addWorkTime = () => {
    if (!newDay || !newStartTime || !newEndTime) {
      alert("Please fill all fields!");
      return;
    }

    const newEntry: UserWorkTime = {
      day: newDay,
      start_time: newStartTime,
      end_time: newEndTime,
      id_user_work_times: 0,
      user_id: 0,
    };

    setWorkTime([...workTime, newEntry]);
    setNewDay("Monday");
    setNewStartTime(null);
    setNewEndTime(null);
  };

  return (
    <View style={{ padding: 20 }}>
      <View>
        {/* List Existing Work Times */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Work Times:
        </Text>
        {workTime.map((item, index) => (
          <View
            key={index}
            style={{
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
            }}
          >
            <Text>Day: {item.day}</Text>
            <Text>Start: {item.start_time.toString()}</Text>
            <Text>End: {item.end_time.toString()}</Text>
          </View>
        ))}
      </View>

      {/* Input Fields */}
      <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 20 }}>
        Add New Work Time:
      </Text>

      {/* Day Picker */}
      <Text style={{ marginBottom: 5, fontWeight: "bold" }}>Select Day:</Text>
      <TouchableOpacity
        onPress={() => setDayPickerVisible(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          marginBottom: 10,
          height: 50,
        }}
      >
        <DropDownPicker
          items={[...days.map((day) => ({ label: day, value: day }))]}
          value={newDay}
          containerStyle={{ height: 50 }}
          style={{ backgroundColor: "#fafafa" }}
          listItemContainerStyle={{
            justifyContent: "flex-start",
          }}
          dropDownContainerStyle={{ backgroundColor: "#fafafa" }}
          onChangeValue={(value) => setNewDay(value as string)}
          multiple={false}
          setValue={setNewDay}
          open={isDayPickerVisible}
          setOpen={setDayPickerVisible}
        />
      </TouchableOpacity>

      {/* Start Time Picker */}
      <TouchableOpacity
        onPress={() => setStartPickerVisible(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginBottom: 10,
          borderRadius: 5,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Text>
          {newStartTime
            ? `Start Time: ${newStartTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Select Start Time"}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="time"
        onConfirm={(date) => {
          setNewStartTime(date);
          setStartPickerVisible(false);
        }}
        onCancel={() => setStartPickerVisible(false)}
      />

      {/* End Time Picker */}
      <TouchableOpacity
        onPress={() => setEndPickerVisible(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginBottom: 10,
          borderRadius: 5,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Text>
          {newEndTime
            ? `End Time: ${newEndTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Select End Time"}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="time"
        onConfirm={(date) => {
          setNewEndTime(date);
          setEndPickerVisible(false);
        }}
        onCancel={() => setEndPickerVisible(false)}
      />

      {/* Add Work Time Button */}
      <Button title="Add Work Time" onPress={addWorkTime} />

      {/* Navigation Button */}
      <View style={{ marginTop: 20 }}>
        <Button title="Go to Home" onPress={() => router.push("/")} />
      </View>
    </View>
  );
}
