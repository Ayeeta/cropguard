import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useScanStore } from "../stores/scanStore";

const isWeb = Platform.OS === "web";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const { isAnalyzing, startAnalysis, currentResult, error } = useScanStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (currentResult) {
      const scanId = currentResult.scan_id;
      router.push({
        pathname: "/result",
        params: { scan_id: scanId },
      });
    }
  }, [currentResult]);

  const handleCapture = async () => {
    if (!cameraRef.current || isAnalyzing) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      await startAnalysis(photo.uri);
    }
  };

  const handlePickImage = async () => {
    if (isAnalyzing) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await startAnalysis(result.assets[0].uri);
    }
  };

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        <Animated.View style={[styles.webCard, { opacity: fadeIn }]}>
          {/* Header */}
          <View style={styles.webHeader}>
            <Text style={styles.webLogo}>CropGuard</Text>
            <View style={styles.webBadge}>
              <Text style={styles.webBadgeText}>AI-Powered</Text>
            </View>
          </View>

          <Text style={styles.webTitle}>Crop Care & Disease Detection</Text>
          <Text style={styles.webDescription}>
            Point your camera at any plant and get an instant diagnosis — disease identification,
            nutrient analysis, watering schedule, pest alerts, and a full care plan.
          </Text>

          {/* Feature pills */}
          <View style={styles.featurePills}>
            {["Disease Detection", "Nutrient Analysis", "Care Plans", "Pest Alerts"].map((f) => (
              <View key={f} style={styles.pill}>
                <Text style={styles.pillText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Upload area */}
          {isAnalyzing ? (
            <Animated.View style={[styles.analyzingContainer, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.spinnerRing}>
                <ActivityIndicator size="large" color="#76C442" />
              </View>
              <Text style={styles.analyzingTitle}>Analyzing your crop...</Text>
              <Text style={styles.analyzingSubtext}>
                Running segmentation & AI diagnosis
              </Text>
            </Animated.View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.uploadArea,
                pressed && styles.uploadAreaPressed,
              ]}
              onPress={handlePickImage}
            >
              <View style={styles.uploadIconCircle}>
                <Text style={styles.uploadIcon}>+</Text>
              </View>
              <Text style={styles.uploadTitle}>Upload Plant Photo</Text>
              <Text style={styles.uploadSubtext}>
                JPG, PNG — drag & drop or click to browse
              </Text>
            </Pressable>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Bottom actions */}
          <View style={styles.webActions}>
            <Pressable
              style={styles.historyBtnWeb}
              onPress={() => router.push("/history")}
            >
              <Text style={styles.historyBtnWebText}>View Scan History</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.webFooter}>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>
              Powered by SAM3 Segmentation & Gemini Vision AI
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  // Mobile: camera permission flow
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          CropGuard needs camera access to analyze your crops
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>CropGuard</Text>
          <Pressable
            style={styles.historyBtn}
            onPress={() => router.push("/history")}
          >
            <Text style={styles.historyBtnText}>History</Text>
          </Pressable>
        </View>

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color="#76C442" />
            <Text style={styles.analyzingText}>
              CropGuard is analyzing your crop...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.bottomBar}>
          <Pressable style={styles.uploadBtn} onPress={handlePickImage}>
            <Text style={styles.uploadBtnText}>Upload</Text>
          </Pressable>

          <Pressable
            style={[styles.captureBtn, isAnalyzing && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={isAnalyzing}
          >
            <View style={styles.captureBtnInner} />
          </Pressable>

          <Pressable
            style={styles.flipBtn}
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
          >
            <Text style={styles.flipBtnText}>Flip</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Web styles ──
  webContainer: {
    flex: 1,
    backgroundColor: "#1C1A14",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  webCard: {
    backgroundColor: "#222018",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#3A3728",
    padding: 48,
    maxWidth: 560,
    width: "100%",
    alignItems: "center",
  },
  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  webLogo: {
    color: "#76C442",
    fontSize: 36,
    fontFamily: "ZillaSlab_700Bold",
    marginRight: 12,
  },
  webBadge: {
    backgroundColor: "rgba(118, 196, 66, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(118, 196, 66, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  webBadgeText: {
    color: "#76C442",
    fontSize: 11,
    fontFamily: "DMSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  webTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "ZillaSlab_700Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  webDescription: {
    color: "#E8E4D9",
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 20,
  },
  featurePills: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  pill: {
    backgroundColor: "#2A2820",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#3A3728",
  },
  pillText: {
    color: "#E8E4D9",
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
  },
  uploadArea: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#3A3728",
    borderStyle: "dashed",
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(42, 40, 32, 0.3)",
  },
  uploadAreaPressed: {
    backgroundColor: "rgba(118, 196, 66, 0.08)",
    borderColor: "#76C442",
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#76C442",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  uploadIcon: {
    color: "#1C1A14",
    fontSize: 28,
    fontWeight: "700",
    marginTop: -2,
  },
  uploadTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    marginBottom: 6,
  },
  uploadSubtext: {
    color: "#E8E4D9",
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    opacity: 0.5,
  },
  analyzingContainer: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(118, 196, 66, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(118, 196, 66, 0.2)",
  },
  spinnerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(118, 196, 66, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  analyzingTitle: {
    color: "#76C442",
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    marginBottom: 4,
  },
  analyzingSubtext: {
    color: "#E8E4D9",
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    opacity: 0.6,
  },
  webActions: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  historyBtnWeb: {
    backgroundColor: "#2A2820",
    borderWidth: 1,
    borderColor: "#3A3728",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  historyBtnWebText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
  },
  webFooter: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.4,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#76C442",
    marginRight: 8,
  },
  footerText: {
    color: "#E8E4D9",
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
  },
  // ── Mobile styles ──
  container: {
    flex: 1,
    backgroundColor: "#1C1A14",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logo: {
    color: "#76C442",
    fontSize: 28,
    fontFamily: "ZillaSlab_700Bold",
  },
  historyBtn: {
    backgroundColor: "rgba(42, 40, 32, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyBtnText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontWeight: "600",
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28, 26, 20, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingText: {
    color: "#E8E4D9",
    fontSize: 18,
    marginTop: 16,
    fontFamily: "DMSans_500Medium",
  },
  errorBanner: {
    backgroundColor: "rgba(244, 67, 54, 0.9)",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 20,
    width: "100%",
    maxWidth: 480,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnDisabled: {
    opacity: 0.4,
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
  },
  uploadBtn: {
    backgroundColor: "rgba(42, 40, 32, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  uploadBtnText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontWeight: "600",
  },
  flipBtn: {
    backgroundColor: "rgba(42, 40, 32, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  flipBtnText: {
    color: "#E8E4D9",
    fontSize: 14,
    fontWeight: "600",
  },
  permissionText: {
    color: "#E8E4D9",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  permissionBtn: {
    backgroundColor: "#76C442",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  permissionBtnText: {
    color: "#1C1A14",
    fontSize: 16,
    fontWeight: "700",
  },
});
