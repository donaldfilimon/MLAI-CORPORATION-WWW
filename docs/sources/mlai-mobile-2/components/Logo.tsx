import React from "react";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { color } from "@/lib/theme";

/* The MLAI chip-stack mark — a rounded-square chip holding three nested layers
   (cyan / violet / emerald), encoding "three layers, one chip." */
export function LogoMark({ size = 32, mono = false }: { size?: number; mono?: boolean }) {
  const stroke = mono ? color.text : "url(#mlaiGrad)";
  const pin = mono ? color.text : "url(#mlaiGrad)";
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="mlaiGrad" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={color.wdbx} />
          <Stop offset="0.5" stopColor={color.abi} />
          <Stop offset="1" stopColor={color.abbey} />
        </LinearGradient>
      </Defs>

      <Rect x={4.5} y={4.5} width={39} height={39} rx={11} stroke={stroke} strokeWidth={2.5} />

      {[16, 24, 32].map((x) => (
        <React.Fragment key={x}>
          <Rect x={x - 1} y={1.5} width={2} height={3.5} rx={1} fill={pin} opacity={0.55} />
          <Rect x={x - 1} y={43} width={2} height={3.5} rx={1} fill={pin} opacity={0.55} />
        </React.Fragment>
      ))}

      {mono ? (
        <>
          <Rect x={13} y={28} width={22} height={4.5} rx={2.25} fill={color.text} opacity={0.55} />
          <Rect x={13} y={21.75} width={22} height={4.5} rx={2.25} fill={color.text} opacity={0.78} />
          <Rect x={13} y={15.5} width={22} height={4.5} rx={2.25} fill={color.text} />
        </>
      ) : (
        <>
          <Rect x={13} y={28} width={22} height={4.5} rx={2.25} fill={color.wdbx} />
          <Rect x={13} y={21.75} width={22} height={4.5} rx={2.25} fill={color.abi} />
          <Rect x={13} y={15.5} width={22} height={4.5} rx={2.25} fill={color.abbey} />
        </>
      )}
    </Svg>
  );
}
