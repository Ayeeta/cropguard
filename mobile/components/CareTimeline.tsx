import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  carePlan: {
    immediate: string[];
    this_week: string[];
    ongoing: string[];
  };
  scanId: string;
}

function CheckItem({
  text,
  checked,
  onToggle,
}: {
  text: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.checkRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.checkText, checked && styles.checkTextDone]}>
        {text}
      </Text>
    </Pressable>
  );
}

export default function CareTimeline({ carePlan, scanId }: Props) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(`care_${scanId}`).then((data) => {
      if (data) setCheckedItems(JSON.parse(data));
    });
  }, [scanId]);

  const toggle = (key: string) => {
    const updated = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(updated);
    AsyncStorage.setItem(`care_${scanId}`, JSON.stringify(updated));
  };

  const renderColumn = (title: string, items: string[], color: string) => (
    <View style={styles.column}>
      <Text style={[styles.columnTitle, { color }]}>{title}</Text>
      {items.map((item) => {
        const key = `${title}_${item}`;
        return (
          <CheckItem
            key={key}
            text={item}
            checked={!!checkedItems[key]}
            onToggle={() => toggle(key)}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Care Plan</Text>
      {renderColumn("Today", carePlan.immediate, "#F44336")}
      {renderColumn("This Week", carePlan.this_week, "#F5A623")}
      {renderColumn("Ongoing", carePlan.ongoing, "#76C442")}
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
    marginBottom: 16,
  },
  column: {
    marginBottom: 16,
  },
  columnTitle: {
    fontSize: 15,
    fontFamily: "ZillaSlab_700Bold",
    marginBottom: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E8E4D9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: "#76C442",
    borderColor: "#76C442",
  },
  checkmark: {
    color: "#1C1A14",
    fontSize: 12,
    fontWeight: "700",
  },
  checkText: {
    color: "#E8E4D9",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  checkTextDone: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
});
