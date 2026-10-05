import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import SbsLoader from "../components/SbsLoader";

// OAuth redirect landing page. `useSSO()` defaults its redirect to the
// `sso-callback` path: after Google/Apple auth the OS hands
// `mobileapp://sso-callback` back to the app, `startSSOFlow` resolves, and the
// login screen replaces this route with onboarding. The SBS loader tile
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
      <SbsLoader size={190} title="Completing sign in…" subtitle="Securing your session" />
    </View>
  );
}
