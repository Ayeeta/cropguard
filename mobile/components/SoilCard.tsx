import { StyleSheet, Text, View } from "react-native";

interface Props {
  soil: {
    recommended_ph: string;
    amendments: string[];
    drainage: string;
  };
}

export default function SoilCard({ soil }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Soil Health</Text>
      <Text style={styles.label}>Recommended pH</Text>
      <Text style={styles.value}>{soil.recommended_ph}</Text>

      <Text style={styles.label}>Drainage</Text>
      <Text style={styles.value}>{soil.drainage}</Text>

      {soil.amendments.length > 0 && (
        <>
          <Text style={styles.label}>Amendments</Text>
          {soil.amendments.map((item, i) => (
            <Text key={i} style={styles.amendment}>
              • {item}
            </Text>
          ))}
        </>
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
  },
  sectionTitle: {
    color: "#76C442",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  label: {
    color: "#76C442",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 2,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  amendment: {
    color: "#E8E4D9",
    fontSize: 14,
    lineHeight: 22,
    paddingLeft: 4,
  },
});
