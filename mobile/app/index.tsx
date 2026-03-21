import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useScanStore } from "../stores/scanStore";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const { isAnalyzing, startAnalysis, currentResult, error } = useScanStore();

  // Navigate to result once analysis completes
  if (currentResult) {
    useScanStore.getState().clearCurrent();
    router.push({
      pathname: "/result",
      params: { scan_id: currentResult.scan_id },
    });
    useScanStore.setState({ currentResult: currentResult });
  }

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
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>CropGuard</Text>
          <Pressable
            style={styles.historyBtn}
            onPress={() => router.push("/history")}
          >
            <Text style={styles.historyBtnText}>History</Text>
          </Pressable>
        </View>

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color="#76C442" />
            <Text style={styles.analyzingText}>
              CropGuard is analyzing your crop...
            </Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <Pressable style={styles.uploadBtn} onPress={handlePickImage}>
            <Text style={styles.uploadBtnText}>Upload</Text>
          </Pressable>

          <Pressable
            style={[
              styles.captureBtn,
              isAnalyzing && styles.captureBtnDisabled,
            ]}
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
    fontSize: 24,
    fontWeight: "800",
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
    fontWeight: "600",
  },
  errorBanner: {
    position: "absolute",
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: "rgba(244, 67, 54, 0.9)",
    padding: 12,
    borderRadius: 8,
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
