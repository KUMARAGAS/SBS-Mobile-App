import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";

// Full-screen animated handoff shown on every cold start. The native splash
// (sbs-logo on #000814) shows first; this takes over the moment it can paint,
// plays the SBS loader, then fades out. No text = no font dependency.
const DISPLAY_MS = 2750;
const FADE_MS = 450;

// Two-stage source: full animation first (with sheen matte sweep), then a
// matte-free version if the device GPU/driver rejects the matte. Both files
// share the same letters/beam/loop art so the look is identical.
const LOTTIE_FULL = require("../../assets/animations/sbs-loader.json");
const LOTTIE_SIMPLE = require("../../assets/animations/sbs-loader-simple.json");

export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [stage, setStage] = useState<"full" | "simple" | "static">("full");
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let faded = false;
    // Reveal the JS animation as soon as it is mounted underneath.
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
      {/* Explicit pixel size: percentage sizing inside flex measures 0 on
          native and the animation never paints. */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {stage === "static" ? (
          <>
            <Image
              source={require("../../assets/images/sbs-logo.png")}
              style={{ width: 200, height: 86 }}
              contentFit="contain"
            />
            <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 24 }} />
            {__DEV__ && error ? (
              <Text
                style={{
                  color: "#F87171",
                  fontSize: 11,
                  marginTop: 16,
                  paddingHorizontal: 32,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            ) : null}
          </>
        ) : (
          <LottieView
            key={stage}
            source={stage === "full" ? LOTTIE_FULL : LOTTIE_SIMPLE}
            autoPlay
            loop
            resizeMode="contain"
            // Android-only (ignored on iOS). The full file's `sheen` layer
            // uses an alpha matte, which paints an opaque black box on the
            // hardware render path — SOFTWARE composites mattes correctly.
            renderMode="SOFTWARE"
            // Wrap Android draw calls so a single bad frame can't crash the
            // splash; disable composition caching so a failed parse is never
            // reused from cache.
            enableSafeModeAndroid
            hardwareAccelerationAndroid={false}
            cacheComposition={false}
            onAnimationLoaded={() => {
              if (__DEV__) console.log(`[AnimatedSplash] Lottie loaded (${stage})`);
            }}
            onAnimationFailure={(err) => {
              const msg = typeof err === "string" ? err : JSON.stringify(err);
              console.warn(`[AnimatedSplash] ${stage} failed:`, msg);
              if (stage === "full") {
                // Matte may be rejected on this GPU — retry without it.
                setStage("simple");
              } else {
                setError(msg);
                setStage("static");
              }
            }}
            style={{ width: 240, height: 240, backgroundColor: "transparent" }}
          />
        )}
      </View>
    </Animated.View>
  );
}
