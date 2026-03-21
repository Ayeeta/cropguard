import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  watering: {
    current_status: string;
    schedule: string;
    amount_ml_per_plant: number;
    warning: string | null;
  };
}

function getWaterLevel(status: string): number {
  const lower = status.toLowerCase();
  if (lower.includes("overwater")) return 90;
  if (lower.includes("well") || lower.includes("adequate")) return 60;
  if (lower.includes("slightly under")) return 35;
  if (lower.includes("underwater")) return 15;
  return 50;
}

export default function WateringCard({ watering }: Props) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const level = getWaterLevel(watering.current_status);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: level,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [level]);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Watering</Text>

      <View style={styles.row}>
        {/* Water level indicator */}
        <View style={styles.waterTank}>
          <Animated.View
            style={[styles.waterFill, { height: fillHeight }]}
          />
          <Text style={styles.waterPercent}>{level}%</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.status}>{watering.current_status}</Text>
          <Text style={styles.schedule}>{watering.schedule}</Text>
          <Text style={styles.amount}>
            {watering.amount_ml_per_plant}ml per plant
          </Text>
        </View>
      </View>

      {watering.warning && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>{watering.warning}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2A2820",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#3A3728",
  },
  sectionTitle: {
    color: "#76C442",
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  waterTank: {
    width: 50,
    height: 80,
    backgroundColor: "#1C1A14",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 16,
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(66, 165, 245, 0.6)",
    borderRadius: 6,
  },
  waterPercent: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    zIndex: 1,
  },
  info: {
    flex: 1,
  },
  status: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "ZillaSlab_700Bold",
    marginBottom: 4,
  },
  schedule: {
    color: "#E8E4D9",
    fontSize: 14,
    marginBottom: 2,
  },
  amount: {
    color: "#E8E4D9",
    fontSize: 14,
  },
  warningBox: {
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: "#F5A623",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    color: "#F5A623",
    fontSize: 13,
    lineHeight: 18,
  },
});
