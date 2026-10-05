import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import SbsLoader from "../../components/SbsLoader";

export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show the SBS loader while the session restores instead of a blank screen.
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#040B1A]">
        <SbsLoader size={170} title="Loading…" />
      </View>
    );
  }
  if (isSignedIn) return <Redirect href="/onboarding" />;

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#040B1A" } }} />;
}
