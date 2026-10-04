import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";

// OAuth redirect landing page. `useSSO()` defaults its redirect to the
// `sso-callback` path: after Google/Apple auth the OS hands
// `mobileapp://sso-callback` back to the app, `startSSOFlow` resolves, and the
// login screen replaces this route with onboarding. This branded interstitial
// covers the brief handoff — it is seen on every social sign-in.
export default function SSOCallback() {
  return (
    <View className="flex-1 items-center justify-center bg-[#040B1A]">
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/auth-hero.png")}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.45 }}
        contentFit="cover"
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(4,11,26,0.6)",
        }}
      />
      <Image
        source={require("../../assets/images/sbs-logo.png")}
        style={{ width: 180, height: 78 }}
        contentFit="contain"
      />
      <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 28 }} />
      <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginTop: 16 }}>
        Signingin…
      </Text>
      <Text style={{ color: "#9DB6D8", fontSize: 13, marginTop: 6 }}>
        Securing your session
      </Text>
    </View>
  );
}
