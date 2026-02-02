import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Animated } from "react-native";

interface SquareSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SquareSwitch = ({
  value,
  onValueChange,
  disabled,
}: SquareSwitchProps) => {
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 0,
      duration: 200,
      useNativeDriver: false, // Does not support native driver for width/layout constraints sometimes, but translation is fine usually. keeping false for safety on web/layout.
    }).start();
  }, [value]);

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={[
        styles.track,
        value ? styles.trackActive : styles.trackInactive,
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          { transform: [{ translateX }] },
          value ? styles.thumbActive : styles.thumbInactive,
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderWidth: 1,
    borderRadius: 0, // No corner
    justifyContent: "center",
    paddingHorizontal: 2, // Slight padding for thumb containment
  },
  trackInactive: {
    borderColor: "#CBD5E1", // Slate 300
    backgroundColor: "#F1F5F9", // Slate 100
  },
  trackActive: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 18,
    height: 18,
    backgroundColor: "#FFF",
    borderRadius: 0, // No corner
    // Sharp look, no shadow or minimal hard shadow
  },
  thumbInactive: {
    backgroundColor: "#64748B", // Slate 500 for inactive thumb
  },
  thumbActive: {
    backgroundColor: "#FFFFFF", // White thumb on blue bg
  },
});
