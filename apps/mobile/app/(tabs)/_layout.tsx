import React from "react";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { color, font, tabBarHeight } from "@/lib/theme";

/* Minimal line icons drawn with react-native-svg — no icon-font dependency. */
function Icon({ name, focused }: { name: string; focused: boolean }) {
  const c = focused ? color.wdbx : color.textMute;
  const sw = 1.8;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {name === "home" && (
        <Path d="M4 11.5 12 5l8 6.5M6 10.5V19h12v-8.5" stroke={c} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      )}
      {name === "stack" && (
        <>
          <Path d="M12 4 20 8l-8 4-8-4 8-4Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M4 12l8 4 8-4M4 16l8 4 8-4" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      )}
      {name === "platform" && (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={3} stroke={c} strokeWidth={sw} />
          <Path d="M4 9h16M4 14h16" stroke={c} strokeWidth={sw} />
        </>
      )}
      {name === "company" && (
        <>
          <Circle cx={12} cy={8} r={3.2} stroke={c} strokeWidth={sw} />
          <Path d="M5.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
      {name === "vault" && (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={3} stroke={c} strokeWidth={sw} />
          <Circle cx={12} cy={12} r={3} stroke={c} strokeWidth={sw} />
          <Path d="M12 12v3" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.wdbx,
        tabBarInactiveTintColor: color.textMute,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : color.panel,
          borderTopColor: color.line,
          borderTopWidth: 1,
          elevation: 0,
          height: tabBarHeight,
        },
        tabBarLabelStyle: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1 },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView tint="dark" intensity={40} style={{ flex: 1, backgroundColor: "rgba(5,7,11,0.7)" }} />
          ) : (
            <View style={{ flex: 1, backgroundColor: color.panel }} />
          ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ focused }) => <Icon name="home" focused={focused} /> }} />
      <Tabs.Screen name="products" options={{ title: "Stack", tabBarIcon: ({ focused }) => <Icon name="stack" focused={focused} /> }} />
      <Tabs.Screen name="vault" options={{ title: "Vault", tabBarIcon: ({ focused }) => <Icon name="vault" focused={focused} /> }} />
      <Tabs.Screen name="platform" options={{ title: "Platform", tabBarIcon: ({ focused }) => <Icon name="platform" focused={focused} /> }} />
      <Tabs.Screen name="company" options={{ title: "Company", tabBarIcon: ({ focused }) => <Icon name="company" focused={focused} /> }} />
    </Tabs>
  );
}
