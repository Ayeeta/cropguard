import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
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

const isWeb = Platform.OS === "web";

export default function ResultScreen() {
  const { scan_id } = useLocalSearchParams<{ scan_id: string }>();
  const router = useRouter();
  const storeResult = useScanStore((s) => s.currentResult);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  const cardAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
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
        duration: 400,
        delay: i * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  }, [result]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#76C442" />
        <Text style={styles.loadingText}>Loading results...</Text>
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
              outputRange: [24, 0],
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={isWeb ? styles.webScrollContent : styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header bar */}
        <View style={isWeb ? styles.webHeader : styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backArrow}>
            <Text style={styles.backArrowText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Scan Results</Text>
          <Text style={styles.cropType}>{result.crop_type}</Text>
        </View>

        {/* Image + Mask section */}
        <View style={isWeb ? styles.webImageSection : styles.imageContainer}>
          <View style={isWeb ? styles.webImageWrapper : styles.imageWrapper}>
            <Image
              source={{ uri: `${BACKEND_URL}/masks/${result.scan_id}.png` }}
              style={isWeb ? styles.webImage : styles.image}
              resizeMode="cover"
            />
            <MaskOverlay scanId={result.scan_id} />
          </View>
        </View>

        {/* Cards */}
        <View style={isWeb ? styles.webCardsContainer : undefined}>
          {renderCard(0, <DiagnosisCard disease={result.disease} />)}

          {isWeb ? (
            <View style={styles.webTwoCol}>
              <View style={styles.webCol}>
                {renderCard(1, <NutrientSection nutrients={result.nutrients} />)}
                {renderCard(3, <PestCard pests={result.pests} />)}
              </View>
              <View style={styles.webCol}>
                {renderCard(2, <WateringCard watering={result.watering} />)}
                {renderCard(4, <SoilCard soil={result.soil} />)}
              </View>
            </View>
          ) : (
            <>
              {renderCard(1, <NutrientSection nutrients={result.nutrients} />)}
              {renderCard(2, <WateringCard watering={result.watering} />)}
              {renderCard(3, <PestCard pests={result.pests} />)}
              {renderCard(4, <SoilCard soil={result.soil} />)}
            </>
          )}

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
        </View>

        {/* New scan button */}
        <View style={styles.newScanRow}>
          <Pressable
            style={styles.newScanBtn}
            onPress={() => {
              useScanStore.getState().clearCurrent();
              router.replace("/");
            }}
          >
            <Text style={styles.newScanBtnText}>New Scan</Text>
          </Pressable>
        </View>
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
  loadingText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    marginTop: 12,
    opacity: 0.6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  webScrollContent: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 40,
  },
  webHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 20,
  },
  backArrow: {
    backgroundColor: "#2A2820",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3A3728",
  },
  backArrowText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "ZillaSlab_700Bold",
  },
  cropType: {
    color: "#76C442",
    fontSize: 14,
    fontFamily: "DMSans_700Bold",
    backgroundColor: "rgba(118, 196, 66, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(118, 196, 66, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  // ── Image ──
  imageContainer: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  imageWrapper: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  webImageSection: {
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#3A3728",
    position: "relative",
  },
  webImageWrapper: {
    flex: 1,
    position: "relative",
  },
  webImage: {
    width: "100%",
    height: "100%",
  },
  // ── Web cards layout ──
  webCardsContainer: {
    width: "100%",
  },
  webTwoCol: {
    flexDirection: "row",
    gap: 12,
  },
  webCol: {
    flex: 1,
  },
  // ── Outlook card ──
  outlookCard: {
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
    marginBottom: 8,
  },
  outlookText: {
    color: "#E8E4D9",
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
    lineHeight: 24,
  },
  // ── New scan ──
  newScanRow: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  newScanBtn: {
    backgroundColor: "#76C442",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  newScanBtnText: {
    color: "#1C1A14",
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
  },
  // ── Error / Back ──
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
