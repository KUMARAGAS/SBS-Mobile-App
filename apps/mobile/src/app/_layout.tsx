import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "../lib/clerk-token-cache";
import "../../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useState } from "react";
import { View } from "react-native";
import AnimatedSplash from "../components/AnimatedSplash";

// Hold the native splash until the animated handoff takes over.
SplashScreen.preventAutoHideAsync().catch(() => {});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

export default function RootLayout() {
  // Cold-start state: animated loader covers the app until it fades out.
  // The wrapping View + contentStyle keep the root dark (#000814) so there
  // is never a white flash behind the splash, during Stack transitions,
  // or while routes redirect (index -> login/home).
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <View style={{ flex: 1, backgroundColor: "#000814" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000814" },
          }}
        />
        {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
      </View>
    </ClerkProvider>
  );
}
