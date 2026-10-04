import { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

const INK = "#FFFFFF";
const SUBTITLE = "#9DB6D8";
const TAGLINE = "#A9C4E6";
const ACCENT = "#3FB9F5";
const DOT_ACTIVE = "#22D3EE";
const FIELD_BG = "rgba(10, 26, 54, 0.72)";
const FIELD_BORDER = "rgba(110, 165, 235, 0.55)";
const LABEL = "#7FDBFF";
const BUBBLE_BG = "rgba(8, 24, 52, 0.9)";
const BUBBLE_BORDER = "#38BDF8";
const GREEN = "#22C55E";
const PRIMARY = "#1E7FE8";
const MAX_WIDTH = 420;

/* ------------------------------- glyphs ------------------------------- */

function CheckGlyph({ size = 20, color = "#FFFFFF", width = 3 }: { size?: number; color?: string; width?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDown({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowRight({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12h15M13 6l6 6-6 6" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PersonGlyph({ size = 26, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7.5} r={4} fill={color} />
      <Path d="M4.5 20.5c.8-3.8 3.9-5.5 7.5-5.5s6.7 1.7 7.5 5.5" fill={color} />
    </Svg>
  );
}

function BriefcaseGlyph({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={7.5} width={18} height={12.5} rx={2.5} stroke="#FFFFFF" strokeWidth={2} />
      <Path d="M9 7.5V5.8A1.8 1.8 0 0110.8 4h2.4A1.8 1.8 0 0115 5.8v1.7M3 12.5h18" stroke="#FFFFFF" strokeWidth={2} />
    </Svg>
  );
}

function BuildingGlyph({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 21V5.5A1.5 1.5 0 016.5 4h7A1.5 1.5 0 0115 5.5V21M3 21h18M15 9h3.5A1.5 1.5 0 0120 10.5V21" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
      <Path d="M8 8h4M8 12h4M8 16h4" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function PhoneGlyph({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.8 3.5h3l1.8 4.6-2.2 1.6c.9 2.3 2.7 4.1 5 5l1.6-2.2 4.6 1.8v3c0 .6-.4 1-1 1C10.9 18.3 5.7 13.1 5.8 4.5c0-.6.4-1 1-1z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function CameraGlyph({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8.5h3l1.8-2.3h6.4L17 8.5h3A1.5 1.5 0 0121.5 10v8a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 18v-8A1.5 1.5 0 014 8.5z" fill="#FFFFFF" />
      <Circle cx={12} cy={13.8} r={3.4} fill="#1D7FE0" />
    </Svg>
  );
}

function WrenchGlyph({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.5 6.5a4.6 4.6 0 01-6.1 6.1L7 20a2.2 2.2 0 01-3.1-3.1l7.4-7.4a4.6 4.6 0 016.1-6.1L14.9 6l2.5 2.5 3.1-2z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function PinGlyph({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.5a6.8 6.8 0 00-6.8 6.8c0 4.9 6.8 12.2 6.8 12.2s6.8-7.3 6.8-12.2A6.8 6.8 0 0012 2.5z" fill="#FFFFFF" />
      <Circle cx={12} cy={9.3} r={2.6} fill="#0A1B33" />
    </Svg>
  );
}

function ChartGlyph({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h16" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
      <Rect x={6} y={12} width={3.4} height={6} rx={1} fill="#FFFFFF" />
      <Rect x={10.8} y={8} width={3.4} height={10} rx={1} fill="#FFFFFF" />
      <Rect x={15.6} y={4.5} width={3.4} height={13.5} rx={1} fill="#FFFFFF" />
    </Svg>
  );
}

function PopperGlyph({ size = 38 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path d="M10 30L17 12l9 4-7 14z" stroke={ACCENT} strokeWidth={2.2} strokeLinejoin="round" />
      <Path d="M14 24l5 2M13 19l4 1.5" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={28} cy={10} r={1.8} fill={ACCENT} />
      <Circle cx={32} cy={17} r={1.8} fill={ACCENT} />
      <Circle cx={26} cy={22} r={1.4} fill={ACCENT} />
      <Path d="M30 25l4-1M28 28l3 2" stroke={ACCENT} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/* ------------------------------- pieces ------------------------------- */

function Stepper({ steps }: { steps: ("done" | "active" | "todo")[] }) {
  return (
    <View className="flex-row items-center justify-center">
      {steps.map((s, i) => (
        <View key={i} className="flex-row items-center">
          <View
            className="items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: s === "todo" ? "rgba(10,26,54,0.7)" : "#1D7FE0",
              borderWidth: 2,
              borderColor: s === "todo" ? "rgba(110,165,235,0.5)" : "#38BDF8",
              opacity: s === "todo" ? 0.85 : 1,
            }}
          >
            {s === "done" ? (
              <CheckGlyph size={18} width={3.2} />
            ) : (
              <Text style={{ color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 16 }}>
                {i + 1}
              </Text>
            )}
          </View>
          {i < steps.length - 1 && (
            <View
              style={{
                width: 44,
                height: 2,
                backgroundColor: s === "done" ? "#38BDF8" : "rgba(110,165,235,0.5)",
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
}

function PageDots({ total, active }: { total: number; active: number }) {
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={
            i === active
              ? { width: 24, height: 8, borderRadius: 4, backgroundColor: DOT_ACTIVE }
              : { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: FIELD_BORDER }
          }
        />
      ))}
    </View>
  );
}

function PrimaryButton({ label, arrow = false }: { label: string; arrow?: boolean }) {
  return (
    <Pressable
      onPress={() => {}}
      accessibilityRole="button"
      className="w-full flex-row items-center justify-center active:opacity-85"
      style={{ backgroundColor: PRIMARY, borderRadius: 16, height: 54, gap: 8 }}
    >
      <Text style={{ color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 16 }}>{label}</Text>
      {arrow && <ArrowRight size={22} color="#FFFFFF" />}
    </Pressable>
  );
}

function ProfileField({
  label,
  value,
  icon,
  chevron = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  chevron?: boolean;
}) {
  return (
    <View className="w-full">
      <Text
        style={{
          color: LABEL,
          fontFamily: "Poppins_500Medium",
          fontSize: 12.5,
          letterSpacing: 0.4,
          marginLeft: 4,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View
        className="w-full flex-row items-center"
        style={{
          backgroundColor: FIELD_BG,
          borderColor: FIELD_BORDER,
          borderWidth: 1.5,
          borderRadius: 14,
          height: 54,
        }}
      >
        <View
          className="items-center justify-center"
          style={{ width: 52, height: "100%", borderRightWidth: 1, borderRightColor: FIELD_BORDER }}
        >
          {icon}
        </View>
        <Text
          style={{ flex: 1, color: INK, fontFamily: "Poppins_500Medium", fontSize: 15, paddingHorizontal: 14 }}
        >
          {value}
        </Text>
        {chevron && <View style={{ paddingRight: 14 }}><ChevronDown size={20} /></View>}
      </View>
    </View>
  );
}

function SlideShell({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <View style={{ width }} className="flex-1 items-center">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          width: "100%",
          maxWidth: MAX_WIDTH,
          alignSelf: "center",
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 24,
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/* -------------------------------- slides ------------------------------ */

function SlideWelcome({ width, onNext }: { width: number; onNext: () => void }) {
  return (
    <View style={{ width }} className="flex-1 items-center">
      <View
        style={{ flex: 1, width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}
        className="items-center px-6"
      >
        {/* Brand — matches login proportions */}
        <View className="items-center justify-center" style={{ flex: 1, paddingTop: 8 }}>
          <Image
            source={require("../../assets/images/sbs-logo.png")}
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
              {"SMARTER FIELD OPERATIONS\nSTRONGER INFRASTRUCTURE"}
            </Text>
          </View>
        </View>

        {/* Pager footer — fixed height so dots never drift */}
        <View style={{ height: 132, justifyContent: "flex-start", alignItems: "center", gap: 20 }}>
          <PageDots total={3} active={0} />
          <Pressable onPress={onNext} className="flex-row items-center active:opacity-80" style={{ gap: 10 }}>
            <Text style={{ color: INK, fontFamily: "Poppins_500Medium", fontSize: 16 }}>Swipe to continue</Text>
            <ArrowRight size={24} color={ACCENT} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SlideProfile({ width }: { width: number }) {
  return (
    <SlideShell width={width}>
      <Stepper steps={["done", "active", "todo"]} />

      <Text style={{ color: INK, fontFamily: "Poppins_700Bold", fontSize: 28, marginTop: 20, textAlign: "center" }}>
        Create Your Profile
      </Text>
      <Text style={{ color: ACCENT, fontFamily: "Poppins_500Medium", fontSize: 14, marginTop: 6, textAlign: "center" }}>
        Let&apos;s set up your profile
      </Text>

      <View className="items-center justify-center" style={{ marginTop: 20 }}>
        <View
          className="items-center justify-center"
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 3,
            borderColor: "#38BDF8",
            backgroundColor: "rgba(10,26,54,0.8)",
          }}
        >
          <PersonGlyph size={64} color="rgba(255,255,255,0.92)" />
          <Pressable
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
            className="items-center justify-center active:opacity-85"
            style={{
              position: "absolute",
              right: -4,
              bottom: 0,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#1D7FE0",
              borderWidth: 2,
              borderColor: "#38BDF8",
            }}
          >
            <CameraGlyph size={20} />
          </Pressable>
        </View>
      </View>

      <View className="w-full" style={{ marginTop: 20, gap: 14 }}>
        <ProfileField label="Full Name" value="Amila Sanjivda" icon={<PersonGlyph size={22} />} />
        <ProfileField label="Designation" value="Field Technician" icon={<BriefcaseGlyph size={22} />} chevron />
        <ProfileField label="Branch" value="Colombo Office" icon={<BuildingGlyph size={22} />} chevron />
        <ProfileField label="Phone Number" value="+94 77 712 3457" icon={<PhoneGlyph size={22} />} />
      </View>

      <View className="w-full" style={{ marginTop: 22 }}>
        <PrimaryButton label="Next" />
      </View>
    </SlideShell>
  );
}

function ShieldArt() {
  return (
    <View className="items-center justify-center" style={{ width: 260, height: 200, alignSelf: "center" }}>
      <Svg width={260} height={200} viewBox="0 0 300 230" fill="none">
        <Ellipse cx={150} cy={115} rx={118} ry={86} stroke="#38BDF8" strokeWidth={2} opacity={0.55} />
        <Ellipse cx={150} cy={115} rx={92} ry={66} stroke="#38BDF8" strokeWidth={1.5} opacity={0.35} />
      </Svg>
      <View style={{ position: "absolute" }}>
        <Svg width={100} height={120} viewBox="0 0 118 140" fill="none">
          <Path
            d="M59 4l51 18v44c0 34-22 56-51 70C30 122 8 100 8 66V22l51-18z"
            fill="#1E7FE8"
            stroke="#7FDBFF"
            strokeWidth={3}
          />
          <Path d="M42 68l12 12 24-26" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </View>
      {[
        { left: 0, top: 4, glyph: <PersonGlyph size={22} /> },
        { right: 0, top: 4, glyph: <WrenchGlyph size={22} /> },
        { left: 0, bottom: 4, glyph: <PinGlyph size={22} /> },
        { right: 0, bottom: 4, glyph: <ChartGlyph size={22} /> },
      ].map((b, i) => (
        <View
          key={i}
          className="items-center justify-center"
          style={{
            position: "absolute",
            left: b.left,
            right: b.right,
            top: b.top,
            bottom: b.bottom,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: BUBBLE_BG,
            borderWidth: 2,
            borderColor: BUBBLE_BORDER,
          }}
        >
          {b.glyph}
        </View>
      ))}
    </View>
  );
}

function SlideDone({ width }: { width: number }) {
  return (
    <SlideShell width={width}>
      <Stepper steps={["done", "done", "active"]} />
      <Text style={{ color: INK, fontFamily: "Poppins_700Bold", fontSize: 28, marginTop: 20, textAlign: "center" }}>
        You&apos;re All Set!
      </Text>
      <Text style={{ color: ACCENT, fontFamily: "Poppins_500Medium", fontSize: 14, marginTop: 6, textAlign: "center" }}>
        Welcome to SBS Field Service
      </Text>

      <View style={{ marginTop: 14 }}>
        <ShieldArt />
      </View>

      <View
        className="w-full"
        style={{
          backgroundColor: "rgba(10,26,54,0.72)",
          borderColor: FIELD_BORDER,
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 16,
          marginTop: 14,
        }}
      >
        <View className="flex-row" style={{ gap: 12 }}>
          <PopperGlyph size={38} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: INK, fontFamily: "Poppins_600SemiBold", fontSize: 16 }}>
              Your account is ready!
            </Text>
            <Text style={{ color: SUBTITLE, fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 4, lineHeight: 19 }}>
              You can now access all Field Service features and start managing your work efficiently.
            </Text>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: FIELD_BORDER, marginVertical: 12, opacity: 0.6 }} />
        <View style={{ gap: 10 }}>
          {["Profile completed", "Access granted", "Ready to go"].map((t) => (
            <View key={t} className="flex-row items-center" style={{ gap: 10 }}>
              <View
                className="items-center justify-center"
                style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: GREEN }}
              >
                <CheckGlyph size={13} width={3.4} />
              </View>
              <Text style={{ color: INK, fontFamily: "Poppins_400Regular", fontSize: 14 }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="w-full" style={{ marginTop: 18 }}>
        <PrimaryButton label="Get Started" arrow />
      </View>

      <Text
        style={{
          color: ACCENT,
          fontFamily: "Poppins_500Medium_Italic",
          fontSize: 14,
          marginTop: 16,
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        {"Together we keep\nSri Lanka Connected"}
      </Text>
    </SlideShell>
  );
}

/* --------------------------------- pager ------------------------------ */

export default function Onboarding() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  if (!fontsLoaded) return null;

  const goTo = (i: number) => {
    setIndex(i);
    listRef.current?.scrollToIndex({ index: i, animated: true });
  };

  return (
    <View className="flex-1 bg-[#040B1A]">
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/auth-hero.png")}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
      />
      {/* soften artwork so all three steps stay legible */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: index === 0 ? "rgba(4,11,26,0.25)" : "rgba(4,11,26,0.6)" }} />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <FlatList
          ref={listRef}
          data={[0, 1, 2]}
          keyExtractor={(i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
          }}
          renderItem={({ index: i }) => {
            if (i === 0) return <SlideWelcome width={width} onNext={() => goTo(1)} />;
            if (i === 1) return <SlideProfile width={width} />;
            return <SlideDone width={width} />;
          }}
        />
      </SafeAreaView>
    </View>
  );
}
