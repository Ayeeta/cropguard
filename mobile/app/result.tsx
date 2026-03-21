import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CareTimeline from "../components/CareTimeline";
import DiagnosisCard from "../components/DiagnosisCard";
import MaskOverlay from "../components/MaskOverlay";
import NutrientSection from "../components/NutrientSection";
import PestCard from "../components/PestCard";
import SoilCard from "../components/SoilCard";
import WateringCard from "../components/WateringCard";
import { BACKEND_URL } from "../constants/api";
import { ScanResult, useScanStore } from "../stores/scanStore";

export default function ResultScreen() {
  const { scan_id } = useLocalSearchParams<{ scan_id: string }>();
  const router = useRouter();
  const storeResult = useScanStore((s) => s.currentResult);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Stagger animation for cards
  const cardAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Use store result if available, otherwise fetch
    if (storeResult && storeResult.scan_id === scan_id) {
      setResult(storeResult);
      setLoading(false);
    } else if (scan_id) {
      fetch(`${BACKEND_URL}/history/${scan_id}`)
        .then((r) => r.json())
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [scan_id]);

  useEffect(() => {
    if (!result) return;
    const animations = cardAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, animations).start();
  }, [result]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#76C442" />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Scan not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const renderCard = (index: number, child: React.ReactNode) => (
    <Animated.View
      key={index}
      style={{
        opacity: cardAnims[index],
        transform: [
          {
            translateY: cardAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      {child}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Image + Mask overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${BACKEND_URL}/masks/${result.scan_id}.png` }}
          style={styles.image}
          resizeMode="cover"
          defaultSource={require("../assets/icon.png")}
        />
        <MaskOverlay scanId={result.scan_id} />

        {/* Top bar over image */}
        <View style={styles.imageTopBar}>
          <Pressable onPress={() => router.back()} style={styles.backArrow}>
            <Text style={styles.backArrowText}>← Back</Text>
          </Pressable>
          <Text style={styles.cropType}>{result.crop_type}</Text>
        </View>
      </View>

      {/* Scrollable TLC cards */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCard(0, <DiagnosisCard disease={result.disease} />)}
        {renderCard(1, <NutrientSection nutrients={result.nutrients} />)}
        {renderCard(2, <WateringCard watering={result.watering} />)}
        {renderCard(3, <PestCard pests={result.pests} />)}
        {renderCard(4, <SoilCard soil={result.soil} />)}
        {renderCard(
          5,
          <CareTimeline carePlan={result.care_plan} scanId={result.scan_id} />
        )}
        {renderCard(
          6,
          <View style={styles.outlookCard}>
            <Text style={styles.sectionTitle}>Recovery Outlook</Text>
            <Text style={styles.outlookText}>{result.recovery_outlook}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1A14",
  },
  center: {
    flex: 1,
    backgroundColor: "#1C1A14",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: "40%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageTopBar: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backArrow: {
    backgroundColor: "rgba(28, 26, 20, 0.8)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backArrowText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontWeight: "600",
  },
  cropType: {
    color: "#76C442",
    fontSize: 18,
    fontWeight: "800",
    backgroundColor: "rgba(28, 26, 20, 0.8)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  outlookCard: {
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
  outlookText: {
    color: "#E8E4D9",
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: "#E8E4D9",
    fontSize: 18,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: "#76C442",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backBtnText: {
    color: "#1C1A14",
    fontSize: 16,
    fontWeight: "700",
  },
});
