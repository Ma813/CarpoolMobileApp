import React, { useState } from "react";
import { TouchableHighlight, View, Text } from "react-native";
import { NativeModules } from "react-native";

const showStringPicker =
  require("react-native-actionsheet-picker").showStringPicker;

interface DayPickerProps {
  days: string[];
  newDay: string;
  setNewDay: (day: string) => void;
}

const DayPicker: React.FC<DayPickerProps> = ({ days, newDay, setNewDay }) => {
  const showPicker = () => {
    showStringPicker({
      title: "Select a Day",
      selectedIndices: [days.indexOf(newDay)],
      rows: days,
    }).then(
      ({
        cancelled,
        selectedIndices,
        selectedValues,
      }: {
        cancelled: boolean;
        selectedIndices: number[];
        selectedValues: string[];
      }) => {
        if (!cancelled && selectedValues.length > 0) {
          setNewDay(selectedValues[0]);
        }
      }
    );
  };

  return (
    <TouchableHighlight
      onPress={showPicker}
      underlayColor="#f7f7f7"
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Text>{newDay || "Select a Day"}</Text>
      </View>
    </TouchableHighlight>
  );
};

export default DayPicker;
