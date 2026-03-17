import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import {
  widthPercentageToDP  as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RelationshipResult } from "../types/types";

// Colour per family side
const SIDE_COLOR: Record<string, string> = {
  paternal: "#64B5F6",   // blue  — dad's side
  maternal: "#F48FB1",   // pink  — mom's side
  self:     "#A5D6A7",   // green — direct line
};

const SIDE_LABEL: Record<string, string> = {
  paternal: "父系",
  maternal: "母系",
  self:     "自身",
};

type Props = {
  expression: string;
  result:     RelationshipResult | null;
  calculated: boolean;
};

export default function Display({ expression, result, calculated }: Props) {
  const { width, height } = useWindowDimensions();
  const sideColor = result?.side ? SIDE_COLOR[result.side] : "#00ff88";
  
  const dynamicStyles = useMemo(() => ({
    container: {
      height: hp("28%"),
      backgroundColor: "#111",
      justifyContent: "flex-end" as const,
      alignItems: "flex-end" as const,
      paddingHorizontal: wp("5%"),
      paddingBottom: hp("1.5%"),
      gap: hp("0.5%"),
    },
    expression: {
      color: "#888",
      fontSize: wp("4.5%"),
      textAlign: "right" as const,
    },
    result: {
      fontSize: wp("5.5%"),
      fontWeight: "bold" as const,
      textAlign: "right" as const,
    },
    tagRow: {
      flexDirection: "row" as const,
      gap: wp("2%"),
      justifyContent: "flex-end" as const,
      flexWrap: "wrap" as const,
    },
    tag: {
      borderWidth: 1,
      borderColor: "#444",
      borderRadius: hp("1%"),
      paddingHorizontal: wp("2.5%"),
      paddingVertical: hp("0.3%"),
    },
    tagText: {
      color: "#aaa",
      fontSize: wp("3.2%"),
    },
    note: {
      color: "#E6A817",
      fontSize: wp("3.5%"),
      textAlign: "right" as const,
    },
    error: {
      color: "#ff5555",
      fontSize: wp("5.5%"),
      fontWeight: "600" as const,
      textAlign: "right" as const,
    },
  }), [width, height]);

  return (
    <View style={dynamicStyles.container}>

      {/* ── expression row ── */}
      <Text
        style={dynamicStyles.expression}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {expression || " "}
      </Text>

      {/* ── result / error ── */}
      {calculated && result ? (
        result.success ? (
          <>
            {/* Main term */}
            <Text
              style={[dynamicStyles.result, { color: sideColor }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {result.term}
            </Text>

            {/* Formal name + side tag on one row */}
            <View style={dynamicStyles.tagRow}>
              {result.formal && result.formal !== result.term && (
                <View style={dynamicStyles.tag}>
                  <Text style={dynamicStyles.tagText}>
                    正式：{result.formal}
                  </Text>
                </View>
              )}
              {result.side && (
                <View style={[dynamicStyles.tag, { borderColor: sideColor }]}>
                  <Text style={[dynamicStyles.tagText, { color: sideColor }]}>
                    {SIDE_LABEL[result.side]}
                  </Text>
                </View>
              )}
            </View>

            {/* Note (disambiguation hint) */}
            {result.note ? (
              <Text style={dynamicStyles.note} numberOfLines={2}>
                💡 {result.note}
              </Text>
            ) : null}
          </>
        ) : (
          /* Error state */
          <Text style={dynamicStyles.error} numberOfLines={2}>
            {result.error}
          </Text>
        )
      ) : null}

    </View>
  );
}