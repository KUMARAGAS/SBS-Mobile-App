import { useAuth } from "@clerk/expo";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";

const INK = "#FFFFFF";
const SUBTITLE = "#9DB6D8";
const TAGLINE = "#A9C4E6";
const ACCENT = "#3FB9F5";
const DOT_ACTIVE = "#22D3EE";
const FIELD_BG = "rgba(10, 26, 54, 0.72)";
const FIELD_BG_FOCUS = "rgba(14, 36, 72, 0.85)";
const FIELD_BORDER = "rgba(110, 165, 235, 0.55)";
const FIELD_BORDER_FOCUS = "#38BDF8";
const LABEL = "#7FDBFF";
const GREEN = "#22C55E";
const MAX_WIDTH = 420;

// Hardcoded invite values so the flow is testable before apps/api lands (PLAN.md J1).
const DESIGNATIONS = ["Field Technician", "Senior Engineer", "Branch In-charge", "Coordinator"];
const BRANCHES = ["Colombo Office", "Rathnapura Office", "Anuradhapura Office", "Head Office"];

export type OnboardingProfile = {
  fullName: string;
  designation: string;
  branch: string;
  phone: string;
};

const DEFAULT_PROFILE: OnboardingProfile = {
  fullName: "Amila Savinda",
  designation: DESIGNATIONS[0],
  branch: BRANCHES[0],
  phone: "+94 77 712 3457",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

function ChevronLeft({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
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

function CloseGlyph({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
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

function PersonGlyph({ size = 26, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7.5} r={4} fill={color} />
      <Path d="M4.5 20.5c.8-3.8 3.9-5.5 7.5-5.5s6.7 1.7 7.5 5.5" fill={color} />
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
              shadowColor: s === "todo" ? "transparent" : "#38BDF8",
              shadowOpacity: s === "todo" ? 0 : 0.7,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
              elevation: s === "todo" ? 0 : 5,
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
  // Design 1: small circles — filled cyan for the current page, thin outline otherwise.
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 10 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={
            i === active
              ? {
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: DOT_ACTIVE,
                  shadowColor: DOT_ACTIVE,
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 4,
                }
              : {
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: "rgba(56, 189, 248, 0.7)",
                }
          }
        />
      ))}
    </View>
  );
}

function PrimaryButton({
  label,
  arrow = false,
  onPress,
  disabled = false,
}: {
  label: string;
  arrow?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  // Design 2/3: gradient pill button. Widths are explicit (not flex/class
  // driven) — shrink-wrapped pills were reported on narrow devices.
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className="active:opacity-85"
      style={{
        width: "100%",
        borderRadius: 28,
        height: 56,
        overflow: "hidden",
        opacity: disabled ? 0.55 : 1,
        shadowColor: "#1D7FE0",
        shadowOpacity: disabled ? 0.15 : 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={["#38BDF8", "#1D7FE0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: "100%",
          height: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: "rgba(127, 219, 255, 0.6)",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 16 }}>{label}</Text>
        {arrow && <ArrowRight size={22} color="#FFFFFF" />}
      </LinearGradient>
    </Pressable>
  );
}

function TextProfileField({
  label,
  value,
  icon,
  keyboardType,
  onChangeText,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  keyboardType?: "default" | "phone-pad";
  onChangeText: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
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
          backgroundColor: focused ? FIELD_BG_FOCUS : FIELD_BG,
          borderColor: focused ? FIELD_BORDER_FOCUS : FIELD_BORDER,
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
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="rgba(157, 182, 216, 0.6)"
          style={{ flex: 1, color: INK, fontFamily: "Poppins_500Medium", fontSize: 15, paddingHorizontal: 14 }}
        />
      </View>
    </View>
  );
}

function SelectProfileField({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  onPress: () => void;
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
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className="w-full flex-row items-center active:opacity-85"
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
        <View style={{ paddingRight: 14 }}>
          <ChevronDown size={20} />
        </View>
      </Pressable>
    </View>
  );
}

function OptionSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(2, 6, 18, 0.7)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: "rgba(8, 22, 48, 0.98)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: FIELD_BORDER,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 28,
          }}
        >
          <View className="items-center" style={{ paddingBottom: 8 }}>
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: "rgba(110,165,235,0.5)" }} />
          </View>
          <View className="flex-row items-center justify-between" style={{ paddingVertical: 8 }}>
            <Text style={{ color: INK, fontFamily: "Poppins_600SemiBold", fontSize: 17 }}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              hitSlop={12}
              className="items-center justify-center active:opacity-70"
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(110,165,235,0.2)" }}
            >
              <CloseGlyph size={16} />
            </Pressable>
          </View>
          {options.map((opt) => {
            const isActive = opt === selected;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
                accessibilityRole="button"
                className="flex-row items-center active:opacity-80"
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  marginTop: 8,
                  borderRadius: 12,
                  gap: 12,
                  backgroundColor: isActive ? "rgba(29, 127, 224, 0.25)" : "rgba(10, 26, 54, 0.6)",
                  borderWidth: 1.5,
                  borderColor: isActive ? "#38BDF8" : "rgba(110,165,235,0.3)",
                }}
              >
                <View
                  className="items-center justify-center"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: isActive ? "#1D7FE0" : "transparent",
                    borderWidth: 1.5,
                    borderColor: isActive ? "#38BDF8" : "rgba(110,165,235,0.6)",
                  }}
                >
                  {isActive && <CheckGlyph size={13} width={3.4} />}
                </View>
                <Text
                  style={{
                    color: INK,
                    fontFamily: isActive ? "Poppins_600SemiBold" : "Poppins_400Regular",
                    fontSize: 15,
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InitialsAvatar({
  name,
  size = 120,
  badge = "camera",
}: {
  name: string;
  size?: number;
  badge?: "camera" | "check" | "none";
}) {
  const badgeSize = size >= 90 ? 40 : 26;
  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: "#38BDF8",
        overflow: "hidden",
        shadowColor: "#38BDF8",
        shadowOpacity: 0.6,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={["#1D4ED8", "#0A1B33"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Text style={{ color: INK, fontFamily: "Poppins_700Bold", fontSize: size * 0.32 }}>
        {initialsOf(name)}
      </Text>
      {badge !== "none" && (
        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel={badge === "check" ? "Profile verified" : "Upload profile photo"}
          className="items-center justify-center active:opacity-85"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: badge === "check" ? GREEN : "#1D7FE0",
            borderWidth: 2,
            borderColor: badge === "check" ? "#040B1A" : "#38BDF8",
          }}
        >
          {badge === "check" ? (
            <CheckGlyph size={badgeSize * 0.5} width={3.4} />
          ) : (
            <CameraGlyph size={badgeSize * 0.5} />
          )}
        </Pressable>
      )}
    </View>
  );
}

function SlideShell({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <View style={{ width, flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{
          flexGrow: 1,
          width: "100%",
          maxWidth: MAX_WIDTH,
          alignSelf: "center",
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/* -------------------------------- slides ------------------------------ */

function SlideWelcome({
  width,
  onNext,
  showSignIn,
}: {
  width: number;
  onNext: () => void;
  showSignIn: boolean;
}) {
  return (
    <View style={{ width }} className="flex-1 items-center">
      <View
        style={{ flex: 1, width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}
        className="items-center px-6"
      >
        {/* Brand — same artwork family as login, own headline so it never reads as login */}
        <View className="items-center justify-center" style={{ flex: 1, paddingTop: 8 }}>
          <View
            className="items-center justify-center"
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(56, 189, 248, 0.5)",
              backgroundColor: "rgba(10, 26, 54, 0.6)",
              marginBottom: 14,
            }}
          >
            <Text
              style={{ color: ACCENT, fontFamily: "Poppins_600SemiBold", fontSize: 11, letterSpacing: 2.5 }}
            >
              GETTING STARTED
            </Text>
          </View>
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

        {/* Pager footer — dots + one clear action */}
        <View className="w-full" style={{ paddingBottom: 8, alignItems: "center", gap: 16 }}>
          <PageDots total={3} active={0} />
          <PrimaryButton label="Continue" arrow onPress={onNext} />
          {showSignIn && (
            <Pressable onPress={() => router.replace("/login")} style={{ paddingVertical: 4 }}>
              <Text style={{ color: SUBTITLE, fontFamily: "Poppins_400Regular", fontSize: 13 }}>
                Already have an account?{" "}
                <Text style={{ color: ACCENT, fontFamily: "Poppins_600SemiBold" }}>Sign in</Text>
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function SlideProfile({
  width,
  profile,
  onChange,
  onNext,
}: {
  width: number;
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
  onNext: () => void;
}) {
  const [sheet, setSheet] = useState<"designation" | "branch" | null>(null);
  // TODO: photo upload via expo-image-picker when the media flow lands; initials keep it testable now.
  const valid = profile.fullName.trim().length >= 2 && profile.phone.trim().length >= 7;

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
        <InitialsAvatar name={profile.fullName || "?"} />
      </View>

      <View className="w-full" style={{ marginTop: 20, gap: 14 }}>
        <TextProfileField
          label="Full Name"
          value={profile.fullName}
          onChangeText={(fullName) => onChange({ fullName })}
          icon={<PersonGlyph size={22} />}
        />
        <SelectProfileField
          label="Designation"
          value={profile.designation}
          onPress={() => setSheet("designation")}
          icon={<BriefcaseGlyph size={22} />}
        />
        <SelectProfileField
          label="Branch"
          value={profile.branch}
          onPress={() => setSheet("branch")}
          icon={<BuildingGlyph size={22} />}
        />
        <TextProfileField
          label="Phone Number"
          value={profile.phone}
          keyboardType="phone-pad"
          onChangeText={(phone) => onChange({ phone })}
          icon={<PhoneGlyph size={22} />}
        />
      </View>

      <View className="w-full" style={{ marginTop: 22 }}>
        <PrimaryButton label="Next" onPress={onNext} disabled={!valid} />
        {!valid && (
          <Text
            style={{
              color: SUBTITLE,
              fontFamily: "Poppins_400Regular",
              fontSize: 12,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Enter your name and phone number to continue
          </Text>
        )}
      </View>

      <OptionSheet
        visible={sheet === "designation"}
        title="Designation"
        options={DESIGNATIONS}
        selected={profile.designation}
        onSelect={(designation) => onChange({ designation })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === "branch"}
        title="Branch"
        options={BRANCHES}
        selected={profile.branch}
        onSelect={(branch) => onChange({ branch })}
        onClose={() => setSheet(null)}
      />
    </SlideShell>
  );
}

function SlideDone({
  width,
  profile,
  onEdit,
  onFinish,
}: {
  width: number;
  profile: OnboardingProfile;
  onEdit: () => void;
  onFinish: () => void;
}) {
  // No-scroll layout: everything fits one screen. Art is compact, the card is
  // tight, and the button is pinned to the bottom with flex spacing.
  return (
    <View style={{ width, flex: 1 }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: MAX_WIDTH,
          alignSelf: "center",
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: 12,
        }}
      >
        {/* Designs label the last dot "4" but draw 3 indicators; the pager has 3
            slides (welcome → profile → done), so the active dot stays "3". */}
        <Stepper steps={["done", "done", "active"]} />
        <View
          className="items-center justify-center"
          style={{
            alignSelf: "center",
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(56, 189, 248, 0.5)",
            backgroundColor: "rgba(10, 26, 54, 0.6)",
            marginTop: 12,
          }}
        >
          <Text
            style={{ color: ACCENT, fontFamily: "Poppins_600SemiBold", fontSize: 11, letterSpacing: 2.5 }}
          >
            SETUP COMPLETE
          </Text>
        </View>
        <Text style={{ color: INK, fontFamily: "Poppins_700Bold", fontSize: 26, marginTop: 8, textAlign: "center" }}>
          You&apos;re All Set!
        </Text>
        <Text style={{ color: ACCENT, fontFamily: "Poppins_500Medium", fontSize: 13, marginTop: 4, textAlign: "center" }}>
          Welcome to SBS Field Service
        </Text>

        <View className="items-center justify-center" style={{ flex: 1, minHeight: 120 }}>
          <InitialsAvatar name={profile.fullName || "?"} size={88} badge="check" />
          <Text
            style={{ color: INK, fontFamily: "Poppins_600SemiBold", fontSize: 19, marginTop: 10, textAlign: "center" }}
            numberOfLines={1}
          >
            {profile.fullName || "Your profile"}
          </Text>
          <Text style={{ color: SUBTITLE, fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 2, textAlign: "center" }} numberOfLines={1}>
            {profile.designation} · {profile.branch}
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            backgroundColor: "rgba(10,26,54,0.72)",
            borderColor: FIELD_BORDER,
            borderWidth: 1.5,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View style={{ flex: 1, flexShrink: 1 }}>
              <Text style={{ color: INK, fontFamily: "Poppins_600SemiBold", fontSize: 15 }}>
                Your account is ready!
              </Text>
              <Text style={{ color: SUBTITLE, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 }}>
                Access every Field Service feature and manage your work.
              </Text>
            </View>
            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
              className="active:opacity-70"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(56, 189, 248, 0.6)",
                backgroundColor: "rgba(29, 127, 224, 0.18)",
              }}
            >
              <Text style={{ color: ACCENT, fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>Edit</Text>
            </Pressable>
          </View>
          <View style={{ height: 1, backgroundColor: FIELD_BORDER, marginVertical: 8, opacity: 0.6 }} />
          <View style={{ gap: 6 }}>
            {["Profile completed", "Access granted", "Ready to go"].map((t) => (
              <View key={t} className="flex-row items-center" style={{ gap: 10 }}>
                <View
                  className="items-center justify-center"
                  style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: GREEN }}
                >
                  <CheckGlyph size={12} width={3.4} />
                </View>
                <Text style={{ color: INK, fontFamily: "Poppins_400Regular", fontSize: 13 }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ width: "100%", marginTop: 12 }}>
          <PrimaryButton label="Get Started" arrow onPress={onFinish} />
        </View>

        <Text
          style={{
            color: ACCENT,
            fontFamily: "Poppins_500Medium_Italic",
            fontSize: 12,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Together we keep Sri Lanka Connected
        </Text>
      </View>
    </View>
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
  const { isSignedIn } = useAuth();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  // Lifted so typed values survive swiping between slides.
  const [profile, setProfile] = useState<OnboardingProfile>(DEFAULT_PROFILE);
  const listRef = useRef<FlatList>(null);

  if (!fontsLoaded) return null;

  const patchProfile = (patch: Partial<OnboardingProfile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(2, i));
    setIndex(clamped);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
  };

  const finish = () => {
    // Correct flow: signed-in techs land on home; signed-out previewers go back to login.
    router.replace(isSignedIn ? "/home" : "/login");
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
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: index === 0 ? "rgba(4,11,26,0.25)" : "rgba(4,11,26,0.6)",
        }}
      />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Pager header: back only (no skip — profile completion is required) */}
          {index > 0 && (
            <View
              className="flex-row items-center justify-between"
              style={{
                width: "100%",
                maxWidth: MAX_WIDTH,
                alignSelf: "center",
                paddingHorizontal: 16,
                height: 44,
              }}
            >
              <Pressable
                onPress={() => goTo(index - 1)}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={10}
                className="flex-row items-center active:opacity-70"
                style={{ gap: 2 }}
              >
                <ChevronLeft size={22} />
                <Text style={{ color: INK, fontFamily: "Poppins_500Medium", fontSize: 15 }}>Back</Text>
              </Pressable>
              <View style={{ width: 64 }} />
            </View>
          )}
          <View style={{ flex: 1 }}>
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
                setIndex(Math.max(0, Math.min(2, i)));
              }}
              renderItem={({ index: i }) => {
                if (i === 0)
                  return <SlideWelcome width={width} onNext={() => goTo(1)} showSignIn={!isSignedIn} />;
                if (i === 1)
                  return (
                    <SlideProfile
                      width={width}
                      profile={profile}
                      onChange={patchProfile}
                      onNext={() => goTo(2)}
                    />
                  );
                return (
                  <SlideDone
                    width={width}
                    profile={profile}
                    onEdit={() => goTo(1)}
                    onFinish={finish}
                  />
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
