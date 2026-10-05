import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import SbsLoader from "../components/SbsLoader";

// Entry route: show the SBS loader while Clerk restores the session, then
// route signed-in techs into the app and everyone else to login. Previously
// this was a blind `<Redirect href="/login" />`, so signed-in users flashed
// the login screen and there was no loader during the auth wait.
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#040B1A]">
        <StatusBar style="light" />
        <SbsLoader size={190} title="Loading SBS…" subtitle="Preparing your workspace" />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? "/home" : "/login"} />;
}
