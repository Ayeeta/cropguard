import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";
import { BACKEND_URL } from "../constants/api";

interface Props {
  scanId: string;
}

export default function MaskOverlay({ scanId }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Image
        source={{ uri: `${BACKEND_URL}/masks/${scanId}.png` }}
        style={styles.mask}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  mask: {
    width: "100%",
    height: "100%",
    tintColor: "rgba(244, 67, 54, 0.5)",
  },
});
