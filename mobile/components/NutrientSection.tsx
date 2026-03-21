import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NutrientRecommendation {
  nutrient: string;
  symptom: string;
  treatment: string;
  frequency: string;
  organic_option: string;
}

interface Props {
  nutrients: {
    deficiencies: string[];
    recommendations: NutrientRecommendation[];
  };
}

function NutrientItem({ rec }: { rec: NutrientRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.nutrientName}>{rec.nutrient}</Text>
        <Text style={styles.chevron}>{expanded ? "▾" : "▸"}</Text>
      </View>
      <Text style={styles.symptom}>{rec.symptom}</Text>
      {expanded && (
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Treatment</Text>
          <Text style={styles.detailText}>{rec.treatment}</Text>
          <Text style={styles.detailLabel}>Frequency</Text>
          <Text style={styles.detailText}>{rec.frequency}</Text>
          <Text style={styles.detailLabel}>Organic Alternative</Text>
          <Text style={styles.detailText}>{rec.organic_option}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function NutrientSection({ nutrients }: Props) {
  if (!nutrients.deficiencies.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nutrients</Text>
        <Text style={styles.noIssues}>No nutrient deficiencies detected</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Nutrients</Text>
      <Text style={styles.deficiencyList}>
        Deficiencies: {nutrients.deficiencies.join(", ")}
      </Text>
      {nutrients.recommendations.map((rec) => (
        <NutrientItem key={rec.nutrient} rec={rec} />
      ))}
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
  deficiencyList: {
    color: "#F5A623",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  noIssues: {
    color: "#4CAF50",
    fontSize: 14,
  },
  item: {
    backgroundColor: "#1C1A14",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nutrientName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  chevron: {
    color: "#E8E4D9",
    fontSize: 16,
  },
  symptom: {
    color: "#E8E4D9",
    fontSize: 13,
    marginTop: 4,
  },
  details: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A2820",
    paddingTop: 12,
  },
  detailLabel: {
    color: "#76C442",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 2,
  },
  detailText: {
    color: "#E8E4D9",
    fontSize: 14,
    lineHeight: 20,
  },
});
