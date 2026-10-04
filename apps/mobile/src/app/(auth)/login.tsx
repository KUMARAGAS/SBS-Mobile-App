import { useSSO } from "@clerk/expo";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { requireOptionalNativeModule } from "expo-modules-core";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const INK = "#FFFFFF";
const SUBTITLE = "#9DB6D8";
const TAGLINE = "#A9C4E6";
const ACCENT = "#3FB9F5";
const BUTTON_BG = "rgba(11, 26, 51, 0.62)";
const BUTTON_BORDER = "rgba(126, 178, 240, 0.55)";
const SCRIM = "rgba(2, 6, 18, 0.88)";

function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

function AppleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </Svg>
  );
}

function SocialButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className="w-full flex-row items-center justify-center active:opacity-80"
      style={{
        backgroundColor: BUTTON_BG,
        borderColor: BUTTON_BORDER,
        borderWidth: 1,
        borderRadius: 16,
        height: 54,
        gap: 12,
        opacity: disabled ? 0.6 : 1,
        // Subtle lift so buttons sit clearly above the artwork.
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      {icon}
      <Text style={{ color: INK, fontFamily: "Poppins_500Medium", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

type SSOProvider = "oauth_google" | "oauth_apple";

export default function Login() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const { startSSOFlow } = useSSO();
  const [pendingProvider, setPendingProvider] = useState<SSOProvider | null>(null);

  const handleSSO = async (strategy: SSOProvider) => {
    if (pendingProvider) return;
    // Native SSO needs the ExpoCrypto module (PKCE), so a stale dev client
    // or outdated Expo Go gets a helpful message instead of a native crash.
    // Web uses the expo-web-browser popup flow and has no native modules —
    // guarding it the same way would block web sign-in entirely.
    if (Platform.OS !== "web" && !requireOptionalNativeModule("ExpoCrypto")) {
      Alert.alert(
        "Update needed to sign in",
        "Your app build is missing the crypto module. Rebuild your dev client (npx expo run:android) or update Expo Go to the latest version, then try again."
      );
      return;
    }
    setPendingProvider(strategy);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/onboarding");
      }
      // No session + no error = user cancelled; stay on the login screen.
    } catch (err) {
      console.error("[SSO]", err instanceof Error ? err.message : JSON.stringify(err));
      Alert.alert(
        "Sign in failed",
        Platform.OS === "web"
          ? "The sign-in window may have been blocked. Allow popups for this site and try again."
          : "Something went wrong signing you in. Please try again."
      );
    } finally {
      setPendingProvider(null);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1 bg-[#040B1A]">
      <StatusBar style="light" />
      <Image
        source={require("../../../assets/images/auth-hero.png")}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
      />
      {/* legibility scrims — keep bright artwork out from under text */}
      <LinearGradient
        colors={[SCRIM, "rgba(2, 6, 18, 0.55)", "transparent"]}
        locations={[0, 0.55, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "52%" }}
      />
      <LinearGradient
        colors={["transparent", "rgba(2, 6, 18, 0.55)", SCRIM]}
        locations={[0, 0.45, 1]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "48%" }}
      />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 items-center px-6" style={{ maxWidth: 420, width: "100%", alignSelf: "center" }}>
          {/* 1 — Brand: absorbs all slack so nothing pools at the bottom */}
          <View className="items-center justify-center" style={{ flex: 1, paddingTop: 8, paddingBottom: 12 }}>
            <Image
              source={require("../../../assets/images/sbs-logo.png")}
              style={{ width: 296, height: 128 }}
              contentFit="contain"
            />
            <Text
              style={{
                color: INK,
                fontFamily: "Poppins_600SemiBold",
                fontSize: 26,
                letterSpacing: 0.3,
                marginTop: 10,
                textAlign: "center",
              }}
            >
              Field Service
            </Text>
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <View style={{ height: 1, width: 48, backgroundColor: "rgba(169, 196, 230, 0.55)", marginBottom: 10 }} />
              <Text
                style={{
                  color: TAGLINE,
                  fontFamily: "Poppins_500Medium",
                  fontSize: 13,
                  letterSpacing: 3,
                  lineHeight: 21,
                  textAlign: "center",
                }}
              >
                {"POWERING SRI LANKA'S\nINFRASTRUCTURE"}
              </Text>
            </View>
          </View>

          {/* 2 — Action block: intrinsic height, sits just above the footer */}
          <View className="w-full items-center">
            <Text style={{ color: INK, fontFamily: "Poppins_700Bold", fontSize: 30, textAlign: "center" }}>
              Welcome Back
            </Text>
            <Text
              style={{
                color: SUBTITLE,
                fontFamily: "Poppins_400Regular",
                fontSize: 14,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Sign in to your account
            </Text>
            <View className="w-full" style={{ marginTop: 20, gap: 12 }}>
              <SocialButton
                label={pendingProvider === "oauth_google" ? "Connecting…" : "Continue with Google"}
                icon={<GoogleIcon size={20} />}
                onPress={() => handleSSO("oauth_google")}
                disabled={pendingProvider !== null}
              />
              <SocialButton
                label={pendingProvider === "oauth_apple" ? "Connecting…" : "Continue with Apple"}
                icon={<AppleIcon size={22} />}
                onPress={() => handleSSO("oauth_apple")}
                disabled={pendingProvider !== null}
              />
            </View>
          </View>

          {/* 3 — Footer: glued under the buttons, no void below */}
          <View style={{ marginTop: 22, paddingBottom: 14, alignItems: "center", gap: 10 }}>
            <Text
              style={{
                color: ACCENT,
                fontFamily: "Poppins_500Medium",
                fontSize: 12.5,
                textAlign: "center",
                textShadowColor: "rgba(0, 0, 0, 0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              Access by invitation only
            </Text>
           
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
