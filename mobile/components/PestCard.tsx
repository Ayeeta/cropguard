import { StyleSheet, Text, View } from "react-native";

interface Props {
  pests: {
    detected: boolean;
    type: string | null;
    severity: string | null;
    treatment: string | null;
  };
}

export default function PestCard({ pests }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Pest Alert</Text>
      {pests.detected ? (
        <>
          <View style={styles.row}>
            <Text style={styles.pestType}>{pests.type}</Text>
            {pests.severity && (
              <View style={styles.severityBadge}>
                <Text style={styles.severityText}>{pests.severity}</Text>
              </View>
            )}
          </View>
          {pests.treatment && (
            <Text style={styles.treatment}>{pests.treatment}</Text>
          )}
        </>
      ) : (
        <Text style={styles.noPests}>No pests detected</Text>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pestType: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginRight: 12,
  },
  severityBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: "#1C1A14",
    fontSize: 12,
    fontWeight: "700",
  },
  treatment: {
    color: "#E8E4D9",
    fontSize: 14,
    lineHeight: 20,
  },
  noPests: {
    color: "#4CAF50",
    fontSize: 14,
  },
});
