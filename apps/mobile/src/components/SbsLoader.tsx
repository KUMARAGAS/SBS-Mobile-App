import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

// Single source of truth for the SBS loader animation.
// Lottie must be given an EXPLICIT pixel size — `width: "100%"` /
// `height: "100%"` inside a flex container measures 0 on native and the
// animation never paints (the original "not showing up" bug).
//
// Two-stage source: full animation first, matte-free retry if the GPU
// rejects the sheen matte. Only after both fail do we show the static tile.
// The failure is logged so Logcat shows the native error.
const LOTTIE_FULL = require("../../assets/animations/sbs-loader.json");
const LOTTIE_SIMPLE = require("../../assets/animations/sbs-loader-simple.json");

export default function SbsLoader({
  size = 190,
  title,
  subtitle,
}: {
  size?: number;
  title?: string;
  subtitle?: string;
}) {
  const [stage, setStage] = useState<"full" | "simple" | "static">("full");

  return (
    <View className="items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 36,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: "rgba(56, 189, 248, 0.5)",
          shadowColor: "#38BDF8",
          shadowOpacity: 0.4,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
          backgroundColor: "#000814",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {stage === "static" ? (
          <>
            <Image
              source={require("../../assets/images/sbs-logo.png")}
              style={{ width: size * 0.62, height: size * 0.27 }}
              contentFit="contain"
            />
            <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: size * 0.08 }} />
          </>
        ) : (
          <LottieView
            key={stage}
            source={stage === "full" ? LOTTIE_FULL : LOTTIE_SIMPLE}
            autoPlay
            loop
            resizeMode="contain"
            // Android-only (ignored on iOS). The full file's `sheen` layer is
            // alpha-masked by `letters-matte`; software rendering composites
            // mattes correctly on GPUs where the hardware path mis-renders
            // them as an opaque black rect covering the tile.
            renderMode="SOFTWARE"
            enableSafeModeAndroid
            hardwareAccelerationAndroid={false}
            cacheComposition={false}
            onAnimationFailure={(error) => {
              const msg = typeof error === "string" ? error : JSON.stringify(error);
              console.warn(`[SbsLoader] ${stage} failed:`, msg);
              setStage(stage === "full" ? "simple" : "static");
            }}
            style={{ width: size, height: size, backgroundColor: "transparent" }}
          />
        )}
      </View>
      {title ? (
        <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginTop: 20 }}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={{ color: "#9DB6D8", fontSize: 13, marginTop: 6 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
