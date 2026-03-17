// import React from "react"
// import { View, Text, StyleSheet } from "react-native"
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp
// } from "react-native-responsive-screen"

// type Props = {
//   expression: string
//   result: string
// }

// export default function Display({ expression, result }: Props) {

//   return (

//     <View style={styles.container}>

//       <Text style={styles.expression}>
//         {expression || " "}
//       </Text>

//       <Text style={styles.result}>
//         {result || " "}
//       </Text>

//     </View>

//   )
// }

// const styles = StyleSheet.create({

//   container: {
//     height: hp("25%"),
//     backgroundColor: "#111",
//     justifyContent: "center",
//     alignItems: "flex-end",
//     paddingHorizontal: wp("5%")
//   },

//   expression: {
//     color: "#aaa",
//     fontSize: wp("6%"),
//     marginBottom: hp("1%")
//   },

//   result: {
//     color: "#00ff88",
//     fontSize: wp("9%"),
//     fontWeight: "bold"
//   }

// })

// components/Display.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
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

  const sideColor = result?.side ? SIDE_COLOR[result.side] : "#00ff88";

  return (
    <View style={styles.container}>

      {/* ── expression row ── */}
      <Text
        style={styles.expression}
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
              style={[styles.result, { color: sideColor }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
            >
              {result.term}
            </Text>

            {/* Formal name + side tag on one row */}
            <View style={styles.tagRow}>
              {result.formal && result.formal !== result.term && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    正式：{result.formal}
                  </Text>
                </View>
              )}
              {result.side && (
                <View style={[styles.tag, { borderColor: sideColor }]}>
                  <Text style={[styles.tagText, { color: sideColor }]}>
                    {SIDE_LABEL[result.side]}
                  </Text>
                </View>
              )}
            </View>

            {/* Note (disambiguation hint) */}
            {result.note ? (
              <Text style={styles.note} numberOfLines={2}>
                💡 {result.note}
              </Text>
            ) : null}
          </>
        ) : (
          /* Error state */
          <Text style={styles.error} numberOfLines={2}>
            {result.error}
          </Text>
        )
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height:              hp("28%"),
    backgroundColor:     "#111",
    justifyContent:      "flex-end",
    alignItems:          "flex-end",
    paddingHorizontal:   wp("5%"),
    paddingBottom:       hp("1.5%"),
    gap:                 hp("0.5%"),
  },

  expression: {
    color:     "#888",
    fontSize:  wp("5.5%"),
    textAlign: "right",
  },

  result: {
    fontSize:   wp("11%"),
    fontWeight: "bold",
    textAlign:  "right",
  },

  tagRow: {
    flexDirection: "row",
    gap:           wp("2%"),
    justifyContent:"flex-end",
    flexWrap:      "wrap",
  },

  tag: {
    borderWidth:       1,
    borderColor:       "#444",
    borderRadius:      hp("1%"),
    paddingHorizontal: wp("2%"),
    paddingVertical:   hp("0.2%"),
  },

  tagText: {
    color:    "#aaa",
    fontSize: wp("3%"),
  },

  note: {
    color:     "#E6A817",
    fontSize:  wp("3.2%"),
    textAlign: "right",
  },

  error: {
    color:      "#ff5555",
    fontSize:   wp("5%"),
    fontWeight: "600",
    textAlign:  "right",
  },
});