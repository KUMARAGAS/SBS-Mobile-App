import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";

// Web fallback for AnimatedSplash (`AnimatedSplash.tsx` is native-only).
// Same timed fade + splash-handoff contract, static branding instead of
// Lottie — keeps `lottie-react-native` out of the web bundle entirely.
const DISPLAY_MS = 2000;
const FADE_MS = 450;

export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let faded = false;
    const reveal = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 80);
    const t = setTimeout(() => {
      if (faded) return;
      faded = true;
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) doneRef.current();
      });
    }, DISPLAY_MS);
    return () => {
      clearTimeout(reveal);
      clearTimeout(t);
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { opacity, backgroundColor: "#000814", zIndex: 50, elevation: 50 },
      ]}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("../../assets/images/sbs-logo.png")}
          style={{ width: 200, height: 86 }}
          contentFit="contain"
        />
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 24 }} />
      </View>
    </Animated.View>
  );
}
