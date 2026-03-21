import { StyleSheet, Text, View } from "react-native";

interface DiseaseResult {
  name: string;
  confidence: number;
  severity: string;
  affected_percent: number;
  description: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  Mild: "#4CAF50",
  Moderate: "#FFC107",
  Severe: "#FF9800",
  Critical: "#F44336",
};

export default function DiagnosisCard({ disease }: { disease: DiseaseResult }) {
  const severityColor = SEVERITY_COLORS[disease.severity] || "#FFC107";

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Diagnosis</Text>
      <Text style={styles.diseaseName}>{disease.name}</Text>

      <View style={styles.row}>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>{disease.severity}</Text>
        </View>
        <Text style={styles.confidence}>
          {Math.round(disease.confidence * 100)}% confidence
        </Text>
      </View>

      {/* Affected area bar */}
      <View style={styles.barContainer}>
        <Text style={styles.barLabel}>
          Affected tissue: {disease.affected_percent.toFixed(1)}%
        </Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(disease.affected_percent, 100)}%`,
                backgroundColor: severityColor,
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.description}>{disease.description}</Text>
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
    marginBottom: 8,
  },
  diseaseName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  severityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  severityText: {
    color: "#1C1A14",
    fontSize: 13,
    fontWeight: "700",
  },
  confidence: {
    color: "#E8E4D9",
    fontSize: 14,
  },
  barContainer: {
    marginBottom: 16,
  },
  barLabel: {
    color: "#E8E4D9",
    fontSize: 13,
    marginBottom: 6,
  },
  barTrack: {
    height: 8,
    backgroundColor: "#1C1A14",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  description: {
    color: "#E8E4D9",
    fontSize: 14,
    lineHeight: 20,
  },
});
