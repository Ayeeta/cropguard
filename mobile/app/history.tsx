import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BACKEND_URL } from "../constants/api";
import { ScanSummary, useScanStore } from "../stores/scanStore";

const SEVERITY_COLORS: Record<string, string> = {
  Mild: "#4CAF50",
  Moderate: "#FFC107",
  Severe: "#FF9800",
  Critical: "#F44336",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ScanCell({ item }: { item: ScanSummary }) {
  const router = useRouter();
  const severityColor = SEVERITY_COLORS[item.severity] || "#FFC107";

  return (
    <Pressable
      style={styles.cell}
      onPress={() =>
        router.push({ pathname: "/result", params: { scan_id: item.scan_id } })
      }
    >
      <Image
        source={{ uri: `${BACKEND_URL}${item.thumbnail_url}` }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <Text style={styles.diseaseName} numberOfLines={1}>
        {item.disease_name}
      </Text>
      <View style={styles.cellBottom}>
        <View
          style={[styles.severityPill, { backgroundColor: severityColor }]}
        >
          <Text style={styles.severityText}>{item.severity}</Text>
        </View>
        <Text style={styles.timestamp}>{timeAgo(item.timestamp)}</Text>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { scanHistory, loadHistory } = useScanStore();

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Scan History</Text>
        <View style={{ width: 60 }} />
      </View>

      {scanHistory.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>
            Take a photo of your crop to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={scanHistory}
          keyExtractor={(item) => item.scan_id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <ScanCell item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1A14",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    backgroundColor: "#2A2820",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "ZillaSlab_700Bold",
  },
  grid: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
  },
  cell: {
    backgroundColor: "#2A2820",
    borderRadius: 16,
    width: "48%",
    marginBottom: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 120,
    backgroundColor: "#1C1A14",
  },
  diseaseName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "ZillaSlab_700Bold",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  cellBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  severityPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  severityText: {
    color: "#1C1A14",
    fontSize: 11,
    fontWeight: "700",
  },
  timestamp: {
    color: "#E8E4D9",
    fontSize: 12,
    opacity: 0.7,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#E8E4D9",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#E8E4D9",
    fontSize: 14,
    opacity: 0.6,
  },
});
