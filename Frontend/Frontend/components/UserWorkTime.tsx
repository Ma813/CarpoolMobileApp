import { useState, useEffect } from "react";
import { Button, Text, View } from "react-native";
import { Switch } from "react-native";
import React from "react";
import { UserWorkTime } from "@/types/UserWorkTime";
import { getUserWorkTimes } from "@/services/api";
import { useRouter } from "expo-router";

export default function UserWorkTimesPage() {
  const [workTime, setWorkTime] = useState<UserWorkTime[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getUserWorkTimes().then((workTime) => {
      setWorkTime(workTime);
      setLoading(false);
    });
  }, []);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {workTime &&
          workTime.map((item, index) => (
            <View key={index} style={{ margin: 10 }}>
              <Text>{item.day}</Text>
              <Text>{item.start_time.toString()}</Text>
              <Text>{item.end_time.toString()}</Text>
            </View>
          ))}
      </View>
      <Button title="Go to Home" onPress={() => router.push("/")} />
    </View>
  );
}
