import { Image } from "expo-image";
import { ActivityIndicator, Text, View } from "react-native";

// Web fallback for SbsLoader (`SbsLoader.tsx` is the native implementation).
// Metro resolves `*.web.tsx` over `*.tsx` on web, so `lottie-react-native`
// — whose web entry requires the missing `@lottiefiles/dotlottie-react`
// package and is unsafe under router SSR — is never imported into the web
// bundle. Same props, same tile styling, branded static content instead.
export default function SbsLoader({
  size = 190,
  title,
  subtitle,
}: {
  size?: number;
  title?: string;
  subtitle?: string;
}) {
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
        <Image
          source={require("../../assets/images/sbs-logo.png")}
          style={{ width: size * 0.62, height: size * 0.27 }}
          contentFit="contain"
        />
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: size * 0.08 }} />
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
