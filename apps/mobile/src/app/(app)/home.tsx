import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useClerk, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const INK = "#FFFFFF";
const SUBTITLE = "#9DB6D8";
const ACCENT = "#3FB9F5";
const FIELD_BG = "rgba(10, 26, 54, 0.72)";
const FIELD_BORDER = "rgba(110, 165, 235, 0.55)";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Temporary home so the login → onboarding → app flow is testable end to end.
// TODO: replace with the real My Jobs screen (PLAN.md J3) bound to apps/api.
export default function Home() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!fontsLoaded) return null;

  const displayName =
    user?.fullName ?? [user?.firstName, user?.lastName].filter(Boolean).join(" ") ?? "Technician";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-[#040B1A]">
      <StatusBar style="light" />
      <Image
        source={require("../../../assets/images/auth-hero.png")}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 }}
        contentFit="cover"
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(4,11,26,0.72)",
        }}
      />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 420,
            alignSelf: "center",
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 24,
          }}
        >
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <View
              className="items-center justify-center"
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 2,
                borderColor: "#38BDF8",
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#1D4ED8", "#0A1B33"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <Text style={{ color: INK, fontFamily: "Poppins_700Bold", fontSize: 17 }}>
                {initialsOf(displayName)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: SUBTITLE, fontFamily: "Poppins_400Regular", fontSize: 12 }}>
                Welcome back
              </Text>
              <Text style={{ color: INK, fontFamily: "Poppins_600SemiBold", fontSize: 18 }}>
                {displayName}
              </Text>
            </View>
            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              className="active:opacity-70"
              style={{
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: FIELD_BORDER,
                backgroundColor: "rgba(10, 26, 54, 0.6)",
              }}
            >
              <Text style={{ color: ACCENT, fontFamily: "Poppins_600SemiBold", fontSize: 13 }}>
                Sign out
              </Text>
            </Pressable>
          </View>

          <View
            className="w-full"
            style={{
              backgroundColor: FIELD_BG,
              borderColor: FIELD_BORDER,
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 18,
              marginTop: 22,
            }}
          >
            <Text style={{ color: INK, fontFamily: "Poppins_700Bold", fontSize: 22 }}>My Jobs</Text>
            <Text
              style={{ color: SUBTITLE, fontFamily: "Poppins_400Regular", fontSize: 14, marginTop: 6, lineHeight: 20 }}
            >
              You have no jobs assigned yet. New breakdown tickets and preventive visits from your
              coordinator will appear here.
            </Text>
            <View
              className="flex-row items-center"
              style={{
                marginTop: 14,
                paddingHorizontal: 14,
                paddingVertical: 11,
                borderRadius: 12,
                gap: 10,
                backgroundColor: "rgba(29, 127, 224, 0.18)",
                borderWidth: 1,
                borderColor: "rgba(56, 189, 248, 0.4)",
              }}
            >
              <Text style={{ color: ACCENT, fontFamily: "Poppins_600SemiBold", fontSize: 13 }}>
                ONBOARDING COMPLETE — REAL JOB LIST COMING SOON
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/onboarding")}
            accessibilityRole="button"
            className="active:opacity-70"
            style={{ marginTop: 16, alignSelf: "center", padding: 8 }}
          >
            <Text style={{ color: SUBTITLE, fontFamily: "Poppins_400Regular", fontSize: 13 }}>
              Review your profile in <Text style={{ color: ACCENT, fontFamily: "Poppins_600SemiBold" }}>onboarding</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
